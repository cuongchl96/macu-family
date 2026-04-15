import type {
  SavingsDeposit,
  RealEstateProperty,
  GoldHolding,
  CryptoHolding,
  CryptoDeposit,
  ExchangeRate
} from '@/types/wealth';

// Exchange Rate (approximate)
export const exchangeRate: ExchangeRate = {
  rate: 25500, // 1 USD = 25,500 VND
  lastUpdated: new Date(),
};

// Savings Deposits from Excel
export const savingsDeposits: SavingsDeposit[] = [
  {
    id: 's1',
    bankName: 'Techcombank',
    principal: 874778424,
    interestRate: 4.7,
    startDate: new Date('2025-09-11'),
    maturityDate: new Date('2026-03-11'),
    currency: 'VND',
  },
  {
    id: 's2',
    bankName: 'Techcombank',
    principal: 138567358,
    interestRate: 5.0,
    startDate: new Date('2025-11-02'),
    maturityDate: new Date('2026-05-02'),
    currency: 'VND',
  },
  {
    id: 's3',
    bankName: 'Techcombank',
    principal: 184061096,
    interestRate: 5.9,
    startDate: new Date('2025-12-06'),
    maturityDate: new Date('2026-06-06'),
    currency: 'VND',
  },
  {
    id: 's4',
    bankName: 'Techcombank',
    principal: 302000000,
    interestRate: 5.9,
    startDate: new Date('2026-01-05'),
    maturityDate: new Date('2026-07-06'),
    currency: 'VND',
  },
  {
    id: 's5',
    bankName: 'Techcombank',
    principal: 60198000,
    interestRate: 5.3,
    startDate: new Date('2025-11-29'),
    maturityDate: new Date('2026-11-29'),
    currency: 'VND',
  },
  {
    id: 's6',
    bankName: 'Family Loan (Mẹ)',
    principal: 100000000,
    interestRate: 0,
    startDate: new Date('2026-01-01'),
    maturityDate: new Date('2026-03-01'),
    currency: 'VND',
  },
  {
    id: 's7',
    bankName: 'Tikop',
    principal: 155453344,
    interestRate: 7.2,
    startDate: new Date('2025-08-26'),
    maturityDate: new Date('2026-06-26'),
    currency: 'VND',
  },
  {
    id: 's8',
    bankName: 'Tikop',
    principal: 90670061,
    interestRate: 6.5,
    startDate: new Date('2026-01-30'),
    maturityDate: new Date('2026-06-30'),
    currency: 'VND',
  },
  {
    id: 's9',
    bankName: 'Tikop',
    principal: 3000000,
    interestRate: 6.0,
    startDate: new Date('2025-08-27'),
    maturityDate: new Date('2026-01-27'),
    currency: 'VND',
  },
  {
    id: 's10',
    bankName: 'Tikop',
    principal: 3150663,
    interestRate: 6.0,
    startDate: new Date('2025-11-19'),
    maturityDate: new Date('2026-04-19'),
    currency: 'VND',
  },
  {
    id: 's11',
    bankName: 'Tikop',
    principal: 2000000,
    interestRate: 6.0,
    startDate: new Date('2025-09-14'),
    maturityDate: new Date('2026-05-19'),
    currency: 'VND',
  },
  {
    id: 's12',
    bankName: 'Tikop (Tuấn)',
    principal: 18000000,
    interestRate: 6.0,
    startDate: new Date('2026-01-01'),
    maturityDate: new Date('2026-05-31'),
    currency: 'VND',
  },
  {
    id: 's13',
    bankName: 'Tikop (Chi)',
    principal: 22000000,
    interestRate: 6.0,
    startDate: new Date('2026-01-01'),
    maturityDate: new Date('2026-05-31'),
    currency: 'VND',
  },
];

// Real Estate from Excel
export const realEstateProperties: RealEstateProperty[] = [
  {
    id: 're1',
    name: 'Apartment Investment',
    totalValue: 1747714788,
    paidAmount: 861447716,
    currency: 'VND',
    payments: [
      { id: 'p1', dueDate: new Date('2024-09-09'), amount: 432812000, isPaid: true, note: 'Contract purchase', currency: 'VND' },
      { id: 'p2', dueDate: new Date('2024-12-16'), amount: 113239684, isPaid: true, currency: 'VND' },
      { id: 'p3', dueDate: new Date('2025-02-10'), amount: 43008550, isPaid: true, currency: 'VND' },
      { id: 'p4', dueDate: new Date('2025-04-09'), amount: 71680916, isPaid: true, currency: 'VND' },
      { id: 'p5', dueDate: new Date('2025-06-07'), amount: 43008550, isPaid: true, currency: 'VND' },
      { id: 'p6', dueDate: new Date('2025-08-11'), amount: 43008550, isPaid: true, currency: 'VND' },
      { id: 'p7', dueDate: new Date('2025-10-07'), amount: 71680916, isPaid: true, currency: 'VND' },
      { id: 'p8', dueDate: new Date('2025-12-02'), amount: 43008550, isPaid: true, currency: 'VND' },
      { id: 'p9', dueDate: new Date('2026-02-15'), amount: 43008550, isPaid: false, note: 'Pending', currency: 'VND' },
      { id: 'p10', dueDate: new Date('2026-04-15'), amount: 57344733, isPaid: false, note: 'Pending', currency: 'VND' },
      { id: 'p11', dueDate: new Date('2026-05-15'), amount: 43008550, isPaid: false, note: 'Pending', currency: 'VND' },
      { id: 'p12', dueDate: new Date('2026-06-19'), amount: 677665043, isPaid: false, note: 'Handover notification', currency: 'VND' },
      { id: 'p13', dueDate: new Date('2026-09-19'), amount: 65240196, isPaid: false, note: 'Title deed issuance', currency: 'VND' },
    ],
  },
];

// Gold Holdings from Excel
export const goldHoldings: GoldHolding[] = [
  {
    id: 'g1',
    taels: 2.3,
    purchasePrice: 82000000, // ~82M VND per tael (historical)
    currentPrice: 170000000, // ~M VND per tael (current)
    purchaseDate: new Date('2025-12-31'),
  },
];

// Crypto deposits (nạp tiền vào sàn) - track total capital put in
export const cryptoDeposits: CryptoDeposit[] = [];

// Crypto Holdings from Excel
export const cryptoHoldings: CryptoHolding[] = [
  {
    id: 'c1',
    name: 'Bitcoin & Crypto Mix',
    symbol: 'CRYPTO',
    amount: 1,
    purchaseCost: 250000000, // End of 2025
    currentPrice: 276000000, // Current value
    purchaseDate: new Date('2025-12-31'),
  },
  {
    id: 'c2',
    name: 'Additional Investment',
    symbol: 'CRYPTO',
    amount: 1,
    purchaseCost: 26000000,
    currentPrice: 26000000,
    purchaseDate: new Date('2026-01-09'),
  },
];

// Personal breakdowns from Excel
export const personalAssets = {
  wife: {
    total: 1677000000,
    endOf2025: 1657000000,
    deposits: [
      { date: new Date('2026-01-03'), amount: 20000000 },
    ],
  },
  husband: {
    total: 1450000000,
    endOf2025: 1365000000,
    deposits: [
      { date: new Date('2026-01-09'), amount: 60000000 },
      { date: new Date('2026-01-26'), amount: 25000000 },
    ],
  },
};

// Utility function to format VND
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Utility function to format USD
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Convert VND to USD
export const vndToUsd = (vnd: number): number => {
  return vnd / exchangeRate.rate;
};

// Get total savings
export const getTotalSavings = (): number => {
  return savingsDeposits.reduce((sum, deposit) => sum + deposit.principal, 0);
};

// Get total gold value
export const getTotalGoldValue = (): number => {
  return goldHoldings.reduce((sum, holding) => sum + (holding.taels * holding.currentPrice), 0);
};

// Get total crypto value
export const getTotalCryptoValue = (): number => {
  return cryptoHoldings.reduce((sum, holding) => sum + holding.currentPrice, 0);
};

// Get total real estate value
export const getTotalRealEstateValue = (): number => {
  return realEstateProperties.reduce((sum, property) => sum + property.totalValue, 0);
};

// Get total net worth
export const getTotalNetWorth = (): number => {
  return getTotalSavings() + getTotalGoldValue() + getTotalCryptoValue() + getTotalRealEstateValue();
};

// Get liquid assets (savings + gold + crypto)
export const getLiquidAssets = (): number => {
  return getTotalSavings() + getTotalGoldValue() + getTotalCryptoValue();
};

// Calculate days until maturity
export const getDaysToMaturity = (maturityDate: Date): number => {
  const today = new Date();
  const diffTime = maturityDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format date to Vietnamese format
export const formatDateVN = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};
