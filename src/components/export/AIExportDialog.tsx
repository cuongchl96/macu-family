import { useMemo, useState } from 'react';
import { Sparkles, Copy, CheckCheck, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWealth } from '@/contexts/WealthContext';
import { differenceInDays, format } from 'date-fns';
import { toast } from 'sonner';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtVND = (n: number) =>
  n >= 1_000_000_000
    ? `${(n / 1_000_000_000).toFixed(2)} tỷ VND`
    : n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(0)} triệu VND`
    : `${Math.round(n).toLocaleString('vi-VN')} VND`;

const fmtDate = (d: Date | string | undefined) =>
  d ? format(new Date(d), 'dd/MM/yyyy') : '—';

const daysLeft = (d: Date | string | undefined) => {
  if (!d) return null;
  return differenceInDays(new Date(d), new Date());
};

const urgencyLabel = (days: number | null) => {
  if (days === null) return '';
  if (days < 0) return ` ⚠️ QUÁ HẠN ${Math.abs(days)} ngày`;
  if (days <= 7) return ` 🔴 còn ${days} ngày`;
  if (days <= 30) return ` 🟡 còn ${days} ngày`;
  return ` (còn ${days} ngày)`;
};

// ─── report generator ───────────────────────────────────────────────────────

function generateReport(data: ReturnType<typeof useWealth>): string {
  const {
    savingsDeposits, financialGoals, salaryAllocations, monthlySalaries,
    realEstateProperties, loans, goldHoldings, cryptoHoldings, funds,
    getTotalRealEstateValue, getTotalSavings, getTotalGoldValue,
    getTotalCryptoValue, getTotalLiabilities,
  } = data;

  const today = new Date();
  const todayStr = format(today, 'dd/MM/yyyy');
  const monthStr = format(today, 'MM/yyyy');

  const totalAssets =
    getTotalSavings() + getTotalGoldValue() + getTotalCryptoValue() + getTotalRealEstateValue();
  const totalLiab = getTotalLiabilities();
  const netWorth = totalAssets - totalLiab;

  const lines: string[] = [];

  // ── Header ─────────────────────────────────────────────────────────────────
  lines.push(`# Báo cáo tài chính gia đình — ${todayStr}`);
  lines.push(`> Xuất từ MacuFam Wealth Hub. Dùng để hỏi AI về phân bổ lương tháng ${monthStr}.`);

  // ── 1. Net Worth tổng quan ─────────────────────────────────────────────────
  lines.push(`\n## 1. Tổng quan Net Worth\n`);
  lines.push(`| Hạng mục | Giá trị |`);
  lines.push(`|---|---|`);
  lines.push(`| **Net Worth** | **${fmtVND(netWorth)}** |`);
  lines.push(`| Tổng tài sản | ${fmtVND(totalAssets)} |`);
  lines.push(`| Tổng nợ phải trả | ${fmtVND(totalLiab)} |`);
  lines.push(`| — Tiết kiệm | ${fmtVND(getTotalSavings())} |`);
  lines.push(`| — Vàng | ${fmtVND(getTotalGoldValue())} |`);
  lines.push(`| — Crypto | ${fmtVND(getTotalCryptoValue())} |`);
  lines.push(`| — Bất động sản | ${fmtVND(getTotalRealEstateValue())} |`);

  // ── 2. Tiết kiệm ───────────────────────────────────────────────────────────
  if (savingsDeposits.length > 0) {
    lines.push(`\n## 2. Sổ tiết kiệm (${savingsDeposits.length} sổ)\n`);
    lines.push(`| Tên / Ngân hàng | Số tiền | Lãi suất | Đáo hạn | Ghi chú |`);
    lines.push(`|---|---|---|---|---|`);
    [...savingsDeposits]
      .sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime())
      .forEach(d => {
        const dl = daysLeft(d.maturityDate);
        const goalName = financialGoals.find(g => g.id === d.goalId)?.name ?? '—';
        lines.push(
          `| ${d.name || d.bankName} | ${fmtVND(d.principal)} | ${d.interestRate}%/năm | ${fmtDate(d.maturityDate)}${urgencyLabel(dl)} | Gắn mục tiêu: ${goalName} |`
        );
      });
  }

  // ── 3. Mục tiêu tài chính ──────────────────────────────────────────────────
  const goalsWithProgress = financialGoals
    .filter(g => g.dueDate)
    .map(g => {
      const saved = savingsDeposits
        .filter(s => s.goalId === g.id)
        .reduce((sum, s) => sum + s.principal, 0);
      const allocated = salaryAllocations
        .filter(a => a.goalId === g.id)
        .reduce((sum, a) => sum + a.amount, 0);
      const remaining = Math.max(0, g.targetAmount - saved);
      const pct = g.targetAmount > 0 ? Math.round((saved / g.targetAmount) * 100) : 0;
      return { g, saved, allocated, remaining, pct, dl: daysLeft(g.dueDate) };
    })
    .sort((a, b) => (a.dl ?? 9999) - (b.dl ?? 9999));

  if (goalsWithProgress.length > 0) {
    lines.push(`\n## 3. Mục tiêu tài chính\n`);
    lines.push(`| Mục tiêu | Cần | Đã tích | Tiến độ | Còn thiếu | Deadline |`);
    lines.push(`|---|---|---|---|---|---|`);
    goalsWithProgress.forEach(({ g, saved, remaining, pct, dl }) => {
      const status = pct >= 100 ? '✅' : (dl !== null && dl < 60 && pct < 50) ? '🔴' : (dl !== null && dl < 90 && pct < 70) ? '🟡' : '🟢';
      lines.push(
        `| ${status} ${g.name} | ${fmtVND(g.targetAmount)} | ${fmtVND(saved)} | ${pct}% | ${remaining > 0 ? fmtVND(remaining) : '—'} | ${fmtDate(g.dueDate)}${urgencyLabel(dl)} |`
      );
    });
  }

  // ── 4. Quỹ chi tiêu ────────────────────────────────────────────────────────
  if (funds.length > 0) {
    lines.push(`\n## 4. Quỹ chi tiêu (sinking funds)\n`);
    lines.push(`> Các quỹ này tích lũy để CHI TIÊU, không phải đầu tư\n`);
    lines.push(`| Quỹ | Mục tiêu | Deadline | Trạng thái |`);
    lines.push(`|---|---|---|---|`);
    funds.forEach(f => {
      const dl = daysLeft(f.deadline);
      const status = f.status === 'ready' ? '✅ Đủ tiền' : `🔄 Đang tích${urgencyLabel(dl)}`;
      lines.push(`| ${f.name} | ${fmtVND(f.targetAmount)} | ${fmtDate(f.deadline)} | ${status} |`);
    });
  }

  // ── 5. Bất động sản + thanh toán ──────────────────────────────────────────
  if (realEstateProperties.length > 0) {
    lines.push(`\n## 5. Bất động sản\n`);
    realEstateProperties.forEach(p => {
      lines.push(`### ${p.name}`);
      lines.push(`- Giá trị: ${fmtVND(p.totalValue)}`);
      lines.push(`- Đã thanh toán: ${fmtVND(p.paidAmount)}`);
      const upcoming = (p.payments ?? [])
        .filter(pm => !pm.isPaid && daysLeft(pm.dueDate) !== null && daysLeft(pm.dueDate)! <= 90)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      if (upcoming.length > 0) {
        lines.push(`- **Đợt thanh toán sắp tới (trong 90 ngày):**`);
        upcoming.forEach(pm => {
          const dl = daysLeft(pm.dueDate);
          lines.push(`  - ${fmtVND(pm.amount)} — hạn ${fmtDate(pm.dueDate)}${urgencyLabel(dl)}${pm.note ? ` (${pm.note})` : ''}`);
        });
      }
    });
  }

  // ── 6. Khoản vay ──────────────────────────────────────────────────────────
  if (loans.length > 0) {
    lines.push(`\n## 6. Khoản vay & Dư nợ\n`);
    lines.push(`| Tên | Loại | Dư nợ | Gốc vay | Lãi suất | Trả góp/tháng |`);
    lines.push(`|---|---|---|---|---|---|`);
    loans.forEach(l => {
      const typeLabel = l.loanType === 'mortgage' ? 'Thế chấp' : l.loanType === 'family' ? 'Gia đình' : 'Tín chấp';
      const monthly = l.repaymentType === 'installment' && l.monthlyPayment
        ? fmtVND(l.monthlyPayment)
        : l.repaymentType === 'bullet'
        ? `Bullet — đáo hạn ${fmtDate(l.dueDate)}`
        : '—';
      lines.push(`| ${l.name} | ${typeLabel} | ${fmtVND(l.outstandingBalance)} | ${fmtVND(l.principalAmount)} | ${l.interestRate}%/năm | ${monthly} |`);
    });
  }

  // ── 7. Đầu tư ────────────────────────────────────────────────────────────
  const hasInvestments = goldHoldings.length > 0 || cryptoHoldings.length > 0;
  if (hasInvestments) {
    lines.push(`\n## 7. Đầu tư\n`);
    if (goldHoldings.length > 0) {
      const totalGoldVND = goldHoldings.reduce((s, g) => s + g.taels * g.currentPrice, 0);
      lines.push(`**Vàng** — Tổng giá trị: ${fmtVND(totalGoldVND)}`);
      goldHoldings.forEach(g => {
        const gain = (g.currentPrice - g.purchasePrice) * g.taels;
        lines.push(`- ${g.taels} lượng | Mua: ${fmtVND(g.purchasePrice)}/lượng | Hiện: ${fmtVND(g.currentPrice)}/lượng | Lãi/lỗ: ${gain >= 0 ? '+' : ''}${fmtVND(gain)}`);
      });
    }
    if (cryptoHoldings.length > 0) {
      const totalCryptoVND = cryptoHoldings.reduce((s, c) => s + c.amount * c.currentPrice, 0);
      lines.push(`\n**Crypto** — Tổng giá trị: ${fmtVND(totalCryptoVND)}`);
      cryptoHoldings.forEach(c => {
        const value = c.amount * c.currentPrice;
        const gain = value - c.purchaseCost;
        lines.push(`- ${c.symbol}: ${c.amount} | Giá trị: ${fmtVND(value)} | Lãi/lỗ: ${gain >= 0 ? '+' : ''}${fmtVND(gain)}`);
      });
    }
  }

  // ── 8. Thu nhập & phân bổ hiện tại ────────────────────────────────────────
  if (monthlySalaries.length > 0) {
    lines.push(`\n## 8. Thu nhập & Phân bổ hiện tại\n`);
    const recent = [...monthlySalaries].slice(-3);
    recent.forEach(s => {
      lines.push(`**${s.name}**: ${fmtVND(s.amount)}`);
      const allocs = salaryAllocations.filter(a => a.salaryId === s.id);
      if (allocs.length > 0) {
        allocs.forEach(a => {
          const goalName = financialGoals.find(g => g.id === a.goalId)?.name ?? 'Không rõ';
          lines.push(`  - → ${goalName}: ${fmtVND(a.amount)}${a.note ? ` (${a.note})` : ''}`);
        });
        const totalAlloc = allocs.reduce((sum, a) => sum + a.amount, 0);
        const unalloc = s.amount - totalAlloc;
        if (unalloc > 0) lines.push(`  - → Chưa phân bổ: ${fmtVND(unalloc)}`);
      } else {
        lines.push(`  - (Chưa phân bổ)`);
      }
    });
  }

  return lines.join('\n');
}

// ─── component ───────────────────────────────────────────────────────────────

interface Props { open: boolean; onClose: () => void }

export const AIExportDialog = ({ open, onClose }: Props) => {
  const wealth = useWealth();
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  const report = useMemo(() => generateReport(wealth), [key, open]);

  const copy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    toast.success('Đã sao chép! Dán vào Claude, ChatGPT hoặc Gemini.');
    setTimeout(() => setCopied(false), 2500);
  };

  const refresh = () => setKey(k => k + 1);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col top-[3%] translate-y-0">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Xuất dữ liệu cho AI
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Toàn bộ tình hình tài chính hiện tại. Sao chép, dán vào Claude / ChatGPT / Gemini rồi tự đặt câu hỏi.
          </p>
        </DialogHeader>

        {/* Report preview */}
        <div className="flex-1 min-h-0 rounded-lg border border-border bg-muted/30 overflow-hidden">
          <textarea
            readOnly
            value={report}
            className="w-full h-full min-h-[400px] p-4 bg-transparent text-xs font-mono text-foreground/80 resize-none outline-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center justify-between gap-3 pt-1">
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Đóng</Button>
            <Button size="sm" onClick={copy} className="min-w-[140px]">
              {copied
                ? <><CheckCheck className="h-4 w-4 mr-2" />Đã sao chép!</>
                : <><Copy className="h-4 w-4 mr-2" />Sao chép toàn bộ</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
