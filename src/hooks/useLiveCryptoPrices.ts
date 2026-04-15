import { useQuery } from '@tanstack/react-query';

export type LivePricesMap = Record<string, number>; // symbol -> USD price

const fetchLivePrices = async (symbols: string[]): Promise<LivePricesMap> => {
  try {
    const binanceSymbols = symbols.map(s => `"${s}USDT"`).join(',');
    const url = `https://api.binance.com/api/v3/ticker/price?symbols=[${binanceSymbols}]`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Binance API error: ${res.statusText}`);
    const data: { symbol: string; price: string }[] = await res.json();
    return data.reduce<LivePricesMap>((acc, item) => {
      acc[item.symbol.replace('USDT', '')] = parseFloat(item.price);
      return acc;
    }, {});
  } catch (error) {
    console.error('[useLiveCryptoPrices] Failed to fetch live prices:', error);
    return {}; // fallback: component falls back to stored price
  }
};

export const useLiveCryptoPrices = (symbols: string[]) => {
  return useQuery({
    queryKey: ['liveCryptoPrices', symbols],
    queryFn: () => fetchLivePrices(symbols),
    enabled: symbols.length > 0,
    refetchInterval: 30 * 1000,
    staleTime: 30 * 1000,
  });
};
