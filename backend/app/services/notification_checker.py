from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.wealth import (
    NotificationSettings, RealEstatePayment, RealEstateProperty,
    SavingsDeposit, FinancialGoal, NetWorthSnapshot,
)
from app.services.telegram import send_message, fmt_vnd


async def _get_settings(db: AsyncSession) -> NotificationSettings | None:
    result = await db.execute(select(NotificationSettings).limit(1))
    return result.scalar_one_or_none()


async def run_daily_checks(db: AsyncSession) -> None:
    settings = await _get_settings(db)
    if not settings or not settings.enabled:
        return
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return

    token = settings.telegram_bot_token
    chat_id = settings.telegram_chat_id
    days = int(settings.days_before_alert)
    today = date.today()
    deadline = today + timedelta(days=days)

    if settings.notify_realestate:
        await _check_realestate(db, token, chat_id, today, deadline)

    if settings.notify_savings:
        await _check_savings(db, token, chat_id, today, deadline)

    if settings.notify_goals:
        await _check_goals(db, token, chat_id, today)

    if settings.notify_monthly and today.day == 1:
        await _send_monthly_summary(db, token, chat_id, today)


async def _check_realestate(db, token, chat_id, today, deadline):
    result = await db.execute(
        select(RealEstatePayment)
        .options(selectinload(RealEstatePayment.property))
        .where(
            RealEstatePayment.is_paid == False,
            RealEstatePayment.due_date >= today,
            RealEstatePayment.due_date <= deadline,
        )
        .order_by(RealEstatePayment.due_date)
    )
    payments = result.scalars().all()
    if not payments:
        return

    lines = ["🏠 <b>Nhắc nhở: Thanh toán BĐS sắp tới</b>\n"]
    for p in payments:
        days_left = (p.due_date - today).days
        lines.append(
            f"• <b>{p.property.name}</b>\n"
            f"  💰 {fmt_vnd(p.amount)}\n"
            f"  📅 {p.due_date.strftime('%d/%m/%Y')} — còn {days_left} ngày"
        )
        if p.note:
            lines.append(f"  📝 {p.note}")
    await send_message(token, chat_id, "\n".join(lines))


async def _check_savings(db, token, chat_id, today, deadline):
    result = await db.execute(
        select(SavingsDeposit)
        .where(
            SavingsDeposit.maturity_date >= today,
            SavingsDeposit.maturity_date <= deadline,
        )
        .order_by(SavingsDeposit.maturity_date)
    )
    deposits = result.scalars().all()
    if not deposits:
        return

    lines = ["💰 <b>Nhắc nhở: Sổ tiết kiệm sắp đáo hạn</b>\n"]
    for d in deposits:
        days_left = (d.maturity_date - today).days
        name = d.name or d.bank_name
        lines.append(
            f"• <b>{name}</b>\n"
            f"  🏦 {d.bank_name} — {d.interest_rate}%/năm\n"
            f"  💵 {fmt_vnd(d.principal)}\n"
            f"  📅 {d.maturity_date.strftime('%d/%m/%Y')} — còn {days_left} ngày"
        )
    await send_message(token, chat_id, "\n".join(lines))


async def _check_goals(db, token, chat_id, today):
    deadline_30 = today + timedelta(days=30)
    result = await db.execute(
        select(FinancialGoal)
        .options(selectinload(FinancialGoal.savings_deposits))
        .where(
            FinancialGoal.due_date != None,
            FinancialGoal.due_date >= today,
            FinancialGoal.due_date <= deadline_30,
        )
        .order_by(FinancialGoal.due_date)
    )
    goals = result.scalars().all()
    if not goals:
        return

    at_risk = []
    for g in goals:
        saved = sum(s.principal for s in g.savings_deposits)
        if saved < g.target_amount:
            at_risk.append((g, saved))

    if not at_risk:
        return

    lines = ["🎯 <b>Nhắc nhở: Mục tiêu tài chính sắp deadline</b>\n"]
    for g, saved in at_risk:
        pct = int(saved / g.target_amount * 100) if g.target_amount > 0 else 0
        remaining = g.target_amount - saved
        days_left = (g.due_date - today).days
        lines.append(
            f"• <b>{g.name}</b>\n"
            f"  📊 Tiến độ: {pct}% — còn thiếu {fmt_vnd(remaining)}\n"
            f"  📅 Deadline: {g.due_date.strftime('%d/%m/%Y')} — còn {days_left} ngày"
        )
    await send_message(token, chat_id, "\n".join(lines))


async def _send_monthly_summary(db, token, chat_id, today):
    prev_month = f"{today.year}-{today.month - 1:02d}" if today.month > 1 else f"{today.year - 1}-12"
    result = await db.execute(
        select(NetWorthSnapshot)
        .where(NetWorthSnapshot.snapshot_date == prev_month)
    )
    snap = result.scalar_one_or_none()
    if not snap:
        return

    month_label = f"{int(prev_month.split('-')[1]):02d}/{prev_month.split('-')[0]}"
    msg = (
        f"📊 <b>Tổng kết tài chính tháng {month_label}</b>\n\n"
        f"💼 Net Worth: <code>{fmt_vnd(snap.net_worth)}</code>\n"
        f"📈 Tổng tài sản: <code>{fmt_vnd(snap.total_assets)}</code>\n"
        f"📉 Tổng nợ: <code>{fmt_vnd(snap.total_liabilities)}</code>\n\n"
        f"Phân bổ tài sản:\n"
        f"• Tiết kiệm: {fmt_vnd(snap.savings_total)}\n"
        f"• Vàng: {fmt_vnd(snap.gold_total)}\n"
        f"• Tiền số: {fmt_vnd(snap.crypto_total)}\n"
        f"• Bất động sản: {fmt_vnd(snap.real_estate_total)}"
    )
    await send_message(token, chat_id, msg)
