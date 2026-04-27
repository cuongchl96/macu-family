import { motion } from 'framer-motion';
import { Wallet, Building2, Coins, TrendingUp, DollarSign, PiggyBank } from 'lucide-react';
import { StatCard } from './StatCard';
import { WealthPieChart } from './WealthPieChart';
import { GoalsBarChart } from './GoalsBarChart';
import { UpcomingPayments } from './UpcomingPayments';
import { UpcomingSavings } from './UpcomingSavings';
import { useWealth } from '@/contexts/WealthContext';
import {
  formatVND,
  formatUSD,
  vndToUsd,
} from '@/data/wealthData';

export const ExecutiveDashboard = () => {
  const { currency, getTotalRealEstateValue, getTotalSavings, getTotalCryptoValue, getTotalGoldValue, hideValues } = useWealth();

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') {
      return formatUSD(vndToUsd(value));
    }
    return formatVND(value);
  };

  const fixedAssets = getTotalRealEstateValue();
  const savingsTotal = getTotalSavings();
  const goldTotal = getTotalGoldValue();
  const cryptoTotal = getTotalCryptoValue();
  const totalNetWorth = savingsTotal + goldTotal + cryptoTotal + fixedAssets;
  const liquidAssets = savingsTotal + goldTotal + cryptoTotal;

  const chartData = [
    { name: 'Savings', value: savingsTotal, color: 'hsl(160, 84%, 45%)' },
    { name: 'Gold', value: goldTotal, color: 'hsl(45, 93%, 55%)' },
    { name: 'Crypto', value: cryptoTotal, color: 'hsl(271, 81%, 65%)' },
    { name: 'Real Estate', value: fixedAssets, color: 'hsl(199, 89%, 55%)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Family Wealth Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete overview of your family's financial portfolio
        </p>
      </motion.div>

      {/* Hero Stat - Total Net Worth */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48Y2lyY2xlIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium uppercase tracking-wider opacity-80">
              Total Net Worth
            </span>
          </div>
          <p className="text-4xl md:text-5xl lg:text-6xl font-bold font-mono tracking-tight">
            {formatValue(totalNetWorth)}
          </p>
          <div className="flex gap-8 mt-6">
            <div>
              <p className="text-sm opacity-80 mb-1">Liquid Assets</p>
              <p className="text-xl font-semibold font-mono">{formatValue(liquidAssets)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80 mb-1">Fixed Assets</p>
              <p className="text-xl font-semibold font-mono">{formatValue(fixedAssets)}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <TrendingUp className="h-64 w-64" />
        </div>
      </motion.div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Savings & Deposits"
          value={formatValue(savingsTotal)}
          icon={PiggyBank}
          variant="savings"
          delay={0.2}
        />
        <StatCard
          title="Gold Holdings"
          value={formatValue(goldTotal)}
          subtitle="2.3 taels"
          icon={Coins}
          variant="gold"
          delay={0.3}
        />
        <StatCard
          title="Crypto Assets"
          value={formatValue(cryptoTotal)}
          icon={TrendingUp}
          trend={{ value: 10.4, isPositive: true }}
          variant="crypto"
          delay={0.4}
        />
        <StatCard
          title="Real Estate"
          value={formatValue(fixedAssets)}
          icon={Building2}
          variant="property"
          delay={0.5}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        <WealthPieChart data={chartData} />
        <GoalsBarChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingPayments />
          <UpcomingSavings />
        </div>
      </div>
    </div>
  );
};
