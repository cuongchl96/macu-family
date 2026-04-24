import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWealth } from '@/contexts/WealthContext';
import type { FinancialGoal, GoalCategory, Currency } from '@/types/wealth';

const CATEGORY_OPTIONS: { value: GoalCategory; label: string; emoji: string }[] = [
  { value: 'real_estate_payment', label: 'Trả góp BĐS', emoji: '🏠' },
  { value: 'travel', label: 'Du lịch', emoji: '✈️' },
  { value: 'education', label: 'Học phí', emoji: '🎓' },
  { value: 'emergency', label: 'Quỹ khẩn cấp', emoji: '🆘' },
  { value: 'other', label: 'Khác', emoji: '📦' },
];

const NONE = '__none__';

interface FormValues {
  name: string;
  targetAmount: string;
  currency: Currency;
  category: GoalCategory;
  dueDate: string;
  propertyId: string;
  paymentId: string;
  note: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<FinancialGoal, 'id'>) => void;
  editGoal?: FinancialGoal | null;
}

export const GoalFormDialog = ({ open, onOpenChange, onSubmit, editGoal }: Props) => {
  const { realEstateProperties } = useWealth();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '', targetAmount: '', currency: 'VND', category: 'other',
      dueDate: '', propertyId: NONE, paymentId: NONE, note: '',
    },
  });

  const [displayAmount, setDisplayAmount] = useState('');

  const category = watch('category');
  const currency = watch('currency');
  const propertyId = watch('propertyId');
  const paymentId = watch('paymentId');
  const selectedProperty = propertyId !== NONE ? realEstateProperties.find(p => p.id === propertyId) : undefined;

  useEffect(() => {
    if (open) {
      if (editGoal) {
        setDisplayAmount(Number(editGoal.targetAmount).toLocaleString('vi-VN'));
        reset({
          name: editGoal.name,
          targetAmount: String(editGoal.targetAmount),
          currency: editGoal.currency,
          category: editGoal.category,
          dueDate: editGoal.dueDate ? new Date(editGoal.dueDate).toISOString().split('T')[0] : '',
          propertyId: editGoal.propertyId ?? NONE,
          paymentId: editGoal.paymentId ?? NONE,
          note: editGoal.note ?? '',
        });
      } else {
        setDisplayAmount('');
        reset({
          name: '', targetAmount: '', currency: 'VND', category: 'other',
          dueDate: '', propertyId: NONE, paymentId: NONE, note: '',
        });
      }
    }
  }, [open, editGoal, reset]);

  useEffect(() => {
    if (paymentId !== NONE && selectedProperty) {
      const payment = selectedProperty.payments.find(p => p.id === paymentId);
      if (payment) {
        setValue('targetAmount', String(payment.amount));
        setDisplayAmount(payment.amount.toLocaleString('vi-VN'));
        setValue('currency', payment.currency);
      }
    }
  }, [paymentId, selectedProperty, setValue]);

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setDisplayAmount(raw ? Number(raw).toLocaleString('vi-VN') : '');
    setValue('targetAmount', raw, { shouldValidate: true });
  };

  const handlePropertyChange = (val: string) => {
    setValue('propertyId', val);
    setValue('paymentId', NONE);
  };

  const onFormSubmit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      targetAmount: parseFloat(values.targetAmount),
      currency: values.currency,
      category: values.category,
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
      propertyId: values.propertyId !== NONE ? values.propertyId : undefined,
      paymentId: values.paymentId !== NONE ? values.paymentId : undefined,
      note: values.note || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] top-[5%] translate-y-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editGoal ? 'Sửa mục tiêu' : 'Tạo mục tiêu tài chính'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-category">Loại mục tiêu</Label>
            <Select value={category} onValueChange={v => setValue('category', v as GoalCategory)}>
              <SelectTrigger id="goal-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.emoji} {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category === 'real_estate_payment' && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Liên kết kỳ trả góp (tùy chọn)</p>
              <div className="space-y-2">
                <Label htmlFor="goal-property">Tài sản BĐS</Label>
                <Select value={propertyId} onValueChange={handlePropertyChange}>
                  <SelectTrigger id="goal-property">
                    <SelectValue placeholder="Chọn tài sản..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>— Không liên kết —</SelectItem>
                    {realEstateProperties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedProperty && (
                <div className="space-y-2">
                  <Label htmlFor="goal-payment">Kỳ thanh toán</Label>
                  <Select value={paymentId} onValueChange={v => setValue('paymentId', v)}>
                    <SelectTrigger id="goal-payment">
                      <SelectValue placeholder="Chọn kỳ thanh toán..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— Không chọn —</SelectItem>
                      {selectedProperty.payments
                        .filter(p => !p.isPaid)
                        .map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {new Date(p.dueDate).toLocaleDateString('vi-VN')} — {p.amount.toLocaleString('vi-VN')}đ
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {paymentId !== NONE && (
                    <p className="text-xs text-profit">✅ Số tiền đã được tự động điền từ kỳ thanh toán</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="goal-name">Tên mục tiêu</Label>
            <Input
              id="goal-name"
              placeholder="VD: Quỹ du lịch Nhật 2026"
              {...register('name', { required: 'Vui lòng nhập tên' })}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goal-amount">Số tiền cần tích lũy</Label>
              <Input
                id="goal-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={displayAmount}
                onChange={handleAmountInput}
              />
              <input type="hidden" {...register('targetAmount', { required: 'Nhập số tiền', min: { value: 1, message: 'Phải > 0' } })} />
              {errors.targetAmount && <p className="text-xs text-destructive">{errors.targetAmount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Đơn vị</Label>
              <Select value={currency} onValueChange={v => setValue('currency', v as Currency)}>
                <SelectTrigger id="goal-currency">
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
            <Label htmlFor="goal-due-date">Deadline (tùy chọn)</Label>
            <Input id="goal-due-date" type="date" {...register('dueDate')} />
            <p className="text-xs text-muted-foreground">Ngày cần tích đủ số tiền</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-note">Ghi chú</Label>
            <Textarea id="goal-note" placeholder="Thêm ghi chú..." rows={2} {...register('note')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit">{editGoal ? 'Cập nhật' : 'Tạo mục tiêu'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
