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

class MonthlySalary(Base):
    __tablename__ = "monthly_salaries"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    month = Column(String, nullable=False)  # YYYY-MM e.g. "2026-01"
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
