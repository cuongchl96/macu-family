import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Pencil, Trash2, Building2, Users, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useWealth } from '@/contexts/WealthContext';
import { LoanFormDialog } from './LoanFormDialog';
import { formatVND, formatUSD, vndToUsd } from '@/data/wealthData';
import type { Loan, LoanType } from '@/types/wealth';

const LOAN_TYPE_CONFIG: Record<LoanType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  mortgage: { label: 'Thế chấp', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Building2 },
  consumer: { label: 'Tín chấp', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: Banknote },
  family: { label: 'Gia đình', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: Users },
};

export const LoansModule = () => {
  const { loans, addLoan, updateLoan, deleteLoan, getTotalLiabilities, currency, hideValues } = useWealth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Loan | null>(null);

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    return currency === 'USD' ? formatUSD(vndToUsd(value)) : formatVND(value);
  };

  const totalLiabilities = getTotalLiabilities();

  const byType = (type: LoanType) => loans.filter(l => l.loanType === type);
  const totalByType = (type: LoanType) => byType(type).reduce((s, l) => s + l.outstandingBalance, 0);

  const paidPercent = (loan: Loan) => {
    if (loan.principalAmount === 0) return 0;
    return Math.round((1 - loan.outstandingBalance / loan.principalAmount) * 100);
  };

  const daysUntilDue = (loan: Loan) => {
    if (!loan.dueDate) return null;
    const due = new Date(loan.dueDate);
    const today = new Date();
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSave = (data: Omit<Loan, 'id'>) => {
    if (editing) {
      updateLoan(editing.id, data);
    } else {
      addLoan(data);
    }
    setEditing(null);
  };

  const openEdit = (loan: Loan) => {
    setEditing(loan);
    setDialogOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Khoản vay</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Theo dõi dư nợ và lịch trả nợ</p>
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Thêm khoản vay
        </Button>
      </motion.div>

      {/* Summary Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-gradient-to-br from-destructive/80 to-destructive/60 p-6 text-destructive-foreground"
      >
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-4 w-4 opacity-80" />
          <span className="text-sm font-medium uppercase tracking-wider opacity-80">Tổng dư nợ</span>
        </div>
        <p className="text-4xl font-bold font-mono">{formatValue(totalLiabilities)}</p>
        <div className="flex gap-6 mt-4">
          {(Object.keys(LOAN_TYPE_CONFIG) as LoanType[]).map(type => (
            <div key={type}>
              <p className="text-xs opacity-70 mb-0.5">{LOAN_TYPE_CONFIG[type].label}</p>
              <p className="text-base font-semibold font-mono">{formatValue(totalByType(type))}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Loan Cards */}
      {loans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Chưa có khoản vay nào</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Thêm khoản vay để theo dõi dư nợ và tính net worth chính xác</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Thêm khoản vay đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {loans
            .slice()
            .sort((a, b) => b.outstandingBalance - a.outstandingBalance)
            .map((loan, i) => {
              const config = LOAN_TYPE_CONFIG[loan.loanType];
              const Icon = config.icon;
              const paid = paidPercent(loan);
              const days = daysUntilDue(loan);

              return (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm truncate">{loan.name}</p>
                          <Badge variant="outline" className={`text-xs ${config.color}`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{loan.creditor}</p>

                        {/* Progress */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Đã trả: <span className="text-foreground font-medium">{paid}%</span></span>
                            <span>Dư nợ: <span className="text-destructive font-medium">{formatValue(loan.outstandingBalance)}</span></span>
                          </div>
                          <Progress value={paid} className="h-1.5" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Gốc vay: {formatValue(loan.principalAmount)}</span>
                            <span>
                              {loan.interestRate > 0 ? `${loan.interestRate}%/năm` : 'Không lãi'}
                            </span>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                          {loan.repaymentType === 'installment' && loan.monthlyPayment && (
                            <span>Góp: <span className="text-foreground">{formatValue(loan.monthlyPayment)}/tháng</span></span>
                          )}
                          {loan.repaymentType === 'bullet' && loan.dueDate && (
                            <span>
                              Đáo hạn: <span className={days !== null && days < 90 ? 'text-yellow-500' : 'text-foreground'}>
                                {new Date(loan.dueDate).toLocaleDateString('vi-VN')}
                                {days !== null && ` (${days} ngày)`}
                              </span>
                            </span>
                          )}
                          {loan.note && <span className="italic truncate max-w-xs">{loan.note}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(loan)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xoá khoản vay?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Xoá "{loan.name}" sẽ xoá khoản nợ này khỏi net worth. Không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteLoan(loan.id)} className="bg-destructive hover:bg-destructive/90">
                              Xoá
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

      <LoanFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
};
