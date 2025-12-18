import { Tenant } from '@/types';
import { cn } from '@/lib/utils';
import { Star, Mail, Phone, Shield, ShieldAlert, User, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TenantCardProps {
  tenant: Tenant;
  onClick?: () => void;
}

const statusConfig = {
  active: { label: 'Ativo', className: 'bg-success text-success-foreground' },
  former: { label: 'Antigo', className: 'bg-secondary text-secondary-foreground' },
  candidate: { label: 'Candidato', className: 'bg-primary text-primary-foreground' },
};

export function TenantCard({ tenant, onClick }: TenantCardProps) {
  const status = statusConfig[tenant.status];

  return (
    <div 
      onClick={onClick}
      className="bg-card rounded-xl border border-border p-4 card-hover cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {tenant.documentType === 'cpf' ? (
            <User className="w-6 h-6 text-primary" />
          ) : (
            <Building className="w-6 h-6 text-primary" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">{tenant.name}</h3>
              <p className="text-sm text-muted-foreground">{tenant.document}</p>
            </div>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "w-4 h-4",
                  i < tenant.rating 
                    ? "fill-warning text-warning" 
                    : "text-muted-foreground/30"
                )} 
              />
            ))}
          </div>

          {/* Contact */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">{tenant.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{tenant.phone}</span>
            </div>
          </div>

          {/* Insurance */}
          <div className="mt-3 flex items-center gap-1.5">
            {tenant.hasInsurance ? (
              <>
                <Shield className="w-4 h-4 text-success" />
                <span className="text-sm text-success">Seguro ativo</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-warning" />
                <span className="text-sm text-warning">Sem seguro</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
