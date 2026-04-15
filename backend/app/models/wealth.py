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

