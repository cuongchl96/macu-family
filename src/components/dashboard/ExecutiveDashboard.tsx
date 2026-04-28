import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PiggyBank, Building2, Coins, Bitcoin, CreditCard, Target } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { StatCard } from './StatCard';
import { WealthPieChart } from './WealthPieChart';
import { UpcomingPayments } from './UpcomingPayments';
import { UpcomingSavings } from './UpcomingSavings';
import { GoalProgressCards } from './GoalProgressCards';
import { NetWorthHistoryChart } from './NetWorthHistoryChart';
import { GoalsBarChart } from './GoalsBarChart';
import { useWealth } from '@/contexts/WealthContext';
import { formatVND, formatUSD, vndToUsd } from '@/data/wealthData';

export const ExecutiveDashboard = () => {
  const {
    currency, hideValues,
    getTotalRealEstateValue, getTotalSavings, getTotalCryptoValue, getTotalGoldValue,
    getTotalLiabilities, recordSnapshot,
    netWorthSnapshots,
  } = useWealth();

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    return currency === 'USD' ? formatUSD(vndToUsd(value)) : formatVND(value);
  };

  const realEstateTotal = getTotalRealEstateValue();
  const savingsTotal = getTotalSavings();
  const goldTotal = getTotalGoldValue();
  const cryptoTotal = getTotalCryptoValue();
  const totalLiabilities = getTotalLiabilities();
  const totalAssets = savingsTotal + goldTotal + cryptoTotal + realEstateTotal;
  const totalNetWorth = totalAssets - totalLiabilities;

  // Record monthly snapshot once per session if data has changed
  useEffect(() => {
    if (totalAssets === 0) return;
    const today = new Date().toISOString().slice(0, 7); // YYYY-MM
    const alreadyRecorded = netWorthSnapshots.some(s => s.snapshotDate === today);
    if (!alreadyRecorded) {
      recordSnapshot({
        totalAssets,
        totalLiabilities,
        netWorth: totalNetWorth,
        savingsTotal,
        goldTotal,
        cryptoTotal,
        realEstateTotal,
        loansTotal: totalLiabilities,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assetChartData = [
    { name: 'Tiết kiệm', value: savingsTotal, color: 'hsl(160, 84%, 45%)' },
    { name: 'Vàng', value: goldTotal, color: 'hsl(45, 93%, 55%)' },
    { name: 'Tiền số', value: cryptoTotal, color: 'hsl(271, 81%, 65%)' },
    { name: 'Bất động sản', value: realEstateTotal, color: 'hsl(199, 89%, 55%)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan tài chính</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Toàn bộ bức tranh tài chính của gia đình</p>
      </motion.div>

      {/* ROW 1: Net Worth Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48Y2lyY2xlIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgY3g9IjMwIiBjeT0iMzAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 opacity-80" />
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">Net Worth</span>
          </div>
          <p className="text-4xl md:text-5xl font-bold font-mono tracking-tight">
            {formatValue(totalNetWorth)}
          </p>
          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-xs opacity-70 mb-0.5">Tổng tài sản</p>
              <p className="text-lg font-semibold font-mono">{formatValue(totalAssets)}</p>
            </div>
            {totalLiabilities > 0 && (
              <>
                <Separator orientation="vertical" className="h-10 bg-white/20" />
                <div>
                  <p className="text-xs opacity-70 mb-0.5">Tổng dư nợ</p>
                  <p className="text-lg font-semibold font-mono text-red-200">− {formatValue(totalLiabilities)}</p>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <TrendingUp className="h-48 w-48" />
        </div>
      </motion.div>

      {/* ROW 2: Asset stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Tiết kiệm" value={formatValue(savingsTotal)} icon={PiggyBank} variant="savings" delay={0.1} />
        <StatCard title="Vàng" value={formatValue(goldTotal)} icon={Coins} variant="gold" delay={0.15} />
        <StatCard title="Tiền số" value={formatValue(cryptoTotal)} icon={Bitcoin} variant="crypto" delay={0.2} />
        <StatCard title="Bất động sản" value={formatValue(realEstateTotal)} icon={Building2} variant="property" delay={0.25} />
      </div>

      {totalLiabilities > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3"
        >
          <CreditCard className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Tổng dư nợ hiện tại</p>
            <p className="text-xs text-muted-foreground">Đã trừ khỏi Net Worth ở trên</p>
          </div>
          <p className="text-base font-bold font-mono text-destructive shrink-0">{formatValue(totalLiabilities)}</p>
        </motion.div>
      )}

      {/* ROW 3: Goals + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Tiến độ mục tiêu</h2>
          </div>
          <GoalProgressCards />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <UpcomingPayments />
          <UpcomingSavings />
        </motion.div>
      </div>

      {/* ROW 4: Goals Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
      >
        <GoalsBarChart />
      </motion.div>

      {/* ROW 5: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h2 className="font-semibold text-sm mb-4">Phân bổ tài sản</h2>
          <WealthPieChart data={assetChartData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h2 className="font-semibold text-sm mb-4">Lịch sử Net Worth</h2>
          <NetWorthHistoryChart />
        </motion.div>
      </div>
    </div>
  );
};
