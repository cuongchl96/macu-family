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
