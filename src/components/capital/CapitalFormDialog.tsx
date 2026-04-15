import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import type { CapitalContribution, Currency, Owner } from '@/types/wealth';

const formSchema = z.object({
  amount: z.number().min(0, "Số tiền phải lớn hơn 0"),
  date: z.date({
    required_error: "Vui lòng chọn ngày",
  }),
  note: z.string().optional(),
  owner: z.enum(['wife', 'husband', 'joint']),
  currency: z.enum(['VND', 'USD']),
});

export type CapitalFormValues = z.infer<typeof formSchema>;

interface CapitalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CapitalFormValues) => void;
  editContribution?: CapitalContribution | null;
}

export const CapitalFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editContribution,
}: CapitalFormDialogProps) => {
  const form = useForm<CapitalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: new Date(),
      note: '',
      owner: 'joint',
      currency: 'VND',
    },
  });

  useEffect(() => {
    if (open) {
      if (editContribution) {
        form.reset({
          amount: editContribution.amount,
          date: editContribution.date instanceof Date ? editContribution.date : new Date(editContribution.date),
          note: editContribution.note || '',
          owner: editContribution.owner,
          currency: editContribution.currency,
        });
      } else {
        form.reset({
          amount: 0,
          date: new Date(),
          note: '',
          owner: 'joint',
          currency: 'VND',
        });
      }
    }
  }, [open, editContribution, form]);

  const handleSubmit = (values: CapitalFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editContribution ? 'Sửa khoản vốn' : 'Thêm khoản vốn đóng góp'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền</FormLabel>
                  <FormControl>
                    <FormattedNumberInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Nhập số tiền"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại tiền tệ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại tiền" />
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
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người đóng góp</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="wife">Vợ</SelectItem>
                        <SelectItem value="husband">Chồng</SelectItem>
                        <SelectItem value="joint">Chung</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày đóng góp</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ví dụ: Lương thưởng Tết" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
