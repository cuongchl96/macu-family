import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Loan, LoanType, RepaymentType } from '@/types/wealth';

const schema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  loanType: z.enum(['family', 'mortgage', 'consumer']),
  creditor: z.string().min(1, 'Bắt buộc'),
  principalAmount: z.coerce.number().positive('Phải > 0'),
  outstandingBalance: z.coerce.number().min(0),
  interestRate: z.coerce.number().min(0),
  startDate: z.string().min(1, 'Bắt buộc'),
  dueDate: z.string().optional(),
  repaymentType: z.enum(['bullet', 'installment']),
  monthlyPayment: z.coerce.number().optional(),
  currency: z.enum(['VND', 'USD']),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Loan, 'id'>) => void;
  initial?: Loan | null;
}

const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  family: 'Vay gia đình / bạn bè',
  mortgage: 'Vay thế chấp (Mortgage)',
  consumer: 'Vay tín chấp / tiêu dùng',
};

const REPAYMENT_LABELS: Record<RepaymentType, string> = {
  bullet: 'Trả 1 lần khi đáo hạn',
  installment: 'Trả góp hàng tháng',
};

export const LoanFormDialog = ({ open, onClose, onSave, initial }: Props) => {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loanType: 'family',
      repaymentType: 'bullet',
      currency: 'VND',
      interestRate: 0,
    },
  });

  const repaymentType = watch('repaymentType');
  const loanType = watch('loanType');

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name,
        loanType: initial.loanType,
        creditor: initial.creditor,
        principalAmount: initial.principalAmount,
        outstandingBalance: initial.outstandingBalance,
        interestRate: initial.interestRate,
        startDate: initial.startDate instanceof Date ? initial.startDate.toISOString().split('T')[0] : initial.startDate,
        dueDate: initial.dueDate ? (initial.dueDate instanceof Date ? initial.dueDate.toISOString().split('T')[0] : initial.dueDate) : '',
        repaymentType: initial.repaymentType,
        monthlyPayment: initial.monthlyPayment,
        currency: initial.currency,
        note: initial.note ?? '',
      });
    } else {
      reset({ loanType: 'family', repaymentType: 'bullet', currency: 'VND', interestRate: 0 });
    }
  }, [initial, open, reset]);

  const onSubmit = (values: FormValues) => {
    onSave({
      name: values.name,
      loanType: values.loanType,
      creditor: values.creditor,
      principalAmount: values.principalAmount,
      outstandingBalance: values.outstandingBalance,
      interestRate: values.interestRate,
      startDate: new Date(values.startDate),
      dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
      currency: values.currency,
      repaymentType: values.repaymentType,
      monthlyPayment: values.monthlyPayment,
      note: values.note,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto top-[5%] translate-y-0">
        <DialogHeader>
          <DialogTitle>{initial ? 'Sửa khoản vay' : 'Thêm khoản vay'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Tên khoản vay</Label>
            <Input placeholder="VD: Vay thế chấp Vinhomes - Techcombank" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Loại vay</Label>
              <Select value={loanType} onValueChange={v => setValue('loanType', v as LoanType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(LOAN_TYPE_LABELS) as [LoanType, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Đơn vị tiền</Label>
              <Select value={watch('currency')} onValueChange={v => setValue('currency', v as 'VND' | 'USD')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">🇻🇳 VND</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Người / Ngân hàng cho vay</Label>
            <Input placeholder="VD: Techcombank, Mẹ, Anh Hai..." {...register('creditor')} />
            {errors.creditor && <p className="text-xs text-destructive">{errors.creditor.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Số tiền vay gốc</Label>
              <Input type="number" placeholder="1000000000" {...register('principalAmount')} />
              {errors.principalAmount && <p className="text-xs text-destructive">{errors.principalAmount.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Dư nợ hiện tại</Label>
              <Input type="number" placeholder="850000000" {...register('outstandingBalance')} />
              {errors.outstandingBalance && <p className="text-xs text-destructive">{errors.outstandingBalance.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Lãi suất (%/năm)</Label>
              <Input type="number" step="0.1" placeholder="0" {...register('interestRate')} />
            </div>
            <div className="space-y-1">
              <Label>Ngày bắt đầu vay</Label>
              <Input type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Hình thức trả nợ</Label>
            <Select value={repaymentType} onValueChange={v => setValue('repaymentType', v as RepaymentType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(REPAYMENT_LABELS) as [RepaymentType, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {repaymentType === 'bullet' && (
            <div className="space-y-1">
              <Label>Ngày đáo hạn</Label>
              <Input type="date" {...register('dueDate')} />
            </div>
          )}

          {repaymentType === 'installment' && (
            <div className="space-y-1">
              <Label>Số tiền trả góp / tháng</Label>
              <Input type="number" placeholder="12000000" {...register('monthlyPayment')} />
            </div>
          )}

          <div className="space-y-1">
            <Label>Ghi chú (tuỳ chọn)</Label>
            <Textarea placeholder="Thông tin thêm về khoản vay..." {...register('note')} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Huỷ</Button>
            <Button type="submit">{initial ? 'Lưu thay đổi' : 'Thêm khoản vay'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
