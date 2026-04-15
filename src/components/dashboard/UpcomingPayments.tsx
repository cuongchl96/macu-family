import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatVND, formatDateVN, getDaysToMaturity, vndToUsd, formatUSD } from '@/data/wealthData';
import { useWealth } from '@/contexts/WealthContext';
import { cn } from '@/lib/utils';

export const UpcomingPayments = () => {
  const { currency, realEstateProperties, hideValues } = useWealth();

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') {
      return formatUSD(vndToUsd(value));
    }
    return formatVND(value);
  };

  // Get upcoming unpaid payments
  const upcomingPayments = realEstateProperties
    .flatMap((property) =>
      property.payments
        .filter((payment) => !payment.isPaid)
        .map((payment) => ({
          ...payment,
          propertyName: property.name,
          daysUntil: getDaysToMaturity(payment.dueDate),
        }))
    )
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upcoming Payments</h3>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        {upcomingPayments.map((payment, index) => {
          const isUrgent = payment.daysUntil <= 30;
          const isPast = payment.daysUntil < 0;

          return (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className={cn(
                'flex items-center justify-between p-4 rounded-lg border transition-all',
                isPast
                  ? 'bg-destructive/10 border-destructive/30'
                  : isUrgent
                  ? 'bg-warning/10 border-warning/30'
                  : 'bg-muted/50 border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                {isPast ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : isUrgent ? (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium text-sm">{formatDateVN(payment.dueDate)}</p>
                  <p className="text-xs text-muted-foreground">{payment.note || 'Scheduled payment'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-semibold text-sm">
                  {formatValue(payment.amount)}
                </p>
                <p
                  className={cn(
                    'text-xs',
                    isPast ? 'text-destructive' : isUrgent ? 'text-warning' : 'text-muted-foreground'
                  )}
                >
                  {isPast
                    ? `${Math.abs(payment.daysUntil)} days overdue`
                    : `${payment.daysUntil} days`}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
