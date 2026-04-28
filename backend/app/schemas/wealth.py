from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from enum import Enum

class CurrencyEnum(str, Enum):
    VND = "VND"
    USD = "USD"

class OwnerEnum(str, Enum):
    joint = "joint"
    husband = "husband"
    wife = "wife"

class RealEstatePaymentBase(BaseModel):
    id: str
    due_date: date
    amount: float
    is_paid: bool
    note: Optional[str] = None
    currency: CurrencyEnum

class RealEstatePaymentCreate(RealEstatePaymentBase):
    pass

class RealEstatePayment(RealEstatePaymentBase):
    property_id: str
    class Config:
        from_attributes = True

class RealEstatePropertyBase(BaseModel):
    id: str
    name: str
    total_value: float
    paid_amount: float
    currency: CurrencyEnum
    owner: Optional[OwnerEnum] = OwnerEnum.joint
    real_estate_payments: Optional[List[RealEstatePaymentBase]] = None

class RealEstatePropertyCreate(RealEstatePropertyBase):
    pass

class RealEstatePropertyUpdate(BaseModel):
    name: Optional[str] = None
    total_value: Optional[float] = None
    paid_amount: Optional[float] = None
    currency: Optional[CurrencyEnum] = None
    owner: Optional[OwnerEnum] = None
    real_estate_payments: Optional[List[RealEstatePaymentBase]] = None

class RealEstateProperty(RealEstatePropertyBase):
    class Config:
        from_attributes = True

class SavingsDepositBase(BaseModel):
    id: str
    name: Optional[str] = None
    bank_name: str
    principal: float
    interest_rate: float
    start_date: date
    maturity_date: date
    currency: CurrencyEnum
    owner: Optional[OwnerEnum] = OwnerEnum.joint
    goal_id: Optional[str] = None

class SavingsDepositCreate(SavingsDepositBase):
    pass

class SavingsDepositUpdate(BaseModel):
    name: Optional[str] = None
    bank_name: Optional[str] = None
    principal: Optional[float] = None
    interest_rate: Optional[float] = None
    start_date: Optional[date] = None
    maturity_date: Optional[date] = None
    currency: Optional[CurrencyEnum] = None
    owner: Optional[OwnerEnum] = None
    goal_id: Optional[str] = None

class SavingsDeposit(SavingsDepositBase):
    class Config:
        from_attributes = True

class CryptoDepositBase(BaseModel):
    id: str
    amount: float
    date: date
    note: Optional[str] = None
    currency: CurrencyEnum

class CryptoDepositCreate(CryptoDepositBase):
    pass

class CryptoDepositUpdate(BaseModel):
    amount: Optional[float] = None
    date: Optional[date] = None
    note: Optional[str] = None
    currency: Optional[CurrencyEnum] = None

class CryptoDeposit(CryptoDepositBase):
    class Config:
        from_attributes = True

class CryptoHoldingBase(BaseModel):
    id: str
    name: str
    symbol: str
    amount: float
    purchase_cost: float
    current_price: float
    purchase_date: date
    owner: Optional[OwnerEnum] = OwnerEnum.joint

class CryptoHoldingCreate(CryptoHoldingBase):
    pass

class CryptoHoldingUpdate(BaseModel):
    name: Optional[str] = None
    symbol: Optional[str] = None
    amount: Optional[float] = None
    purchase_cost: Optional[float] = None
    current_price: Optional[float] = None
    purchase_date: Optional[date] = None
    owner: Optional[OwnerEnum] = None

class CryptoHolding(CryptoHoldingBase):
    class Config:
        from_attributes = True

class GoldHoldingBase(BaseModel):
    id: str
    taels: float
    purchase_price: float
    current_price: float
    purchase_date: date
    owner: Optional[OwnerEnum] = OwnerEnum.joint

class GoldHoldingCreate(GoldHoldingBase):
    pass

class GoldHoldingUpdate(BaseModel):
    taels: Optional[float] = None
    purchase_price: Optional[float] = None
    current_price: Optional[float] = None
    purchase_date: Optional[date] = None
    owner: Optional[OwnerEnum] = None

class GoldHolding(GoldHoldingBase):
    class Config:
        from_attributes = True

class CapitalContributionBase(BaseModel):
    id: str
    amount: float
    date: date
    note: Optional[str] = None
    currency: CurrencyEnum
    owner: Optional[OwnerEnum] = OwnerEnum.joint

class CapitalContributionCreate(CapitalContributionBase):
    pass

class CapitalContributionUpdate(BaseModel):
    amount: Optional[float] = None
    date: Optional[date] = None
    note: Optional[str] = None
    currency: Optional[CurrencyEnum] = None
    owner: Optional[OwnerEnum] = None

class CapitalContribution(CapitalContributionBase):
    class Config:
        from_attributes = True


# --- Salary Planning Schemas ---

class GoalCategoryEnum(str, Enum):
    real_estate_payment = "real_estate_payment"
    travel = "travel"
    education = "education"
    emergency = "emergency"
    other = "other"

class GoalSourceEnum(str, Enum):
    manual = "manual"
    real_estate = "real_estate"
    fund = "fund"

class FundStatusEnum(str, Enum):
    accumulating = "accumulating"
    ready = "ready"

# MonthlySalary
class MonthlySalaryBase(BaseModel):
    id: str
    name: str  # Free-text e.g. "Lương tháng 4/2026"
    amount: float
    note: Optional[str] = None
    currency: CurrencyEnum

class MonthlySalaryCreate(MonthlySalaryBase):
    pass

class MonthlySalaryUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    note: Optional[str] = None
    currency: Optional[CurrencyEnum] = None

class MonthlySalary(MonthlySalaryBase):
    class Config:
        from_attributes = True

# FinancialGoal
class FinancialGoalBase(BaseModel):
    id: str
    name: str
    target_amount: float
    currency: CurrencyEnum
    category: GoalCategoryEnum
    due_date: Optional[date] = None
    source: GoalSourceEnum = GoalSourceEnum.manual
    property_id: Optional[str] = None
    payment_id: Optional[str] = None
    note: Optional[str] = None

class FinancialGoalCreate(FinancialGoalBase):
    pass

class FinancialGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    currency: Optional[CurrencyEnum] = None
    category: Optional[GoalCategoryEnum] = None
    due_date: Optional[date] = None
    source: Optional[GoalSourceEnum] = None
    property_id: Optional[str] = None
    payment_id: Optional[str] = None
    note: Optional[str] = None

class FinancialGoal(FinancialGoalBase):
    class Config:
        from_attributes = True

# SalaryAllocation
class SalaryAllocationBase(BaseModel):
    id: str
    salary_id: str
    goal_id: str
    amount: float
    note: Optional[str] = None

class SalaryAllocationCreate(SalaryAllocationBase):
    pass

class SalaryAllocationUpdate(BaseModel):
    amount: Optional[float] = None
    note: Optional[str] = None

class SalaryAllocation(SalaryAllocationBase):
    class Config:
        from_attributes = True

# --- Fund Schemas ---

class FundBase(BaseModel):
    id: str
    name: str
    target_amount: float
    currency: CurrencyEnum
    category: GoalCategoryEnum
    deadline: date
    status: FundStatusEnum = FundStatusEnum.accumulating
    note: Optional[str] = None
    goal_id: Optional[str] = None

class FundCreate(BaseModel):
    id: str
    name: str
    target_amount: float
    currency: CurrencyEnum
    category: GoalCategoryEnum
    deadline: date
    note: Optional[str] = None

class FundUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    currency: Optional[CurrencyEnum] = None
    category: Optional[GoalCategoryEnum] = None
    deadline: Optional[date] = None
    note: Optional[str] = None

class FundStatusUpdate(BaseModel):
    status: FundStatusEnum

class Fund(FundBase):
    class Config:
        from_attributes = True

# FundExpense
class FundExpenseBase(BaseModel):
    id: str
    fund_id: str
    amount: float
    date: date
    note: Optional[str] = None

class FundExpenseCreate(FundExpenseBase):
    pass

class FundExpense(FundExpenseBase):
    class Config:
        from_attributes = True


# --- Loan Schemas ---

class LoanTypeEnum(str, Enum):
    family = "family"
    mortgage = "mortgage"
    consumer = "consumer"

class RepaymentTypeEnum(str, Enum):
    bullet = "bullet"
    installment = "installment"

class LoanBase(BaseModel):
    id: str
    name: str
    loan_type: LoanTypeEnum
    creditor: str
    principal_amount: float
    outstanding_balance: float
    interest_rate: float = 0
    start_date: date
    due_date: Optional[date] = None
    currency: CurrencyEnum
    repayment_type: RepaymentTypeEnum
    monthly_payment: Optional[float] = None
    property_id: Optional[str] = None
    note: Optional[str] = None

class LoanCreate(LoanBase):
    pass

class LoanUpdate(BaseModel):
    name: Optional[str] = None
    creditor: Optional[str] = None
    outstanding_balance: Optional[float] = None
    interest_rate: Optional[float] = None
    due_date: Optional[date] = None
    monthly_payment: Optional[float] = None
    note: Optional[str] = None

class Loan(LoanBase):
    class Config:
        from_attributes = True


# --- Net Worth Snapshot Schemas ---

class NetWorthSnapshotCreate(BaseModel):
    total_assets: float
    total_liabilities: float
    net_worth: float
    savings_total: float = 0
    gold_total: float = 0
    crypto_total: float = 0
    real_estate_total: float = 0
    loans_total: float = 0

class NetWorthSnapshot(BaseModel):
    id: str
    snapshot_date: str
    total_assets: float
    total_liabilities: float
    net_worth: float
    savings_total: float
    gold_total: float
    crypto_total: float
    real_estate_total: float
    loans_total: float

    class Config:
        from_attributes = True

