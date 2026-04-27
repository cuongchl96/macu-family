import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Vault, Plus, Pencil, Trash2, CheckCircle2, Clock, ArrowRight, Receipt } from 'lucide-react';
import { useWealth } from '@/contexts/WealthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FundFormDialog } from './FundFormDialog';
import { FundExpenseDialog } from './FundExpenseDialog';
import type { Fund } from '@/types/wealth';

const FMT = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const CAT_META: Record<string, { label: string; emoji: string; color: string }> = {
  real_estate_payment: { label: 'Trả góp BĐS', emoji: '🏠', color: 'text-amber-500' },
  travel:              { label: 'Du lịch',      emoji: '✈️',  color: 'text-sky-500' },
  education:           { label: 'Học phí',      emoji: '🎓', color: 'text-violet-500' },
  emergency:           { label: 'Khẩn cấp',     emoji: '🆘', color: 'text-red-500' },
  other:               { label: 'Khác',         emoji: '📦', color: 'text-gray-500' },
};

export const FundsModule = () => {
  const {
    funds, addFund, updateFund, deleteFund, toggleFundStatus,
    fundExpenses, addFundExpense, deleteFundExpense,
    savingsDeposits, financialGoals, hideValues,
  } = useWealth();

  const [formOpen, setFormOpen] = useState(false);
  const [editFund, setEditFund] = useState<Fund | null>(null);
  const [expenseDialogFund, setExpenseDialogFund] = useState<Fund | null>(null);

  const hv = hideValues;
  const V = (n: number) => hv ? '******' : FMT(n);

  // Compute fund data
  const fundsData = useMemo(() => funds.map(fund => {
    const goalSavings = fund.goalId
      ? savingsDeposits.filter(d => d.goalId === fund.goalId)
      : [];
    const totalSaved = goalSavings.reduce((s, d) => s + d.principal, 0);
    const expenses = fundExpenses.filter(e => e.fundId === fund.id);
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const availableBalance = Math.max(totalSaved - totalSpent, 0);
    const progressPercent = fund.targetAmount > 0
      ? Math.min((totalSaved / fund.targetAmount) * 100, 100)
      : 0;
    const daysLeft = Math.ceil((new Date(fund.deadline).getTime() - Date.now()) / 86400000);
    return { fund, totalSaved, totalSpent, availableBalance, progressPercent, expenses, daysLeft, goalSavings };
  }), [funds, savingsDeposits, fundExpenses]);

  const accumulatingFunds = fundsData.filter(f => f.fund.status === 'accumulating');
  const readyFunds = fundsData.filter(f => f.fund.status === 'ready');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10"><Vault className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quản lý Quỹ</h1>
              <p className="text-muted-foreground">Theo dõi các quỹ gia đình: gom tiền → sử dụng</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => { setEditFund(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />Tạo quỹ
          </Button>
        </div>
      </motion.div>

      {fundsData.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
          <Vault className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có quỹ nào. Hãy tạo quỹ đầu tiên!</p>
          <Button className="mt-4 gap-2" onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Tạo quỹ</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pha Tích lũy */}
          {accumulatingFunds.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5 text-sky-500" />Đang gom tiền ({accumulatingFunds.length})</h2>
              <div className="space-y-3">
                {accumulatingFunds.map((fd, i) => {
                  const cat = CAT_META[fd.fund.category] || CAT_META.other;
                  const isUrgent = fd.daysLeft <= 60 && fd.daysLeft >= 0;
                  const isOverdue = fd.daysLeft < 0;
                  return (
                    <motion.div key={fd.fund.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={cn('p-5 rounded-xl border bg-card space-y-3',
                        isOverdue ? 'border-destructive/30' : isUrgent ? 'border-amber-500/30' : 'border-border'
                      )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xl shrink-0">{cat.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{fd.fund.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge variant="outline" className={cn('text-xs', cat.color)}>{cat.label}</Badge>
                              {fd.progressPercent >= 100 && <Badge className="text-xs bg-profit/20 text-profit border-profit/30">✅ Đủ tiền</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">Mục tiêu</p>
                          <p className="font-mono font-bold">{V(fd.fund.targetAmount)}</p>
                          <p className={cn('text-xs mt-0.5', isOverdue ? 'text-destructive' : isUrgent ? 'text-amber-500' : 'text-muted-foreground')}>
                            {isOverdue ? `Quá hạn ${Math.abs(fd.daysLeft)} ngày` : `Còn ${fd.daysLeft} ngày`}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="text-profit">✅ Đã tích lũy (sổ): {V(fd.totalSaved)}</span>
                          <span className="text-profit font-medium">{fd.progressPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={fd.progressPercent} className="h-2 bg-muted [&>div]:bg-profit" />
                        {fd.totalSaved < fd.fund.targetAmount && (
                          <p className="text-xs text-muted-foreground">Còn thiếu: <span className="font-semibold text-destructive">{V(fd.fund.targetAmount - fd.totalSaved)}</span></p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {fd.progressPercent >= 100 && (
                          <Button size="sm" className="gap-1.5 text-xs" onClick={() => toggleFundStatus(fd.fund.id, 'ready')}>
                            <ArrowRight className="h-3.5 w-3.5" />Chuyển sang sử dụng
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditFund(fd.fund); setFormOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteFund(fd.fund.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pha Giải ngân */}
          {readyFunds.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-profit" />Sẵn sàng sử dụng ({readyFunds.length})</h2>
              <div className="space-y-3">
                {readyFunds.map((fd, i) => {
                  const cat = CAT_META[fd.fund.category] || CAT_META.other;
                  return (
                    <motion.div key={fd.fund.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-xl border border-profit/20 bg-card space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xl shrink-0">{cat.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{fd.fund.name}</p>
                            <Badge className="text-xs bg-profit/20 text-profit border-profit/30 mt-1">✅ Sẵn sàng sử dụng</Badge>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">Số dư khả dụng</p>
                          <p className="font-mono font-bold text-xl text-profit">{V(fd.availableBalance)}</p>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-xs text-muted-foreground">Đã gom</p>
                          <p className="font-mono font-semibold text-sm">{V(fd.totalSaved)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-2">
                          <p className="text-xs text-muted-foreground">Đã chi</p>
                          <p className="font-mono font-semibold text-sm text-destructive">{V(fd.totalSpent)}</p>
                        </div>
                        <div className="rounded-lg bg-profit/10 p-2">
                          <p className="text-xs text-muted-foreground">Còn lại</p>
                          <p className="font-mono font-semibold text-sm text-profit">{V(fd.availableBalance)}</p>
                        </div>
                      </div>

                      {/* Expense history */}
                      {fd.expenses.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lịch sử chi tiêu</p>
                          <div className="rounded-lg border divide-y divide-border max-h-48 overflow-y-auto">
                            {[...fd.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                              <div key={exp.id} className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Receipt className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="truncate">{exp.note || 'Chi tiêu'}</span>
                                  <span className="text-xs text-muted-foreground shrink-0">{new Date(exp.date).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono font-semibold text-destructive">-{V(exp.amount)}</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/50 hover:text-destructive" onClick={() => deleteFundExpense(exp.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button size="sm" className="gap-1.5 text-xs" onClick={() => setExpenseDialogFund(fd.fund)}>
                          <Receipt className="h-3.5 w-3.5" />Ghi nhận chi tiêu
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toggleFundStatus(fd.fund.id, 'accumulating')}>
                          <Clock className="h-3.5 w-3.5" />Quay lại gom tiền
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteFund(fd.fund.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <FundFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editFund={editFund}
        onSubmit={v => editFund ? updateFund(editFund.id, v) : addFund(v)}
      />
      {expenseDialogFund && (
        <FundExpenseDialog
          open={!!expenseDialogFund}
          onOpenChange={v => { if (!v) setExpenseDialogFund(null); }}
          fundId={expenseDialogFund.id}
          fundName={expenseDialogFund.name}
          availableBalance={fundsData.find(f => f.fund.id === expenseDialogFund.id)?.availableBalance ?? 0}
          onSubmit={addFundExpense}
        />
      )}
    </div>
  );
};
