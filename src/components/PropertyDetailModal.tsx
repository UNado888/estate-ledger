import { Property } from '@/types';
import { X, MapPin, Bed, Bath, Car, Calendar, TrendingUp, DollarSign, FileText, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTenants, mockFurniture, mockRentalHistory } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
}

const statusConfig = {
  rented: { label: 'Alugado', className: 'bg-success text-success-foreground' },
  vacant: { label: 'Vago', className: 'bg-warning text-warning-foreground' },
  renovation: { label: 'Em Reforma', className: 'bg-secondary text-secondary-foreground' },
  sale: { label: 'À Venda', className: 'bg-primary text-primary-foreground' },
};

export function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const status = statusConfig[property.status];
  const currentTenant = property.currentTenantId 
    ? mockTenants.find(t => t.id === property.currentTenantId)
    : null;
  const furniture = mockFurniture.filter(f => f.propertyId === property.id);
  const rentalHistory = mockRentalHistory.filter(r => r.propertyId === property.id);

  const totalInvestment = property.acquisitionCost + property.renovationCost;
  const equity = property.currentMarketValue - totalInvestment;
  const equityPercent = ((equity / totalInvestment) * 100).toFixed(1);
  const roi = ((property.monthlyRent * 12) / totalInvestment * 100).toFixed(2);
  const netMonthly = property.monthlyRent - property.iptu - property.condoFee;
  const paybackYears = (totalInvestment / (netMonthly * 12)).toFixed(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Generate equity chart data
  const equityData = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - (9 - i);
    const appreciation = 1 + (i * 0.035);
    return {
      year: year.toString(),
      investido: totalInvestment,
      valorMercado: Math.round(totalInvestment * appreciation * (0.95 + Math.random() * 0.1)),
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-display font-bold text-foreground">{property.name}</h2>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{property.address}, {property.city}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="tenant">Inquilino</TabsTrigger>
              <TabsTrigger value="inventory">Inventário</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Bed className="w-5 h-5 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{property.bedrooms}</p>
                  <p className="text-xs text-muted-foreground">Quartos</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Bath className="w-5 h-5 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{property.bathrooms}</p>
                  <p className="text-xs text-muted-foreground">Banheiros</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Car className="w-5 h-5 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{property.parkingSpaces}</p>
                  <p className="text-xs text-muted-foreground">Vagas</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Package className="w-5 h-5 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{property.usefulArea}</p>
                  <p className="text-xs text-muted-foreground">m² úteis</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Aluguel Mensal</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(property.monthlyRent)}</p>
                  <p className="text-sm text-muted-foreground">Líquido: {formatCurrency(netMonthly)}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">ROI Anual</span>
                  </div>
                  <p className="text-2xl font-bold text-success">{roi}%</p>
                  <p className="text-sm text-muted-foreground">Payback: {paybackYears} anos</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Aquisição</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{new Date(property.acquisitionDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(property.acquisitionCost)}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              {/* Equity Chart */}
              <div className="bg-secondary/30 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Evolução do Equity (10 anos)</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityData}>
                      <defs>
                        <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        formatter={(value: number) => [formatCurrency(value), '']}
                      />
                      <Area type="monotone" dataKey="investido" stroke="hsl(var(--muted-foreground))" fill="none" strokeDasharray="5 5" name="Investido" />
                      <Area type="monotone" dataKey="valorMercado" stroke="hsl(142, 71%, 45%)" fillOpacity={1} fill="url(#colorValor)" name="Valor de Mercado" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DRE */}
              <div className="bg-secondary/30 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">DRE Mensal</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Receita Bruta</span>
                    <span className="font-medium text-foreground">{formatCurrency(property.monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border text-destructive">
                    <span>(-) IPTU</span>
                    <span>{formatCurrency(property.iptu)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border text-destructive">
                    <span>(-) Condomínio</span>
                    <span>{formatCurrency(property.condoFee)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border text-destructive">
                    <span>(-) IR (estimado)</span>
                    <span>{formatCurrency(property.monthlyRent * 0.05)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-success/10 rounded-lg px-3">
                    <span className="font-semibold text-success">Lucro Líquido</span>
                    <span className="font-bold text-success">{formatCurrency(netMonthly - property.monthlyRent * 0.05)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tenant" className="space-y-6">
              {currentTenant ? (
                <div className="bg-secondary/30 rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">Inquilino Atual</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nome</span>
                      <span className="font-medium text-foreground">{currentTenant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Documento</span>
                      <span className="text-foreground">{currentTenant.document}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contato</span>
                      <span className="text-foreground">{currentTenant.phone}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Sem inquilino ativo
                </div>
              )}

              {/* Rental History */}
              <div className="bg-secondary/30 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Histórico de Locações</h3>
                {rentalHistory.length > 0 ? (
                  <div className="space-y-3">
                    {rentalHistory.map((rental) => {
                      const tenant = mockTenants.find(t => t.id === rental.tenantId);
                      return (
                        <div key={rental.id} className="flex justify-between items-center py-2 border-b border-border">
                          <div>
                            <p className="font-medium text-foreground">{tenant?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(rental.startDate).toLocaleDateString('pt-BR')} - {rental.endDate ? new Date(rental.endDate).toLocaleDateString('pt-BR') : 'Atual'}
                            </p>
                          </div>
                          <span className="text-foreground">{formatCurrency(rental.monthlyRent)}/mês</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sem histórico registrado</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              <div className="bg-secondary/30 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Inventário de Móveis e Equipamentos</h3>
                {furniture.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-3">Item</th>
                          <th className="pb-3">Categoria</th>
                          <th className="pb-3">Valor</th>
                          <th className="pb-3">Estado</th>
                          <th className="pb-3">Garantia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {furniture.map((item) => (
                          <tr key={item.id} className="border-b border-border">
                            <td className="py-3 font-medium text-foreground">{item.name}</td>
                            <td className="py-3 text-muted-foreground">{item.category}</td>
                            <td className="py-3">{formatCurrency(item.purchaseValue)}</td>
                            <td className="py-3">
                              <Badge variant={item.condition === 'excellent' ? 'default' : 'secondary'}>
                                {item.condition === 'excellent' ? 'Excelente' : item.condition === 'good' ? 'Bom' : item.condition === 'fair' ? 'Regular' : 'Ruim'}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {item.warrantyEndDate ? new Date(item.warrantyEndDate).toLocaleDateString('pt-BR') : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum item cadastrado</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
