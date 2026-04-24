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
import { useWealth } from '@/contexts/WealthContext';
import type { SavingsDeposit, Currency } from '@/types/wealth';

export type SavingsFormValues = {
  name?: string;
  bankName: string;
  principal: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  currency: Currency;
  goalId: string;
};

const defaultValues: SavingsFormValues = {
  name: '',
  bankName: '',
  principal: 0,
  interestRate: 0,
  startDate: new Date().toISOString().slice(0, 10),
  maturityDate: new Date().toISOString().slice(0, 10),
  currency: 'VND',
  goalId: '__none__',
};

type SavingsFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SavingsFormValues) => void;
  editDeposit?: SavingsDeposit | null;
};

export function SavingsFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editDeposit,
}: SavingsFormDialogProps) {
  const form = useForm<SavingsFormValues>({
    defaultValues,
  });
  const { financialGoals } = useWealth();

  const isEdit = Boolean(editDeposit);

  useEffect(() => {
    if (open) {
      if (editDeposit) {
        form.reset({
          name: editDeposit.name || '',
          bankName: editDeposit.bankName,
          principal: editDeposit.principal,
          interestRate: editDeposit.interestRate,
          startDate: editDeposit.startDate instanceof Date
            ? editDeposit.startDate.toISOString().slice(0, 10)
            : new Date(editDeposit.startDate).toISOString().slice(0, 10),
          maturityDate: editDeposit.maturityDate instanceof Date
            ? editDeposit.maturityDate.toISOString().slice(0, 10)
            : new Date(editDeposit.maturityDate).toISOString().slice(0, 10),
          currency: editDeposit.currency,
          goalId: editDeposit.goalId || '__none__',
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa sổ tiết kiệm / tiền gửi' : 'Thêm sổ tiết kiệm / tiền gửi'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên / Mục đích sổ (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Gửi tiền học phí" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankName"
                rules={{ required: 'Vui lòng nhập tên ngân hàng / nguồn' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên ngân hàng / nguồn</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Techcombank, Tikop" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="principal"
                rules={{ required: 'Vui lòng nhập số tiền', min: { value: 0, message: 'Phải ≥ 0' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền gốc (VND)</FormLabel>
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
                name="interestRate"
                rules={{ required: 'Vui lòng nhập lãi suất', min: { value: 0, message: 'Phải ≥ 0' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lãi suất (% năm)</FormLabel>
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                rules={{ required: 'Vui lòng chọn ngày bắt đầu' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maturityDate"
                rules={{ required: 'Vui lòng chọn ngày đáo hạn' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày đáo hạn</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="goalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mục tiêu tài chính (Tùy chọn)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Không gắn mục tiêu nào" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">— Không gắn —</SelectItem>
                        {financialGoals.map(g => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {isEdit ? 'Cập nhật' : 'Thêm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function formValuesToDeposit(
  values: SavingsFormValues,
  editDeposit?: SavingsDeposit | null
): Omit<SavingsDeposit, 'id'> | SavingsDeposit {
  const deposit = {
    name: values.name || undefined,
    bankName: values.bankName,
    principal: values.principal,
    interestRate: values.interestRate,
    startDate: new Date(values.startDate),
    maturityDate: new Date(values.maturityDate),
    currency: values.currency,
    goalId: values.goalId !== '__none__' ? values.goalId : undefined,
  };
  if (editDeposit?.id) {
    return { id: editDeposit.id, ...deposit };
  }
  return deposit;
}
