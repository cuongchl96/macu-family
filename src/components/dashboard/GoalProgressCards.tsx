import { differenceInDays } from 'date-fns';
import { Target, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWealth } from '@/contexts/WealthContext';
import { formatVND, formatUSD, vndToUsd } from '@/data/wealthData';
import type { FinancialGoal } from '@/types/wealth';

type GoalStatus = 'on_track' | 'at_risk' | 'overdue' | 'complete';

function getGoalStatus(goal: FinancialGoal, savedAmount: number): GoalStatus {
  if (savedAmount >= goal.targetAmount) return 'complete';
  if (!goal.dueDate) return 'on_track';
  const today = new Date();
  const due = new Date(goal.dueDate);
  if (due < today) return 'overdue';
  const totalDays = differenceInDays(due, today);
  const remainingAmount = goal.targetAmount - savedAmount;
  // at_risk nếu cần tích lũy > 50% target trong < 60 ngày
  if (totalDays < 60 && savedAmount / goal.targetAmount < 0.5) return 'at_risk';
  // at_risk nếu tiến độ thực tế tụt hậu > 25% so với kỳ vọng
  const daysFromCreation = 365; // estimate
  const expectedProgress = Math.min(1, (daysFromCreation - totalDays) / daysFromCreation);
  const actualProgress = savedAmount / goal.targetAmount;
  if (actualProgress < expectedProgress - 0.25) return 'at_risk';
  return 'on_track';
}

const STATUS_CONFIG: Record<GoalStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  barClass: string;
}> = {
  complete: {
    label: 'Hoàn thành',
    icon: CheckCircle2,
    badgeClass: 'bg-green-500/10 text-green-400 border-green-500/20',
    barClass: '[&>div]:bg-green-500',
  },
  on_track: {
    label: 'Đúng tiến độ',
    icon: CheckCircle2,
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    barClass: '[&>div]:bg-blue-500',
  },
  at_risk: {
    label: 'Cần chú ý',
    icon: AlertTriangle,
    badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    barClass: '[&>div]:bg-yellow-500',
  },
  overdue: {
    label: 'Quá hạn',
    icon: XCircle,
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/20',
    barClass: '[&>div]:bg-destructive',
  },
};

const STATUS_SORT: Record<GoalStatus, number> = { overdue: 0, at_risk: 1, on_track: 2, complete: 3 };

export const GoalProgressCards = () => {
  const { financialGoals, savingsDeposits, currency, hideValues } = useWealth();

  const formatValue = (v: number) => {
    if (hideValues) return '******';
    return currency === 'USD' ? formatUSD(vndToUsd(v)) : formatVND(v);
  };

  const goalsWithProgress = financialGoals
    .filter(g => g.dueDate) // chỉ hiển thị goals có deadline
    .map(goal => {
      const savedAmount = savingsDeposits
        .filter(s => s.goalId === goal.id)
        .reduce((sum, s) => sum + s.principal, 0);
      const status = getGoalStatus(goal, savedAmount);
      const progressPct = Math.min(100, Math.round((savedAmount / goal.targetAmount) * 100));
      const remaining = Math.max(0, goal.targetAmount - savedAmount);
      const daysLeft = goal.dueDate ? differenceInDays(new Date(goal.dueDate), new Date()) : null;
      return { goal, savedAmount, status, progressPct, remaining, daysLeft };
    })
    .sort((a, b) => STATUS_SORT[a.status] - STATUS_SORT[b.status]);

  if (goalsWithProgress.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Target className="h-10 w-10 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">Chưa có mục tiêu nào có deadline</p>
      </div>
    );
  }

  const summary = {
    complete: goalsWithProgress.filter(g => g.status === 'complete').length,
    on_track: goalsWithProgress.filter(g => g.status === 'on_track').length,
    at_risk: goalsWithProgress.filter(g => g.status === 'at_risk').length,
    overdue: goalsWithProgress.filter(g => g.status === 'overdue').length,
  };

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {summary.overdue > 0 && (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="h-3 w-3" />{summary.overdue} quá hạn
          </span>
        )}
        {summary.at_risk > 0 && (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <AlertTriangle className="h-3 w-3" />{summary.at_risk} cần chú ý
          </span>
        )}
        {summary.on_track > 0 && (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="h-3 w-3" />{summary.on_track} đúng tiến độ
          </span>
        )}
        {summary.complete > 0 && (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 className="h-3 w-3" />{summary.complete} hoàn thành
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {goalsWithProgress.slice(0, 6).map(({ goal, savedAmount, status, progressPct, remaining, daysLeft }) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          return (
            <div key={goal.id} className="rounded-lg border border-border bg-card/50 p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 ${status === 'at_risk' ? 'text-yellow-400' : status === 'overdue' ? 'text-destructive' : status === 'complete' ? 'text-green-400' : 'text-blue-400'}`} />
                  <p className="text-sm font-medium truncate">{goal.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`text-xs ${cfg.badgeClass}`}>{cfg.label}</Badge>
                  {daysLeft !== null && (
                    <span className={`text-xs ${daysLeft < 0 ? 'text-destructive' : daysLeft < 60 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d trễ` : `${daysLeft}d`}
                    </span>
                  )}
                </div>
              </div>
              <Progress value={progressPct} className={`h-1.5 ${cfg.barClass}`} />
              <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                <span>{formatValue(savedAmount)} / {formatValue(goal.targetAmount)}</span>
                {remaining > 0 && <span className="text-destructive">còn thiếu {formatValue(remaining)}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
