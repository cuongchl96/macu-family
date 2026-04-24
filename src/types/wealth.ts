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
  goalId?: string;
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

// --- Salary Planning Types ---

export type GoalCategory = 'real_estate_payment' | 'travel' | 'education' | 'emergency' | 'other';

export interface MonthlySalary {
  id: string;
  month: string; // "YYYY-MM" e.g. "2026-01"
  amount: number;
  note?: string;
  currency: Currency;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currency: Currency;
  category: GoalCategory;
  dueDate?: Date;
  /** Tham chiếu BĐS — chỉ hiển thị, không auto-update trạng thái */
  propertyId?: string;
  paymentId?: string;
  note?: string;
}

export interface SalaryAllocation {
  id: string;
  salaryId: string;
  goalId: string;
  amount: number;
  note?: string;
}

/** Computed type — tính toán ở FE, không lưu DB */
export interface GoalProgress {
  goal: FinancialGoal;
  /** Tổng các allocation (Kế hoạch) */
  plannedAmount: number;
  /** Tổng principal của các SavingsDeposit có goalId (Thực tế) */
  savedAmount: number;
  /** savedAmount / targetAmount * 100 */
  progressPercent: number;
  /** plannedAmount / targetAmount * 100 */
  plannedPercent: number;
  remainingAmount: number;
  allocations: Array<SalaryAllocation & {
    salary: MonthlySalary;
  }>;
  savingsDeposits: SavingsDeposit[];
}
