import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useWealth } from '@/contexts/WealthContext';
import type { SavingsDeposit } from '@/types/wealth';

interface FormValues {
  amount: string;
  logExpenseNote: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit: SavingsDeposit | null;
}

const FMT = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export const WithdrawDialog = ({ open, onOpenChange, deposit }: Props) => {
  const { funds, fundExpenses, savingsDeposits, updateSavingsDeposit, addFundExpense } = useWealth();
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { amount: '', logExpenseNote: '' },
  });

  const [displayAmount, setDisplayAmount] = useState('');
  const [logToFund, setLogToFund] = useState(false);

  // Find linked fund (if deposit's goal is linked to a fund)
  const linkedFund = deposit?.goalId
    ? funds.find(f => f.goalId === deposit.goalId && f.status === 'ready')
    : undefined;

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setDisplayAmount(raw ? Number(raw).toLocaleString('vi-VN') : '');
    setValue('amount', raw, { shouldValidate: true });
  };

  const onFormSubmit = (values: FormValues) => {
    if (!deposit) return;
    const withdrawAmount = parseFloat(values.amount);
    // 1. Reduce savings principal
    updateSavingsDeposit(deposit.id, { principal: deposit.principal - withdrawAmount });
    // 2. If logging to fund
    if (logToFund && linkedFund) {
      addFundExpense({
        fundId: linkedFund.id,
        amount: withdrawAmount,
        date: new Date(),
        note: values.logExpenseNote || `Rút từ sổ: ${deposit.name || deposit.bankName}`,
      });
    }
    setDisplayAmount('');
    setLogToFund(false);
    reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    setDisplayAmount('');
    setLogToFund(false);
    reset();
    onOpenChange(false);
  };

  if (!deposit) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[440px] top-[5%] translate-y-0">
        <DialogHeader>
          <DialogTitle>Rút tiền — {deposit.name || deposit.bankName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            Số dư hiện tại: <span className="font-mono font-bold">{FMT(deposit.principal)}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wd-amount">Số tiền rút</Label>
            <Input id="wd-amount" type="text" inputMode="numeric" placeholder="0" value={displayAmount} onChange={handleAmountInput} />
            <input type="hidden" {...register('amount', {
              required: 'Nhập số tiền',
              min: { value: 1, message: 'Phải > 0' },
              validate: v => parseFloat(v) <= deposit.principal || `Vượt quá số dư (${FMT(deposit.principal)})`,
            })} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          {linkedFund && (
            <div className="space-y-3 p-3 rounded-lg border border-sky-500/20 bg-sky-500/5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="log-fund"
                  checked={logToFund}
                  onCheckedChange={v => setLogToFund(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="log-fund" className="text-sm leading-tight cursor-pointer">
                  Ghi nhận chi tiêu cho Quỹ <span className="font-semibold">"{linkedFund.name}"</span>
                </label>
              </div>
              {logToFund && (
                <div className="space-y-2 pl-7">
                  <Label htmlFor="wd-note" className="text-xs">Ghi chú chi tiêu</Label>
                  <Input id="wd-note" placeholder="VD: Đặt vé máy bay" {...register('logExpenseNote')} />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Hủy</Button>
            <Button type="submit" variant="destructive">Rút tiền</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
