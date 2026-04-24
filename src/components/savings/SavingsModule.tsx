import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, Calendar, Percent, Building, Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import { formatVND, formatDateVN, getDaysToMaturity, vndToUsd, formatUSD } from '@/data/wealthData';
import { useWealth } from '@/contexts/WealthContext';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SavingsFormDialog, formValuesToDeposit } from './SavingsFormDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SavingsDeposit } from '@/types/wealth';
import type { SavingsFormValues } from './SavingsFormDialog';

export const SavingsModule = () => {
  const { currency, savingsDeposits, financialGoals, addSavingsDeposit, updateSavingsDeposit, deleteSavingsDeposit, hideValues } = useWealth();
  const [formOpen, setFormOpen] = useState(false);
  const [editDeposit, setEditDeposit] = useState<SavingsDeposit | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'bank_group' | 'maturity_asc' | 'value_desc'>('maturity_asc');
  const [selectedDepositIds, setSelectedDepositIds] = useState<string[]>([]);

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') {
      return formatUSD(vndToUsd(value));
    }
    return formatVND(value);
  };

  const handleFormSubmit = (values: SavingsFormValues) => {
    if (editDeposit) {
      const updated = formValuesToDeposit(values, editDeposit);
      updateSavingsDeposit(editDeposit.id, updated);
      setEditDeposit(null);
    } else {
      addSavingsDeposit(formValuesToDeposit(values));
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteSavingsDeposit(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  let filteredDeposits = [...savingsDeposits];

  if (sortOption === 'maturity_asc') {
    filteredDeposits = [...filteredDeposits].sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime());
  } else if (sortOption === 'value_desc') {
    filteredDeposits = [...filteredDeposits].sort((a, b) => b.principal - a.principal);
  }

  const totalSavings = filteredDeposits.reduce((sum, d) => sum + d.principal, 0);
  const avgInterest = filteredDeposits.length > 0
    ? filteredDeposits.reduce((sum, d) => sum + d.interestRate, 0) / filteredDeposits.length
    : 0;

  // Group by bank or flat list if sorting
  const groupedByBank = sortOption === 'bank_group'
    ? filteredDeposits.reduce((acc, deposit) => {
      const bankKey = deposit.bankName.split(' ')[0]; // Group variants together
      if (!acc[bankKey]) {
        acc[bankKey] = [];
      }
      acc[bankKey].push(deposit);
      return acc;
    }, {} as Record<string, SavingsDeposit[]>)
    : {
      'Danh sách sổ tiết kiệm': filteredDeposits
    };

  const selectedTotal = filteredDeposits
    .filter(d => selectedDepositIds.includes(d.id))
    .reduce((sum, d) => sum + d.principal, 0);

  const toggleSelectAllGroup = (groupDeposits: SavingsDeposit[], checked: boolean) => {
    const groupIds = groupDeposits.map(d => d.id);
    if (checked) {
      setSelectedDepositIds(prev => Array.from(new Set([...prev, ...groupIds])));
    } else {
      setSelectedDepositIds(prev => prev.filter(id => !groupIds.includes(id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-wealth-savings/20">
              <PiggyBank className="h-6 w-6 text-wealth-savings" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Savings & Deposits</h1>
              <p className="text-muted-foreground">
                Fixed deposits and savings accounts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_group">Theo ngân hàng</SelectItem>
                <SelectItem value="maturity_asc">Đáo hạn gần nhất</SelectItem>
                <SelectItem value="value_desc">Số tiền lớn nhất</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setEditDeposit(null);
                setFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm sổ tiết kiệm
            </Button>
          </div>
        </div>
      </motion.div>

      <SavingsFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditDeposit(null);
        }}
        onSubmit={handleFormSubmit}
        editDeposit={editDeposit}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sổ tiết kiệm?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Sổ tiết kiệm sẽ bị xóa khỏi danh sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl border border-wealth-savings/30 bg-gradient-to-br from-wealth-savings/10 to-transparent p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
              Total Fixed Deposits
            </p>
            <p className="text-4xl font-bold font-mono">{formatValue(totalSavings)}</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-wealth-savings">{filteredDeposits.length}</p>
              <p className="text-xs text-muted-foreground">Active Deposits</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-wealth-savings">
                {avgInterest.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Avg. Interest</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Deposits List */}
      <div className="space-y-6">
        {Object.entries(groupedByBank).map(([bank, deposits], groupIndex) => (
          <motion.div
            key={bank}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + groupIndex * 0.1 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="px-6 py-4 bg-muted/50 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={deposits.length > 0 && deposits.every(d => selectedDepositIds.includes(d.id))}
                  onCheckedChange={(checked) => toggleSelectAllGroup(deposits, checked as boolean)}
                />
                <Building className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">{bank}</h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {deposits.length} deposit{deposits.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-border">
              {deposits.map((deposit, index) => {
                const daysToMaturity = getDaysToMaturity(deposit.maturityDate);
                const totalDays = Math.ceil(
                  (deposit.maturityDate.getTime() - deposit.startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
                );
                const expectedInterest = (deposit.principal * deposit.interestRate / 100) * (totalDays / 365);
                const progressDays = totalDays - daysToMaturity;
                const progressPercent = Math.min(100, Math.max(0, (progressDays / totalDays) * 100));
                const isMaturing = daysToMaturity <= 30;
                const isMatured = daysToMaturity <= 0;
                const linkedGoal = deposit.goalId ? financialGoals.find(g => g.id === deposit.goalId) : null;

                return (
                  <motion.div
                    key={deposit.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                    className={cn(
                      'p-6 hover:bg-muted/30 transition-colors',
                      isMatured && 'bg-destructive/5',
                      isMaturing && !isMatured && 'bg-warning/5'
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="pt-1">
                          <Checkbox
                            checked={selectedDepositIds.includes(deposit.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDepositIds(prev => [...prev, deposit.id]);
                              } else {
                                setSelectedDepositIds(prev => prev.filter(id => id !== deposit.id));
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{deposit.name ? deposit.name : deposit.bankName}</span>
                            {deposit.name && <span className="text-muted-foreground text-sm font-medium">({deposit.bankName})</span>}
                            {linkedGoal && (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                🎯 {linkedGoal.name}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDateVN(deposit.startDate)} → {formatDateVN(deposit.maturityDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Percent className="h-4 w-4" />
                              {deposit.interestRate}% APY
                            </span>
                          </div>
                          <div className="w-full max-w-md">
                            <Progress
                              value={progressPercent}
                              className="h-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>{progressPercent.toFixed(0)}% complete</span>
                              <span>{daysToMaturity} days remaining</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 ml-10 lg:ml-0">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Principal</p>
                          <p className="text-xl font-mono font-bold">
                            {formatValue(deposit.principal)}
                          </p>
                          {expectedInterest > 0 && (
                            <p className="text-sm font-mono font-medium text-wealth-savings mt-1" title="Lãi dự kiến">
                              +{formatValue(Math.round(expectedInterest))}
                            </p>
                          )}
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg',
                            isMatured
                              ? 'bg-destructive/20 text-destructive'
                              : isMaturing
                                ? 'bg-warning/20 text-warning'
                                : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Clock className="h-4 w-4" />
                          <span className="font-mono font-semibold">
                            {isMatured
                              ? 'Matured!'
                              : `${daysToMaturity}d`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditDeposit(deposit);
                              setFormOpen(true);
                            }}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirmId(deposit.id)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Sum Selection Bar */}
      {selectedDepositIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover/95 backdrop-blur-md border border-border shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-50 text-popover-foreground"
        >
          <div className="text-sm font-medium whitespace-nowrap">Đã chọn: <span className="font-bold text-lg">{selectedDepositIds.length}</span></div>
          <div className="w-px h-6 bg-border" />
          <div className="text-sm font-medium whitespace-nowrap">Tổng tiền: <span className="font-mono font-bold text-xl text-wealth-savings">{formatValue(selectedTotal)}</span></div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDepositIds([])} className="hover:bg-muted ml-2 text-muted-foreground">Bỏ chọn</Button>
        </motion.div>
      )}
    </div>
  );
};
