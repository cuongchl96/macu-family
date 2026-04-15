import { useState } from 'react';
import { WealthProvider, useWealth } from '@/contexts/WealthContext';

import { NavigationLayout, type Page } from '@/components/layout/NavigationLayout';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { HighlightsModule } from '@/components/highlights/HighlightsModule';
import { SavingsModule } from '@/components/savings/SavingsModule';
import { CapitalModule } from '@/components/capital/CapitalModule';
import { RealEstateModule } from '@/components/realestate/RealEstateModule';
import { GoldModule } from '@/components/investments/GoldModule';
import { StockModule } from '@/components/investments/StockModule';
import { CryptoModule } from '@/components/investments/CryptoModule';
import { Loader2 } from 'lucide-react';

const WealthApp = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'highlights':
        return <HighlightsModule />;
      case 'savings':
        return <SavingsModule />;
      case 'capital':
        return <CapitalModule />;
      case 'realestate':
        return <RealEstateModule />;
      case 'investments-gold':
        return <GoldModule />;
      case 'investments-stock':
        return <StockModule />;
      case 'investments-crypto':
        return <CryptoModule />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <NavigationLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </NavigationLayout>
  );
};

const Index = () => {
  return (
    <WealthProvider>
      <WealthApp />
    </WealthProvider>
  );
};

export default Index;
