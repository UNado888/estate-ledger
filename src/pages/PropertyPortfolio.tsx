import { useState, useMemo } from 'react';
import { Plus, Search, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PropertyCard } from '@/components/PropertyCard';
import { mockProperties as initialProperties, mockTenants as initialTenants, mockRentalHistory } from '@/data/mockData';
import { Property, Tenant, UtilityPaymentRecord } from '@/types';
import { usePaymentAlerts } from '@/hooks/usePaymentAlerts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyDetailModal } from '@/components/PropertyDetailModal';
import { AddPropertyModal } from '@/components/AddPropertyModal';
import { EditPropertyModal } from '@/components/EditPropertyModal';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function PropertyPortfolio() {
  const [properties, setProperties] = useLocalStorage<Property[]>('imobiliaria-properties', initialProperties);
  const [tenants] = useLocalStorage<Tenant[]>('imobiliaria-tenants', initialTenants);
  const [utilityPayments] = useLocalStorage<UtilityPaymentRecord[]>('imobiliaria-utility-payments', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Generate alerts and count per property
  const alerts = usePaymentAlerts({ properties, rentalHistory: mockRentalHistory, utilityPayments });
  const alertsByProperty = useMemo(() => {
    const map: Record<string, number> = {};
    alerts.forEach(a => {
      if (a.propertyId) {
        map[a.propertyId] = (map[a.propertyId] || 0) + 1;
      }
    });
    return map;
  }, [alerts]);

  // Calculate summary stats
  const totalValue = filteredProperties.reduce((sum, p) => sum + p.currentMarketValue, 0);
  const avgRoi = filteredProperties.length > 0 
    ? filteredProperties.reduce((sum, p) => sum + ((p.monthlyRent * 12) / (p.acquisitionCost + p.renovationCost) * 100), 0) / filteredProperties.length 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAddProperty = (newProperty: Property) => {
    setProperties(prev => [...prev, newProperty]);
  };

  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties(prev => 
      prev.map(p => p.id === updatedProperty.id ? updatedProperty : p)
    );
    setSelectedProperty(updatedProperty);
  };

  const handleDeleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setSelectedProperty(null);
    toast.success('Imóvel excluído com sucesso!');
  };

  const handleEditProperty = () => {
    if (selectedProperty) {
      setEditingProperty(selectedProperty);
    }
  };

  const handleSaveEditedProperty = (updatedProperty: Property) => {
    setProperties(prev => 
      prev.map(p => p.id === updatedProperty.id ? updatedProperty : p)
    );
    setSelectedProperty(updatedProperty);
    setEditingProperty(null);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Portfólio de Imóveis</h1>
          <p className="text-muted-foreground">
            {filteredProperties.length} imóveis • Valor total: {formatCurrency(totalValue)} • ROI médio: {avgRoi.toFixed(2)}%
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" />
          Novo Imóvel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, endereço ou cidade..."
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
            <SelectItem value="rented">Alugado</SelectItem>
            <SelectItem value="vacant">Vago</SelectItem>
            <SelectItem value="renovation">Em Reforma</SelectItem>
            <SelectItem value="sale">À Venda</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Tipos</SelectItem>
            <SelectItem value="apartment">Apartamento</SelectItem>
            <SelectItem value="kitnet">Kitnet</SelectItem>
            <SelectItem value="house">Casa</SelectItem>
            <SelectItem value="commercial">Sala Comercial</SelectItem>
            <SelectItem value="land">Terreno</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="w-8 h-8"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="w-8 h-8"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        : "space-y-4"
      }>
        {filteredProperties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property}
            alertCount={alertsByProperty[property.id] || 0}
            onClick={() => setSelectedProperty(property)}
          />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum imóvel encontrado com os filtros selecionados.</p>
        </div>
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal 
          property={selectedProperty} 
          onClose={() => setSelectedProperty(null)}
          onUpdateProperty={handleUpdateProperty}
          onDeleteProperty={() => handleDeleteProperty(selectedProperty.id)}
          onEditProperty={handleEditProperty}
          allTenants={tenants}
        />
      )}

      {/* Add Property Modal */}
      <AddPropertyModal 
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProperty}
      />

      {/* Edit Property Modal */}
      <EditPropertyModal
        open={!!editingProperty}
        property={editingProperty}
        onClose={() => setEditingProperty(null)}
        onSave={handleSaveEditedProperty}
      />
    </div>
  );
}
