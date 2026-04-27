from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.security import verify_token
from app.database import get_db
from app.models import wealth as models
from app.schemas import wealth as schemas

router = APIRouter(dependencies=[Depends(verify_token)])

# --- Gold Holdings ---
@router.get("/gold_holdings", response_model=List[schemas.GoldHolding])
async def get_gold(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.GoldHolding))
    return result.scalars().all()

@router.post("/gold_holdings", response_model=schemas.GoldHolding)
async def create_gold(item: schemas.GoldHoldingCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.GoldHolding(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.put("/gold_holdings/{id}", response_model=schemas.GoldHolding)
async def update_gold(id: str, item: schemas.GoldHoldingUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.GoldHolding).where(models.GoldHolding.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/gold_holdings/{id}")
async def delete_gold(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.GoldHolding).where(models.GoldHolding.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}

# --- Savings Deposits ---
@router.get("/savings_deposits", response_model=List[schemas.SavingsDeposit])
async def get_savings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SavingsDeposit))
    return result.scalars().all()

@router.post("/savings_deposits", response_model=schemas.SavingsDeposit)
async def create_savings(item: schemas.SavingsDepositCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.SavingsDeposit(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.put("/savings_deposits/{id}", response_model=schemas.SavingsDeposit)
async def update_savings(id: str, item: schemas.SavingsDepositUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SavingsDeposit).where(models.SavingsDeposit.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/savings_deposits/{id}")
async def delete_savings(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SavingsDeposit).where(models.SavingsDeposit.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}

# --- Crypto Deposits ---
@router.get("/crypto_deposits", response_model=List[schemas.CryptoDeposit])
async def get_crypto_dep(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CryptoDeposit))
    return result.scalars().all()

@router.post("/crypto_deposits", response_model=schemas.CryptoDeposit)
async def create_crypto_dep(item: schemas.CryptoDepositCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.CryptoDeposit(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.put("/crypto_deposits/{id}", response_model=schemas.CryptoDeposit)
async def update_crypto_dep(id: str, item: schemas.CryptoDepositUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CryptoDeposit).where(models.CryptoDeposit.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/crypto_deposits/{id}")
async def delete_crypto_dep(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CryptoDeposit).where(models.CryptoDeposit.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}

# --- Crypto Holdings ---
@router.get("/crypto_holdings", response_model=List[schemas.CryptoHolding])
async def get_crypto_hold(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CryptoHolding))
    return result.scalars().all()

@router.post("/crypto_holdings", response_model=schemas.CryptoHolding)
async def create_crypto_hold(item: schemas.CryptoHoldingCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.CryptoHolding(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.put("/crypto_holdings/{id}", response_model=schemas.CryptoHolding)
async def update_crypto_hold(id: str, item: schemas.CryptoHoldingUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CryptoHolding).where(models.CryptoHolding.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/crypto_holdings/{id}")
async def delete_crypto_hold(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CryptoHolding).where(models.CryptoHolding.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}

# --- Real Estate Properties ---
@router.get("/real_estate_properties")
async def get_real_estate(db: AsyncSession = Depends(get_db)):
    # Load properties and nested payments via selectinload
    stmt = select(models.RealEstateProperty).options(selectinload(models.RealEstateProperty.payments))
    result = await db.execute(stmt)
    properties = result.scalars().all()
    
    res = []
    for prop in properties:
        data = schemas.RealEstateProperty.model_validate(prop).model_dump()
        # the FE expects 'real_estate_payments' key from legacy supabase
        data['real_estate_payments'] = [schemas.RealEstatePayment.model_validate(p).model_dump() for p in prop.payments]
        res.append(data)
    return res

@router.post("/real_estate_properties")
async def create_real_estate(item: schemas.RealEstatePropertyCreate, db: AsyncSession = Depends(get_db)):
    data = item.model_dump(exclude={"real_estate_payments"})
    db_item = models.RealEstateProperty(**data)
    db.add(db_item)
    
    if item.real_estate_payments:
        for pm in item.real_estate_payments:
            db_pm = models.RealEstatePayment(**pm.model_dump(), property_id=db_item.id)
            db.add(db_pm)
            
    await db.commit()
    return {"ok": True}

@router.put("/real_estate_properties/{id}")
async def update_real_estate(id: str, item: schemas.RealEstatePropertyUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.RealEstateProperty).where(models.RealEstateProperty.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    update_data = item.model_dump(exclude={"real_estate_payments"}, exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    # Handle nested payments: remove old, insert new. 
    # Supabase code does a full replace of real estate payments.
    if item.real_estate_payments is not None:
        await db.execute(models.RealEstatePayment.__table__.delete().where(models.RealEstatePayment.property_id == id))
        for pm in item.real_estate_payments:
            db_pm = models.RealEstatePayment(**pm.model_dump(), property_id=id)
            db.add(db_pm)
            
    await db.commit()
    return {"ok": True}

@router.delete("/real_estate_properties/{id}")
async def delete_real_estate(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.RealEstateProperty).where(models.RealEstateProperty.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}

# --- Capital Contributions ---
@router.get("/capital_contributions", response_model=List[schemas.CapitalContribution])
async def get_capital_contributions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CapitalContribution))
    return result.scalars().all()

@router.post("/capital_contributions", response_model=schemas.CapitalContribution)
async def create_capital_contribution(item: schemas.CapitalContributionCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.CapitalContribution(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.put("/capital_contributions/{id}", response_model=schemas.CapitalContribution)
async def update_capital_contribution(id: str, item: schemas.CapitalContributionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CapitalContribution).where(models.CapitalContribution.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/capital_contributions/{id}")
async def delete_capital_contribution(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.CapitalContribution).where(models.CapitalContribution.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}


# --- Monthly Salaries ---
@router.get("/monthly_salaries", response_model=List[schemas.MonthlySalary])
async def get_monthly_salaries(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MonthlySalary))
    return result.scalars().all()

@router.post("/monthly_salaries", response_model=schemas.MonthlySalary)
async def create_monthly_salary(item: schemas.MonthlySalaryCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.MonthlySalary(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.put("/monthly_salaries/{id}", response_model=schemas.MonthlySalary)
async def update_monthly_salary(id: str, item: schemas.MonthlySalaryUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MonthlySalary).where(models.MonthlySalary.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/monthly_salaries/{id}")
async def delete_monthly_salary(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.MonthlySalary).where(models.MonthlySalary.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}


# --- Financial Goals ---
@router.get("/financial_goals", response_model=List[schemas.FinancialGoal])
async def get_financial_goals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.FinancialGoal))
    return result.scalars().all()

@router.post("/financial_goals", response_model=schemas.FinancialGoal)
async def create_financial_goal(item: schemas.FinancialGoalCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.FinancialGoal(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.put("/financial_goals/{id}", response_model=schemas.FinancialGoal)
async def update_financial_goal(id: str, item: schemas.FinancialGoalUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.FinancialGoal).where(models.FinancialGoal.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/financial_goals/{id}")
async def delete_financial_goal(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.FinancialGoal).where(models.FinancialGoal.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}


# --- Salary Allocations ---
@router.get("/salary_allocations", response_model=List[schemas.SalaryAllocation])
async def get_salary_allocations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SalaryAllocation))
    return result.scalars().all()

@router.post("/salary_allocations", response_model=schemas.SalaryAllocation)
async def create_salary_allocation(item: schemas.SalaryAllocationCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.SalaryAllocation(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.put("/salary_allocations/{id}", response_model=schemas.SalaryAllocation)
async def update_salary_allocation(id: str, item: schemas.SalaryAllocationUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SalaryAllocation).where(models.SalaryAllocation.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    await db.commit()
    await db.refresh(db_item)
    return db_item



@router.delete("/salary_allocations/{id}")
async def delete_salary_allocation(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SalaryAllocation).where(models.SalaryAllocation.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}


# --- Funds ---
@router.get("/funds", response_model=List[schemas.Fund])
async def get_funds(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Fund))
    return result.scalars().all()

@router.post("/funds", response_model=schemas.Fund)
async def create_fund(item: schemas.FundCreate, db: AsyncSession = Depends(get_db)):
    """Create a Fund and auto-generate a linked FinancialGoal."""
    import uuid
    goal_id = str(uuid.uuid4())
    # Auto-create linked FinancialGoal
    goal = models.FinancialGoal(
        id=goal_id,
        name=item.name,
        target_amount=item.target_amount,
        currency=item.currency,
        category=item.category,
        due_date=item.deadline,
        source=models.GoalSourceEnum.fund,
        note=f"Tự động tạo từ Quỹ: {item.name}",
    )
    db.add(goal)
    # Create Fund with link to goal
    fund = models.Fund(
        id=item.id,
        name=item.name,
        target_amount=item.target_amount,
        currency=item.currency,
        category=item.category,
        deadline=item.deadline,
        note=item.note,
        goal_id=goal_id,
    )
    db.add(fund)
    await db.commit()
    await db.refresh(fund)
    return fund

@router.put("/funds/{id}", response_model=schemas.Fund)
async def update_fund(id: str, item: schemas.FundUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Fund).where(models.Fund.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Fund not found")
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    # Auto-update linked Goal
    if db_item.goal_id:
        goal_result = await db.execute(select(models.FinancialGoal).where(models.FinancialGoal.id == db_item.goal_id))
        goal = goal_result.scalar_one_or_none()
        if goal:
            if "name" in update_data:
                goal.name = update_data["name"]
            if "target_amount" in update_data:
                goal.target_amount = update_data["target_amount"]
            if "currency" in update_data:
                goal.currency = update_data["currency"]
            if "category" in update_data:
                goal.category = update_data["category"]
            if "deadline" in update_data:
                goal.due_date = update_data["deadline"]
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.patch("/funds/{id}/status", response_model=schemas.Fund)
async def update_fund_status(id: str, body: schemas.FundStatusUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Fund).where(models.Fund.id == id))
    db_item = result.scalar_one_or_none()
    if not db_item:
        raise HTTPException(status_code=404, detail="Fund not found")
    db_item.status = body.status
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/funds/{id}")
async def delete_fund(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Fund).where(models.Fund.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        # Delete linked Goal (cascade will handle allocations/savings)
        if db_item.goal_id:
            goal_result = await db.execute(select(models.FinancialGoal).where(models.FinancialGoal.id == db_item.goal_id))
            goal = goal_result.scalar_one_or_none()
            if goal:
                await db.delete(goal)
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}


# --- Fund Expenses ---
@router.get("/fund_expenses", response_model=List[schemas.FundExpense])
async def get_fund_expenses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.FundExpense))
    return result.scalars().all()

@router.post("/fund_expenses", response_model=schemas.FundExpense)
async def create_fund_expense(item: schemas.FundExpenseCreate, db: AsyncSession = Depends(get_db)):
    db_item = models.FundExpense(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/fund_expenses/{id}")
async def delete_fund_expense(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.FundExpense).where(models.FundExpense.id == id))
    db_item = result.scalar_one_or_none()
    if db_item:
        await db.delete(db_item)
        await db.commit()
    return {"ok": True}


# --- BĐS Auto-Sync Goals ---
@router.post("/real_estate_properties/{id}/sync_goals")
async def sync_property_goals(id: str, db: AsyncSession = Depends(get_db)):
    """Auto-create FinancialGoals for unpaid payments of a property."""
    import uuid
    result = await db.execute(
        select(models.RealEstateProperty)
        .options(selectinload(models.RealEstateProperty.payments))
        .where(models.RealEstateProperty.id == id)
    )
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    created = 0
    for payment in prop.payments:
        if payment.is_paid:
            continue
        # Check if a goal already exists for this payment
        existing = await db.execute(
            select(models.FinancialGoal).where(
                models.FinancialGoal.payment_id == payment.id,
                models.FinancialGoal.source == models.GoalSourceEnum.real_estate,
            )
        )
        if existing.scalar_one_or_none():
            continue
        goal = models.FinancialGoal(
            id=str(uuid.uuid4()),
            name=f"Trả góp {prop.name} - {payment.due_date.strftime('%d/%m/%Y')}",
            target_amount=payment.amount,
            currency=payment.currency,
            category=models.GoalCategoryEnum.real_estate_payment,
            due_date=payment.due_date,
            source=models.GoalSourceEnum.real_estate,
            property_id=prop.id,
            payment_id=payment.id,
            note=payment.note,
        )
        db.add(goal)
        created += 1
    await db.commit()
    return {"ok": True, "goals_created": created}

