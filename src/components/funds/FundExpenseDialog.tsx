import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FundExpense } from '@/types/wealth';

interface FormValues {
  amount: string;
  date: string;
  note: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fundId: string;
  fundName: string;
  availableBalance: number;
  onSubmit: (expense: Omit<FundExpense, 'id'>) => void;
}

export const FundExpenseDialog = ({ open, onOpenChange, fundId, fundName, availableBalance, onSubmit }: Props) => {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { amount: '', date: new Date().toISOString().split('T')[0], note: '' },
  });
  const [displayAmount, setDisplayAmount] = useState('');

  const FMT = (n: number) => n.toLocaleString('vi-VN') + 'đ';

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setDisplayAmount(raw ? Number(raw).toLocaleString('vi-VN') : '');
    setValue('amount', raw, { shouldValidate: true });
  };

  const onFormSubmit = (values: FormValues) => {
    onSubmit({
      fundId,
      amount: parseFloat(values.amount),
      date: new Date(values.date),
      note: values.note || undefined,
    });
    setDisplayAmount('');
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { setDisplayAmount(''); reset(); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[420px] top-[5%] translate-y-0">
        <DialogHeader>
          <DialogTitle>Ghi nhận chi tiêu — {fundName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            Số dư khả dụng: <span className="font-mono font-bold text-profit">{FMT(availableBalance)}</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-amount">Số tiền chi</Label>
            <Input id="exp-amount" type="text" inputMode="numeric" placeholder="0" value={displayAmount} onChange={handleAmountInput} />
            <input type="hidden" {...register('amount', {
              required: 'Nhập số tiền',
              min: { value: 1, message: 'Phải > 0' },
              validate: v => parseFloat(v) <= availableBalance || `Vượt quá số dư (${FMT(availableBalance)})`,
            })} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-date">Ngày chi</Label>
            <Input id="exp-date" type="date" {...register('date', { required: 'Chọn ngày' })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-note">Mô tả</Label>
            <Input id="exp-note" placeholder="VD: Đặt vé Đà Nẵng" {...register('note')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit">Ghi nhận</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
