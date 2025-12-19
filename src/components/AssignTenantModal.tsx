import { useState } from 'react';
import { UserPlus, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tenant, RentalHistory } from '@/types';
import { toast } from 'sonner';

interface AssignTenantModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  tenants: Tenant[];
  onAssign: (tenantId: string, rentalData: Omit<RentalHistory, 'id' | 'paymentHistory'>) => void;
}

export function AssignTenantModal({ 
  open, 
  onClose, 
  propertyId, 
  propertyName,
  tenants,
  onAssign 
}: AssignTenantModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyRent, setMonthlyRent] = useState('');

  const availableTenants = tenants.filter(t => 
    t.status !== 'former' &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.document.includes(searchTerm))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTenant) {
      toast.error('Selecione um inquilino');
      return;
    }

    if (!monthlyRent || Number(monthlyRent) <= 0) {
      toast.error('Informe o valor do aluguel');
      return;
    }

    onAssign(selectedTenant.id, {
      propertyId,
      tenantId: selectedTenant.id,
      startDate,
      monthlyRent: Number(monthlyRent),
    });

    toast.success(`${selectedTenant.name} vinculado ao imóvel com sucesso!`);
    onClose();
    
    // Reset
    setSelectedTenant(null);
    setSearchTerm('');
    setMonthlyRent('');
    setStartDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Vincular Inquilino
          </DialogTitle>
          <DialogDescription>
            Adicionar inquilino ao imóvel: {propertyName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Tenants */}
          <div className="space-y-2">
            <Label>Buscar Inquilino</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nome ou documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tenant List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableTenants.length > 0 ? (
              availableTenants.map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => setSelectedTenant(tenant)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedTenant?.id === tenant.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">{tenant.document}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < tenant.rating
                              ? 'fill-warning text-warning'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tenant.status === 'active' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {tenant.status === 'active' ? 'Ativo' : 'Candidato'}
                    </span>
                    {tenant.hasInsurance && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        Seguro
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                Nenhum inquilino encontrado
              </p>
            )}
          </div>

          {/* Rental Details */}
          {selectedTenant && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="font-semibold text-foreground">Dados do Contrato</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Aluguel Mensal (R$)</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    placeholder="0,00"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedTenant}>
              Vincular Inquilino
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
