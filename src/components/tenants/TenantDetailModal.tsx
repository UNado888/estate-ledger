import { Tenant } from '@/types';
import { X, Star, Mail, Phone, Shield, ShieldAlert, User, Building, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TenantDetailModalProps {
  tenant: Tenant;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const statusConfig = {
  active: { label: 'Ativo', className: 'bg-success text-success-foreground' },
  former: { label: 'Antigo', className: 'bg-secondary text-secondary-foreground' },
  candidate: { label: 'Candidato', className: 'bg-primary text-primary-foreground' },
};

export function TenantDetailModal({ tenant, onClose, onEdit, onDelete }: TenantDetailModalProps) {
  const status = statusConfig[tenant.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {tenant.documentType === 'cpf' ? (
                  <User className="w-8 h-8 text-primary" />
                ) : (
                  <Building className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">{tenant.name}</h2>
                <p className="text-muted-foreground">{tenant.document}</p>
                <Badge className={cn("mt-2", status.className)}>{status.label}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Avaliação:</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-5 h-5",
                    i < tenant.rating 
                      ? "fill-warning text-warning" 
                      : "text-muted-foreground/30"
                  )} 
                />
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Contato</h3>
            <div className="grid gap-2">
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{tenant.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{tenant.phone}</span>
              </div>
            </div>
          </div>

          {/* Guarantor Info */}
          {tenant.guarantorName && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Fiador</h3>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="font-medium">{tenant.guarantorName}</p>
                {tenant.guarantorDocument && (
                  <p className="text-sm text-muted-foreground">{tenant.guarantorDocument}</p>
                )}
              </div>
            </div>
          )}

          {/* Insurance */}
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            {tenant.hasInsurance ? (
              <>
                <Shield className="w-5 h-5 text-success" />
                <span className="text-success font-medium">Seguro fiança ativo</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 text-warning" />
                <span className="text-warning font-medium">Sem seguro fiança</span>
              </>
            )}
          </div>

          {/* Notes */}
          {tenant.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Observações</h3>
              <p className="text-muted-foreground p-3 bg-secondary/50 rounded-lg">{tenant.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={onEdit}>
            <Edit className="w-4 h-4" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1 gap-2">
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir inquilino?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O inquilino "{tenant.name}" será removido permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
