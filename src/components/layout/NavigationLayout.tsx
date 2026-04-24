import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PiggyBank,
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Menu,
  X,
  Sun,
  Moon,
  Coins,
  LineChart,
  Bitcoin,
  Sparkles,
  Wallet,
  Eye,
  EyeOff,
  Target,
} from 'lucide-react';
import { useWealth } from '@/contexts/WealthContext';
import { type Currency } from '@/types/wealth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type Page = 'dashboard' | 'highlights' | 'savings' | 'capital' | 'realestate' | 'investments-gold' | 'investments-stock' | 'investments-crypto' | 'salary-planning';

interface NavigationLayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
}

const navItems: Array<{
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: Array<{ id: Page; label: string; icon: React.ComponentType<{ className?: string }> }>;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'highlights', label: 'Highlights', icon: Sparkles },
  { id: 'savings', label: 'Savings', icon: PiggyBank },
  { id: 'realestate', label: 'Real Estate', icon: Building2 },
  {
    id: 'investments-gold',
    label: 'Investments',
    icon: TrendingUp,
    children: [
      { id: 'investments-gold', label: 'Gold', icon: Coins },
      { id: 'investments-stock', label: 'Stocks', icon: LineChart },
      { id: 'investments-crypto', label: 'Crypto', icon: Bitcoin },
    ],
  },
  { id: 'capital', label: 'Nguồn vốn', icon: Wallet },
  { id: 'salary-planning', label: 'Kế hoạch Lương', icon: Target },
];

export const NavigationLayout = ({
  currentPage,
  onPageChange,
  children,
}: NavigationLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { currency, setCurrency, currentUser, hideValues, toggleHideValues } = useWealth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Initialize dark mode
  useState(() => {
    document.documentElement.classList.add('dark');
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="font-bold">MacuFam Wealth</h1>
        <div className="flex items-center">
          <button
            onClick={toggleHideValues}
            className="p-2 hover:bg-muted rounded-lg"
            title={hideValues ? "Hiện số tiền" : "Ẩn số tiền"}
          >
            {hideValues ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-lg"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border z-50 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-lg">MacuFam</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) =>
                  item.children ? (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground font-medium">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            onPageChange(child.id);
                            setSidebarOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 pl-11 rounded-lg text-left transition-colors',
                            currentPage === child.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <child.icon className="h-5 w-5 shrink-0" />
                          <span className="font-medium">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      key={item.id}
                      onClick={() => {
                        onPageChange(item.id);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                        currentPage === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border flex-col p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">MacuFam</h1>
            <p className="text-xs text-muted-foreground">Wealth Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground font-medium">
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.children.map((child) => (
                  <motion.button
                    key={child.id}
                    whileHover={{ x: 4 }}
                    onClick={() => onPageChange(child.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 pl-11 rounded-lg text-left transition-colors',
                      currentPage === child.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <child.icon className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{child.label}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            )
          )}
        </nav>

        {/* Controls */}
        <div className="space-y-4 pt-4 border-t border-border">

          {/* Currency */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Currency
            </label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">🇻🇳 VND</SelectItem>
                <SelectItem value="USD">🇺🇸 USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>

          {/* Hide Values Toggle */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={toggleHideValues}
          >
            {hideValues ? <EyeOff className="h-5 w-5 mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
            {hideValues ? 'Hiện số tiền' : 'Ẩn số tiền'}
          </Button>

          {/* User & Logout */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{currentUser?.name}</span>
            </div>

          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
