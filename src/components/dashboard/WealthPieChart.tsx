import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatVND, vndToUsd, formatUSD } from '@/data/wealthData';
import { useWealth } from '@/contexts/WealthContext';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface WealthPieChartProps {
  data: ChartData[];
}

const COLORS = [
  'hsl(160, 84%, 45%)', // savings - emerald
  'hsl(45, 93%, 55%)',  // gold
  'hsl(271, 81%, 65%)', // crypto - purple
  'hsl(199, 89%, 55%)', // property - blue
];

export const WealthPieChart = ({ data }: WealthPieChartProps) => {
  const { currency, hideValues } = useWealth();

  const formatValue = (value: number) => {
    if (hideValues) return '******';
    if (currency === 'USD') {
      return formatUSD(vndToUsd(value));
    }
    return formatVND(value);
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Asset Distribution</h3>
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-1/2 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                animationBegin={200}
                animationDuration={800}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / total) * 100).toFixed(1);
                    return (
                      <div className="bg-popover border border-border rounded-lg px-4 py-3 shadow-xl">
                        <p className="font-semibold text-sm">{data.name}</p>
                        <p className="text-lg font-mono font-bold">
                          {formatValue(data.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage}% of portfolio
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full lg:w-1/2 space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-sm">
                    {formatValue(item.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
