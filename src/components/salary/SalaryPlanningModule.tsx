import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Wallet, TrendingUp, PiggyBank, Calendar, CheckCircle2, ClipboardList, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { useWealth } from '@/contexts/WealthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SalaryFormDialog } from './SalaryFormDialog';
import { GoalFormDialog } from './GoalFormDialog';
import { AllocationFormDialog } from './AllocationFormDialog';
import type { MonthlySalary, FinancialGoal, SalaryAllocation, GoalProgress } from '@/types/wealth';

const FMT = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const fmtMonth = (m: string) => { const [y,mo] = m.split('-'); return `${MONTHS[+mo-1]}/${y}`; };

const CAT_META: Record<string, {label:string;emoji:string;color:string}> = {
  real_estate_payment: { label:'Trả góp BĐS', emoji:'🏠', color:'text-amber-500' },
  travel:              { label:'Du lịch',      emoji:'✈️',  color:'text-sky-500' },
  education:           { label:'Học phí',      emoji:'🎓', color:'text-violet-500' },
  emergency:           { label:'Khẩn cấp',     emoji:'🆘', color:'text-red-500' },
  other:               { label:'Khác',         emoji:'📦', color:'text-gray-500' },
};

function StatCard({ label, value, sub, color }: { label:string; value:string; sub?:string; color:string }) {
  return (
    <div className={cn('rounded-xl border p-4 bg-card', color)}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold font-mono">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export const SalaryPlanningModule = ({ onNavigateToSavings }: { onNavigateToSavings?: () => void }) => {
  const {
    monthlySalaries, addMonthlySalary, updateMonthlySalary, deleteMonthlySalary,
    financialGoals, addFinancialGoal, updateFinancialGoal, deleteFinancialGoal,
    salaryAllocations, addSalaryAllocation, deleteSalaryAllocation,
    savingsDeposits, hideValues,
  } = useWealth();

  const [salaryOpen, setSalaryOpen] = useState(false);
  const [editSalary, setEditSalary] = useState<MonthlySalary|null>(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<FinancialGoal|null>(null);
  const [allocOpen, setAllocOpen] = useState(false);
  const [defaultAllocSalary, setDefaultAllocSalary] = useState('');

  const hv = hideValues;
  const V = (n: number) => hv ? '******' : FMT(n);

  const goalsProgress: GoalProgress[] = useMemo(() =>
    financialGoals.map(goal => {
      const allocs = salaryAllocations
        .filter(a => a.goalId === goal.id)
        .map(a => ({
          ...a,
          salary: monthlySalaries.find(s => s.id === a.salaryId)!,
        }))
        .filter(a => a.salary);
      const goalSavings = savingsDeposits.filter(d => d.goalId === goal.id);
      const plannedAmount = allocs.reduce((s,a) => s+a.amount, 0);
      const savedAmount = goalSavings.reduce((s,d) => s+d.principal, 0);
      return {
        goal,
        plannedAmount,
        savedAmount,
        progressPercent: goal.targetAmount > 0 ? Math.min((savedAmount/goal.targetAmount)*100, 100) : 0,
        plannedPercent: goal.targetAmount > 0 ? Math.min((plannedAmount/goal.targetAmount)*100, 100) : 0,
        remainingAmount: Math.max(goal.targetAmount - savedAmount, 0),
        allocations: allocs,
        savingsDeposits: goalSavings,
      };
    }), [financialGoals, salaryAllocations, monthlySalaries, savingsDeposits]);

  const totalSalary = monthlySalaries.reduce((s,x) => s+x.amount, 0);
  const totalPlanned = salaryAllocations.reduce((s,a)=>s+a.amount,0);
  const totalSaved = savingsDeposits.filter(d => !!d.goalId).reduce((s,d)=>s+d.principal,0);
  const totalUnallocated = Math.max(totalSalary - totalPlanned, 0);

  const daysUntil = (d?: Date) => {
    if (!d) return null;
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  };

  const sortedSalaries = [...monthlySalaries].sort((a,b) => b.month.localeCompare(a.month));

  return (
    <div className="space-y-6">
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Kế hoạch Chi tiêu Lương</h1>
              <p className="text-muted-foreground">Phân bổ lương hàng tháng cho các mục tiêu tài chính</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Lương tích lũy" value={V(totalSalary)} color="border-border" />
        <StatCard label="Đã kế hoạch" value={V(totalPlanned)} sub={`${monthlySalaries.length} tháng`} color="border-sky-500/20 bg-sky-500/5" />
        <StatCard label="Đã tích lũy (sổ)" value={V(totalSaved)} color="border-profit/20 bg-profit/5" />
        <StatCard label="Chưa phân bổ" value={V(totalUnallocated)} color={totalUnallocated > 0 ? 'border-amber-500/20 bg-amber-500/5' : 'border-border'} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/50 h-11 p-1 mb-4">
          <TabsTrigger value="overview" className="gap-2 px-4"><TrendingUp className="h-4 w-4"/>Tổng quan</TabsTrigger>
          <TabsTrigger value="goals" className="gap-2 px-4"><Target className="h-4 w-4"/>Mục tiêu ({financialGoals.length})</TabsTrigger>
          <TabsTrigger value="salaries" className="gap-2 px-4"><Wallet className="h-4 w-4"/>Lương tháng</TabsTrigger>
          <TabsTrigger value="allocations" className="gap-2 px-4"><ClipboardList className="h-4 w-4"/>Phân bổ</TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: OVERVIEW ===== */}
        <TabsContent value="overview" className="space-y-4 mt-0">
          {goalsProgress.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-30"/>
              <p>Chưa có mục tiêu nào. Hãy tạo mục tiêu đầu tiên!</p>
              <Button className="mt-4 gap-2" onClick={() => setGoalOpen(true)}><Plus className="h-4 w-4"/>Tạo mục tiêu</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {goalsProgress
                .sort((a,b) => {
                  const da = daysUntil(a.goal.dueDate);
                  const db = daysUntil(b.goal.dueDate);
                  if (da === null && db === null) return 0;
                  if (da === null) return 1;
                  if (db === null) return -1;
                  return da - db;
                })
                .map((gp, i) => {
                  const days = daysUntil(gp.goal.dueDate);
                  const isUrgent = days !== null && days <= 60 && days >= 0;
                  const isOverdue = days !== null && days < 0;
                  const cat = CAT_META[gp.goal.category] || CAT_META.other;
                  const isFullyPlanned = gp.plannedAmount >= gp.goal.targetAmount;
                  const isFullySaved = gp.savedAmount >= gp.goal.targetAmount;
                  return (
                    <motion.div key={gp.goal.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                      className={cn('p-5 rounded-xl border bg-card space-y-3',
                        isOverdue ? 'border-destructive/30' : isUrgent ? 'border-amber-500/30' : 'border-border'
                      )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xl shrink-0">{cat.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{gp.goal.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge variant="outline" className={cn('text-xs', cat.color)}>{cat.label}</Badge>
                              {isFullySaved && <Badge className="text-xs bg-profit/20 text-profit border-profit/30">✅ Đã tích lũy đủ</Badge>}
                              {!isFullySaved && isFullyPlanned && <Badge className="text-xs bg-sky-500/20 text-sky-500 border-sky-500/30">📋 Đủ kế hoạch</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">Cần tích</p>
                          <p className="font-mono font-bold">{V(gp.goal.targetAmount)}</p>
                          {days !== null && (
                            <p className={cn('text-xs mt-0.5', isOverdue ? 'text-destructive' : isUrgent ? 'text-amber-500' : 'text-muted-foreground')}>
                              {isOverdue ? `Quá hạn ${Math.abs(days)} ngày` : `Còn ${days} ngày`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>📋 Kế hoạch: {V(gp.plannedAmount)}</span>
                          <span>{gp.plannedPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={gp.plannedPercent} className="h-2 bg-muted" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span className="text-profit">✅ Đã tích lũy (sổ): {V(gp.savedAmount)}</span>
                          <span className="text-profit font-medium">{gp.progressPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={gp.progressPercent} className="h-2 bg-muted [&>div]:bg-profit" />
                      </div>
                      {gp.remainingAmount > 0 && (
                        <p className="text-xs text-muted-foreground">Còn thiếu: <span className="font-semibold text-destructive">{V(gp.remainingAmount)}</span></p>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          )}
        </TabsContent>

        {/* ===== TAB 2: GOALS ===== */}
        <TabsContent value="goals" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button className="gap-2" onClick={() => { setEditGoal(null); setGoalOpen(true); }}>
              <Plus className="h-4 w-4"/>Thêm mục tiêu
            </Button>
          </div>
          {financialGoals.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground">Chưa có mục tiêu nào</div>
          ) : (
            <div className="space-y-3">
              {goalsProgress.map((gp, i) => {
                const cat = CAT_META[gp.goal.category] || CAT_META.other;
                const days = daysUntil(gp.goal.dueDate);
                return (
                  <motion.div key={gp.goal.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                    className="p-5 rounded-xl border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.emoji}</span>
                        <div>
                          <p className="font-semibold">{gp.goal.name}</p>
                          <p className="text-xs text-muted-foreground">{cat.label} · Cần: {V(gp.goal.targetAmount)}{days !== null ? ` · ${days < 0 ? `Quá hạn ${Math.abs(days)}n` : `Còn ${days} ngày`}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditGoal(gp.goal); setGoalOpen(true); }}><Pencil className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteFinancialGoal(gp.goal.id)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs"><span className="text-muted-foreground">📋 Kế hoạch {V(gp.plannedAmount)}</span><span>{gp.plannedPercent.toFixed(0)}%</span></div>
                      <Progress value={gp.plannedPercent} className="h-2"/>
                      <div className="flex justify-between text-xs mt-1"><span className="text-profit">✅ Tích lũy {V(gp.savedAmount)}</span><span className="text-profit font-medium">{gp.progressPercent.toFixed(0)}%</span></div>
                      <Progress value={gp.progressPercent} className="h-2 [&>div]:bg-profit"/>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== TAB 3: SALARIES ===== */}
        <TabsContent value="salaries" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button className="gap-2" onClick={() => { setEditSalary(null); setSalaryOpen(true); }}>
              <Plus className="h-4 w-4"/>Khai báo lương
            </Button>
          </div>
          {sortedSalaries.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground">Chưa có khai báo lương nào</div>
          ) : (
            <div className="space-y-3">
              {sortedSalaries.map((s, i) => {
                const allocs = salaryAllocations.filter(a => a.salaryId === s.id);
                const totalAlloc = allocs.reduce((sum,a) => sum+a.amount, 0);
                const rem = s.amount - totalAlloc;
                const pct = s.amount > 0 ? (totalAlloc/s.amount)*100 : 0;
                return (
                  <motion.div key={s.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                    className="p-5 rounded-xl border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-4 w-4 text-primary"/></div>
                        <div>
                          <p className="font-semibold">{fmtMonth(s.month)}</p>
                          {s.note && <p className="text-xs text-muted-foreground">{s.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-mono font-bold">{V(s.amount)}</p>
                          <p className={cn('text-xs', rem > 0 ? 'text-amber-500' : 'text-profit')}>
                            {rem > 0 ? `Còn ${V(rem)}` : 'Đã phân bổ hết'}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDefaultAllocSalary(s.id); setAllocOpen(true); }} title="Phân bổ"><Plus className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditSalary(s); setSalaryOpen(true); }}><Pencil className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMonthlySalary(s.id)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Đã phân bổ: {V(totalAlloc)} ({allocs.length} khoản)</span>
                        <span>{pct.toFixed(0)}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5"/>
                    </div>
                    {allocs.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {allocs.map(a => {
                          const g = financialGoals.find(g => g.id === a.goalId);
                          const cat = g ? (CAT_META[g.category] || CAT_META.other) : CAT_META.other;
                          return (
                            <div key={a.id} className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-3 py-2">
                              <span className="flex items-center gap-1.5">
                                <ClipboardList className="h-3.5 w-3.5 text-muted-foreground"/>
                                <span>{cat.emoji} {g?.name ?? '—'}</span>
                              </span>
                              <span className="font-mono font-semibold">{V(a.amount)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== TAB 4: ALLOCATIONS ===== */}
        <TabsContent value="allocations" className="mt-0">
          <div className="flex justify-end mb-4">
            <Button className="gap-2" onClick={() => { setDefaultAllocSalary(''); setAllocOpen(true); }}>
              <Plus className="h-4 w-4"/>Thêm phân bổ
            </Button>
          </div>
          {salaryAllocations.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground">Chưa có phân bổ nào</div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden divide-y divide-border">
              {[...salaryAllocations]
                .sort((a,b) => {
                  const sa = monthlySalaries.find(s=>s.id===a.salaryId);
                  const sb = monthlySalaries.find(s=>s.id===b.salaryId);
                  return (sb?.month ?? '').localeCompare(sa?.month ?? '');
                })
                .map((a, i) => {
                  const salary = monthlySalaries.find(s => s.id === a.salaryId);
                  const goal = financialGoals.find(g => g.id === a.goalId);
                  const cat = goal ? (CAT_META[goal.category] || CAT_META.other) : CAT_META.other;
                  return (
                    <motion.div key={a.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
                      className={cn('p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors')}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn('p-2 rounded-lg shrink-0 bg-muted')}>
                          <ClipboardList className="h-4 w-4 text-muted-foreground"/>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm">{cat.emoji}</span>
                            <span className="font-medium text-sm truncate">{goal?.name ?? '—'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Từ lương: {salary ? fmtMonth(salary.month) : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pl-11 sm:pl-0">
                        <div className="text-right">
                          <p className="font-mono font-bold">{V(a.amount)}</p>
                          <Badge variant="outline" className={cn('text-xs mt-0.5 text-muted-foreground')}>
                            📋 Kế hoạch
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteSalaryAllocation(a.id)}>
                            <Trash2 className="h-3.5 w-3.5"/>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SalaryFormDialog
        open={salaryOpen}
        onOpenChange={setSalaryOpen}
        editSalary={editSalary}
        onSubmit={v => editSalary ? updateMonthlySalary(editSalary.id, v) : addMonthlySalary(v)}
      />
      <GoalFormDialog
        open={goalOpen}
        onOpenChange={setGoalOpen}
        editGoal={editGoal}
        onSubmit={v => editGoal ? updateFinancialGoal(editGoal.id, v) : addFinancialGoal(v)}
      />
      <AllocationFormDialog
        open={allocOpen}
        onOpenChange={setAllocOpen}
        defaultSalaryId={defaultAllocSalary}
        onSubmit={v => addSalaryAllocation(v)}
      />
    </div>
  );
};
