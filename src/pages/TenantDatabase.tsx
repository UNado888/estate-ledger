import { useState } from 'react';
import { Plus, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TenantCard } from '@/components/tenants/TenantCard';
import { mockTenants as initialTenants } from '@/data/mockData';
import { Tenant } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddTenantModal } from '@/components/tenants/AddTenantModal';
import { EditTenantModal } from '@/components/tenants/EditTenantModal';
import { TenantDetailModal } from '@/components/tenants/TenantDetailModal';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function TenantDatabase() {
  const [tenants, setTenants] = useLocalStorage<Tenant[]>('imobiliaria-tenants', initialTenants);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.document.includes(searchTerm) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || tenant.rating >= parseInt(ratingFilter);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const activeCount = tenants.filter(t => t.status === 'active').length;
  const formerCount = tenants.filter(t => t.status === 'former').length;
  const candidateCount = tenants.filter(t => t.status === 'candidate').length;

  const handleAddTenant = (newTenant: Tenant) => {
    setTenants(prev => [...prev, newTenant]);
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {
    setTenants(prev => 
      prev.map(t => t.id === updatedTenant.id ? updatedTenant : t)
    );
    setSelectedTenant(updatedTenant);
    setEditingTenant(null);
  };

  const handleDeleteTenant = (tenantId: string) => {
    setTenants(prev => prev.filter(t => t.id !== tenantId));
    setSelectedTenant(null);
    toast.success('Inquilino excluído com sucesso!');
  };

  const handleEditTenant = () => {
    if (selectedTenant) {
      setEditingTenant(selectedTenant);
      setSelectedTenant(null);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Banco de Inquilinos</h1>
          <p className="text-muted-foreground">
            {activeCount} ativos • {formerCount} antigos • {candidateCount} candidatos
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Novo Inquilino
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="former">Antigos</SelectItem>
            <SelectItem value="candidate">Candidatos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Avaliação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Avaliações</SelectItem>
            <SelectItem value="5">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-warning text-warning" /> 5 estrelas
              </div>
            </SelectItem>
            <SelectItem value="4">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-warning text-warning" /> 4+ estrelas
              </div>
            </SelectItem>
            <SelectItem value="3">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-warning text-warning" /> 3+ estrelas
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTenants.map((tenant) => (
          <TenantCard 
            key={tenant.id} 
            tenant={tenant} 
            onClick={() => setSelectedTenant(tenant)}
          />
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum inquilino encontrado com os filtros selecionados.</p>
        </div>
      )}

      {/* Add Tenant Modal */}
      <AddTenantModal 
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTenant}
      />

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <TenantDetailModal
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
          onEdit={handleEditTenant}
          onDelete={() => handleDeleteTenant(selectedTenant.id)}
        />
      )}

      {/* Edit Tenant Modal */}
      <EditTenantModal
        open={!!editingTenant}
        tenant={editingTenant}
        onClose={() => setEditingTenant(null)}
        onSave={handleUpdateTenant}
      />
    </div>
  );
}
