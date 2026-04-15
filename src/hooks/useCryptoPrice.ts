import { useQuery } from '@tanstack/react-query';

export interface CryptoPrice {
  symbol: string;
  price: number;
}

const fetchCryptoPrices = async (): Promise<CryptoPrice[]> => {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","BNBUSDT"]');
    if (!response.ok) {
      throw new Error(`Failed to fetch crypto prices: ${response.statusText}`);
    }
    const data: { symbol: string, price: string }[] = await response.json();
    
    return data.map(item => ({
      symbol: item.symbol.replace('USDT', ''), // Convert BTCUSDT to BTC
      price: parseFloat(item.price)
    }));
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    // Fallback if API fails
    return [
      { symbol: 'BTC', price: 65000 },
      { symbol: 'ETH', price: 3500 },
      { symbol: 'BNB', price: 600 }
    ];
  }
};

export const useCryptoPrice = () => {
  return useQuery({
    queryKey: ['cryptoPrices'],
    queryFn: fetchCryptoPrices,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    staleTime: 30 * 1000,
  });
};
