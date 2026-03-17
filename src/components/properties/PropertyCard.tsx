import { Property, Alert } from '@/types';
import { cn } from '@/lib/utils';
import { MapPin, Bed, Bath, Car, TrendingUp, Building2, Home, Store, Mountain, Warehouse, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PropertyCardProps {
  property: Property;
  alerts?: Alert[];
  onClick?: () => void;
}

const statusConfig = {
  rented: { label: 'Alugado', variant: 'success' as const },
  vacant: { label: 'Vago', variant: 'warning' as const },
  renovation: { label: 'Em Reforma', variant: 'secondary' as const },
  sale: { label: 'À Venda', variant: 'default' as const },
};

const typeIcons: Record<Property['type'], React.ComponentType<{ className?: string }>> = {
  apartment: Building2,
  house: Home,
  commercial: Store,
  land: Mountain,
  kitnet: Warehouse,
};

export function PropertyCard({ property, alerts = [], onClick }: PropertyCardProps) {
  const alertCount = alerts.length;
  const status = statusConfig[property.status];
  const TypeIcon = typeIcons[property.type];
  
  const equity = property.currentMarketValue - (property.acquisitionCost + property.renovationCost);
  const equityPercent = ((equity / (property.acquisitionCost + property.renovationCost)) * 100).toFixed(1);
  const roi = ((property.monthlyRent * 12) / (property.acquisitionCost + property.renovationCost) * 100).toFixed(2);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div 
      onClick={onClick}
      className="bg-card rounded-xl border border-border overflow-hidden card-hover cursor-pointer group"
    >
      {/* Image/Header */}
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center overflow-hidden">
        {property.imageUrl ? (
          <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover" />
        ) : (
          <TypeIcon className="w-12 h-12 text-primary/40" />
        )}
        <Badge 
          className={cn(
            "absolute top-3 right-3",
            status.variant === 'success' && "bg-success text-success-foreground",
            status.variant === 'warning' && "bg-warning text-warning-foreground",
            status.variant === 'secondary' && "bg-secondary text-secondary-foreground",
            status.variant === 'default' && "bg-primary text-primary-foreground"
          )}
        >
          {status.label}
        </Badge>
        {alertCount > 0 && (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <div 
                className="absolute top-3 left-3 flex items-center gap-1 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs font-medium animate-pulse cursor-help z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <AlertTriangle className="w-3 h-3" />
                {alertCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-xs z-[60]" sideOffset={8}>
              <div className="space-y-1 p-0.5">
                <p className="font-semibold text-sm">{alertCount} alerta{alertCount > 1 ? 's' : ''} pendente{alertCount > 1 ? 's' : ''}</p>
                {alerts.slice(0, 3).map((alert) => (
                  <p key={alert.id} className="text-xs text-popover-foreground/80">
                    • {alert.title}
                  </p>
                ))}
                {alertCount > 3 && (
                  <p className="text-xs text-popover-foreground/60 italic">e mais {alertCount - 3}...</p>
                )}
                <p className="text-xs text-popover-foreground/50 mt-1">Clique para ver detalhes</p>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{property.city}</span>
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Car className="w-4 h-4" />
            <span>{property.parkingSpaces}</span>
          </div>
          <span className="text-xs">{property.usefulArea}m²</span>
        </div>

        {/* Financial */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Aluguel</span>
            <span className="font-semibold text-foreground">{formatCurrency(property.monthlyRent)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">ROI Anual</span>
            <span className="font-semibold text-success">{roi}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Valorização</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <span className="font-semibold text-success">+{equityPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
