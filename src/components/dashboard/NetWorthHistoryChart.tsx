import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useWealth } from '@/contexts/WealthContext';
import { formatVND, formatUSD, vndToUsd } from '@/data/wealthData';

const formatShort = (value: number, inUSD: boolean) => {
  const v = inUSD ? vndToUsd(value) : value;
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  return v.toLocaleString('vi-VN');
};

const monthLabel = (yyyymm: string) => {
  const [year, month] = yyyymm.split('-');
  return `T${month}/${year.slice(2)}`;
};

export const NetWorthHistoryChart = () => {
  const { netWorthSnapshots, currency, hideValues } = useWealth();

  if (netWorthSnapshots.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <p className="text-sm text-muted-foreground">Chưa đủ dữ liệu lịch sử</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Dữ liệu sẽ tích lũy mỗi tháng bạn mở app
        </p>
      </div>
    );
  }

  const inUSD = currency === 'USD';
  const data = netWorthSnapshots.map(s => ({
    month: monthLabel(s.snapshotDate),
    'Net Worth': inUSD ? vndToUsd(s.netWorth) : s.netWorth,
    'Tài sản': inUSD ? vndToUsd(s.totalAssets) : s.totalAssets,
    'Dư nợ': inUSD ? vndToUsd(s.totalLiabilities) : s.totalLiabilities,
  }));

  const formatTick = (v: number) => formatShort(inUSD ? v : v, inUSD);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs space-y-1">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between gap-4">
            <span style={{ color: p.color }}>{p.name}</span>
            <span className="font-mono">
              {hideValues ? '***' : (inUSD ? formatUSD(p.value) : formatVND(inUSD ? p.value : p.value))}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
        <YAxis tickFormatter={formatTick} tick={{ fontSize: 10 }} width={48} className="fill-muted-foreground" />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="Tài sản" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Dư nợ" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} strokeDasharray="4 4" />
        <Line type="monotone" dataKey="Net Worth" stroke="hsl(160, 84%, 45%)" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
