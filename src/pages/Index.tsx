import { useState, Component } from 'react';
import type { ReactNode } from 'react';
import { WealthProvider, useWealth } from '@/contexts/WealthContext';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-destructive">
          <p className="font-bold">Runtime Error in page:</p>
          <pre className="text-xs mt-2 whitespace-pre-wrap">{this.state.error.message}</pre>
          <pre className="text-xs mt-2 whitespace-pre-wrap opacity-70">{this.state.error.stack}</pre>
          <button className="mt-4 underline text-sm" onClick={() => this.setState({ error: null })}>Thử lại</button>
        </div>
      );
    }
    return this.props.children;
  }
}

import { NavigationLayout, type Page } from '@/components/layout/NavigationLayout';
import { ExecutiveDashboard } from '@/components/dashboard/ExecutiveDashboard';
import { HighlightsModule } from '@/components/highlights/HighlightsModule';
import { SavingsModule } from '@/components/savings/SavingsModule';
import { CapitalModule } from '@/components/capital/CapitalModule';
import { RealEstateModule } from '@/components/realestate/RealEstateModule';
import { GoldModule } from '@/components/investments/GoldModule';
import { StockModule } from '@/components/investments/StockModule';
import { CryptoModule } from '@/components/investments/CryptoModule';
import { SalaryPlanningModule } from '@/components/salary/SalaryPlanningModule';
import { FundsModule } from '@/components/funds/FundsModule';
import { LoansModule } from '@/components/loans/LoansModule';
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
      case 'salary-planning':
        return <SalaryPlanningModule onNavigateToSavings={() => setCurrentPage('savings')} />;
      case 'funds':
        return <FundsModule />;
      case 'loans':
        return <LoansModule />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <NavigationLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      <ErrorBoundary key={currentPage}>
        {renderPage()}
      </ErrorBoundary>
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
