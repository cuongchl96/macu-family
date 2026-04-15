import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar as CalendarIcon, Bot, Building2, PiggyBank, AlertTriangle, CheckCircle2, Coins, Bitcoin, TrendingUp, Clock, Plus, X } from 'lucide-react';
import { useWealth } from '@/contexts/WealthContext';
import { useGoldPrice } from '@/hooks/useGoldPrice';
import { useLiveCryptoPrices } from '@/hooks/useLiveCryptoPrices';
import { formatVND, formatDateVN, getDaysToMaturity, vndToUsd, formatUSD } from '@/data/wealthData';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type TimelineEvent = {
  id: string;
  type: 'real_estate_payment' | 'savings_maturity';
  title: string;
  subtitle: string;
  date: Date;
  amount: number;
  daysUntil: number;
  isOverdue: boolean;
};

const WATCHED_COINS_KEY = 'highlights_watched_coins';
const DEFAULT_COINS = ['BTC', 'ETH', 'BNB'];
const MAX_COINS = 8;

const MarketPricesWidget = () => {
  const { data: goldPrice, isLoading: isLoadingGold } = useGoldPrice();

  const [watchedCoins, setWatchedCoins] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WATCHED_COINS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_COINS;
    } catch { return DEFAULT_COINS; }
  });
  const [addOpen, setAddOpen] = useState(false);
  const [inputSymbol, setInputSymbol] = useState('');

  useEffect(() => {
    localStorage.setItem(WATCHED_COINS_KEY, JSON.stringify(watchedCoins));
  }, [watchedCoins]);

  const { data: livePrices, isLoading: isLoadingCrypto } = useLiveCryptoPrices(watchedCoins);

  const handleAddCoin = () => {
    const sym = inputSymbol.trim().toUpperCase();
    if (!sym || watchedCoins.includes(sym) || watchedCoins.length >= MAX_COINS) return;
    setWatchedCoins(prev => [...prev, sym]);
    setInputSymbol('');
    setAddOpen(false);
  };

  const handleRemoveCoin = (sym: string) => {
    setWatchedCoins(prev => prev.filter(s => s !== sym));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Card className="h-full border-border/50 shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border/50 pb-4 pt-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-wealth-gold" />
            <CardTitle className="text-base">Thị trường Live</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Gold */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Coins className="h-4 w-4 text-wealth-gold" /> Vàng SJC
            </div>
            {isLoadingGold ? (
              <div className="h-[68px] bg-muted/50 rounded-lg animate-pulse" />
            ) : goldPrice ? (
              <div className="flex justify-between items-end bg-wealth-gold/5 p-3 rounded-lg border border-wealth-gold/10">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Giá Mua</p>
                  <p className="font-mono text-sm font-bold text-profit">{formatVND(goldPrice.buy)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Giá Bán</p>
                  <p className="font-mono text-sm font-bold text-destructive">{formatVND(goldPrice.sell)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Không thể tải dữ liệu vàng</p>
            )}
          </div>

          {/* Crypto */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Bitcoin className="h-4 w-4 text-wealth-crypto" /> Crypto (Binance)
              </div>
              {watchedCoins.length < MAX_COINS && (
                <Popover open={addOpen} onOpenChange={setAddOpen}>
                  <PopoverTrigger asChild>
                    <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
                      <Plus className="h-3 w-3" /> Thêm
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-52 p-3" align="end">
                    <p className="text-sm font-medium mb-2">Thêm coin theo dõi</p>
                    <div className="flex gap-2">
                      <Input
                        value={inputSymbol}
                        onChange={e => setInputSymbol(e.target.value.toUpperCase())}
                        placeholder="VD: SOL"
                        className="h-8 text-sm uppercase"
                        maxLength={10}
                        onKeyDown={e => e.key === 'Enter' && handleAddCoin()}
                        autoFocus
                      />
                      <Button size="sm" className="h-8 px-3" onClick={handleAddCoin}>OK</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">Tối đa {MAX_COINS} coin. Dùng symbol Binance (BTC, ETH, SOL...)</p>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {isLoadingCrypto ? (
              <div className="h-[52px] bg-muted/50 rounded-lg animate-pulse" />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {watchedCoins.map(symbol => {
                  const price = livePrices?.[symbol];
                  return (
                    <div key={symbol} className="bg-wealth-crypto/5 p-2 rounded-lg border border-wealth-crypto/10 relative group">
                      <button
                        onClick={() => handleRemoveCoin(symbol)}
                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        aria-label={`Xóa ${symbol}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-[10px] text-muted-foreground font-bold">{symbol}</p>
                      <p className="font-mono font-bold text-sm">{price ? formatUSD(price) : '—'}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end pt-2 border-t border-border/50">
            <Clock className="h-3 w-3" /> Cập nhật tự động
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const HighlightsModule = () => {
  const { 
    currency, 
    realEstateProperties, 
    savingsDeposits, 
    cryptoHoldings, 
    goldHoldings,
    capitalContributions,
    hideValues
  } = useWealth();
  
  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') return formatUSD(vndToUsd(value));
    return formatVND(value);
  };

  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

  // 1. Get Real Estate Payments
  const realEstateEvents: TimelineEvent[] = realEstateProperties.flatMap(property =>
    property.payments
      .filter(payment => !payment.isPaid)
      .filter(payment => {
        const d = new Date(payment.dueDate);
        // Includes overdue ones from past + anything in current month
        return d.getTime() <= currentMonthEnd.getTime();
      })
      .map(payment => {
        const daysUntil = getDaysToMaturity(payment.dueDate);
        return {
          id: `re-${payment.id}`,
          type: 'real_estate_payment',
          title: `Trả góp: ${property.name}`,
          subtitle: payment.note || 'Thanh toán định kỳ',
          date: new Date(payment.dueDate),
          amount: payment.amount,
          daysUntil,
          isOverdue: daysUntil < 0
        };
      })
  );

  // 2. Get Savings Maturities
  const savingsEvents: TimelineEvent[] = savingsDeposits
    .filter(deposit => {
      const d = new Date(deposit.maturityDate);
      return d.getTime() <= currentMonthEnd.getTime();
    })
    .map(deposit => {
      const daysUntil = getDaysToMaturity(deposit.maturityDate);
      return {
        id: `sv-${deposit.id}`,
        type: 'savings_maturity',
        title: `Đáo hạn: ${deposit.name || deposit.bankName}`,
        subtitle: deposit.name ? `${deposit.bankName} - Lãi suất: ${deposit.interestRate}%` : `Lãi suất: ${deposit.interestRate}%`,
        date: new Date(deposit.maturityDate),
        amount: deposit.principal,
        daysUntil,
        isOverdue: daysUntil < 0
      };
    });

  // Combine & Sort by Date Ascending
  const allEvents = [...realEstateEvents, ...savingsEvents].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Highlights</h1>
            <p className="text-muted-foreground">
              Tổng hợp sự kiện quan trọng và nhận định thị trường
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lịch Sự kiện Tháng */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="h-full border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Sự kiện tài chính tháng {currentDate.getMonth() + 1}</CardTitle>
                </div>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                  {allEvents.length} sự kiện
                </span>
              </div>
              <CardDescription>
                Danh sách những khoản cần thanh toán hoặc sổ tiết kiệm đáo hạn tính đến hết tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()} (Gồm cả các khoản đang quá hạn).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {allEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-primary/40" />
                  </div>
                  <p className="font-medium text-foreground">Bạn không có Sự kiện tài chính nào trong tháng này!</p>
                  <p className="text-sm">Quản lý dòng tiền rất xuất sắc.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {allEvents.map((event, index) => {
                    const isRealEstate = event.type === 'real_estate_payment';
                    const isUrgent = event.daysUntil <= 7 && !event.isOverdue;

                    return (
                      <div key={event.id} className={cn(
                        "p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors hover:bg-muted/30",
                        event.isOverdue ? "bg-destructive/5" : isUrgent ? "bg-warning/5" : ""
                      )}>
                        {/* Icon Column */}
                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full border bg-background shrink-0">
                          {isRealEstate ? (
                            <Building2 className={cn("h-5 w-5", event.isOverdue ? "text-destructive" : isUrgent ? "text-warning" : "text-wealth-property")} />
                          ) : (
                            <PiggyBank className={cn("h-5 w-5", event.isOverdue ? "text-wealth-savings" : "text-wealth-savings")} />
                          )}
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-base truncate">{event.title}</h4>
                            {event.isOverdue && (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="h-3 w-3" /> Quá hạn
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{event.subtitle}</p>
                        </div>

                        {/* Amounts & Date Column */}
                        <div className="flex flex-row sm:flex-col justify-between sm:items-end flex-shrink-0 mt-2 sm:mt-0 gap-1 sm:gap-0">
                          <p className={cn(
                            "font-mono font-bold text-lg",
                            isRealEstate ? "text-foreground" : "text-wealth-savings"
                          )}>
                            {isRealEstate ? "-" : "+"}{formatValue(event.amount)}
                          </p>
                          <p className={cn(
                            "text-sm font-medium",
                            event.isOverdue ? "text-destructive" : isUrgent ? "text-warning" : "text-muted-foreground"
                          )}>
                            {event.isOverdue
                              ? `Trễ ${Math.abs(event.daysUntil)} ngày`
                              : event.daysUntil === 0 ? "Hôm nay!" : `Còn ${event.daysUntil} ngày`
                            }
                            <span className="text-muted-foreground font-normal ml-2">({formatDateVN(event.date)})</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          <MarketPricesWidget />

          {/* AI News Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-sm relative overflow-hidden">
              {/* Decorative background flair */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-wealth-crypto/10 rounded-full blur-2xl pointer-events-none" />

              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Bot className="h-6 w-6" />
                  <CardTitle className="text-lg">AI Market Insights</CardTitle>
                </div>
                <CardDescription>
                  Trợ lý phân tích thị trường cá nhân hóa.
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {/* Placeholder Skeleton UI */}
                  {[1, 2].map((item) => (
                    <div key={item} className="p-3 rounded-lg bg-background/50 border border-primary/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/40 animate-pulse" />
                        <div className="h-3 bg-muted/50 rounded w-1/3 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-muted/30 rounded w-full" />
                        <div className="h-2 bg-muted/30 rounded w-4/5" />
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 flex flex-col items-center justify-center gap-2">
                    <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary uppercase tracking-wider">
                      Sắp ra mắt
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
