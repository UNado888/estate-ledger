import { Alert } from '@/types';
import { AlertItem } from '@/components/dashboard/AlertItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Bell, CheckCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationsPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  onMarkAllRead?: () => void;
  collapsed?: boolean;
}

export function NotificationsPanel({ 
  alerts, 
  onDismiss, 
  onMarkAllRead,
  collapsed = false 
}: NotificationsPanelProps) {
  const unreadCount = alerts.filter(a => !a.read).length;
  const highSeverityCount = alerts.filter(a => a.severity === 'high' && !a.read).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          <div className="relative">
            <Bell className={cn("w-5 h-5", highSeverityCount > 0 && "text-destructive")} />
            {unreadCount > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-medium",
                highSeverityCount > 0 
                  ? "bg-destructive text-destructive-foreground animate-pulse" 
                  : "bg-warning text-warning-foreground"
              )}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          {!collapsed && <span className="text-sm font-medium">Alertas</span>}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} não lidas</Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && onMarkAllRead && (
              <Button variant="ghost" size="sm" onClick={onMarkAllRead}>
                <CheckCheck className="w-4 h-4 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
          
          {highSeverityCount > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">
                ⚠️ {highSeverityCount} alerta{highSeverityCount > 1 ? 's' : ''} de alta prioridade
              </p>
            </div>
          )}
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-180px)] mt-4 pr-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertItem 
                  key={alert.id} 
                  alert={alert} 
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
