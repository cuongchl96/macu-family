import { motion } from 'framer-motion';
import { Coins, TrendingUp, TrendingDown, Bitcoin, Sparkles } from 'lucide-react';
import { formatVND, vndToUsd, formatUSD } from '@/data/wealthData';
import { useWealth } from '@/contexts/WealthContext';
import { cn } from '@/lib/utils';

export const InvestmentsModule = () => {
  const { currency, goldHoldings, cryptoHoldings } = useWealth();

  const formatValue = (value: number) => {
    if (currency === 'USD') {
      return formatUSD(vndToUsd(value));
    }
    return formatVND(value);
  };

  // Gold calculations
  const totalGoldTaels = goldHoldings.reduce((sum, h) => sum + h.taels, 0);
  const goldCurrentValue = goldHoldings.reduce((sum, h) => sum + h.taels * h.currentPrice, 0);
  const goldCostBasis = goldHoldings.reduce((sum, h) => sum + h.taels * h.purchasePrice, 0);
  const goldProfit = goldCurrentValue - goldCostBasis;
  const goldROI = goldCostBasis > 0 ? ((goldCurrentValue - goldCostBasis) / goldCostBasis) * 100 : 0;
  const latestGoldPrice = goldHoldings.length > 0 ? goldHoldings[0].currentPrice : 0;

  // Crypto calculations
  const cryptoTotalCost = cryptoHoldings.reduce((sum, c) => sum + c.purchaseCost, 0);
  const cryptoCurrentValue = cryptoHoldings.reduce((sum, c) => sum + (c.amount * c.currentPrice), 0);
  const cryptoProfit = cryptoCurrentValue - cryptoTotalCost;
  const cryptoROI = cryptoTotalCost > 0 ? ((cryptoCurrentValue - cryptoTotalCost) / cryptoTotalCost) * 100 : 0;

  // Total investments
  const totalInvestmentValue = goldCurrentValue + cryptoCurrentValue;
  const totalProfit = goldProfit + cryptoProfit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-wealth-gold/20 to-wealth-crypto/20">
            <TrendingUp className="h-6 w-6 text-wealth-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dynamic Investments</h1>
            <p className="text-muted-foreground">
              Real-time tracking of Gold & Crypto holdings
            </p>
          </div>
        </div>
      </motion.div>

      {/* Total Investment Summary */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl border border-border bg-gradient-to-br from-wealth-gold/5 via-transparent to-wealth-crypto/5 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
              Live Portfolio Value
            </p>
            <p className="text-4xl font-bold font-mono">{formatValue(totalInvestmentValue)}</p>
          </div>
          <div className="flex items-center gap-2">
            {totalProfit >= 0 ? (
              <TrendingUp className="h-6 w-6 text-profit" />
            ) : (
              <TrendingDown className="h-6 w-6 text-loss" />
            )}
            <div>
              <p
                className={cn(
                  'text-2xl font-bold font-mono',
                  totalProfit >= 0 ? 'text-profit' : 'text-loss'
                )}
              >
                {totalProfit >= 0 ? '+' : ''}{formatValue(totalProfit)}
              </p>
              <p className="text-xs text-muted-foreground">Total Profit/Loss</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gold Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-xl border border-wealth-gold/30 bg-card overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-wealth-gold/20 to-transparent border-b border-wealth-gold/20 flex items-center gap-3">
            <Coins className="h-6 w-6 text-wealth-gold" />
            <h3 className="font-semibold text-lg">Gold Holdings</h3>
            <Sparkles className="h-4 w-4 text-wealth-gold ml-auto animate-pulse" />
          </div>

          <div className="p-6 space-y-6">
            {/* Gold Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-wealth-gold/5 border border-wealth-gold/20">
                <p className="text-sm text-muted-foreground mb-1">Holdings</p>
                <p className="text-2xl font-bold font-mono">{totalGoldTaels} taels</p>
              </div>
              <div className="p-4 rounded-lg bg-wealth-gold/5 border border-wealth-gold/20">
                <p className="text-sm text-muted-foreground mb-1">Ref Price</p>
                <p className="text-2xl font-bold font-mono">{formatValue(latestGoldPrice)}/tael</p>
              </div>
            </div>

            {/* Gold Value Card */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-wealth-gold/10 to-wealth-gold/5 border border-wealth-gold/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-3xl font-bold font-mono">{formatValue(goldCurrentValue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Cost Basis</p>
                  <p className="text-lg font-mono text-muted-foreground">{formatValue(goldCostBasis)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-wealth-gold/20">
                <div className="flex items-center gap-2">
                  {goldProfit >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-profit" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-loss" />
                  )}
                  <span
                    className={cn(
                      'text-xl font-bold font-mono',
                      goldProfit >= 0 ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {goldProfit >= 0 ? '+' : ''}{formatValue(goldProfit)}
                  </span>
                </div>
                <div
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-bold',
                    goldROI >= 0
                      ? 'bg-profit/20 text-profit'
                      : 'bg-loss/20 text-loss'
                  )}
                >
                  {goldROI >= 0 ? '+' : ''}{goldROI.toFixed(1)}% ROI
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Crypto Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl border border-wealth-crypto/30 bg-card overflow-hidden"
        >
          <div className="px-6 py-4 bg-gradient-to-r from-wealth-crypto/20 to-transparent border-b border-wealth-crypto/20 flex items-center gap-3">
            <Bitcoin className="h-6 w-6 text-wealth-crypto" />
            <h3 className="font-semibold text-lg">Crypto Assets</h3>
            <div className="ml-auto flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-profit"></span>
              </span>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Crypto Holdings */}
            <div className="space-y-3">
              {cryptoHoldings.map((crypto, index) => (
                <motion.div
                  key={crypto.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="p-4 rounded-lg bg-wealth-crypto/5 border border-wealth-crypto/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{crypto.name}</p>
                      <p className="text-sm text-muted-foreground">Cost: {formatValue(crypto.purchaseCost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">{formatValue(crypto.currentPrice)}</p>
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          crypto.currentPrice >= crypto.purchaseCost ? 'text-profit' : 'text-loss'
                        )}
                      >
                        {crypto.currentPrice >= crypto.purchaseCost ? '+' : ''}
                        {formatValue(crypto.currentPrice - crypto.purchaseCost)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Crypto Total */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-wealth-crypto/10 to-wealth-crypto/5 border border-wealth-crypto/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Crypto Value</p>
                  <p className="text-3xl font-bold font-mono">{formatValue(cryptoCurrentValue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-lg font-mono text-muted-foreground">{formatValue(cryptoTotalCost)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-wealth-crypto/20">
                <div className="flex items-center gap-2">
                  {cryptoProfit >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-profit" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-loss" />
                  )}
                  <span
                    className={cn(
                      'text-xl font-bold font-mono',
                      cryptoProfit >= 0 ? 'text-profit' : 'text-loss'
                    )}
                  >
                    {cryptoProfit >= 0 ? '+' : ''}{formatValue(cryptoProfit)}
                  </span>
                </div>
                <div
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-bold',
                    cryptoROI >= 0
                      ? 'bg-profit/20 text-profit'
                      : 'bg-loss/20 text-loss'
                  )}
                >
                  {cryptoROI >= 0 ? '+' : ''}{cryptoROI.toFixed(1)}% ROI
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
