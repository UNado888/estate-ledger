import { Alert } from '@/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, Wrench, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertItemProps {
  alert: Alert;
  onDismiss?: (id: string) => void;
}

const typeConfig = {
  delinquency: { icon: AlertTriangle, color: 'text-destructive bg-destructive/10' },
  vacancy: { icon: Clock, color: 'text-warning bg-warning/10' },
  maintenance: { icon: Wrench, color: 'text-primary bg-primary/10' },
  contract: { icon: FileText, color: 'text-success bg-success/10' },
};

const severityBorder = {
  high: 'border-l-destructive',
  medium: 'border-l-warning',
  low: 'border-l-muted-foreground',
};

export function AlertItem({ alert, onDismiss }: AlertItemProps) {
  const config = typeConfig[alert.type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "bg-card rounded-lg border border-border border-l-4 p-4",
      severityBorder[alert.severity],
      alert.read && "opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.color)}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground text-sm">{alert.title}</h4>
            {onDismiss && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-6 h-6 -mt-1 -mr-1"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
          <span className="text-xs text-muted-foreground mt-2 block">
            {new Date(alert.date).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
}
