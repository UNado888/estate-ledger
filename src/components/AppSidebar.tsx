import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  HardDrive,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { mockProperties, mockRentalHistory } from '@/data/mockData';
import { usePaymentAlerts } from '@/hooks/usePaymentAlerts';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { Alert, UtilityPaymentRecord } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard Global', path: '/' },
  { icon: Building2, label: 'Portfólio de Imóveis', path: '/portfolio' },
  { icon: Users, label: 'Banco de Inquilinos', path: '/tenants' },
  { icon: Receipt, label: 'Utilidades', path: '/utilities' },
  { icon: FileText, label: 'Relatórios', path: '/reports' },
  { icon: HardDrive, label: 'Backup', path: '/backup' },
];

export function AppSidebar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [utilityPayments] = useLocalStorage<UtilityPaymentRecord[]>('imobiliaria-utility-payments', []);
  
  // Generate automatic alerts based on payment status
  const paymentAlerts = usePaymentAlerts({ 
    properties: mockProperties, 
    rentalHistory: mockRentalHistory,
    utilityPayments
  });
  
  // Filter out dismissed alerts
  const activeAlerts = paymentAlerts.filter(a => !dismissedAlerts.includes(a.id));
  
  const handleDismissAlert = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
  };
  
  const handleMarkAllRead = () => {
    setDismissedAlerts(paymentAlerts.map(a => a.id));
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar flex flex-col transition-all duration-300 relative",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "p-4 border-b border-sidebar-border flex items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground text-sm">Holding</h1>
              <p className="text-xs text-sidebar-foreground/60">Imobiliária</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              "hover:bg-sidebar-accent",
              isActive 
                ? "bg-sidebar-accent text-sidebar-primary" 
                : "text-sidebar-foreground/70",
              collapsed && "justify-center px-2"
            )}
          >
            <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed && "w-5 h-5")} />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Notifications Panel */}
      <div className={cn("px-3 py-2", collapsed && "px-2")}>
        <NotificationsPanel 
          alerts={activeAlerts}
          onDismiss={handleDismissAlert}
          onMarkAllRead={handleMarkAllRead}
          collapsed={collapsed}
        />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          {!collapsed && <span className="text-sm font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </Button>
      </div>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </Button>
    </aside>
  );
}
