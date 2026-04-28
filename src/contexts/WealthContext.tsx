import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { Currency } from '@/types/wealth';
import type { RealEstateProperty, SavingsDeposit, CryptoDeposit, CryptoHolding, GoldHolding, CapitalContribution, MonthlySalary, FinancialGoal, SalaryAllocation, Fund, FundExpense, Loan, NetWorthSnapshot } from '@/types/wealth';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface WealthContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  hideValues: boolean;
  toggleHideValues: () => void;
  // Auth state
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  // Real estate CRUD
  realEstateProperties: RealEstateProperty[];
  addRealEstateProperty: (property: Omit<RealEstateProperty, 'id'>) => void;
  updateRealEstateProperty: (id: string, updates: Partial<RealEstateProperty>) => void;
  deleteRealEstateProperty: (id: string) => void;
  getTotalRealEstateValue: () => number;
  // Savings CRUD
  savingsDeposits: SavingsDeposit[];
  addSavingsDeposit: (deposit: Omit<SavingsDeposit, 'id'>) => void;
  updateSavingsDeposit: (id: string, updates: Partial<SavingsDeposit>) => void;
  deleteSavingsDeposit: (id: string) => void;
  getTotalSavings: () => number;
  // Crypto deposits (nạp tiền vào sàn)
  cryptoDeposits: CryptoDeposit[];
  addCryptoDeposit: (deposit: Omit<CryptoDeposit, 'id'>) => void;
  updateCryptoDeposit: (id: string, updates: Partial<CryptoDeposit>) => void;
  deleteCryptoDeposit: (id: string) => void;
  getTotalCryptoDeposits: () => number;
  // Crypto holdings (từng loại coin)
  cryptoHoldings: CryptoHolding[];
  addCryptoHolding: (holding: Omit<CryptoHolding, 'id'>) => void;
  updateCryptoHolding: (id: string, updates: Partial<CryptoHolding>) => void;
  deleteCryptoHolding: (id: string) => void;
  getTotalCryptoValue: () => number;
  // Gold holdings
  goldHoldings: GoldHolding[];
  addGoldHolding: (holding: Omit<GoldHolding, 'id'>) => void;
  updateGoldHolding: (id: string, updates: Partial<GoldHolding>) => void;
  deleteGoldHolding: (id: string) => void;
  getTotalGoldValue: () => number;
  // Capital Contributions
  capitalContributions: CapitalContribution[];
  addCapitalContribution: (contribution: Omit<CapitalContribution, 'id'>) => void;
  updateCapitalContribution: (id: string, updates: Partial<CapitalContribution>) => void;
  deleteCapitalContribution: (id: string) => void;
  getTotalCapitalContribution: (owner?: 'wife' | 'husband' | 'joint') => number;
  // Salary Planning
  monthlySalaries: MonthlySalary[];
  addMonthlySalary: (salary: Omit<MonthlySalary, 'id'>) => void;
  updateMonthlySalary: (id: string, updates: Partial<MonthlySalary>) => void;
  deleteMonthlySalary: (id: string) => void;
  financialGoals: FinancialGoal[];
  addFinancialGoal: (goal: Omit<FinancialGoal, 'id'>) => void;
  updateFinancialGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  deleteFinancialGoal: (id: string) => void;
  salaryAllocations: SalaryAllocation[];
  addSalaryAllocation: (allocation: Omit<SalaryAllocation, 'id'>) => void;
  updateSalaryAllocation: (id: string, updates: Partial<SalaryAllocation>) => void;
  deleteSalaryAllocation: (id: string) => void;
  // Funds
  funds: Fund[];
  addFund: (fund: Omit<Fund, 'id' | 'status' | 'goalId'>) => void;
  updateFund: (id: string, updates: Partial<Fund>) => void;
  deleteFund: (id: string) => void;
  toggleFundStatus: (id: string, status: Fund['status']) => void;
  fundExpenses: FundExpense[];
  addFundExpense: (expense: Omit<FundExpense, 'id'>) => void;
  deleteFundExpense: (id: string) => void;
  // BĐS Goal Sync
  syncPropertyGoals: (propertyId: string) => void;
  // Loans / Liabilities
  loans: Loan[];
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  getTotalLiabilities: () => number;
  // Net Worth Snapshots
  netWorthSnapshots: NetWorthSnapshot[];
  recordSnapshot: (data: Omit<NetWorthSnapshot, 'id' | 'snapshotDate'>) => void;
}

const WealthContext = createContext<WealthContextType | undefined>(undefined);

// Define Base URL for the Python Backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const WealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, logout } = useAuth();

  const [currency, setCurrency] = useState<Currency>('VND');
  const [hideValues, setHideValues] = useState<boolean>(() => {
    return localStorage.getItem('hideValues') === 'true';
  });

  const toggleHideValues = useCallback(() => {
    setHideValues(prev => {
      const next = !prev;
      localStorage.setItem('hideValues', String(next));
      return next;
    });
  }, []);

  // Auth state (delegated to AuthContext)
  const isAuthLoading = false;
  const isAuthenticated = token !== null;
  const currentUser: UserProfile = {
    id: 'local-admin',
    email: 'admin@macufam.local',
    name: 'Admin Family',
  };

  const [realEstateProperties, setRealEstateProperties] = useState<RealEstateProperty[]>([]);
  const [savingsDeposits, setSavingsDeposits] = useState<SavingsDeposit[]>([]);
  const [cryptoDeposits, setCryptoDeposits] = useState<CryptoDeposit[]>([]);
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>([]);
  const [goldHoldings, setGoldHoldings] = useState<GoldHolding[]>([]);
  const [capitalContributions, setCapitalContributions] = useState<CapitalContribution[]>([]);
  const [monthlySalaries, setMonthlySalaries] = useState<MonthlySalary[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [salaryAllocations, setSalaryAllocations] = useState<SalaryAllocation[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [fundExpenses, setFundExpenses] = useState<FundExpense[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [netWorthSnapshots, setNetWorthSnapshots] = useState<NetWorthSnapshot[]>([]);

  // API Helper
  const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      });

      if (res.status === 401) {
        logout();
        return null;
      }
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
      if (method === 'DELETE') return true;
      return await res.json();
    } catch (err) {
      console.error(`Error in API call [${method} ${endpoint}]:`, err);
      if (method !== 'GET') {
        toast.error(`Lỗi giao tiếp máy chủ Backend: ${err}`);
      }
      return null;
    }
  };

  // Data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch Gold
      const goldData = await apiCall('/gold_holdings');
      if (goldData) {
        setGoldHoldings(goldData.map((item: any) => ({
          id: item.id,
          taels: item.taels,
          purchasePrice: item.purchase_price,
          currentPrice: item.current_price,
          purchaseDate: new Date(item.purchase_date),
        })));
      }

      // Fetch Savings
      const savingsData = await apiCall('/savings_deposits');
      if (savingsData) {
        setSavingsDeposits(savingsData.map((item: any) => ({
          id: item.id,
          name: item.name,
          bankName: item.bank_name,
          principal: item.principal,
          interestRate: item.interest_rate,
          startDate: new Date(item.start_date),
          maturityDate: new Date(item.maturity_date),
          currency: item.currency as Currency,
          goalId: item.goal_id ?? undefined,
        })));
      }

      // Fetch Crypto Deposits
      const cryptoDepData = await apiCall('/crypto_deposits');
      if (cryptoDepData) {
        setCryptoDeposits(cryptoDepData.map((item: any) => ({
          id: item.id,
          amount: item.amount,
          date: new Date(item.date),
          note: item.note,
          currency: item.currency as Currency
        })));
      }

      // Fetch Crypto Holdings
      const cryptoHoldData = await apiCall('/crypto_holdings');
      if (cryptoHoldData) {
        setCryptoHoldings(cryptoHoldData.map((item: any) => ({
          id: item.id,
          name: item.name,
          symbol: item.symbol,
          amount: item.amount,
          purchaseCost: item.purchase_cost,
          currentPrice: item.current_price,
          purchaseDate: new Date(item.purchase_date),
        })));
      }

      // Fetch Real Estate Properties
      const realEstateData = await apiCall('/real_estate_properties');
      if (realEstateData) {
        setRealEstateProperties(realEstateData.map((item: any) => ({
          id: item.id,
          name: item.name,
          totalValue: item.total_value,
          paidAmount: item.paid_amount,
          currency: item.currency as Currency,
          payments: (item.real_estate_payments || []).map((pm: any) => ({
            id: pm.id,
            dueDate: new Date(pm.due_date),
            amount: pm.amount,
            isPaid: pm.is_paid,
            note: pm.note,
            currency: pm.currency as Currency
          }))
        })));
      }

      // Fetch Capital Contributions
      const capitalData = await apiCall('/capital_contributions');
      if (capitalData) {
        setCapitalContributions(capitalData.map((item: any) => ({
          id: item.id,
          amount: item.amount,
          date: new Date(item.date),
          note: item.note,
          currency: item.currency as Currency,
          owner: item.owner
        })));
      }

      // Fetch Monthly Salaries
      const salaryData = await apiCall('/monthly_salaries');
      if (salaryData) {
        setMonthlySalaries(salaryData.map((item: any) => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          note: item.note,
          currency: item.currency as Currency,
        })));
      }

      // Fetch Financial Goals
      const goalsData = await apiCall('/financial_goals');
      if (goalsData) {
        setFinancialGoals(goalsData.map((item: any) => ({
          id: item.id,
          name: item.name,
          targetAmount: item.target_amount,
          currency: item.currency as Currency,
          category: item.category,
          dueDate: item.due_date ? new Date(item.due_date) : undefined,
          source: item.source || 'manual',
          propertyId: item.property_id,
          paymentId: item.payment_id,
          note: item.note,
        })));
      }

      // Fetch Salary Allocations
      const allocData = await apiCall('/salary_allocations');
      if (allocData) {
        setSalaryAllocations(allocData.map((item: any) => ({
          id: item.id,
          salaryId: item.salary_id,
          goalId: item.goal_id,
          amount: item.amount,
          note: item.note,
        })));
      }

      // Fetch Funds
      const fundsData = await apiCall('/funds');
      if (fundsData) {
        setFunds(fundsData.map((item: any) => ({
          id: item.id,
          name: item.name,
          targetAmount: item.target_amount,
          currency: item.currency as Currency,
          category: item.category,
          deadline: new Date(item.deadline),
          status: item.status,
          note: item.note,
          goalId: item.goal_id ?? undefined,
        })));
      }

      // Fetch Fund Expenses
      const expData = await apiCall('/fund_expenses');
      if (expData) {
        setFundExpenses(expData.map((item: any) => ({
          id: item.id,
          fundId: item.fund_id,
          amount: item.amount,
          date: new Date(item.date),
          note: item.note,
        })));
      }

      // Fetch Loans
      const loansData = await apiCall('/loans');
      if (loansData) {
        setLoans(loansData.map((item: any) => ({
          id: item.id,
          name: item.name,
          loanType: item.loan_type,
          creditor: item.creditor,
          principalAmount: item.principal_amount,
          outstandingBalance: item.outstanding_balance,
          interestRate: item.interest_rate,
          startDate: new Date(item.start_date),
          dueDate: item.due_date ? new Date(item.due_date) : undefined,
          currency: item.currency as Currency,
          repaymentType: item.repayment_type,
          monthlyPayment: item.monthly_payment ?? undefined,
          propertyId: item.property_id ?? undefined,
          note: item.note ?? undefined,
        })));
      }

      // Fetch Net Worth Snapshots
      const snapshotsData = await apiCall('/snapshots?months=12');
      if (snapshotsData) {
        setNetWorthSnapshots(snapshotsData.map((item: any) => ({
          id: item.id,
          snapshotDate: item.snapshot_date,
          totalAssets: item.total_assets,
          totalLiabilities: item.total_liabilities,
          netWorth: item.net_worth,
          savingsTotal: item.savings_total,
          goldTotal: item.gold_total,
          cryptoTotal: item.crypto_total,
          realEstateTotal: item.real_estate_total,
          loansTotal: item.loans_total,
        })));
      }
    };
    
    // We try to fetch on load. If python backend is missing, it logs warning silently
    fetchAllData();
  }, []);

  // --- Real Estate ---
  const addRealEstateProperty = useCallback(async (property: Omit<RealEstateProperty, 'id'>) => {
    const newId = crypto.randomUUID();
    const payments = (property.payments ?? []).map((pm) => ({
      ...pm,
      id: pm.id || crypto.randomUUID(),
      dueDate: pm.dueDate instanceof Date ? pm.dueDate : new Date(pm.dueDate),
    }));

    const newProperty: RealEstateProperty = {
      ...property,
      id: newId,
      payments,
    };
    
    // Optimistic UI update
    setRealEstateProperties((prev) => [...prev, newProperty]);

    // Construct backend payload
    const payload = {
      id: newId,
      name: property.name,
      total_value: property.totalValue,
      paid_amount: property.paidAmount,
      currency: property.currency,
      real_estate_payments: payments.map(pm => ({
        id: pm.id,
        due_date: pm.dueDate.toISOString().split('T')[0],
        amount: pm.amount,
        is_paid: pm.isPaid,
        note: pm.note,
        currency: pm.currency
      }))
    };

    await apiCall('/real_estate_properties', 'POST', payload);
  }, []);

  const updateRealEstateProperty = useCallback(async (id: string, updates: Partial<RealEstateProperty>) => {
    let nextPayments: any[] | undefined = undefined;
    if (updates.payments) {
      nextPayments = updates.payments.map((pm) => ({
        ...pm,
        id: pm.id || crypto.randomUUID(),
        dueDate: pm.dueDate instanceof Date ? pm.dueDate : new Date(pm.dueDate),
      }));
    }

    setRealEstateProperties((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, ...updates, ...(nextPayments && { payments: nextPayments }) };
      })
    );

    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.totalValue !== undefined) payload.total_value = updates.totalValue;
    if (updates.paidAmount !== undefined) payload.paid_amount = updates.paidAmount;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    
    if (nextPayments) {
      payload.real_estate_payments = nextPayments.map(pm => ({
        id: pm.id,
        due_date: pm.dueDate.toISOString().split('T')[0],
        amount: pm.amount,
        is_paid: pm.isPaid,
        note: pm.note,
        currency: pm.currency
      }));
    }

    if (Object.keys(payload).length > 0) {
      await apiCall(`/real_estate_properties/${id}`, 'PUT', payload);
    }
  }, []);

  const deleteRealEstateProperty = useCallback(async (id: string) => {
    setRealEstateProperties((prev) => prev.filter((p) => p.id !== id));
    await apiCall(`/real_estate_properties/${id}`, 'DELETE');
  }, []);

  const getTotalRealEstateValue = useCallback(() => {
    return realEstateProperties.reduce((sum, p) => sum + p.paidAmount, 0);
  }, [realEstateProperties]);

  // --- Savings ---
  const addSavingsDeposit = useCallback(async (deposit: Omit<SavingsDeposit, 'id'>) => {
    const newId = crypto.randomUUID();
    const startDate = deposit.startDate instanceof Date ? deposit.startDate : new Date(deposit.startDate);
    const maturityDate = deposit.maturityDate instanceof Date ? deposit.maturityDate : new Date(deposit.maturityDate);
    
    const newDeposit: SavingsDeposit = {
      ...deposit,
      id: newId,
      startDate,
      maturityDate,
    };
    setSavingsDeposits((prev) => [...prev, newDeposit]);

    await apiCall('/savings_deposits', 'POST', {
      id: newId,
      name: deposit.name,
      bank_name: deposit.bankName,
      principal: deposit.principal,
      interest_rate: deposit.interestRate,
      start_date: startDate.toISOString().split('T')[0],
      maturity_date: maturityDate.toISOString().split('T')[0],
      currency: deposit.currency,
      goal_id: deposit.goalId ?? null
    });
  }, []);

  const updateSavingsDeposit = useCallback(async (id: string, updates: Partial<SavingsDeposit>) => {
    setSavingsDeposits((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const next = { ...d, ...updates };
        if (updates.startDate) next.startDate = updates.startDate instanceof Date ? updates.startDate : new Date(updates.startDate);
        if (updates.maturityDate) next.maturityDate = updates.maturityDate instanceof Date ? updates.maturityDate : new Date(updates.maturityDate);
        return next;
      })
    );

    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.bankName !== undefined) payload.bank_name = updates.bankName;
    if (updates.principal !== undefined) payload.principal = updates.principal;
    if (updates.interestRate !== undefined) payload.interest_rate = updates.interestRate;
    if (updates.startDate !== undefined) payload.start_date = new Date(updates.startDate).toISOString().split('T')[0];
    if (updates.maturityDate !== undefined) payload.maturity_date = new Date(updates.maturityDate).toISOString().split('T')[0];
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.goalId !== undefined) payload.goal_id = updates.goalId;

    if (Object.keys(payload).length > 0) {
      await apiCall(`/savings_deposits/${id}`, 'PUT', payload);
    }
  }, []);

  const deleteSavingsDeposit = useCallback(async (id: string) => {
    setSavingsDeposits((prev) => prev.filter((d) => d.id !== id));
    await apiCall(`/savings_deposits/${id}`, 'DELETE');
  }, []);

  const getTotalSavings = useCallback(() => {
    return savingsDeposits.reduce((sum, d) => sum + d.principal, 0);
  }, [savingsDeposits]);

  // --- Crypto Deposits ---
  const addCryptoDeposit = useCallback(async (deposit: Omit<CryptoDeposit, 'id'>) => {
    const newId = crypto.randomUUID();
    const depositDate = deposit.date instanceof Date ? deposit.date : new Date(deposit.date);
    
    setCryptoDeposits((prev) => [
      ...prev,
      { ...deposit, id: newId, date: depositDate },
    ]);

    await apiCall('/crypto_deposits', 'POST', {
      id: newId,
      amount: deposit.amount,
      date: depositDate.toISOString().split('T')[0],
      note: deposit.note,
      currency: deposit.currency
    });
  }, []);

  const updateCryptoDeposit = useCallback(async (id: string, updates: Partial<CryptoDeposit>) => {
    setCryptoDeposits((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const next = { ...d, ...updates };
        if (updates.date) next.date = updates.date instanceof Date ? updates.date : new Date(updates.date);
        return next;
      })
    );

    const payload: any = {};
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.date !== undefined) payload.date = new Date(updates.date).toISOString().split('T')[0];
    if (updates.note !== undefined) payload.note = updates.note;
    if (updates.currency !== undefined) payload.currency = updates.currency;

    if (Object.keys(payload).length > 0) {
      await apiCall(`/crypto_deposits/${id}`, 'PUT', payload);
    }
  }, []);

  const deleteCryptoDeposit = useCallback(async (id: string) => {
    setCryptoDeposits((prev) => prev.filter((d) => d.id !== id));
    await apiCall(`/crypto_deposits/${id}`, 'DELETE');
  }, []);

  const getTotalCryptoDeposits = useCallback(() => {
    return cryptoDeposits.reduce((sum, d) => sum + d.amount, 0);
  }, [cryptoDeposits]);

  // --- Crypto Holdings ---
  const addCryptoHolding = useCallback(async (holding: Omit<CryptoHolding, 'id'>) => {
    const newId = crypto.randomUUID();
    const purchaseDate = holding.purchaseDate instanceof Date ? holding.purchaseDate : new Date(holding.purchaseDate);
    
    setCryptoHoldings((prev) => [
      ...prev,
      { ...holding, id: newId, purchaseDate },
    ]);

    await apiCall('/crypto_holdings', 'POST', {
      id: newId,
      name: holding.name,
      symbol: holding.symbol,
      amount: holding.amount,
      purchase_cost: holding.purchaseCost,
      current_price: holding.currentPrice,
      purchase_date: purchaseDate.toISOString().split('T')[0],});
  }, []);

  const updateCryptoHolding = useCallback(async (id: string, updates: Partial<CryptoHolding>) => {
    setCryptoHoldings((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const next = { ...h, ...updates };
        if (updates.purchaseDate) next.purchaseDate = updates.purchaseDate instanceof Date ? updates.purchaseDate : new Date(updates.purchaseDate);
        return next;
      })
    );

    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.symbol !== undefined) payload.symbol = updates.symbol;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.purchaseCost !== undefined) payload.purchase_cost = updates.purchaseCost;
    if (updates.currentPrice !== undefined) payload.current_price = updates.currentPrice;
    if (updates.purchaseDate !== undefined) payload.purchase_date = new Date(updates.purchaseDate).toISOString().split('T')[0];

    if (Object.keys(payload).length > 0) {
      await apiCall(`/crypto_holdings/${id}`, 'PUT', payload);
    }
  }, []);

  const deleteCryptoHolding = useCallback(async (id: string) => {
    setCryptoHoldings((prev) => prev.filter((h) => h.id !== id));
    await apiCall(`/crypto_holdings/${id}`, 'DELETE');
  }, []);

  const getTotalCryptoValue = useCallback(() => {
    return cryptoHoldings.reduce((sum, h) => sum + h.amount * h.currentPrice, 0);
  }, [cryptoHoldings]);

  // --- Gold Holdings ---
  const addGoldHolding = useCallback(async (holding: Omit<GoldHolding, 'id'>) => {
    const newId = crypto.randomUUID();
    const newDate = holding.purchaseDate instanceof Date ? holding.purchaseDate : new Date(holding.purchaseDate);
    const newHolding = { ...holding, id: newId, purchaseDate: newDate };
    
    setGoldHoldings((prev) => [...prev, newHolding]);

    await apiCall('/gold_holdings', 'POST', {
      id: newId,
      taels: holding.taels,
      purchase_price: holding.purchasePrice,
      current_price: holding.currentPrice,
      purchase_date: newDate.toISOString().split('T')[0],});
  }, []);

  const updateGoldHolding = useCallback(async (id: string, updates: Partial<GoldHolding>) => {
    setGoldHoldings((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const next = { ...h, ...updates };
        if (updates.purchaseDate) next.purchaseDate = updates.purchaseDate instanceof Date ? updates.purchaseDate : new Date(updates.purchaseDate);
        return next;
      })
    );

    const payload: any = {};
    if (updates.taels !== undefined) payload.taels = updates.taels;
    if (updates.purchasePrice !== undefined) payload.purchase_price = updates.purchasePrice;
    if (updates.currentPrice !== undefined) payload.current_price = updates.currentPrice;
    if (updates.purchaseDate !== undefined) payload.purchase_date = new Date(updates.purchaseDate).toISOString().split('T')[0];

    if (Object.keys(payload).length > 0) {
      await apiCall(`/gold_holdings/${id}`, 'PUT', payload);
    }
  }, []);

  const deleteGoldHolding = useCallback(async (id: string) => {
    setGoldHoldings((prev) => prev.filter((h) => h.id !== id));
    await apiCall(`/gold_holdings/${id}`, 'DELETE');
  }, []);

  const getTotalGoldValue = useCallback(() => {
    return goldHoldings.reduce((sum, h) => sum + h.taels * h.currentPrice, 0);
  }, [goldHoldings]);

  // --- Capital Contributions ---
  const addCapitalContribution = useCallback(async (contribution: Omit<CapitalContribution, 'id'>) => {
    const newId = crypto.randomUUID();
    const contrDate = contribution.date instanceof Date ? contribution.date : new Date(contribution.date);
    
    setCapitalContributions((prev) => [
      ...prev,
      { ...contribution, id: newId, date: contrDate },
    ]);

    await apiCall('/capital_contributions', 'POST', {
      id: newId,
      amount: contribution.amount,
      date: contrDate.toISOString().split('T')[0],
      note: contribution.note,
      currency: contribution.currency,
      owner: contribution.owner
    });
  }, []);

  const updateCapitalContribution = useCallback(async (id: string, updates: Partial<CapitalContribution>) => {
    setCapitalContributions((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, ...updates };
        if (updates.date) next.date = updates.date instanceof Date ? updates.date : new Date(updates.date);
        return next;
      })
    );

    const payload: any = {};
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.date !== undefined) payload.date = new Date(updates.date).toISOString().split('T')[0];
    if (updates.note !== undefined) payload.note = updates.note;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.owner !== undefined) payload.owner = updates.owner;

    if (Object.keys(payload).length > 0) {
      await apiCall(`/capital_contributions/${id}`, 'PUT', payload);
    }
  }, []);

  const deleteCapitalContribution = useCallback(async (id: string) => {
    setCapitalContributions((prev) => prev.filter((c) => c.id !== id));
    await apiCall(`/capital_contributions/${id}`, 'DELETE');
  }, []);

  const getTotalCapitalContribution = useCallback((owner?: 'wife' | 'husband' | 'joint') => {
    if (owner) {
      return capitalContributions.filter(c => c.owner === owner).reduce((sum, c) => sum + c.amount, 0);
    }
    return capitalContributions.reduce((sum, c) => sum + c.amount, 0);
  }, [capitalContributions]);


  // --- Monthly Salaries ---
  const addMonthlySalary = useCallback(async (salary: Omit<MonthlySalary, 'id'>) => {
    const newId = crypto.randomUUID();
    const newSalary: MonthlySalary = { ...salary, id: newId };
    setMonthlySalaries(prev => [...prev, newSalary]);
    await apiCall('/monthly_salaries', 'POST', {
      id: newId,
      name: salary.name,
      amount: salary.amount,
      note: salary.note,
      currency: salary.currency,
    });
  }, []);

  const updateMonthlySalary = useCallback(async (id: string, updates: Partial<MonthlySalary>) => {
    setMonthlySalaries(prev => prev.map(s => s.id !== id ? s : { ...s, ...updates }));
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.note !== undefined) payload.note = updates.note;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (Object.keys(payload).length > 0) await apiCall(`/monthly_salaries/${id}`, 'PUT', payload);
  }, []);

  const deleteMonthlySalary = useCallback(async (id: string) => {
    setMonthlySalaries(prev => prev.filter(s => s.id !== id));
    await apiCall(`/monthly_salaries/${id}`, 'DELETE');
  }, []);

  // --- Financial Goals ---
  const addFinancialGoal = useCallback(async (goal: Omit<FinancialGoal, 'id'>) => {
    const newId = crypto.randomUUID();
    const newGoal: FinancialGoal = { ...goal, id: newId };
    setFinancialGoals(prev => [...prev, newGoal]);
    await apiCall('/financial_goals', 'POST', {
      id: newId,
      name: goal.name,
      target_amount: goal.targetAmount,
      currency: goal.currency,
      category: goal.category,
      due_date: goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : null,
      property_id: goal.propertyId ?? null,
      payment_id: goal.paymentId ?? null,
      note: goal.note,
    });
  }, []);

  const updateFinancialGoal = useCallback(async (id: string, updates: Partial<FinancialGoal>) => {
    setFinancialGoals(prev => prev.map(g => g.id !== id ? g : { ...g, ...updates }));
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString().split('T')[0] : null;
    if (updates.propertyId !== undefined) payload.property_id = updates.propertyId;
    if (updates.paymentId !== undefined) payload.payment_id = updates.paymentId;
    if (updates.note !== undefined) payload.note = updates.note;
    if (Object.keys(payload).length > 0) await apiCall(`/financial_goals/${id}`, 'PUT', payload);
  }, []);

  const deleteFinancialGoal = useCallback(async (id: string) => {
    setFinancialGoals(prev => prev.filter(g => g.id !== id));
    await apiCall(`/financial_goals/${id}`, 'DELETE');
  }, []);

  // --- Salary Allocations ---
  const addSalaryAllocation = useCallback(async (allocation: Omit<SalaryAllocation, 'id'>) => {
    const newId = crypto.randomUUID();
    const newAllocation: SalaryAllocation = { ...allocation, id: newId };
    setSalaryAllocations(prev => [...prev, newAllocation]);
    await apiCall('/salary_allocations', 'POST', {
      id: newId,
      salary_id: allocation.salaryId,
      goal_id: allocation.goalId,
      amount: allocation.amount,
      note: allocation.note,
    });
  }, []);

  const updateSalaryAllocation = useCallback(async (id: string, updates: Partial<SalaryAllocation>) => {
    setSalaryAllocations(prev => prev.map(a => a.id !== id ? a : { ...a, ...updates }));
    const payload: any = {};
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.note !== undefined) payload.note = updates.note;
    if (Object.keys(payload).length > 0) await apiCall(`/salary_allocations/${id}`, 'PUT', payload);
  }, []);

  const deleteSalaryAllocation = useCallback(async (id: string) => {
    setSalaryAllocations(prev => prev.filter(a => a.id !== id));
    await apiCall(`/salary_allocations/${id}`, 'DELETE');
  }, []);


  // --- Funds ---
  const addFund = useCallback(async (fund: Omit<Fund, 'id' | 'status' | 'goalId'>) => {
    const newId = crypto.randomUUID();
    const result = await apiCall('/funds', 'POST', {
      id: newId,
      name: fund.name,
      target_amount: fund.targetAmount,
      currency: fund.currency,
      category: fund.category,
      deadline: new Date(fund.deadline).toISOString().split('T')[0],
      note: fund.note,
    });
    if (result) {
      const newFund: Fund = {
        id: result.id,
        name: result.name,
        targetAmount: result.target_amount,
        currency: result.currency as Currency,
        category: result.category,
        deadline: new Date(result.deadline),
        status: result.status,
        note: result.note,
        goalId: result.goal_id ?? undefined,
      };
      setFunds(prev => [...prev, newFund]);
      // Also add the auto-created goal to local state
      const goalsData = await apiCall('/financial_goals');
      if (goalsData) {
        setFinancialGoals(goalsData.map((item: any) => ({
          id: item.id, name: item.name, targetAmount: item.target_amount,
          currency: item.currency as Currency, category: item.category,
          dueDate: item.due_date ? new Date(item.due_date) : undefined,
          source: item.source || 'manual',
          propertyId: item.property_id, paymentId: item.payment_id, note: item.note,
        })));
      }
      toast.success('Tạo quỹ thành công');
    }
  }, []);

  const updateFund = useCallback(async (id: string, updates: Partial<Fund>) => {
    setFunds(prev => prev.map(f => f.id !== id ? f : { ...f, ...updates }));
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.deadline !== undefined) payload.deadline = new Date(updates.deadline).toISOString().split('T')[0];
    if (updates.note !== undefined) payload.note = updates.note;
    if (Object.keys(payload).length > 0) {
      await apiCall(`/funds/${id}`, 'PUT', payload);
      // Refresh goals since auto-update may have occurred
      const goalsData = await apiCall('/financial_goals');
      if (goalsData) {
        setFinancialGoals(goalsData.map((item: any) => ({
          id: item.id, name: item.name, targetAmount: item.target_amount,
          currency: item.currency as Currency, category: item.category,
          dueDate: item.due_date ? new Date(item.due_date) : undefined,
          source: item.source || 'manual',
          propertyId: item.property_id, paymentId: item.payment_id, note: item.note,
        })));
      }
    }
  }, []);

  const deleteFund = useCallback(async (id: string) => {
    const fund = funds.find(f => f.id === id);
    setFunds(prev => prev.filter(f => f.id !== id));
    setFundExpenses(prev => prev.filter(e => e.fundId !== id));
    if (fund?.goalId) {
      setFinancialGoals(prev => prev.filter(g => g.id !== fund.goalId));
    }
    await apiCall(`/funds/${id}`, 'DELETE');
  }, [funds]);

  const toggleFundStatus = useCallback(async (id: string, status: Fund['status']) => {
    setFunds(prev => prev.map(f => f.id !== id ? f : { ...f, status }));
    await apiCall(`/funds/${id}/status`, 'PATCH', { status });
  }, []);

  // --- Fund Expenses ---
  const addFundExpense = useCallback(async (expense: Omit<FundExpense, 'id'>) => {
    const newId = crypto.randomUUID();
    const newExpense: FundExpense = { ...expense, id: newId };
    setFundExpenses(prev => [...prev, newExpense]);
    await apiCall('/fund_expenses', 'POST', {
      id: newId,
      fund_id: expense.fundId,
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split('T')[0],
      note: expense.note,
    });
  }, []);

  const deleteFundExpense = useCallback(async (id: string) => {
    setFundExpenses(prev => prev.filter(e => e.id !== id));
    await apiCall(`/fund_expenses/${id}`, 'DELETE');
  }, []);

  // --- Loans ---
  const getTotalLiabilities = useCallback(() => {
    return loans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  }, [loans]);

  const addLoan = useCallback(async (loan: Omit<Loan, 'id'>) => {
    const newId = crypto.randomUUID();
    const newLoan: Loan = { ...loan, id: newId };
    setLoans(prev => [...prev, newLoan]);
    await apiCall('/loans', 'POST', {
      id: newId,
      name: loan.name,
      loan_type: loan.loanType,
      creditor: loan.creditor,
      principal_amount: loan.principalAmount,
      outstanding_balance: loan.outstandingBalance,
      interest_rate: loan.interestRate,
      start_date: loan.startDate instanceof Date ? loan.startDate.toISOString().split('T')[0] : loan.startDate,
      due_date: loan.dueDate ? (loan.dueDate instanceof Date ? loan.dueDate.toISOString().split('T')[0] : loan.dueDate) : null,
      currency: loan.currency,
      repayment_type: loan.repaymentType,
      monthly_payment: loan.monthlyPayment ?? null,
      property_id: loan.propertyId ?? null,
      note: loan.note ?? null,
    });
    toast.success('Thêm khoản vay thành công');
  }, []);

  const updateLoan = useCallback(async (id: string, updates: Partial<Loan>) => {
    setLoans(prev => prev.map(l => l.id !== id ? l : { ...l, ...updates }));
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.creditor !== undefined) payload.creditor = updates.creditor;
    if (updates.outstandingBalance !== undefined) payload.outstanding_balance = updates.outstandingBalance;
    if (updates.interestRate !== undefined) payload.interest_rate = updates.interestRate;
    if (updates.dueDate !== undefined) payload.due_date = updates.dueDate instanceof Date ? updates.dueDate.toISOString().split('T')[0] : updates.dueDate;
    if (updates.monthlyPayment !== undefined) payload.monthly_payment = updates.monthlyPayment;
    if (updates.note !== undefined) payload.note = updates.note;
    if (Object.keys(payload).length > 0) await apiCall(`/loans/${id}`, 'PUT', payload);
  }, []);

  const deleteLoan = useCallback(async (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    await apiCall(`/loans/${id}`, 'DELETE');
    toast.success('Đã xoá khoản vay');
  }, []);

  // --- Net Worth Snapshots ---
  const recordSnapshot = useCallback(async (data: Omit<NetWorthSnapshot, 'id' | 'snapshotDate'>) => {
    const result = await apiCall('/snapshots/record', 'POST', {
      total_assets: data.totalAssets,
      total_liabilities: data.totalLiabilities,
      net_worth: data.netWorth,
      savings_total: data.savingsTotal,
      gold_total: data.goldTotal,
      crypto_total: data.cryptoTotal,
      real_estate_total: data.realEstateTotal,
      loans_total: data.loansTotal,
    });
    if (result) {
      const snapshot: NetWorthSnapshot = {
        id: result.id,
        snapshotDate: result.snapshot_date,
        totalAssets: result.total_assets,
        totalLiabilities: result.total_liabilities,
        netWorth: result.net_worth,
        savingsTotal: result.savings_total,
        goldTotal: result.gold_total,
        cryptoTotal: result.crypto_total,
        realEstateTotal: result.real_estate_total,
        loansTotal: result.loans_total,
      };
      setNetWorthSnapshots(prev => {
        const filtered = prev.filter(s => s.snapshotDate !== snapshot.snapshotDate);
        return [...filtered, snapshot].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));
      });
    }
  }, []);

  // --- BĐS Goal Sync ---
  const syncPropertyGoals = useCallback(async (propertyId: string) => {
    const result = await apiCall(`/real_estate_properties/${propertyId}/sync_goals`, 'POST');
    if (result && result.goals_created > 0) {
      toast.success(`Đã tạo ${result.goals_created} mục tiêu từ BĐS`);
      // Refresh goals
      const goalsData = await apiCall('/financial_goals');
      if (goalsData) {
        setFinancialGoals(goalsData.map((item: any) => ({
          id: item.id, name: item.name, targetAmount: item.target_amount,
          currency: item.currency as Currency, category: item.category,
          dueDate: item.due_date ? new Date(item.due_date) : undefined,
          source: item.source || 'manual',
          propertyId: item.property_id, paymentId: item.payment_id, note: item.note,
        })));
      }
    } else {
      toast.info('Không có kỳ thanh toán mới cần đồng bộ');
    }
  }, []);

  return (
    <WealthContext.Provider
      value={{
        currency,
        setCurrency,
        hideValues,
        toggleHideValues,
        isAuthLoading,
        isAuthenticated,
        currentUser,
        realEstateProperties,
        addRealEstateProperty,
        updateRealEstateProperty,
        deleteRealEstateProperty,
        getTotalRealEstateValue,
        savingsDeposits,
        addSavingsDeposit,
        updateSavingsDeposit,
        deleteSavingsDeposit,
        getTotalSavings,
        cryptoDeposits,
        addCryptoDeposit,
        updateCryptoDeposit,
        deleteCryptoDeposit,
        getTotalCryptoDeposits,
        cryptoHoldings,
        addCryptoHolding,
        updateCryptoHolding,
        deleteCryptoHolding,
        getTotalCryptoValue,
        goldHoldings,
        addGoldHolding,
        updateGoldHolding,
        deleteGoldHolding,
        getTotalGoldValue,
        capitalContributions,
        addCapitalContribution,
        updateCapitalContribution,
        deleteCapitalContribution,
        getTotalCapitalContribution,
        monthlySalaries,
        addMonthlySalary,
        updateMonthlySalary,
        deleteMonthlySalary,
        financialGoals,
        addFinancialGoal,
        updateFinancialGoal,
        deleteFinancialGoal,
        salaryAllocations,
        addSalaryAllocation,
        updateSalaryAllocation,
        deleteSalaryAllocation,
        funds,
        addFund,
        updateFund,
        deleteFund,
        toggleFundStatus,
        fundExpenses,
        addFundExpense,
        deleteFundExpense,
        syncPropertyGoals,
        loans,
        addLoan,
        updateLoan,
        deleteLoan,
        getTotalLiabilities,
        netWorthSnapshots,
        recordSnapshot,
      }}
    >
      {children}
    </WealthContext.Provider>
  );
};

export const useWealth = (): WealthContextType => {
  const context = useContext(WealthContext);
  if (!context) {
    throw new Error('useWealth must be used within a WealthProvider');
  }
  return context;
};
