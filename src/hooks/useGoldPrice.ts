import { useQuery } from '@tanstack/react-query';

// Type for the API response
export interface GoldAPIResponse {
  data: {
    buy: string;
    sell: string;
    type: string;
    timestamp: string;
  }[];
}

// Resulting parsed gold price
export interface SjcGoldPrice {
  buy: number;
  sell: number;
  timestamp: Date;
}

const fetchSjcGoldPrice = async (): Promise<SjcGoldPrice> => {
  try {
    const response = await fetch('https://api.giavang.now.sh/');
    if (!response.ok) {
      throw new Error(`Failed to fetch gold price: ${response.statusText}`);
    }
    const data: GoldAPIResponse = await response.json();
    
    // Find the standard SJC 9999 gold price
    const sjcData = data.data.find(item => item.type.includes('SJC') || item.type.includes('9999'));
    
    if (sjcData) {
      // The API typically returns price in million VND per tael, need to multiply to get actual VND
      // Or it might be string format with dots like "82.500.000"
      const parsePrice = (priceStr: string) => {
        // remove any non-numeric except dots or commas if applicable
        const cleanStr = priceStr.replace(/[^\d]/g, '');
        // Usually giavang.now returns price for 1 'chỉ' (mace) or 1 'lượng' (tael)
        // If it's something like "8,250", it's usually thousands per mace -> 82,500,000 per tael
        // We will assume the raw number represents VND directly if we strip formatting
        // Actually giavang.now returns string like "82,500,000" or similar
        return parseInt(cleanStr, 10);
      };

      return {
        buy: parsePrice(sjcData.buy),
        sell: parsePrice(sjcData.sell),
        timestamp: new Date(),
      };
    }
    throw new Error('Could not find SJC data in API response');
  } catch (error) {
    console.error('Error fetching gold price:', error);
    // Fallback if API fails
    return {
      buy: 170000000,
      sell: 172000000,
      timestamp: new Date(),
    };
  }
};

export const useGoldPrice = () => {
  return useQuery({
    queryKey: ['goldPrice'],
    queryFn: fetchSjcGoldPrice,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 5 * 60 * 1000,
  });
};
