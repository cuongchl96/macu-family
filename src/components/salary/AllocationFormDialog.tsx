import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWealth } from '@/contexts/WealthContext';
import type { SalaryAllocation } from '@/types/wealth';

interface FormValues {
  salaryId: string;
  goalId: string;
  amount: string;
  note: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Omit<SalaryAllocation, 'id'>) => void;
  defaultSalaryId?: string;
  defaultGoalId?: string;
}

const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                 'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const fmtMonth = (m: string) => { const [y,mo] = m.split('-'); return `${MONTHS[+mo-1]}/${y}`; };
const FMT = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export const AllocationFormDialog = ({ open, onOpenChange, onSubmit, defaultSalaryId, defaultGoalId }: Props) => {
  const { monthlySalaries, financialGoals, salaryAllocations } = useWealth();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { salaryId: '', goalId: '', amount: '', note: '' },
  });

  const [displayAmount, setDisplayAmount] = useState('');

  const salaryId = watch('salaryId');
  const goalId = watch('goalId');
  const selectedSalary = monthlySalaries.find(s => s.id === salaryId);
  const selectedGoal = financialGoals.find(g => g.id === goalId);

  const allocatedForSalary = salaryAllocations
    .filter(a => a.salaryId === salaryId)
    .reduce((sum, a) => sum + a.amount, 0);
  const remaining = selectedSalary ? selectedSalary.amount - allocatedForSalary : 0;

  useEffect(() => {
    if (open) {
      setDisplayAmount('');
      reset({ salaryId: defaultSalaryId ?? '', goalId: defaultGoalId ?? '', amount: '', note: '' });
    }
  }, [open, defaultSalaryId, defaultGoalId, reset]);

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setDisplayAmount(raw ? Number(raw).toLocaleString('vi-VN') : '');
    setValue('amount', raw, { shouldValidate: true });
  };

  const handleMaxAmount = () => {
    if (remaining > 0) {
      setDisplayAmount(remaining.toLocaleString('vi-VN'));
      setValue('amount', String(remaining), { shouldValidate: true });
    }
  };

  const onFormSubmit = (values: FormValues) => {
    onSubmit({
      salaryId: values.salaryId,
      goalId: values.goalId,
      amount: parseFloat(values.amount),
      note: values.note || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] top-[5%] translate-y-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Phân bổ lương vào mục tiêu</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alloc-salary">Từ tháng lương</Label>
            <Select value={salaryId} onValueChange={v => setValue('salaryId', v)}>
              <SelectTrigger id="alloc-salary">
                <SelectValue placeholder="Chọn tháng lương..." />
              </SelectTrigger>
              <SelectContent>
                {[...monthlySalaries]
                  .sort((a, b) => b.month.localeCompare(a.month))
                  .map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {fmtMonth(s.month)} — {FMT(s.amount)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedSalary && (
              <p className="text-xs text-muted-foreground">
                Còn lại chưa phân bổ:{' '}
                <span className={remaining > 0 ? 'text-profit font-semibold' : 'text-destructive font-semibold'}>
                  {FMT(remaining)}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alloc-goal">Vào mục tiêu</Label>
            <Select value={goalId} onValueChange={v => setValue('goalId', v)}>
              <SelectTrigger id="alloc-goal">
                <SelectValue placeholder="Chọn mục tiêu..." />
              </SelectTrigger>
              <SelectContent>
                {financialGoals.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGoal && (
              <p className="text-xs text-muted-foreground">Cần tích: {FMT(selectedGoal.targetAmount)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alloc-amount">Số tiền phân bổ</Label>
            <div className="flex gap-2">
              <Input
                id="alloc-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                className="flex-1"
                value={displayAmount}
                onChange={handleAmountInput}
              />
              {remaining > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={handleMaxAmount} className="whitespace-nowrap text-xs">
                  Tối đa
                </Button>
              )}
            </div>
            <input type="hidden" {...register('amount', { required: 'Nhập số tiền', min: { value: 1, message: 'Phải > 0' } })} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alloc-note">Ghi chú</Label>
            <Input id="alloc-note" placeholder="VD: Để dành trả góp T3" {...register('note')} />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            📋 Phân bổ này chỉ đóng vai trò dự trù nguồn tiền từ lương cho mục tiêu. Để ghi nhận thực tế, hãy chuyển sang mục Tiết kiệm, tạo Sổ tiết kiệm và gắn với mục tiêu tương ứng.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={!salaryId || !goalId}>Phân bổ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
