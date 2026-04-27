import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useWealth } from '@/contexts/WealthContext';
import { Target } from 'lucide-react';

const MONTHS_VI = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const fmtMonth = (m: string) => {
  const [y, mo] = m.split('-');
  return `${MONTHS_VI[+mo - 1]}/${y.slice(2)}`;
};
const FMT = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'tr';
  return n.toLocaleString('vi-VN') + 'đ';
};
const FMT_FULL = (n: number) => n.toLocaleString('vi-VN') + 'đ';

interface MonthData {
  month: string;
  label: string;
  totalTarget: number;
  totalSaved: number;
  remaining: number;
  goals: Array<{ name: string; target: number; saved: number }>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as MonthData;
  if (!data) return null;
  return (
    <div className="bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-4 max-w-[320px]">
      <p className="font-semibold text-sm mb-2">{data.label}</p>
      <div className="space-y-1.5 mb-3">
        {data.goals.map((g, i) => (
          <div key={i} className="text-xs">
            <p className="font-medium truncate">{g.name}</p>
            <div className="flex justify-between text-muted-foreground">
              <span>Cần: {FMT_FULL(g.target)}</span>
              <span className="text-profit">Đã gom: {FMT_FULL(g.saved)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-2 text-xs space-y-1">
        <div className="flex justify-between"><span>Tổng cần trả:</span><span className="font-mono font-semibold">{FMT_FULL(data.totalTarget)}</span></div>
        <div className="flex justify-between"><span className="text-profit">Đã tích lũy:</span><span className="font-mono font-semibold text-profit">{FMT_FULL(data.totalSaved)}</span></div>
        {data.remaining > 0 && (
          <div className="flex justify-between"><span className="text-destructive">Còn thiếu:</span><span className="font-mono font-semibold text-destructive">{FMT_FULL(data.remaining)}</span></div>
        )}
      </div>
    </div>
  );
};

export const GoalsBarChart = () => {
  const { financialGoals, savingsDeposits, hideValues } = useWealth();

  const chartData = useMemo(() => {
    // Group goals by month
    const monthMap = new Map<string, MonthData>();

    financialGoals.forEach(goal => {
      if (!goal.dueDate) return;
      const d = new Date(goal.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const goalSavings = savingsDeposits.filter(sd => sd.goalId === goal.id);
      const saved = goalSavings.reduce((s, sd) => s + sd.principal, 0);

      if (!monthMap.has(key)) {
        monthMap.set(key, {
          month: key,
          label: fmtMonth(key),
          totalTarget: 0,
          totalSaved: 0,
          remaining: 0,
          goals: [],
        });
      }
      const entry = monthMap.get(key)!;
      entry.totalTarget += goal.targetAmount;
      entry.totalSaved += Math.min(saved, goal.targetAmount);
      entry.remaining = Math.max(entry.totalTarget - entry.totalSaved, 0);
      entry.goals.push({ name: goal.name, target: goal.targetAmount, saved });
    });

    return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [financialGoals, savingsDeposits]);

  if (chartData.length === 0) return null;

  const maxValue = Math.max(...chartData.map(d => d.totalTarget));

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Lịch Thanh Toán Theo Tháng</h3>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span>Đã tích lũy (sổ tiết kiệm)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-rose-400/60" />
          <span>Còn thiếu</span>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%" barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => hideValues ? '***' : FMT(v)}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
            <Bar dataKey="totalSaved" stackId="a" fill="hsl(160, 84%, 45%)" radius={[0, 0, 0, 0]} name="Đã tích lũy" />
            <Bar dataKey="remaining" stackId="a" fill="hsl(0, 70%, 72%)" radius={[4, 4, 0, 0]} name="Còn thiếu" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
