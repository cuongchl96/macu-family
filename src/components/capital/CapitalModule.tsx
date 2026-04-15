import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, Pencil, Trash2 } from 'lucide-react';
import { formatVND, formatDateVN, formatUSD } from '@/data/wealthData';
import { useWealth } from '@/contexts/WealthContext';
import { Button } from '@/components/ui/button';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CapitalFormDialog } from './CapitalFormDialog';
import type { CapitalContribution } from '@/types/wealth';
import type { CapitalFormValues } from './CapitalFormDialog';

export const CapitalModule = () => {
  const { currency, capitalContributions, addCapitalContribution, updateCapitalContribution, deleteCapitalContribution, getTotalCapitalContribution, hideValues } = useWealth();
  const [formOpen, setFormOpen] = useState(false);
  const [editContribution, setEditContribution] = useState<CapitalContribution | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatValue = (value: number, curr?: string) => {
    if (hideValues) return '******';
    // Basic formatting assuming value logic, simple fallback if currency mismatch
    if (curr === 'USD' || currency === 'USD') {
      return formatUSD(value);
    }
    return formatVND(value);
  };

  const handleFormSubmit = (values: CapitalFormValues) => {
    if (editContribution) {
      updateCapitalContribution(editContribution.id, values);
      setEditContribution(null);
    } else {
      addCapitalContribution(values);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteCapitalContribution(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const wifeTotal = getTotalCapitalContribution('wife');
  const husbandTotal = getTotalCapitalContribution('husband');
  
  // Sort by date descending
  const wifeContributions = capitalContributions.filter(c => c.owner === 'wife').sort((a, b) => b.date.getTime() - a.date.getTime());
  const husbandContributions = capitalContributions.filter(c => c.owner === 'husband').sort((a, b) => b.date.getTime() - a.date.getTime());

  const renderTable = (personName: string, total: number, data: CapitalContribution[], type: 'wife' | 'husband') => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border bg-card overflow-hidden shadow-sm"
    >
      <div className="bg-primary/5 px-4 py-4 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold text-primary text-xl">{personName}</h3>
        <span className="font-bold text-destructive text-lg">{formatValue(total)}</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-bold text-foreground w-[120px]">Mốc</TableHead>
            <TableHead className="font-bold text-foreground text-right w-[160px]">Số tiền</TableHead>
            <TableHead className="font-bold text-foreground">Ghi chú</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Chưa có khoản đóng góp nào.</TableCell>
            </TableRow>
          ) : (
            data.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{formatDateVN(c.date)}</TableCell>
                <TableCell className="text-right font-medium text-wealth-savings">{formatValue(c.amount)}</TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate" title={c.note || 'Không có ghi chú'}>{c.note || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditContribution(c);
                        setFormOpen(true);
                      }}
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirmId(c.id)}
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </motion.div>
  );

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
            <div className="p-3 rounded-xl bg-destructive/10">
              <Wallet className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nguồn vốn gia đình</h1>
              <p className="text-muted-foreground">
                Quản lý phần vốn đóng góp vào quỹ chung
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setEditContribution(null);
                setFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm nguồn vốn
            </Button>
          </div>
        </div>
      </motion.div>

      <CapitalFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditContribution(null);
        }}
        onSubmit={handleFormSubmit}
        editContribution={editContribution}
      />

      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa khoản vốn đóng góp?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Khoản vốn này sẽ bị xóa khỏi danh sách đóng góp.
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {renderTable('Vợ', wifeTotal, wifeContributions, 'wife')}
        {renderTable('Chồng', husbandTotal, husbandContributions, 'husband')}
      </div>
    </div>
  );
};
