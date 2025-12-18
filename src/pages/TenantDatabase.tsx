import { useState } from 'react';
import { Plus, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TenantCard } from '@/components/TenantCard';
import { mockTenants } from '@/data/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TenantDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const filteredTenants = mockTenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.document.includes(searchTerm) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesRating = ratingFilter === 'all' || tenant.rating >= parseInt(ratingFilter);
    return matchesSearch && matchesStatus && matchesRating;
  });

  const activeCount = mockTenants.filter(t => t.status === 'active').length;
  const formerCount = mockTenants.filter(t => t.status === 'former').length;
  const candidateCount = mockTenants.filter(t => t.status === 'candidate').length;

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
        <Button className="gap-2">
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
          <TenantCard key={tenant.id} tenant={tenant} />
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum inquilino encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
}
