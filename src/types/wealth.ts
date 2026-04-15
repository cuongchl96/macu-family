// Core Types for MacuFam Wealth Management

export type Currency = 'VND' | 'USD';

export type AssetCategory = 'savings' | 'real-estate' | 'gold' | 'crypto';

export interface SavingsDeposit {
  id: string;
  name?: string;
  bankName: string;
  principal: number;
  interestRate: number;
  startDate: Date;
  maturityDate: Date;
  currency: Currency;
}

export interface RealEstatePayment {
  id: string;
  dueDate: Date;
  amount: number;
  isPaid: boolean;
  note?: string;
  currency: Currency;
}

export interface RealEstateProperty {
  id: string;
  name: string;
  totalValue: number;
  paidAmount: number;
  payments: RealEstatePayment[];
  currency: Currency;
}

export interface GoldHolding {
  id: string;
  taels: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: Date;
}

/** Record of a deposit (nạp tiền) to exchange - for tracking total capital put in */
export interface CryptoDeposit {
  id: string;
  amount: number;
  date: Date;
  note?: string;
  currency: Currency;
}

export interface CryptoHolding {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  purchaseCost: number;
  currentPrice: number;
  purchaseDate: Date;
}

export type Owner = 'wife' | 'husband' | 'joint';

export interface CapitalContribution {
  id: string;
  amount: number;
  date: Date;
  note?: string;
  currency: Currency;
  owner: Owner;
}

export interface PortfolioSummary {
  totalNetWorth: number;
  liquidAssets: number;
  fixedAssets: number;
  savingsTotal: number;
  goldTotal: number;
  cryptoTotal: number;
  realEstateTotal: number;
  currency: Currency;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// Exchange Rate
export interface ExchangeRate {
  rate: number;
  lastUpdated: Date;
}
