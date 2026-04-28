import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PiggyBank,
  Building2,
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
  Vault,
  BookOpen,
  CreditCard,
  Bell,
} from 'lucide-react';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { useWealth } from '@/contexts/WealthContext';
import { type Currency } from '@/types/wealth';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type Page = 'dashboard' | 'highlights' | 'savings' | 'capital' | 'realestate' | 'investments-gold' | 'investments-stock' | 'investments-crypto' | 'salary-planning' | 'funds' | 'loans';

interface NavigationLayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
}

type NavItem = {
  id: Page | null;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: Array<{ id: Page; label: string; icon: React.ComponentType<{ className?: string }> }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { id: 'highlights', label: 'Điểm nổi bật', icon: Sparkles },
      { id: 'capital', label: 'Nguồn vốn', icon: Wallet },
    ],
  },
  {
    label: 'Tài sản & Đầu tư',
    items: [
      { id: 'savings', label: 'Tiết kiệm', icon: PiggyBank },
      { id: 'investments-gold', label: 'Vàng', icon: Coins },
      { id: 'investments-stock', label: 'Chứng khoán', icon: LineChart },
      { id: 'investments-crypto', label: 'Tiền số', icon: Bitcoin },
      { id: 'realestate', label: 'Bất động sản', icon: Building2 },
    ],
  },
  {
    label: 'Mục tiêu chi tiêu',
    items: [
      { id: 'funds', label: 'Quỹ', icon: Vault },
    ],
  },
  {
    label: 'Kế hoạch',
    items: [
      { id: 'salary-planning', label: 'Kế hoạch tài chính', icon: Target },
    ],
  },
  {
    label: 'Nợ phải trả',
    items: [
      { id: 'loans', label: 'Khoản vay', icon: CreditCard },
    ],
  },
];

interface NavContentProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onItemClick?: () => void;
}

const NavContent = ({ currentPage, onPageChange, onItemClick }: NavContentProps) => (
  <nav className="space-y-1 flex-1">
    {navGroups.map((group, groupIndex) => (
      <div key={group.label} className={groupIndex > 0 ? 'pt-3 mt-2 border-t border-border/60' : ''}>
        <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-widest px-3 mb-1.5">
          {group.label}
        </p>
        <div className="space-y-0.5">
          {group.items.map((item) =>
            item.children ? (
              <div key={item.label}>
                <div className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground font-medium">
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.children.map((child) => (
                  <motion.button
                    key={child.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      onPageChange(child.id);
                      onItemClick?.();
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 pl-11 rounded-lg text-left transition-colors',
                      currentPage === child.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <child.icon className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{child.label}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.button
                key={item.id}
                whileHover={{ x: 3 }}
                onClick={() => {
                  if (item.id) {
                    onPageChange(item.id);
                    onItemClick?.();
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-4 w-4 shrink-0', currentPage === item.id ? '' : 'opacity-70')} />
                <span className="text-sm">{item.label}</span>
              </motion.button>
            )
          )}
        </div>
      </div>
    ))}
  </nav>
);

export const NavigationLayout = ({
  currentPage,
  onPageChange,
  children,
}: NavigationLayoutProps) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const { currency, setCurrency, currentUser, hideValues, toggleHideValues } = useWealth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

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
            title={hideValues ? 'Hiện số tiền' : 'Ẩn số tiền'}
          >
            {hideValues ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
          <button onClick={toggleTheme} className="p-2 hover:bg-muted rounded-lg">
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
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border z-50 flex flex-col p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">MacuFam</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavContent
                currentPage={currentPage}
                onPageChange={onPageChange}
                onItemClick={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[280px] bg-card border-r border-border flex-col p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">MacuFam</h1>
            <p className="text-xs text-muted-foreground">Wealth Manager</p>
          </div>
        </div>

        <NavContent currentPage={currentPage} onPageChange={onPageChange} />

        {/* Controls */}
        <div className="pt-3 border-t border-border space-y-3">

          {/* Currency */}
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger className="w-full h-8 text-sm">
              <DollarSign className="h-3.5 w-3.5 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VND">🇻🇳 VND</SelectItem>
              <SelectItem value="USD">🇺🇸 USD</SelectItem>
            </SelectContent>
          </Select>

          {/* Quick toggles — icon buttons in a row */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{isDark ? 'Light' : 'Dark'}</span>
            </button>
            <button
              onClick={toggleHideValues}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                hideValues
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {hideValues ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
              <span className="truncate">{hideValues ? 'Ẩn' : 'Hiện'}</span>
            </button>
          </div>

          {/* Secondary links */}
          <div className="space-y-0.5">
            <button
              onClick={() => navigate('/docs')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4 shrink-0 opacity-70" />
              Tài liệu
            </button>
            <button
              onClick={() => setNotifOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Bell className="h-4 w-4 shrink-0 opacity-70" />
              Thông báo Telegram
            </button>
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5 px-1 pt-2 border-t border-border">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium truncate">{currentUser?.name}</span>
          </div>
        </div>
      </aside>

      <NotificationSettings open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
