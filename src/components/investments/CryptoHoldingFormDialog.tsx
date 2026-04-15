import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { CryptoHolding, Currency } from '@/types/wealth';
import { exchangeRate } from '@/data/wealthData';

// VND per 1 USD - used for crypto price conversion (same as wealthData exchangeRate)
const USD_TO_VND = exchangeRate.rate;

// Fetch all Binance USDT pairs
const fetchAllBinancePrices = async () => {
  const res = await fetch('https://api.binance.com/api/v3/ticker/price');
  if (!res.ok) throw new Error('API failed');
  const data: { symbol: string; price: string }[] = await res.json();
  const filtered = data
    .filter(d => d.symbol.endsWith('USDT') && !d.symbol.includes('UPUSDT') && !d.symbol.includes('DOWNUSDT'))
    .map(d => ({
       symbol: d.symbol.replace('USDT', ''),
       price: parseFloat(d.price)
    }));
  return filtered;
};

export type CryptoHoldingFormValues = {
  name: string;
  symbol: string;
  amount: number;
  currentPrice: number;
  priceCurrency: Currency;
  purchaseDate: string;
};

const defaultValues: CryptoHoldingFormValues = {
  name: '',
  symbol: '',
  amount: 0,
  currentPrice: 0,
  priceCurrency: 'VND',
  purchaseDate: new Date().toISOString().slice(0, 10),
};

type CryptoHoldingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CryptoHoldingFormValues) => void;
  editHolding?: CryptoHolding | null;
};

export function CryptoHoldingFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editHolding,
}: CryptoHoldingFormDialogProps) {
  const form = useForm<CryptoHoldingFormValues>({ defaultValues });
  const [openCombobox, setOpenCombobox] = useState(false);

  // Load Coins from Binance
  const { data: coinsData, isLoading: isLoadingCoins } = useQuery({
    queryKey: ['binanceAllPrices'],
    queryFn: fetchAllBinancePrices,
    staleTime: 60 * 1000,
    enabled: open, // Only fetch when dialog opens
  });

  // Sort important coins first
  const sortedCoins = useMemo(() => {
    if (!coinsData) return [];
    const topCoins = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'LINK', 'DOGE', 'DOT'];
    return [...coinsData].sort((a, b) => {
      const idxA = topCoins.indexOf(a.symbol);
      const idxB = topCoins.indexOf(b.symbol);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [coinsData]);

  useEffect(() => {
    if (open) {
      if (editHolding) {
        form.reset({
          name: editHolding.name,
          symbol: editHolding.symbol,
          amount: editHolding.amount,
          currentPrice: editHolding.currentPrice,
          priceCurrency: 'VND',
          purchaseDate: editHolding.purchaseDate instanceof Date
            ? editHolding.purchaseDate.toISOString().slice(0, 10)
            : new Date(editHolding.purchaseDate).toISOString().slice(0, 10),
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [open, editHolding, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden',
          'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
          'flex flex-col',
          '[&>button]:right-4 [&>button]:top-4'
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>{editHolding ? 'Edit holding' : 'Add asset'}</DialogTitle>
        </DialogHeader>
        <div
          className="min-h-0 overflow-y-scroll overflow-x-hidden px-6 pb-6 overscroll-contain"
          style={{ maxHeight: 'min(55vh, 420px)' }}
        >
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (e.g. Bitcoin)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="symbol"
                  rules={{ required: 'Symbol is required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2 max-w-full truncate">
                      <FormLabel>Select Coin</FormLabel>
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className={cn(
                                "justify-between font-normal px-3",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                <span className="flex items-center gap-2 truncate">
                                  <span className="font-bold">{field.value}</span>
                                </span>
                              ) : (
                                "Select a coin..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search coin... (e.g. BTC)" />
                            <CommandList>
                              <CommandEmpty>
                                {isLoadingCoins ? (
                                   <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching real-time data...
                                   </div>
                                ) : "No coin found."}
                              </CommandEmpty>
                              <CommandGroup>
                                {sortedCoins.map((coin) => (
                                  <CommandItem
                                    key={coin.symbol}
                                    value={coin.symbol}
                                    onSelect={(currentValue) => {
                                      const topMatch = sortedCoins.find((c) => c.symbol.toLowerCase() === currentValue.toLowerCase());
                                      if (topMatch) {
                                        form.setValue("symbol", topMatch.symbol);
                                        form.setValue("currentPrice", topMatch.price);
                                        form.setValue("priceCurrency", "USD");
                                        if (!form.getValues("name")) {
                                          form.setValue("name", topMatch.symbol);
                                        }
                                      }
                                      setOpenCombobox(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === coin.symbol ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="font-bold w-14">{coin.symbol}</span>
                                    <span className="text-muted-foreground text-xs ml-auto font-mono">
                                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="amount"
                rules={{ required: 'Quantity is required', min: { value: 0, message: 'Must be ≥ 0' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (units)</FormLabel>
                    <FormControl>
                      <FormattedNumberInput
                        allowDecimal={true}
                        value={field.value}
                        onChange={(val) => field.onChange(val || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentPrice"
                  rules={{ required: 'Current price is required', min: { value: 0, message: 'Must be ≥ 0' } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current price (per unit)</FormLabel>
                      <FormControl>
                        <FormattedNumberInput
                          allowDecimal={true}
                          value={field.value}
                          onChange={(val) => field.onChange(val || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price in</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VND">VND</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="purchaseDate"
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 pb-2 gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">{editHolding ? 'Update' : 'Add'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Convert form price to VND using USD_TO_VND when price is in USD */
export function currentPriceToVND(price: number, currency: Currency): number {
  return currency === 'USD' ? price * USD_TO_VND : price;
}

export function holdingFormToRecord(values: CryptoHoldingFormValues, existingId?: string): Omit<CryptoHolding, 'id'> | CryptoHolding {
  const currentPriceVND = currentPriceToVND(values.currentPrice, values.priceCurrency);
  const record = {
    name: values.name,
    symbol: values.symbol,
    amount: values.amount,
    purchaseCost: 0,
    currentPrice: currentPriceVND,
    purchaseDate: new Date(values.purchaseDate),
  };
  if (existingId) return { id: existingId, ...record };
  return record;
}
