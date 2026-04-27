import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Wallet, TrendingUp, PiggyBank, Calendar, CheckCircle2, ClipboardList, Trash2, Pencil, AlertTriangle, Filter, RotateCcw } from 'lucide-react';
import { useWealth } from '@/contexts/WealthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SalaryFormDialog } from './SalaryFormDialog';
import { GoalFormDialog } from './GoalFormDialog';
import { AllocationFormDialog } from './AllocationFormDialog';
import type { MonthlySalary, FinancialGoal, SalaryAllocation, GoalProgress, GoalSource } from '@/types/wealth';

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

  // Goal filters
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const sortedSalaries = [...monthlySalaries].sort((a,b) => a.name.localeCompare(b.name));

  const hasActiveFilter = filterFromDate || filterToDate || filterCategory !== 'all' || filterSource !== 'all' || filterStatus !== 'all';

  const filteredGoals = useMemo(() => {
    let result = [...goalsProgress];
    if (filterFromDate) {
      result = result.filter(gp => gp.goal.dueDate && new Date(gp.goal.dueDate) >= new Date(filterFromDate));
    }
    if (filterToDate) {
      result = result.filter(gp => gp.goal.dueDate && new Date(gp.goal.dueDate) <= new Date(filterToDate));
    }
    if (filterCategory !== 'all') {
      result = result.filter(gp => gp.goal.category === filterCategory);
    }
    if (filterSource !== 'all') {
      result = result.filter(gp => gp.goal.source === filterSource);
    }
    if (filterStatus !== 'all') {
      result = result.filter(gp => {
        const days = daysUntil(gp.goal.dueDate);
        const isComplete = gp.savedAmount >= gp.goal.targetAmount;
        const isOverdue = days !== null && days < 0 && !isComplete;
        if (filterStatus === 'complete') return isComplete;
        if (filterStatus === 'overdue') return isOverdue;
        if (filterStatus === 'active') return !isComplete && !isOverdue;
        return true;
      });
    }
    return result.sort((a,b) => {
      const da = daysUntil(a.goal.dueDate);
      const db = daysUntil(b.goal.dueDate);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
  }, [goalsProgress, filterFromDate, filterToDate, filterCategory, filterSource, filterStatus]);

  const resetFilters = () => { setFilterFromDate(''); setFilterToDate(''); setFilterCategory('all'); setFilterSource('all'); setFilterStatus('all'); };
  const filteredTotalTarget = filteredGoals.reduce((s,g) => s+g.goal.targetAmount, 0);
  const filteredTotalSaved = filteredGoals.reduce((s,g) => s+g.savedAmount, 0);
  const filteredTotalRemaining = filteredGoals.reduce((s,g) => s+g.remainingAmount, 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Quản lý Mục tiêu</h1>
              <p className="text-muted-foreground">Theo dõi tích lũy và phân bổ lương cho các mục tiêu tài chính</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Nguồn vốn" value={V(totalSalary)} sub={`${monthlySalaries.length} nguồn`} color="border-border" />
        <StatCard label="Đã kế hoạch" value={V(totalPlanned)} sub={`${monthlySalaries.length} tháng`} color="border-sky-500/20 bg-sky-500/5" />
        <StatCard label="Đã tích lũy (sổ)" value={V(totalSaved)} color="border-profit/20 bg-profit/5" />
        <StatCard label="Chưa phân bổ" value={V(totalUnallocated)} color={totalUnallocated > 0 ? 'border-amber-500/20 bg-amber-500/5' : 'border-border'} />
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="bg-muted/50 h-11 p-1 mb-4">
          <TabsTrigger value="goals" className="gap-2 px-4"><Target className="h-4 w-4"/>Mục tiêu ({financialGoals.length})</TabsTrigger>
          <TabsTrigger value="salaries" className="gap-2 px-4"><Wallet className="h-4 w-4"/>Lương tháng</TabsTrigger>
          <TabsTrigger value="allocations" className="gap-2 px-4"><ClipboardList className="h-4 w-4"/>Phân bổ</TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: OVERVIEW (removed) ===== */}
        <TabsContent value="overview_removed" className="space-y-4 mt-0">
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
                  const isComplete = gp.savedAmount >= gp.goal.targetAmount;
                  const cat = CAT_META[gp.goal.category] || CAT_META.other;
                  return (
                    <motion.div key={gp.goal.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                      className={cn('p-5 rounded-xl border bg-card space-y-4',
                        isComplete ? 'border-profit/30' : isOverdue ? 'border-destructive/30' : isUrgent ? 'border-amber-500/30' : 'border-border'
                      )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-xl shrink-0">{cat.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{gp.goal.name}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <Badge variant="outline" className={cn('text-xs', cat.color)}>{cat.label}</Badge>
                              {gp.goal.source === 'real_estate' && <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">🏠 BĐS</Badge>}
                              {gp.goal.source === 'fund' && <Badge variant="outline" className="text-xs text-sky-500 border-sky-500/30">💰 Quỹ</Badge>}
                              {isComplete && <Badge className="text-xs bg-profit/20 text-profit border-profit/30">✅ Hoàn thành</Badge>}
                              {isOverdue && !isComplete && <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">⏰ Quá hạn {Math.abs(days!)}n</Badge>}
                            </div>
                          </div>
                        </div>
                        {days !== null && !isComplete && !isOverdue && (
                          <p className={cn('text-xs font-medium shrink-0', isUrgent ? 'text-amber-500' : 'text-muted-foreground')}>
                            Còn {days} ngày
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Cần trả</p>
                          <p className="font-mono font-bold text-sm">{V(gp.goal.targetAmount)}</p>
                        </div>
                        <div className="rounded-lg bg-profit/5 border border-profit/10 p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Đã tích lũy</p>
                          <p className="font-mono font-bold text-sm text-profit">{V(gp.savedAmount)}</p>
                          <p className="text-[10px] text-profit">{gp.progressPercent.toFixed(0)}%</p>
                        </div>
                        <div className={cn('rounded-lg p-3 text-center', gp.remainingAmount > 0 ? 'bg-destructive/5 border border-destructive/10' : 'bg-profit/5 border border-profit/10')}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Còn thiếu</p>
                          <p className={cn('font-mono font-bold text-sm', gp.remainingAmount > 0 ? 'text-destructive' : 'text-profit')}>{V(gp.remainingAmount)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>✅ Tích lũy thực tế</span>
                            <span className="text-profit font-medium">{gp.progressPercent.toFixed(0)}%</span>
                          </div>
                          <Progress value={gp.progressPercent} className="h-3 bg-muted [&>div]:bg-profit [&>div]:rounded-full" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>📋 Kế hoạch: {V(gp.plannedAmount)}</span>
                            <span>{gp.plannedPercent.toFixed(0)}%</span>
                          </div>
                          <Progress value={gp.plannedPercent} className="h-1.5 bg-muted" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </TabsContent>

        {/* ===== TAB 2: GOALS ===== */}
        <TabsContent value="goals" className="mt-0 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground shrink-0">
              <Filter className="h-4 w-4" />Lọc
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Từ ngày</label>
              <Input type="date" value={filterFromDate} onChange={e => setFilterFromDate(e.target.value)} className="h-8 w-[140px] text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Đến ngày</label>
              <Input type="date" value={filterToDate} onChange={e => setFilterToDate(e.target.value)} className="h-8 w-[140px] text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Danh mục</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="real_estate_payment">🏠 BĐS</SelectItem>
                  <SelectItem value="travel">✈️ Du lịch</SelectItem>
                  <SelectItem value="education">🎓 Học phí</SelectItem>
                  <SelectItem value="emergency">🆘 Khẩn cấp</SelectItem>
                  <SelectItem value="other">📦 Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Nguồn</label>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="manual">✍️ Thủ công</SelectItem>
                  <SelectItem value="real_estate">🏠 BĐS</SelectItem>
                  <SelectItem value="fund">💰 Quỹ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Trạng thái</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">🔵 Đang tích lũy</SelectItem>
                  <SelectItem value="complete">✅ Hoàn thành</SelectItem>
                  <SelectItem value="overdue">🔴 Quá hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8" onClick={resetFilters}><RotateCcw className="h-3 w-3" />Reset</Button>
            )}
            <div className="ml-auto">
              <Button className="gap-2 h-8 text-xs" onClick={() => { setEditGoal(null); setGoalOpen(true); }}><Plus className="h-3.5 w-3.5"/>Thêm mục tiêu</Button>
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilter && (
            <div className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg bg-muted/50 border text-sm">
              <span className="text-muted-foreground">📊 Hiển thị <strong>{filteredGoals.length}</strong>/{goalsProgress.length} mục tiêu</span>
              <span className="text-muted-foreground">Tổng cần: <strong className="font-mono">{V(filteredTotalTarget)}</strong></span>
              <span className="text-profit">Đã tích lũy: <strong className="font-mono">{V(filteredTotalSaved)}</strong></span>
              <span className="text-destructive">Còn thiếu: <strong className="font-mono">{V(filteredTotalRemaining)}</strong></span>
            </div>
          )}

          {/* Goal Cards */}
          {filteredGoals.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground">
              {hasActiveFilter ? 'Không có mục tiêu phù hợp bộ lọc' : 'Chưa có mục tiêu nào'}
            </div>
          ) : (() => {
            // Render a single goal card
            const renderGoalCard = (gp: GoalProgress, i: number) => {
              const cat = CAT_META[gp.goal.category] || CAT_META.other;
              const days = daysUntil(gp.goal.dueDate);
              const isOverdue = days !== null && days < 0;
              const isUrgent = days !== null && days <= 60 && days >= 0;
              const isComplete = gp.savedAmount >= gp.goal.targetAmount;
              const savedPct = gp.progressPercent;
              const plannedOnlyPct = Math.min(gp.plannedPercent, Math.max(100 - savedPct, 0));
              return (
                <motion.div key={gp.goal.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                  className={cn('p-5 rounded-xl border bg-card space-y-4',
                    isComplete ? 'border-profit/30' : isOverdue ? 'border-destructive/30' : isUrgent ? 'border-amber-500/30' : 'border-border'
                  )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg shrink-0">{cat.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{gp.goal.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <Badge variant="outline" className={cn('text-xs', cat.color)}>{cat.label}</Badge>
                          {gp.goal.source === 'real_estate' && <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">🏠 BĐS</Badge>}
                          {gp.goal.source === 'fund' && <Badge variant="outline" className="text-xs text-sky-500 border-sky-500/30">💰 Quỹ</Badge>}
                          {isComplete && <Badge className="text-xs bg-profit/20 text-profit border-profit/30">✅ Hoàn thành</Badge>}
                          {isOverdue && !isComplete && <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">⏰ Quá hạn {Math.abs(days!)}n</Badge>}
                          {days !== null && !isComplete && !isOverdue && (
                            <span className={cn('text-xs', isUrgent ? 'text-amber-500' : 'text-muted-foreground')}>Còn {days} ngày</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {gp.goal.source === 'manual' ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditGoal(gp.goal); setGoalOpen(true); }}><Pencil className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteFinancialGoal(gp.goal.id)}><Trash2 className="h-4 w-4"/></Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground italic px-2">Tự động</span>
                      )}
                    </div>
                  </div>
                  {/* 3 Stats */}
                  {(() => {
                    const totalWithPlan = gp.savedAmount + gp.plannedAmount;
                    const remainingWithPlan = Math.max(gp.goal.targetAmount - totalWithPlan, 0);
                    const hasPlan = gp.plannedAmount > 0;
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Cần trả</p>
                          <p className="font-mono font-bold text-sm">{V(gp.goal.targetAmount)}</p>
                        </div>
                        <div className="rounded-lg bg-profit/5 border border-profit/10 p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Đã tích lũy</p>
                          <p className="font-mono font-bold text-sm text-profit">{V(gp.savedAmount)}</p>
                          <p className="text-[10px] text-profit">{savedPct.toFixed(0)}%</p>
                          {hasPlan && (
                            <p className="text-[10px] text-amber-500 mt-0.5 border-t border-amber-500/20 pt-0.5">
                              + kế hoạch: {V(totalWithPlan)} ({(savedPct + plannedOnlyPct).toFixed(0)}%)
                            </p>
                          )}
                        </div>
                        <div className={cn('rounded-lg p-3 text-center', gp.remainingAmount > 0 ? 'bg-destructive/5 border border-destructive/10' : 'bg-profit/5 border border-profit/10')}>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Còn thiếu</p>
                          <p className={cn('font-mono font-bold text-sm', gp.remainingAmount > 0 ? 'text-destructive' : 'text-profit')}>{V(gp.remainingAmount)}</p>
                          {hasPlan && (
                            <p className={cn('text-[10px] mt-0.5 border-t pt-0.5', remainingWithPlan > 0 ? 'text-amber-500 border-amber-500/20' : 'text-profit border-profit/20')}>
                              + kế hoạch: {V(remainingWithPlan)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {/* Composite Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[hsl(var(--profit))]" /> Tích lũy {savedPct.toFixed(0)}%</span>
                        {plannedOnlyPct > 0 && (
                          <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 progress-planned" /> Kế hoạch +{plannedOnlyPct.toFixed(0)}%</span>
                        )}
                      </div>
                      <span className="font-medium">{Math.min(savedPct + plannedOnlyPct, 100).toFixed(0)}%</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-muted overflow-hidden flex">
                      {/* Green: đã tích lũy (sổ tiết kiệm) */}
                      {savedPct > 0 && (
                        <div
                          className="h-full bg-[hsl(var(--profit))] transition-all shrink-0"
                          style={{ width: `${savedPct}%` }}
                        />
                      )}
                      {/* Amber pulsing: kế hoạch phân bổ lương chưa gán sổ */}
                      {plannedOnlyPct > 0 && (
                        <div
                          className="h-full bg-amber-400 progress-planned transition-all shrink-0"
                          style={{ width: `${plannedOnlyPct}%` }}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            };

            // If filter active → flat list; otherwise → group by month
            if (hasActiveFilter) {
              return <div className="space-y-3">{filteredGoals.map((gp, i) => renderGoalCard(gp, i))}</div>;
            }

            // Group by month
            const monthGroups: Record<string, GoalProgress[]> = {};
            const noDateGoals: GoalProgress[] = [];
            filteredGoals.forEach(gp => {
              if (!gp.goal.dueDate) { noDateGoals.push(gp); return; }
              const d = new Date(gp.goal.dueDate);
              const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
              if (!monthGroups[key]) monthGroups[key] = [];
              monthGroups[key].push(gp);
            });

            const sortedMonths = Object.keys(monthGroups).sort();

            return (
              <div className="space-y-8">
                {sortedMonths.map(monthKey => {
                  const goals = monthGroups[monthKey];
                  const [y, m] = monthKey.split('-');
                  const label = `Tháng ${+m}/${y}`;
                  const totalTarget = goals.reduce((s,g) => s+g.goal.targetAmount, 0);
                  const totalSaved = goals.reduce((s,g) => s+g.savedAmount, 0);
                  return (
                    <div key={monthKey} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <h4 className="font-semibold text-lg flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-5 w-5" />{label}
                          <span className="text-sm font-normal">({goals.length} mục tiêu)</span>
                        </h4>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Tổng cần</p>
                          <p className="font-mono font-bold text-primary">{V(totalTarget)}</p>
                          {totalSaved > 0 && <p className="text-xs text-profit font-mono">Đã gom: {V(totalSaved)}</p>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        {goals.map((gp, i) => renderGoalCard(gp, i))}
                      </div>
                    </div>
                  );
                })}
                {noDateGoals.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                      <h4 className="font-semibold text-lg text-muted-foreground">Không có hạn</h4>
                    </div>
                    <div className="space-y-3">{noDateGoals.map((gp, i) => renderGoalCard(gp, i))}</div>
                  </div>
                )}
              </div>
            );
          })()}
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
                          <p className="font-semibold">{s.name}</p>
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
                  return (sb?.name ?? '').localeCompare(sa?.name ?? '');
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
                            Từ nguồn: {salary ? salary.name : '—'}
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
