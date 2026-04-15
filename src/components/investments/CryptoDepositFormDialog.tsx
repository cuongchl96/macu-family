import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import type { CryptoDeposit, Currency } from '@/types/wealth';

export type CryptoDepositFormValues = {
  amount: number;
  date: string;
  note: string;
  currency: Currency;
};

const defaultValues: CryptoDepositFormValues = {
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  note: '',
  currency: 'VND',
};

type CryptoDepositFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CryptoDepositFormValues) => void;
  editDeposit?: CryptoDeposit | null;
};

export function CryptoDepositFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editDeposit,
}: CryptoDepositFormDialogProps) {
  const form = useForm<CryptoDepositFormValues>({ defaultValues });

  useEffect(() => {
    if (open) {
      if (editDeposit) {
        form.reset({
          amount: editDeposit.amount,
          date: editDeposit.date instanceof Date ? editDeposit.date.toISOString().slice(0, 10) : new Date(editDeposit.date).toISOString().slice(0, 10),
          note: editDeposit.note ?? '',
          currency: editDeposit.currency,
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [open, editDeposit, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editDeposit ? 'Chỉnh sửa lần nạp' : 'Thêm lần nạp tiền'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              rules={{ required: 'Vui lòng nhập số tiền', min: { value: 0, message: 'Phải ≥ 0' } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền (VND)</FormLabel>
                  <FormControl>
                    <FormattedNumberInput
                      allowDecimal={false}
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
              name="date"
              rules={{ required: 'Vui lòng chọn ngày' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày nạp</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Input placeholder="Tùy chọn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiền tệ</FormLabel>
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit">{editDeposit ? 'Cập nhật' : 'Thêm'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function depositFormToRecord(values: CryptoDepositFormValues, existingId?: string): CryptoDeposit {
  return {
    id: existingId ?? crypto.randomUUID(),
    amount: values.amount,
    date: new Date(values.date),
    note: values.note || undefined,
    currency: values.currency,
  };
}
