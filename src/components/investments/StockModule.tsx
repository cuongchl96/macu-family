import { motion } from 'framer-motion';
import { LineChart } from 'lucide-react';

export const StockModule = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/20">
            <LineChart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chứng khoán</h1>
            <p className="text-muted-foreground">Theo dõi danh mục chứng khoán (sắp có)</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-12 text-center"
      >
        <LineChart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Tính năng đang phát triển</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Phần quản lý chứng khoán sẽ được bổ sung sau. Bạn có thể theo dõi vàng và crypto ở các mục tương ứng.
        </p>
      </motion.div>
    </div>
  );
};
