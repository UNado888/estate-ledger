import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  const trendColor = trend && trend.value >= 0 ? 'stat-positive' : 'stat-negative';
  
  return (
    <div className={cn(
      "bg-card rounded-xl p-5 border border-border card-hover",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            variant === 'success' && "bg-success/10 text-success",
            variant === 'warning' && "bg-warning/10 text-warning",
            variant === 'danger' && "bg-destructive/10 text-destructive",
            variant === 'default' && "bg-primary/10 text-primary"
          )}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
        
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-sm">
            {trend && (
              <span className={cn("font-medium", trendColor)}>
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
            )}
            {subtitle && (
              <span className="text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
