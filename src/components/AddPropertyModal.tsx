import { useState } from 'react';
import { X, Building2, Home, Store, MapPin, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UtilitiesConfig, defaultUtilities } from '@/components/UtilitiesConfig';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Property, PropertyUtilities, UtilityResponsible } from '@/types';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface AddPropertyModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (property: Property) => void;
}

const propertyTypes = [
  { value: 'apartment', label: 'Apartamento', icon: Building2 },
  { value: 'house', label: 'Casa', icon: Home },
  { value: 'commercial', label: 'Sala Comercial', icon: Store },
  { value: 'kitnet', label: 'Kitnet', icon: Warehouse },
  { value: 'land', label: 'Terreno', icon: MapPin },
];

const statusOptions = [
  { value: 'vacant', label: 'Vago' },
  { value: 'rented', label: 'Alugado' },
  { value: 'renovation', label: 'Em Reforma' },
  { value: 'sale', label: 'À Venda' },
];

export function AddPropertyModal({ open, onClose, onAdd }: AddPropertyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    type: 'apartment' as Property['type'],
    status: 'vacant' as Property['status'],
    totalArea: '',
    usefulArea: '',
    bedrooms: '',
    suites: '',
    bathrooms: '',
    parkingSpaces: '',
    acquisitionCost: '',
    renovationCost: '',
    currentMarketValue: '',
    monthlyRent: '',
    iptu: '',
    condoFee: '',
    acquisitionDate: '',
    utilities: defaultUtilities,
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.city) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const newProperty: Property = {
      id: Date.now().toString(),
      name: formData.name,
      address: formData.address,
      city: formData.city,
      type: formData.type,
      status: formData.status,
      totalArea: Number(formData.totalArea) || 0,
      usefulArea: Number(formData.usefulArea) || 0,
      bedrooms: Number(formData.bedrooms) || 0,
      suites: Number(formData.suites) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      parkingSpaces: Number(formData.parkingSpaces) || 0,
      acquisitionCost: Number(formData.acquisitionCost) || 0,
      renovationCost: Number(formData.renovationCost) || 0,
      currentMarketValue: Number(formData.currentMarketValue) || 0,
      monthlyRent: Number(formData.monthlyRent) || 0,
      iptu: Number(formData.iptu) || 0,
      condoFee: Number(formData.condoFee) || 0,
      acquisitionDate: formData.acquisitionDate || new Date().toISOString().split('T')[0],
      utilities: formData.utilities,
    };

    onAdd(newProperty);
    toast.success('Imóvel adicionado com sucesso!');
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      address: '',
      city: '',
      type: 'apartment',
      status: 'vacant',
      totalArea: '',
      usefulArea: '',
      bedrooms: '',
      suites: '',
      bathrooms: '',
      parkingSpaces: '',
      acquisitionCost: '',
      renovationCost: '',
      currentMarketValue: '',
      monthlyRent: '',
      iptu: '',
      condoFee: '',
      acquisitionDate: '',
      utilities: defaultUtilities,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Novo Imóvel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Type Selection */}
          <div className="space-y-2">
            <Label>Tipo de Imóvel *</Label>
            <div className="grid grid-cols-5 gap-2">
              {propertyTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange('type', value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    formData.type === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Imóvel *</Label>
              <Input
                id="name"
                placeholder="Ex: Apartamento Centro"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                placeholder="Rua, número"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                placeholder="Cidade"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Especificações</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalArea">Área Total (m²)</Label>
                <Input
                  id="totalArea"
                  type="number"
                  value={formData.totalArea}
                  onChange={(e) => handleChange('totalArea', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usefulArea">Área Útil (m²)</Label>
                <Input
                  id="usefulArea"
                  type="number"
                  value={formData.usefulArea}
                  onChange={(e) => handleChange('usefulArea', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Quartos</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleChange('bedrooms', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suites">Suítes</Label>
                <Input
                  id="suites"
                  type="number"
                  value={formData.suites}
                  onChange={(e) => handleChange('suites', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Banheiros</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleChange('bathrooms', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parkingSpaces">Vagas</Label>
                <Input
                  id="parkingSpaces"
                  type="number"
                  value={formData.parkingSpaces}
                  onChange={(e) => handleChange('parkingSpaces', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Informações Financeiras</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acquisitionCost">Custo de Aquisição</Label>
                <Input
                  id="acquisitionCost"
                  type="number"
                  placeholder="R$"
                  value={formData.acquisitionCost}
                  onChange={(e) => handleChange('acquisitionCost', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="renovationCost">Custo de Reforma</Label>
                <Input
                  id="renovationCost"
                  type="number"
                  placeholder="R$"
                  value={formData.renovationCost}
                  onChange={(e) => handleChange('renovationCost', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentMarketValue">Valor de Mercado</Label>
                <Input
                  id="currentMarketValue"
                  type="number"
                  placeholder="R$"
                  value={formData.currentMarketValue}
                  onChange={(e) => handleChange('currentMarketValue', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyRent">Aluguel Mensal</Label>
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="R$"
                  value={formData.monthlyRent}
                  onChange={(e) => handleChange('monthlyRent', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iptu">IPTU Mensal</Label>
                <Input
                  id="iptu"
                  type="number"
                  placeholder="R$"
                  value={formData.iptu}
                  onChange={(e) => handleChange('iptu', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condoFee">Condomínio</Label>
                <Input
                  id="condoFee"
                  type="number"
                  placeholder="R$"
                  value={formData.condoFee}
                  onChange={(e) => handleChange('condoFee', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Acquisition Date */}
          <div className="space-y-2">
            <Label htmlFor="acquisitionDate">Data de Aquisição</Label>
            <Input
              id="acquisitionDate"
              type="date"
              value={formData.acquisitionDate}
              onChange={(e) => handleChange('acquisitionDate', e.target.value)}
            />
          </div>

          {/* Utilities */}
          <UtilitiesConfig
            utilities={formData.utilities}
            onChange={(utilities) => setFormData(prev => ({ ...prev, utilities }))}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Adicionar Imóvel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
