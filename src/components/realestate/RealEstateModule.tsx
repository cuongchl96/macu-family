import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar, CheckCircle2, AlertTriangle, TrendingUp, Plus, Home, Pencil, Trash2, Target } from 'lucide-react';
import { formatVND, formatDateVN, getDaysToMaturity, vndToUsd, formatUSD } from '@/data/wealthData';
import { useWealth } from '@/contexts/WealthContext';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RealEstateFormDialog, formValuesToProperty } from './RealEstateFormDialog';
import type { RealEstateProperty } from '@/types/wealth';
import type { RealEstateFormValues } from './RealEstateFormDialog';

const PropertyCard = ({
  property,
  index,
  onEdit,
  onDelete,
  onSyncGoals,
}: {
  property: RealEstateProperty;
  index: number;
  onEdit: (p: RealEstateProperty) => void;
  onDelete: (p: RealEstateProperty) => void;
  onSyncGoals: (p: RealEstateProperty) => void;
}) => {
  const { currency, hideValues } = useWealth();

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') {
      return formatUSD(vndToUsd(value));
    }
    return formatVND(value);
  };

  const remainingBalance = property.totalValue - property.paidAmount;
  const progressPercent = (property.paidAmount / property.totalValue) * 100;
  const upcomingPayments = property.payments.filter((p) => !p.isPaid);
  const paidPayments = property.payments.filter((p) => p.isPaid);
  const nextPayment = upcomingPayments[0];
  const daysToNext = nextPayment ? getDaysToMaturity(nextPayment.dueDate) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <AccordionItem value={property.id} className="border border-border rounded-xl overflow-hidden bg-card mb-4">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-4 w-full">
            <div className="p-3 rounded-xl bg-wealth-property/20 shrink-0">
              <Home className="h-5 w-5 text-wealth-property" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg">{property.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>Tổng: {formatValue(property.totalValue)}</span>
                <span>•</span>
                <span className="text-profit">Đã trả: {progressPercent.toFixed(1)}%</span>
                {daysToNext !== null && (
                  <>
                    <span>•</span>
                    <span className={cn(
                      daysToNext < 0 ? 'text-destructive' : daysToNext <= 30 ? 'text-warning' : ''
                    )}>
                      {daysToNext < 0 
                        ? `Quá hạn ${Math.abs(daysToNext)} ngày` 
                        : `${daysToNext} ngày tới kỳ`}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 mr-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Còn lại</p>
                <p className="font-mono font-bold text-loss">{formatValue(remainingBalance)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(property);
                }}
                title="Chỉnh sửa"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  onSyncGoals(property);
                }}
                title="Đồng bộ mục tiêu"
              >
                <Target className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(property);
                }}
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent className="px-6 pb-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Tổng giá trị
              </p>
              <p className="text-xl font-bold font-mono">{formatValue(property.totalValue)}</p>
            </div>
            <div className="p-4 rounded-lg bg-profit/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Đã thanh toán
              </p>
              <p className="text-xl font-bold font-mono text-profit">{formatValue(property.paidAmount)}</p>
            </div>
            <div className="p-4 rounded-lg bg-loss/10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Còn phải trả
              </p>
              <p className="text-xl font-bold font-mono text-loss">{formatValue(remainingBalance)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Tiến độ thanh toán</span>
              <span className="font-mono font-semibold">{progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {/* Payment Schedule */}
          <div className="space-y-4">
            {/* Upcoming Payments */}
            {upcomingPayments.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Các khoản sắp tới ({upcomingPayments.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {upcomingPayments.map((payment) => {
                    const daysUntil = getDaysToMaturity(payment.dueDate);
                    const isUrgent = daysUntil <= 30;
                    const isPast = daysUntil < 0;

                    return (
                      <div
                        key={payment.id}
                        className={cn(
                          'p-4 rounded-lg border',
                          isPast
                            ? 'bg-destructive/10 border-destructive/30'
                            : isUrgent
                            ? 'bg-warning/10 border-warning/30'
                            : 'bg-muted/50 border-border'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatDateVN(payment.dueDate)}</span>
                            </div>
                            {payment.note && (
                              <p className="text-xs text-muted-foreground mt-1">{payment.note}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold">{formatValue(payment.amount)}</p>
                            <p
                              className={cn(
                                'text-xs',
                                isPast ? 'text-destructive' : isUrgent ? 'text-warning' : 'text-muted-foreground'
                              )}
                            >
                              {isPast
                                ? `Quá hạn ${Math.abs(daysUntil)} ngày`
                                : `${daysUntil} ngày`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paid Payments */}
            {paidPayments.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-profit" />
                  Đã thanh toán ({paidPayments.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paidPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-3 rounded-lg bg-profit/5 border border-profit/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-profit" />
                          <span className="text-sm">{formatDateVN(payment.dueDate)}</span>
                        </div>
                        <span className="font-mono text-sm font-semibold">
                          {formatValue(payment.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </motion.div>
  );
};

export const RealEstateModule = () => {
  const {
    currency,
    realEstateProperties,
    addRealEstateProperty,
    updateRealEstateProperty,
    deleteRealEstateProperty,
    hideValues,
    syncPropertyGoals,
  } = useWealth();
  const [formOpen, setFormOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<RealEstateProperty | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'value_desc' | 'name_asc'>('value_desc');

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') {
      return formatUSD(vndToUsd(value));
    }
    return formatVND(value);
  };

  const handleFormSubmit = (values: RealEstateFormValues) => {
    if (editProperty) {
      const updated = formValuesToProperty(values, editProperty);
      updateRealEstateProperty(editProperty.id, updated);
      setEditProperty(null);
    } else {
      addRealEstateProperty(formValuesToProperty(values));
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteRealEstateProperty(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Calculate totals across all properties
  const totalValue = realEstateProperties.reduce((sum, p) => sum + p.totalValue, 0);
  const totalPaid = realEstateProperties.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalRemaining = totalValue - totalPaid;
  const overallProgress = totalValue > 0 ? (totalPaid / totalValue) * 100 : 0;

  // Flatten and sort all payments chronologically
  const allPaymentsOrdered = realEstateProperties
    .flatMap(p => p.payments.map(payment => ({ ...payment, propertyName: p.name, propertyId: p.id })))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-wealth-property/20">
              <Building2 className="h-6 w-6 text-wealth-property" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Danh mục Bất động sản</h1>
              <p className="text-muted-foreground">
                Quản lý {realEstateProperties.length} tài sản bất động sản
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditProperty(null);
              setFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm tài sản
          </Button>
        </div>
      </motion.div>

      <RealEstateFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditProperty(null);
        }}
        onSubmit={handleFormSubmit}
        editProperty={editProperty}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài sản?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tài sản sẽ bị xóa khỏi danh sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Portfolio Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl border border-wealth-property/30 bg-gradient-to-br from-wealth-property/10 to-transparent p-6"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Tổng quan danh mục
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tổng giá trị</p>
            <p className="text-2xl font-bold font-mono">{formatValue(totalValue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Đã thanh toán</p>
            <p className="text-2xl font-bold font-mono text-profit">{formatValue(totalPaid)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Còn phải trả</p>
            <p className="text-2xl font-bold font-mono text-loss">{formatValue(totalRemaining)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Số tài sản</p>
            <p className="text-2xl font-bold font-mono">{realEstateProperties.length}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Tiến độ tổng thể</span>
            <span className="font-mono font-semibold">{overallProgress.toFixed(1)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </motion.div>

      {/* Main Content Areas */}
      <Tabs defaultValue="properties" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList className="bg-muted/50 h-11 p-1">
            <TabsTrigger value="properties" className="flex items-center gap-2 px-4 py-2">
              <Building2 className="h-4 w-4" />
              Danh sách tài sản
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2 px-4 py-2">
              <Calendar className="h-4 w-4" />
              Lịch thanh toán tổng hợp
            </TabsTrigger>
          </TabsList>
          
          <Select value={sortOption} onValueChange={(v: any) => setSortOption(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value_desc">Giá trị lớn nhất</SelectItem>
              <SelectItem value="name_asc">Tên (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Properties List Tab */}
        <TabsContent value="properties" className="mt-0 outline-none">
          <Accordion type="multiple" className="space-y-0">
            {[...realEstateProperties].sort((a, b) => {
              if (sortOption === 'value_desc') return b.totalValue - a.totalValue;
              if (sortOption === 'name_asc') return a.name.localeCompare(b.name);
              return 0;
            }).map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                onEdit={(p) => {
                  setEditProperty(p);
                  setFormOpen(true);
                }}
                onDelete={(p) => setDeleteConfirmId(p.id)}
                onSyncGoals={(p) => syncPropertyGoals(p.id)}
              />
            ))}
          </Accordion>
        </TabsContent>

        {/* Consolidated Payment Schedule Tab */}
        <TabsContent value="schedule" className="mt-0 outline-none">
          {allPaymentsOrdered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-card">
              Chưa có kỳ thanh toán nào được ghi nhận.
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(
                allPaymentsOrdered.reduce((acc, payment) => {
                  const date = new Date(payment.dueDate);
                  const monthYear = `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
                  if (!acc[monthYear]) acc[monthYear] = [];
                  acc[monthYear].push(payment);
                  return acc;
                }, {} as Record<string, typeof allPaymentsOrdered>)
              ).map(([monthYear, payments], groupIndex) => {
                const totalForMonth = payments.reduce((sum, p) => sum + p.amount, 0);
                
                return (
                <div key={monthYear} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <h4 className="font-semibold text-lg flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-5 w-5" />
                      {monthYear}
                    </h4>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Tổng cần trả</p>
                      <p className="font-mono font-bold text-wealth-property">{formatValue(totalForMonth)}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="divide-y divide-border">
                      {payments.map((payment, i) => {
                        const daysUntil = getDaysToMaturity(payment.dueDate);
                        const isUrgent = daysUntil <= 30 && daysUntil >= 0;
                        const isPast = daysUntil < 0;

                        return (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            key={`${payment.propertyId}-${payment.id}`} 
                            className={cn(
                              "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-muted/30",
                              payment.isPaid 
                                ? 'bg-profit/5' 
                                : isPast 
                                  ? 'bg-destructive/5'
                                  : isUrgent
                                    ? 'bg-warning/5'
                                    : ''
                            )}
                          >
                            <div className="flex items-start sm:items-center gap-4 flex-1">
                              <div className="shrink-0 mt-1 sm:mt-0">
                                {payment.isPaid ? (
                                  <CheckCircle2 className="h-6 w-6 text-profit" />
                                ) : isPast ? (
                                  <AlertTriangle className="h-6 w-6 text-destructive" />
                                ) : isUrgent ? (
                                  <AlertTriangle className="h-6 w-6 text-warning" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 m-0.5" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={cn(
                                    "text-sm font-semibold uppercase tracking-wider",
                                    payment.isPaid ? "text-profit/80" : "text-muted-foreground"
                                  )}>
                                    {formatDateVN(payment.dueDate)}
                                  </span>
                                  <span className="text-muted-foreground/30 hidden sm:inline">•</span>
                                  <h4 className="font-semibold text-sm flex items-center gap-1.5 break-all sm:break-normal">
                                    <Building2 className={cn("h-3.5 w-3.5 shrink-0", payment.isPaid ? 'text-profit' : 'text-wealth-property')} />
                                    <span>{payment.propertyName}</span>
                                  </h4>
                                </div>
                                {payment.note && <p className="text-xs text-muted-foreground italic line-clamp-1">"{payment.note}"</p>}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3 pl-10 sm:pl-0 border-t sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0 border-border/50">
                              <div className="text-left sm:text-right w-full">
                                <p className={cn("font-mono font-bold text-base sm:text-lg", payment.isPaid ? 'text-profit' : '')}>
                                  {formatValue(payment.amount)}
                                </p>
                                {!payment.isPaid && (
                                  <p className={cn("text-xs font-medium mt-0.5", 
                                    isPast ? 'text-destructive' : 
                                    isUrgent ? 'text-warning' : 'text-muted-foreground'
                                  )}>
                                    {isPast 
                                      ? `Quá hạn ${Math.abs(daysUntil)} ngày`
                                      : `Còn ${daysUntil} ngày`
                                    }
                                  </p>
                                )}
                                {payment.isPaid && (
                                  <p className="text-xs font-medium mt-0.5 text-profit/80">
                                    Đã hoàn tất
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
