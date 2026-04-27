import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Fund, GoalCategory, Currency } from '@/types/wealth';

const CATEGORY_OPTIONS: { value: GoalCategory; label: string; emoji: string }[] = [
  { value: 'travel', label: 'Du lịch', emoji: '✈️' },
  { value: 'education', label: 'Học phí', emoji: '🎓' },
  { value: 'emergency', label: 'Khẩn cấp', emoji: '🆘' },
  { value: 'other', label: 'Khác', emoji: '📦' },
];

interface FormValues {
  name: string;
  targetAmount: string;
  currency: Currency;
  category: GoalCategory;
  deadline: string;
  note: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<Fund, 'id' | 'status' | 'goalId'>) => void;
  editFund?: Fund | null;
}

export const FundFormDialog = ({ open, onOpenChange, onSubmit, editFund }: Props) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', targetAmount: '', currency: 'VND', category: 'other', deadline: '', note: '' },
  });

  const [displayAmount, setDisplayAmount] = useState('');
  const category = watch('category');
  const currency = watch('currency');

  useEffect(() => {
    if (open) {
      if (editFund) {
        setDisplayAmount(Number(editFund.targetAmount).toLocaleString('vi-VN'));
        reset({
          name: editFund.name,
          targetAmount: String(editFund.targetAmount),
          currency: editFund.currency,
          category: editFund.category,
          deadline: new Date(editFund.deadline).toISOString().split('T')[0],
          note: editFund.note ?? '',
        });
      } else {
        setDisplayAmount('');
        reset({ name: '', targetAmount: '', currency: 'VND', category: 'other', deadline: '', note: '' });
      }
    }
  }, [open, editFund, reset]);

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setDisplayAmount(raw ? Number(raw).toLocaleString('vi-VN') : '');
    setValue('targetAmount', raw, { shouldValidate: true });
  };

  const onFormSubmit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      targetAmount: parseFloat(values.targetAmount),
      currency: values.currency,
      category: values.category,
      deadline: new Date(values.deadline),
      note: values.note || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] top-[5%] translate-y-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editFund ? 'Sửa quỹ' : 'Tạo quỹ mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fund-category">Danh mục</Label>
            <Select value={category} onValueChange={v => setValue('category', v as GoalCategory)}>
              <SelectTrigger id="fund-category"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fund-name">Tên quỹ</Label>
            <Input id="fund-name" placeholder="VD: Quỹ du lịch 2027" {...register('name', { required: 'Nhập tên quỹ' })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fund-amount">Số tiền mục tiêu</Label>
              <Input id="fund-amount" type="text" inputMode="numeric" placeholder="0" value={displayAmount} onChange={handleAmountInput} />
              <input type="hidden" {...register('targetAmount', { required: 'Nhập số tiền', min: { value: 1, message: 'Phải > 0' } })} />
              {errors.targetAmount && <p className="text-xs text-destructive">{errors.targetAmount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Đơn vị</Label>
              <Select value={currency} onValueChange={v => setValue('currency', v as Currency)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">🇻🇳 VND</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fund-deadline">Hạn chót gom tiền</Label>
            <Input id="fund-deadline" type="date" {...register('deadline', { required: 'Chọn hạn chót' })} />
            {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fund-note">Ghi chú</Label>
            <Textarea id="fund-note" placeholder="Thêm ghi chú..." rows={2} {...register('note')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit">{editFund ? 'Cập nhật' : 'Tạo quỹ'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
