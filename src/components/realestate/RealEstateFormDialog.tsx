import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import type { RealEstateProperty, RealEstatePayment, Currency } from '@/types/wealth';

export type RealEstateFormValues = {
  name: string;
  currency: Currency;

  payments: Array<{
    dueDate: string;
    amount: number;
    isPaid: boolean;
    note: string;
    currency: Currency;
  }>;
};

const getDefaultValues = (): RealEstateFormValues => ({
  name: '',
  currency: 'VND',

  payments: [],
});

type RealEstateFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RealEstateFormValues) => void;
  editProperty?: RealEstateProperty | null;
};

export function RealEstateFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editProperty,
}: RealEstateFormDialogProps) {
  const form = useForm<RealEstateFormValues>({
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'payments',
  });

  const isEdit = Boolean(editProperty);

  useEffect(() => {
    if (open) {
      if (editProperty) {
        form.reset({
          name: editProperty.name,
          currency: editProperty.currency,

          payments: editProperty.payments.map((p) => ({
            dueDate: p.dueDate instanceof Date ? p.dueDate.toISOString().slice(0, 10) : new Date(p.dueDate).toISOString().slice(0, 10),
            amount: p.amount,
            isPaid: p.isPaid,
            note: p.note ?? '',
            currency: p.currency,
          })),
        });
      } else {
        form.reset(getDefaultValues());
      }
    }
  }, [open, editProperty, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
    onOpenChange(false);
  });

  const addPayment = (e: React.MouseEvent) => {
    e.preventDefault();
    append({
      dueDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      isPaid: false,
      note: '',
      currency: form.getValues('currency'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa bất động sản' : 'Thêm bất động sản'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Vui lòng nhập tên' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tài sản</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Căn hộ A" {...field} />
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
            </div>

            {/* Payments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Lịch thanh toán</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPayment}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm kỳ
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                {fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">Chưa có kỳ thanh toán. Bấm &quot;Thêm kỳ&quot; để thêm.</p>
                ) : (
                  fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-2 items-end p-2 rounded bg-background border"
                    >
                      <FormField
                        control={form.control}
                        name={`payments.${index}.dueDate`}
                        render={({ field: f }) => (
                          <FormItem className="col-span-3">
                            <FormLabel className="text-xs">Ngày</FormLabel>
                            <FormControl>
                              <Input type="date" {...f} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`payments.${index}.amount`}
                        render={({ field: f }) => (
                          <FormItem className="col-span-3">
                            <FormLabel className="text-xs">Số tiền</FormLabel>
                            <FormControl>
                              <FormattedNumberInput
                                allowDecimal={false}
                                value={f.value}
                                onChange={(val) => f.onChange(val || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`payments.${index}.note`}
                        render={({ field: f }) => (
                          <FormItem className="col-span-3">
                            <FormLabel className="text-xs">Ghi chú</FormLabel>
                            <FormControl>
                              <Input placeholder="Ghi chú" {...f} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`payments.${index}.isPaid`}
                        render={({ field: f }) => (
                          <FormItem className="col-span-2 flex flex-row items-center gap-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={f.value}
                                onCheckedChange={f.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">Đã trả</FormLabel>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-1 text-destructive hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
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

export function formValuesToProperty(
  values: RealEstateFormValues,
  editProperty?: RealEstateProperty | null
): Omit<RealEstateProperty, 'id'> | RealEstateProperty {
  const payments: RealEstatePayment[] = values.payments.map((p, i) => ({
    id: editProperty?.payments[i]?.id ?? crypto.randomUUID(),
    dueDate: new Date(p.dueDate),
    amount: p.amount,
    isPaid: p.isPaid,
    note: p.note || undefined,
    currency: p.currency,
  }));
  const calculatedTotal = values.payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const calculatedPaid = values.payments.reduce((acc, p) => acc + (p.isPaid ? (Number(p.amount) || 0) : 0), 0);

  const prop = {
    name: values.name,
    totalValue: calculatedTotal,
    paidAmount: calculatedPaid,
    currency: values.currency,

    payments,
  };
  if (editProperty?.id) {
    return { id: editProperty.id, ...prop };
  }
  return prop;
}
