import { motion } from 'framer-motion';
import { Hourglass, AlertTriangle, PiggyBank, Sparkles } from 'lucide-react';
import { formatVND, formatDateVN, getDaysToMaturity, vndToUsd, formatUSD } from '@/data/wealthData';
import { useWealth } from '@/contexts/WealthContext';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export const UpcomingSavings = () => {
  const { currency, savingsDeposits, hideValues } = useWealth();

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') {
      return formatUSD(vndToUsd(value));
    }
    return formatVND(value);
  };

  // Get maturing savings
  const upcomingSavings = savingsDeposits
    .map((deposit) => {
      const daysUntil = getDaysToMaturity(deposit.maturityDate);
      const totalDays = Math.ceil(
        (new Date(deposit.maturityDate).getTime() - new Date(deposit.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const progressPercent = Math.min(100, Math.max(0, ((totalDays - daysUntil) / totalDays) * 100));
      
      return {
        ...deposit,
        daysUntil,
        progressPercent,
      };
    })
    .filter(d => d.daysUntil <= 60) // Show only deposits maturing in 60 days or already matured
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
           <Hourglass className="h-4 w-4 text-wealth-savings" />
           Sổ tiết kiệm đến hạn
        </h3>
        <PiggyBank className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {upcomingSavings.length === 0 ? (
           <div className="text-center py-6 text-muted-foreground bg-muted/20 border border-dashed rounded-lg">
             <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
             <p className="text-sm">Không có sổ tiết kiệm nào sắp đáo hạn.</p>
           </div>
        ) : (
          upcomingSavings.map((deposit, index) => {
            const isUrgent = deposit.daysUntil <= 15 && deposit.daysUntil > 0;
            const isPast = deposit.daysUntil <= 0;

            return (
              <motion.div
                key={deposit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className={cn(
                  'flex flex-col gap-2 p-4 rounded-lg border transition-all',
                  isPast
                    ? 'bg-destructive/10 border-destructive/30'
                    : isUrgent
                    ? 'bg-warning/10 border-warning/30'
                    : 'bg-muted/50 border-transparent hover:border-wealth-savings/30'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isPast ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : isUrgent ? (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-wealth-savings flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-wealth-savings" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{deposit.name ? deposit.name : deposit.bankName}</p>
                      <p className="text-xs text-muted-foreground">{deposit.name ? `${deposit.bankName} - ` : ''}Lãi suất: {deposit.interestRate}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-sm">
                      {formatValue(deposit.principal)}
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-0.5',
                        isPast ? 'text-destructive font-semibold' : isUrgent ? 'text-warning font-semibold' : 'text-muted-foreground'
                      )}
                    >
                      {isPast
                        ? 'Đã đáo hạn'
                        : `Còn ${deposit.daysUntil} ngày`}
                    </p>
                  </div>
                </div>

                {/* Progress bar for non-mature deposits */}
                {!isPast && (
                  <div className="w-full pl-8 mt-1">
                    <Progress value={deposit.progressPercent} className={cn("h-1.5", isUrgent ? "bg-warning/20" : "")} indicatorClassName={isUrgent ? "bg-warning" : "bg-wealth-savings"} />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>{formatDateVN(deposit.startDate)}</span>
                      <span>{formatDateVN(deposit.maturityDate)}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
