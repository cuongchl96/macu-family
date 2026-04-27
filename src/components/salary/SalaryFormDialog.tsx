import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MonthlySalary, Currency } from '@/types/wealth';

interface FormValues {
  name: string;
  amount: string;
  currency: Currency;
  note: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<MonthlySalary, 'id'>) => void;
  editSalary?: MonthlySalary | null;
}

export const SalaryFormDialog = ({ open, onOpenChange, onSubmit, editSalary }: Props) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', amount: '', currency: 'VND', note: '' },
  });

  const [displayAmount, setDisplayAmount] = useState('');
  const currency = watch('currency');

  useEffect(() => {
    if (open) {
      if (editSalary) {
        setDisplayAmount(editSalary.amount.toLocaleString('vi-VN'));
        reset({
          name: editSalary.name,
          amount: String(editSalary.amount),
          currency: editSalary.currency,
          note: editSalary.note ?? '',
        });
      } else {
        setDisplayAmount('');
        reset({ name: '', amount: '', currency: 'VND', note: '' });
      }
    }
  }, [open, editSalary, reset]);

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setDisplayAmount(raw ? Number(raw).toLocaleString('vi-VN') : '');
    setValue('amount', raw, { shouldValidate: true });
  };

  const onFormSubmit = (values: FormValues) => {
    onSubmit({
      name: values.name.trim(),
      amount: parseFloat(values.amount),
      currency: values.currency,
      note: values.note || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] top-[5%] translate-y-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editSalary ? 'Sửa nguồn vốn' : 'Thêm nguồn vốn'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="salary-name">Tên nguồn vốn</Label>
            <Input
              id="salary-name"
              placeholder="VD: Lương tháng 4/2026, Tiền thưởng Q1, Bán xe cũ..."
              {...register('name', { required: 'Vui lòng nhập tên nguồn vốn' })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="salary-amount">Số tiền</Label>
              <Input
                id="salary-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={displayAmount}
                onChange={handleAmountInput}
              />
              <input type="hidden" {...register('amount', { required: 'Nhập số tiền', min: { value: 1, message: 'Phải > 0' } })} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Đơn vị</Label>
              <Select value={currency} onValueChange={v => setValue('currency', v as Currency)}>
                <SelectTrigger id="salary-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">🇻🇳 VND</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary-note">Ghi chú (tùy chọn)</Label>
            <Input id="salary-note" placeholder="VD: Đã trừ thuế TNCN" {...register('note')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit">{editSalary ? 'Cập nhật' : 'Lưu'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
