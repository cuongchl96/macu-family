import uuid
from sqlalchemy import Column, String, Float, Date, ForeignKey, Enum as SAEnum, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import date
import enum

class CurrencyEnum(str, enum.Enum):
    VND = "VND"
    USD = "USD"

class OwnerEnum(str, enum.Enum):
    joint = "joint"
    husband = "husband"
    wife = "wife"

class RealEstateProperty(Base):
    __tablename__ = "real_estate_properties"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    total_value = Column(Float, nullable=False)
    paid_amount = Column(Float, nullable=False)
    currency = Column(SAEnum(CurrencyEnum), nullable=False)
    owner = Column(SAEnum(OwnerEnum), nullable=False)
    
    payments = relationship("RealEstatePayment", back_populates="property", cascade="all, delete-orphan", lazy="selectin")

class RealEstatePayment(Base):
    __tablename__ = "real_estate_payments"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id = Column(String, ForeignKey("real_estate_properties.id", ondelete="CASCADE"), nullable=False)
    due_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    is_paid = Column(Boolean, nullable=False, default=False)
    note = Column(String, nullable=True)
    currency = Column(SAEnum(CurrencyEnum), nullable=False)
    
    property = relationship("RealEstateProperty", back_populates="payments")

class SavingsDeposit(Base):
    __tablename__ = "savings_deposits"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=True)
    bank_name = Column(String, nullable=False)
    principal = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    maturity_date = Column(Date, nullable=False)
    currency = Column(SAEnum(CurrencyEnum), nullable=False)
    owner = Column(SAEnum(OwnerEnum), nullable=False)
    goal_id = Column(String, ForeignKey("financial_goals.id", ondelete="SET NULL"), nullable=True)

    goal = relationship("FinancialGoal", back_populates="savings_deposits")

class CryptoDeposit(Base):
    __tablename__ = "crypto_deposits"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    note = Column(String, nullable=True)
    currency = Column(SAEnum(CurrencyEnum), nullable=False)

class CryptoHolding(Base):
    __tablename__ = "crypto_holdings"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    purchase_cost = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    purchase_date = Column(Date, nullable=False)
    owner = Column(SAEnum(OwnerEnum), nullable=False)

class GoldHolding(Base):
    __tablename__ = "gold_holdings"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    taels = Column(Float, nullable=False)
    purchase_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    purchase_date = Column(Date, nullable=False)
    owner = Column(SAEnum(OwnerEnum), nullable=False)

class CapitalContribution(Base):
    __tablename__ = "capital_contributions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    note = Column(String, nullable=True)
    currency = Column(SAEnum(CurrencyEnum), nullable=False)
    owner = Column(SAEnum(OwnerEnum), nullable=False)


# --- Salary Planning Feature ---

class GoalCategoryEnum(str, enum.Enum):
    real_estate_payment = "real_estate_payment"
    travel = "travel"
    education = "education"
    emergency = "emergency"
    other = "other"

class GoalSourceEnum(str, enum.Enum):
    manual = "manual"
    real_estate = "real_estate"
    fund = "fund"

class FundStatusEnum(str, enum.Enum):
    accumulating = "accumulating"
    ready = "ready"

class MonthlySalary(Base):
    __tablename__ = "monthly_salaries"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)  # Free-text e.g. "Lương tháng 4/2026", "Thưởng Q1"
    amount = Column(Float, nullable=False)
    note = Column(String, nullable=True)
    currency = Column(SAEnum(CurrencyEnum), nullable=False)

    allocations = relationship("SalaryAllocation", back_populates="salary", cascade="all, delete-orphan")

class FinancialGoal(Base):
    __tablename__ = "financial_goals"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    currency = Column(SAEnum(CurrencyEnum), nullable=False)
    category = Column(SAEnum(GoalCategoryEnum), nullable=False)
    due_date = Column(Date, nullable=True)
    source = Column(SAEnum(GoalSourceEnum, native_enum=False), nullable=False, default=GoalSourceEnum.manual)
    # Optional reference to real estate (display only, no auto side-effects)
    property_id = Column(String, ForeignKey("real_estate_properties.id", ondelete="SET NULL"), nullable=True)
    payment_id = Column(String, ForeignKey("real_estate_payments.id", ondelete="SET NULL"), nullable=True)
    note = Column(String, nullable=True)

    allocations = relationship("SalaryAllocation", back_populates="goal", cascade="all, delete-orphan")
    savings_deposits = relationship("SavingsDeposit", back_populates="goal")

class SalaryAllocation(Base):
    __tablename__ = "salary_allocations"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    salary_id = Column(String, ForeignKey("monthly_salaries.id", ondelete="CASCADE"), nullable=False)
    goal_id = Column(String, ForeignKey("financial_goals.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    note = Column(String, nullable=True)

    salary = relationship("MonthlySalary", back_populates="allocations")
    goal = relationship("FinancialGoal", back_populates="allocations")


# --- Fund Management ---

class Fund(Base):
    __tablename__ = "funds"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    currency = Column(SAEnum(CurrencyEnum), nullable=False)
    category = Column(SAEnum(GoalCategoryEnum), nullable=False)
    deadline = Column(Date, nullable=False)
    status = Column(SAEnum(FundStatusEnum, native_enum=False), nullable=False, default=FundStatusEnum.accumulating)
    note = Column(String, nullable=True)
    goal_id = Column(String, ForeignKey("financial_goals.id", ondelete="SET NULL"), nullable=True)

    goal = relationship("FinancialGoal")
    expenses = relationship("FundExpense", back_populates="fund", cascade="all, delete-orphan")

class FundExpense(Base):
    __tablename__ = "fund_expenses"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    fund_id = Column(String, ForeignKey("funds.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    note = Column(String, nullable=True)

    fund = relationship("Fund", back_populates="expenses")


# --- Loans / Liabilities ---

class LoanTypeEnum(str, enum.Enum):
    family = "family"
    mortgage = "mortgage"
    consumer = "consumer"

class RepaymentTypeEnum(str, enum.Enum):
    bullet = "bullet"
    installment = "installment"

class Loan(Base):
    __tablename__ = "loans"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    loan_type = Column(SAEnum(LoanTypeEnum, native_enum=False), nullable=False)
    creditor = Column(String, nullable=False)
    principal_amount = Column(Float, nullable=False)
    outstanding_balance = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False, default=0)
    start_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    currency = Column(SAEnum(CurrencyEnum), nullable=False)
    repayment_type = Column(SAEnum(RepaymentTypeEnum, native_enum=False), nullable=False)
    monthly_payment = Column(Float, nullable=True)
    property_id = Column(String, ForeignKey("real_estate_properties.id", ondelete="SET NULL"), nullable=True)
    note = Column(String, nullable=True)
    created_at = Column(Date, nullable=False, default=date.today)


# --- Notification Settings ---

class NotificationSettings(Base):
    __tablename__ = "notification_settings"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    telegram_bot_token = Column(String, nullable=True)
    telegram_chat_id = Column(String, nullable=True)
    enabled = Column(Boolean, nullable=False, default=True)
    notify_realestate = Column(Boolean, nullable=False, default=True)
    notify_savings = Column(Boolean, nullable=False, default=True)
    notify_goals = Column(Boolean, nullable=False, default=True)
    notify_monthly = Column(Boolean, nullable=False, default=True)
    days_before_alert = Column(Float, nullable=False, default=7)


# --- Net Worth Snapshots ---

class NetWorthSnapshot(Base):
    __tablename__ = "net_worth_snapshots"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    snapshot_date = Column(String, nullable=False)  # YYYY-MM
    total_assets = Column(Float, nullable=False)
    total_liabilities = Column(Float, nullable=False)
    net_worth = Column(Float, nullable=False)
    savings_total = Column(Float, nullable=False, default=0)
    gold_total = Column(Float, nullable=False, default=0)
    crypto_total = Column(Float, nullable=False, default=0)
    real_estate_total = Column(Float, nullable=False, default=0)
    loans_total = Column(Float, nullable=False, default=0)
    created_at = Column(Date, nullable=False, default=date.today)

