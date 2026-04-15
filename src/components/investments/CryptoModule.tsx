import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Plus, Pencil, Trash2, Wallet, Coins, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { formatVND, formatDateVN, vndToUsd, formatUSD, exchangeRate } from '@/data/wealthData';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveCryptoPrices } from '@/hooks/useLiveCryptoPrices';
import { useWealth } from '@/contexts/WealthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CryptoDepositFormDialog, depositFormToRecord } from './CryptoDepositFormDialog';
import type { CryptoDepositFormValues } from './CryptoDepositFormDialog';
import { CryptoHoldingFormDialog, holdingFormToRecord } from './CryptoHoldingFormDialog';
import type { CryptoHoldingFormValues } from './CryptoHoldingFormDialog';
import type { CryptoDeposit, CryptoHolding } from '@/types/wealth';

export const CryptoModule = () => {
  const {
    currency,
    cryptoDeposits,
    addCryptoDeposit,
    updateCryptoDeposit,
    deleteCryptoDeposit,
    getTotalCryptoDeposits,
    cryptoHoldings,
    addCryptoHolding,
    updateCryptoHolding,
    deleteCryptoHolding,
    hideValues,
  } = useWealth();

  const USD_TO_VND = exchangeRate.rate;

  const symbols = useMemo(
    () => [...new Set(cryptoHoldings.map(h => h.symbol))],
    [cryptoHoldings]
  );
  const { data: livePrices, isLoading: isLoadingLive } = useLiveCryptoPrices(symbols);

  const [depositFormOpen, setDepositFormOpen] = useState(false);
  const [editDeposit, setEditDeposit] = useState<CryptoDeposit | null>(null);
  const [depositDeleteId, setDepositDeleteId] = useState<string | null>(null);

  const [holdingFormOpen, setHoldingFormOpen] = useState(false);
  const [editHolding, setEditHolding] = useState<CryptoHolding | null>(null);
  const [holdingDeleteId, setHoldingDeleteId] = useState<string | null>(null);
  const [holdingSortOption, setHoldingSortOption] = useState<'value_desc' | 'amount_desc' | 'name_asc'>('value_desc');

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') return formatUSD(vndToUsd(value));
    return formatVND(value);
  };

  const totalDeposits = getTotalCryptoDeposits();

  const resolveCurrentValueVND = (h: CryptoHolding): number => {
    const liveUSD = livePrices?.[h.symbol];
    return liveUSD !== undefined ? liveUSD * USD_TO_VND * h.amount : h.amount * h.currentPrice;
  };

  const totalHoldingValue = cryptoHoldings.reduce((sum, h) => sum + resolveCurrentValueVND(h), 0);
  const totalPnL = totalHoldingValue - totalDeposits;

  const handleDepositSubmit = (values: CryptoDepositFormValues) => {
    if (editDeposit) {
      const record = depositFormToRecord(values, editDeposit.id);
      updateCryptoDeposit(editDeposit.id, record);
      setEditDeposit(null);
    } else {
      addCryptoDeposit({
        amount: values.amount,
        date: new Date(values.date),
        note: values.note || undefined,
        currency: values.currency,
      });
    }
  };

  const handleHoldingSubmit = (values: CryptoHoldingFormValues) => {
    const record = holdingFormToRecord(values, editHolding?.id);
    if (editHolding && 'id' in record) {
      updateCryptoHolding(editHolding.id, record);
      setEditHolding(null);
    } else {
      addCryptoHolding(record as Omit<CryptoHolding, 'id'>);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-wealth-crypto/20">
            <Bitcoin className="h-6 w-6 text-wealth-crypto" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crypto</h1>
            <p className="text-muted-foreground">
              Nạp tiền vào sàn & theo dõi từng loại coin (sẽ gắn API Binance để tính giá trị hiện tại)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Section 1: Nạp tiền vào sàn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl border border-wealth-crypto/30 bg-card overflow-hidden"
      >
        <div className="px-6 py-4 bg-gradient-to-r from-wealth-crypto/20 to-transparent border-b border-wealth-crypto/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-wealth-crypto" />
            <h2 className="font-semibold text-lg">Nạp tiền vào sàn</h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Tổng đã nạp:</p>
            <p className="text-xl font-bold font-mono text-wealth-crypto">{formatValue(totalDeposits)}</p>
            <Button size="sm" onClick={() => { setEditDeposit(null); setDepositFormOpen(true); }} className="gap-1">
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Tiền tệ</TableHead>
                <TableHead className="w-[100px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cryptoDeposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Chưa có lần nạp. Bấm &quot;Thêm&quot; để thêm.
                  </TableCell>
                </TableRow>
              ) : (
                [...cryptoDeposits]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{formatDateVN(d.date)}</TableCell>
                      <TableCell className="text-right font-mono">{formatValue(d.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">{d.note ?? '—'}</TableCell>
                      <TableCell>{d.currency}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditDeposit(d); setDepositFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDepositDeleteId(d.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Section 2: Holdings (từng loại coin) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-xl border border-wealth-crypto/30 bg-card overflow-hidden"
      >
        <div className="px-6 py-4 bg-gradient-to-r from-wealth-crypto/20 to-transparent border-b border-wealth-crypto/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="h-6 w-6 text-wealth-crypto" />
            <h2 className="font-semibold text-lg">Từng loại tiền (holdings)</h2>
            {isLoadingLive && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Đang tải giá...
              </span>
            )}
            {!isLoadingLive && livePrices && Object.keys(livePrices).length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Select value={holdingSortOption} onValueChange={(v: any) => setHoldingSortOption(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value_desc">Giá trị cao nhất</SelectItem>
                <SelectItem value="amount_desc">Số lượng lớn nhất</SelectItem>
                <SelectItem value="name_asc">Tên (A-Z)</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => { setEditHolding(null); setHoldingFormOpen(true); }} className="gap-1">
              <Plus className="h-4 w-4" />
              Thêm coin
            </Button>
          </div>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Current value</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cryptoHoldings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No holdings yet. Click &quot;Add coin&quot; to add. (Binance API can be added later to update prices.)
                  </TableCell>
                </TableRow>
              ) : (
                [...cryptoHoldings].sort((a, b) => {
                  if (holdingSortOption === 'value_desc') return resolveCurrentValueVND(b) - resolveCurrentValueVND(a);
                  if (holdingSortOption === 'amount_desc') return b.amount - a.amount;
                  if (holdingSortOption === 'name_asc') return a.name.localeCompare(b.name);
                  return 0;
                }).map((h) => {
                  const liveUSD = livePrices?.[h.symbol];
                  const isLive = liveUSD !== undefined;
                  const currentVal = resolveCurrentValueVND(h);
                  return (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.name}</TableCell>
                      <TableCell className="font-mono">{h.symbol}</TableCell>
                      <TableCell className="text-right font-mono">{h.amount}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {isLoadingLive && !livePrices ? (
                          <Skeleton className="h-4 w-24 ml-auto" />
                        ) : (
                          <span className="flex items-center justify-end gap-1.5">
                            {formatValue(currentVal)}
                            {isLive && (
                              <span className="text-[10px] px-1 border rounded border-green-500/50 text-green-600 bg-green-500/10">
                                LIVE
                              </span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditHolding(h); setHoldingFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setHoldingDeleteId(h.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {cryptoHoldings.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-wealth-crypto/5 border border-wealth-crypto/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total capital (deposits)</p>
                <p className="text-xl font-mono font-semibold">{formatValue(totalDeposits)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total current value</p>
                <p className="text-xl font-mono font-semibold">{formatValue(totalHoldingValue)}</p>
              </div>
              <div className="flex items-center gap-2">
                {totalPnL >= 0 ? <TrendingUp className="h-5 w-5 text-profit" /> : <TrendingDown className="h-5 w-5 text-loss" />}
                <div>
                  <p className="text-sm text-muted-foreground">P/L (value − capital)</p>
                  <p className={cn('text-xl font-mono font-bold', totalPnL >= 0 ? 'text-profit' : 'text-loss')}>
                    {totalPnL >= 0 ? '+' : ''}{formatValue(totalPnL)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <CryptoDepositFormDialog
        open={depositFormOpen}
        onOpenChange={(o) => { setDepositFormOpen(o); if (!o) setEditDeposit(null); }}
        onSubmit={handleDepositSubmit}
        editDeposit={editDeposit}
      />
      <CryptoHoldingFormDialog
        open={holdingFormOpen}
        onOpenChange={(o) => { setHoldingFormOpen(o); if (!o) setEditHolding(null); }}
        onSubmit={handleHoldingSubmit}
        editHolding={editHolding}
      />

      <AlertDialog open={!!depositDeleteId} onOpenChange={(o) => !o && setDepositDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa lần nạp?</AlertDialogTitle>
            <AlertDialogDescription>Hành động không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => depositDeleteId && (deleteCryptoDeposit(depositDeleteId), setDepositDeleteId(null))}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!holdingDeleteId} onOpenChange={(o) => !o && setHoldingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa holding?</AlertDialogTitle>
            <AlertDialogDescription>Hành động không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => holdingDeleteId && (deleteCryptoHolding(holdingDeleteId), setHoldingDeleteId(null))}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
