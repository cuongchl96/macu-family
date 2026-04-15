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

