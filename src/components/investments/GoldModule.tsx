import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, TrendingUp, TrendingDown, Sparkles, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { formatVND, vndToUsd, formatUSD } from '@/data/wealthData';
import { useWealth } from '@/contexts/WealthContext';
import { useGoldPrice, SjcGoldPrice } from '@/hooks/useGoldPrice';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { useToast } from '@/hooks/use-toast';
import type { GoldHolding } from '@/types/wealth';

export const GoldModule = () => {
  const { currency, goldHoldings, addGoldHolding, updateGoldHolding, deleteGoldHolding, hideValues } = useWealth();
  const { data: goldPriceData, isLoading: isLoadingPrice, isError: isErrorPrice } = useGoldPrice();
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'date_desc' | 'taels_desc' | 'profit_desc'>('date_desc');
  
  // Form State
  const [formTaels, setFormTaels] = useState<number | undefined>(undefined);
  const [formPurchasePrice, setFormPurchasePrice] = useState<number | undefined>(undefined);
  const [formPurchaseDate, setFormPurchaseDate] = useState(new Date().toISOString().split('T')[0]);


  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') return formatUSD(vndToUsd(value));
    return formatVND(value);
  };

  const handleOpenAddModal = () => {
    setFormTaels(undefined);
    setFormPurchasePrice(undefined);
    setFormPurchaseDate(new Date().toISOString().split('T')[0]);
    setIsAddModalOpen(true);
    setEditingId(null);
  };

  const handleOpenEditModal = (holding: GoldHolding) => {
    setFormTaels(holding.taels);
    setFormPurchasePrice(holding.purchasePrice);
    setFormPurchaseDate(new Date(holding.purchaseDate).toISOString().split('T')[0]);
    setEditingId(holding.id);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taels = formTaels;
    const purchasePrice = formPurchasePrice;

    if (taels === undefined || purchasePrice === undefined || !formPurchaseDate) {
      toast({ title: 'Invalid input', description: 'Please check your inputs.', variant: 'destructive' });
      return;
    }

    if (editingId) {
      updateGoldHolding(editingId, {
        taels,
        purchasePrice,
        purchaseDate: new Date(formPurchaseDate),
      });
      toast({ title: 'Success', description: 'Gold holding updated!' });
    } else {
      addGoldHolding({
        taels,
        purchasePrice,
        currentPrice: goldPriceData?.buy || 0, // Will be overridden on render by real deal
        purchaseDate: new Date(formPurchaseDate),
      });
      toast({ title: 'Success', description: 'Gold holding added!' });
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteGoldHolding(id);
    toast({ title: 'Deleted', description: 'Gold holding removed.' });
  };

  const calculateHoldingCurrentPrice = (holding: GoldHolding) => {
    if (goldPriceData) return goldPriceData.buy;
    return holding.currentPrice;
  };

  const sortedHoldings = [...goldHoldings].sort((a, b) => {
    if (sortOption === 'date_desc') return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
    if (sortOption === 'taels_desc') return b.taels - a.taels;
    if (sortOption === 'profit_desc') {
      const profitA = (a.taels * calculateHoldingCurrentPrice(a)) - (a.taels * a.purchasePrice);
      const profitB = (b.taels * calculateHoldingCurrentPrice(b)) - (b.taels * b.purchasePrice);
      return profitB - profitA;
    }
    return 0;
  });
  
  const totalGoldValue = goldHoldings.reduce((sum, h) => sum + h.taels * calculateHoldingCurrentPrice(h), 0);
  const totalCostBasis = goldHoldings.reduce((sum, h) => sum + h.taels * h.purchasePrice, 0);
  const totalProfit = totalGoldValue - totalCostBasis;
  const totalROI = totalCostBasis > 0 ? (totalProfit / totalCostBasis) * 100 : 0;


  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-wealth-gold/20">
            <Coins className="h-6 w-6 text-wealth-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vàng</h1>
            <p className="text-muted-foreground">Theo dõi tài sản vàng SJC</p>
          </div>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddModal} className="bg-wealth-gold text-primary hover:bg-wealth-gold/90 font-semibold gap-2">
              <Plus className="h-4 w-4" /> Thêm khoản đầu tư
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Sửa thông tin Vàng' : 'Thêm khoản đầu tư Vàng'}</DialogTitle>
              <DialogDescription>Nhập số lượng lượng vàng và giá mua vào.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="taels">Số lượng (Lượng)</Label>
                <FormattedNumberInput id="taels" allowDecimal={true} value={formTaels} onChange={setFormTaels} required placeholder="VD: 5.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Giá mua (VNĐ/Lượng)</Label>
                <FormattedNumberInput id="purchasePrice" allowDecimal={false} value={formPurchasePrice} onChange={setFormPurchasePrice} required placeholder="VD: 82,000,000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Ngày mua</Label>
                <Input id="purchaseDate" type="date" value={formPurchaseDate} onChange={(e) => setFormPurchaseDate(e.target.value)} required />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-wealth-gold text-primary hover:bg-wealth-gold/90">Lưu</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Real-time price widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-wealth-gold/30 bg-card overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-wealth-gold/20 to-transparent border-b border-wealth-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-wealth-gold" />
              <h3 className="font-semibold text-lg">Thị trường Vàng SJC</h3>
            </div>
            {isLoadingPrice && <div className="text-sm text-muted-foreground animate-pulse">Đang cập nhật realtime...</div>}
            {isErrorPrice && <div className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4"/> Lỗi API</div>}
            {goldPriceData && !isLoadingPrice && !isErrorPrice && <div className="text-sm text-muted-foreground flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Live</div>}
          </div>
          <CardContent className="p-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-wealth-gold/5 border border-wealth-gold/20">
                  <p className="text-sm text-muted-foreground mb-1">Giá Mua (SJC)</p>
                  <p className="text-2xl font-bold font-mono text-profit">{goldPriceData ? formatVND(goldPriceData.buy) : "---"}</p>
                </div>
                <div className="p-4 rounded-lg bg-wealth-gold/5 border border-wealth-gold/20">
                  <p className="text-sm text-muted-foreground mb-1">Giá Bán (SJC)</p>
                  <p className="text-2xl font-bold font-mono text-destructive">{goldPriceData ? formatVND(goldPriceData.sell) : "---"}</p>
                </div>
                <div className="p-4 rounded-lg bg-wealth-gold/5 border border-wealth-gold/20 md:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Tổng Lượng Đang Giữ</p>
                  <p className="text-2xl font-bold font-mono">{goldHoldings.reduce((acc, h) => acc + h.taels, 0)} Lượng</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </motion.div>

       {/* Portfolio Summary */}
      {goldHoldings.length > 0 && (
         <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.2 }}
         >
          <div className="p-6 rounded-xl bg-gradient-to-br from-wealth-gold/10 to-wealth-gold/5 border border-wealth-gold/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Tổng Giá Trị Hiện Tại</p>
                <p className="text-3xl font-bold font-mono">{formatValue(totalGoldValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tổng Vốn Gốc</p>
                <p className="text-lg font-mono text-muted-foreground">{formatValue(totalCostBasis)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-wealth-gold/20">
              <div className="flex items-center gap-2">
                {totalProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-profit" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-loss" />
                )}
                <span className={cn('text-xl font-bold font-mono', totalProfit >= 0 ? 'text-profit' : 'text-loss')}>
                  {totalProfit >= 0 ? '+' : ''}{formatValue(totalProfit)}
                </span>
              </div>
              <div
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-bold',
                  totalROI >= 0 ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'
                )}
              >
                {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}% ROI
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Holdings List */}
      <AnimatePresence>
        {goldHoldings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 mb-4 gap-4">
              <h3 className="text-xl font-semibold">Chi tiết các khoản</h3>
              <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Mới nhất</SelectItem>
                  <SelectItem value="taels_desc">Số lượng lớn nhất</SelectItem>
                  <SelectItem value="profit_desc">Lợi nhuận cao nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sortedHoldings.map((holding) => {
              const currentPrice = calculateHoldingCurrentPrice(holding);
              const holdingCurrentValue = holding.taels * currentPrice;
              const holdingCostBasis = holding.taels * holding.purchasePrice;
              const holdingProfit = holdingCurrentValue - holdingCostBasis;
              const holdingROI = holdingCostBasis > 0 ? (holdingProfit / holdingCostBasis) * 100 : 0;

              return (
                <motion.div
                  key={holding.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden border-border/50 hover:border-wealth-gold/50 transition-colors">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                        
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="p-3 bg-secondary rounded-full">
                            <Coins className="h-6 w-6 text-wealth-gold" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{holding.taels} Lượng SJC</h4>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                               <span>Ngày mua: {new Date(holding.purchaseDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 w-full md:w-auto text-sm text-right">
                           <div>
                              <p className="text-muted-foreground">Giá mua</p>
                              <p className="font-mono font-medium">{formatValue(holding.purchasePrice)}</p>
                           </div>
                           <div>
                              <p className="text-muted-foreground">Giá hiện tại</p>
                              <p className="font-mono font-medium flex items-center justify-end gap-1">
                                {formatValue(currentPrice)}
                                {goldPriceData && (
                                  <span className="text-[10px] px-1 border rounded border-green-500/50 text-green-600 bg-green-500/10">
                                    LIVE
                                  </span>
                                )}
                              </p>
                           </div>
                           <div>
                              <p className="text-muted-foreground">Giá trị hiện tại</p>
                              <p className="font-mono font-medium">{formatValue(holdingCurrentValue)}</p>
                           </div>
                           <div>
                              <p className="text-muted-foreground">Lợi nhuận</p>
                              <p className={cn("font-mono font-bold flex items-center justify-end gap-1", holdingProfit >= 0 ? "text-profit" : "text-loss")}>
                                {holdingProfit >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {holdingROI > 0 ? "+" : ""}{holdingROI.toFixed(1)}%
                              </p>
                           </div>
                           <div className="col-span-2 mt-2 pt-2 border-t border-border flex justify-end gap-2">
                             <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(holding)}>
                               <Edit2 className="h-4 w-4 mr-1" /> Sửa
                             </Button>
                             <Button variant="destructive" size="sm" onClick={() => handleDelete(holding.id)}>
                               <Trash2 className="h-4 w-4 mr-1" /> Xóa
                             </Button>
                           </div>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 border-2 border-dashed border-border rounded-xl"
          >
            <Coins className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Chưa có khoản đầu tư Vàng nào</h3>
            <p className="text-muted-foreground mb-4">Bấm vào nút "Thêm khoản đầu tư" ở góc trên để bắt đầu thêm dữ liệu.</p>
            <Button onClick={handleOpenAddModal} className="bg-wealth-gold text-primary hover:bg-wealth-gold/90">
               Thêm khoản đầu tư ngay
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

