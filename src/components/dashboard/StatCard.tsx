import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'gold' | 'crypto' | 'property' | 'savings';
  delay?: number;
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20',
  gold: 'bg-gradient-to-br from-wealth-gold/10 to-wealth-gold/5 border-wealth-gold/20',
  crypto: 'bg-gradient-to-br from-wealth-crypto/10 to-wealth-crypto/5 border-wealth-crypto/20',
  property: 'bg-gradient-to-br from-wealth-property/10 to-wealth-property/5 border-wealth-property/20',
  savings: 'bg-gradient-to-br from-wealth-savings/10 to-wealth-savings/5 border-wealth-savings/20',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/20 text-primary',
  gold: 'bg-wealth-gold/20 text-wealth-gold',
  crypto: 'bg-wealth-crypto/20 text-wealth-crypto',
  property: 'bg-wealth-property/20 text-wealth-property',
  savings: 'bg-wealth-savings/20 text-wealth-savings',
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  delay = 0,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'rounded-xl border p-6 transition-all duration-300 hover:shadow-lg',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-bold font-mono tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 pt-1">
              <span
                className={cn(
                  'text-sm font-semibold',
                  trend.isPositive ? 'text-profit' : 'text-loss'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};
