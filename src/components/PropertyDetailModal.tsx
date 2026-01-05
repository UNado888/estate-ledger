import { useState } from 'react';
import { Property, Tenant, RentalHistory, PaymentRecord } from '@/types';
import { X, MapPin, Bed, Bath, Car, Calendar, TrendingUp, DollarSign, Package, UserPlus, Edit2, Edit, Trash2, CreditCard, Check, Clock, AlertTriangle, Droplets, Zap, Flame, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTenants, mockFurniture, mockRentalHistory } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { AssignTenantModal } from './AssignTenantModal';
import { RegisterPaymentModal } from './RegisterPaymentModal';
import { toast } from 'sonner';
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
  onUpdateProperty?: (updatedProperty: Property) => void;
  onDeleteProperty?: () => void;
  onEditProperty?: () => void;
  allTenants?: Tenant[];
}

const statusConfig = {
  rented: { label: 'Alugado', className: 'bg-success text-success-foreground' },
  vacant: { label: 'Vago', className: 'bg-warning text-warning-foreground' },
  renovation: { label: 'Em Reforma', className: 'bg-secondary text-secondary-foreground' },
  sale: { label: 'À Venda', className: 'bg-primary text-primary-foreground' },
};

const statusOptions = [
  { value: 'rented', label: 'Alugado' },
  { value: 'vacant', label: 'Vago' },
  { value: 'renovation', label: 'Em Reforma' },
  { value: 'sale', label: 'À Venda' },
];

const paymentStatusConfig = {
  paid: { label: 'Pago', icon: Check, className: 'text-success' },
  pending: { label: 'Pendente', icon: Clock, className: 'text-warning' },
  late: { label: 'Atrasado', icon: AlertTriangle, className: 'text-destructive' },
};

export function PropertyDetailModal({ 
  property, 
  onClose, 
  onUpdateProperty,
  onDeleteProperty,
  onEditProperty,
  allTenants = mockTenants 
}: PropertyDetailModalProps) {
  const [currentProperty, setCurrentProperty] = useState(property);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [showAssignTenant, setShowAssignTenant] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [rentalHistoryState, setRentalHistoryState] = useState<RentalHistory[]>(
    mockRentalHistory.filter(r => r.propertyId === property.id)
  );
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);

  const status = statusConfig[currentProperty.status];
  const currentTenant = currentProperty.currentTenantId 
    ? allTenants.find(t => t.id === currentProperty.currentTenantId)
    : null;
  const furniture = mockFurniture.filter(f => f.propertyId === currentProperty.id);

  const totalInvestment = currentProperty.acquisitionCost + currentProperty.renovationCost;
  const equity = currentProperty.currentMarketValue - totalInvestment;
  const equityPercent = ((equity / totalInvestment) * 100).toFixed(1);
  const roi = ((currentProperty.monthlyRent * 12) / totalInvestment * 100).toFixed(2);
  const netMonthly = currentProperty.monthlyRent - currentProperty.iptu - currentProperty.condoFee;
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

  const handleStatusChange = (newStatus: Property['status']) => {
    const updatedProperty = { ...currentProperty, status: newStatus };
    
    // If changing to vacant, remove current tenant
    if (newStatus === 'vacant' && currentProperty.currentTenantId) {
      updatedProperty.currentTenantId = undefined;
      
      // Close current rental in history
      setRentalHistoryState(prev => 
        prev.map(r => 
          r.tenantId === currentProperty.currentTenantId && !r.endDate
            ? { ...r, endDate: new Date().toISOString().split('T')[0] }
            : r
        )
      );
    }
    
    setCurrentProperty(updatedProperty);
    onUpdateProperty?.(updatedProperty);
    setIsEditingStatus(false);
    toast.success(`Status alterado para "${statusOptions.find(s => s.value === newStatus)?.label}"`);
  };

  const handleAssignTenant = (tenantId: string, rentalData: Omit<RentalHistory, 'id' | 'paymentHistory'>) => {
    // Close any existing active rental
    if (currentProperty.currentTenantId) {
      setRentalHistoryState(prev => 
        prev.map(r => 
          r.tenantId === currentProperty.currentTenantId && !r.endDate
            ? { ...r, endDate: new Date().toISOString().split('T')[0] }
            : r
        )
      );
    }

    // Add new rental history entry
    const newRental: RentalHistory = {
      id: Date.now().toString(),
      propertyId: rentalData.propertyId,
      tenantId: rentalData.tenantId,
      startDate: rentalData.startDate,
      monthlyRent: rentalData.monthlyRent,
      paymentHistory: [],
    };
    setRentalHistoryState(prev => [newRental, ...prev]);

    // Update property with new tenant and set to rented
    const updatedProperty = { 
      ...currentProperty, 
      currentTenantId: tenantId,
      status: 'rented' as Property['status'],
      monthlyRent: rentalData.monthlyRent
    };
    setCurrentProperty(updatedProperty);
    onUpdateProperty?.(updatedProperty);
  };

  const handleRemoveTenant = () => {
    if (!currentProperty.currentTenantId) return;

    // Close current rental in history
    setRentalHistoryState(prev => 
      prev.map(r => 
        r.tenantId === currentProperty.currentTenantId && !r.endDate
          ? { ...r, endDate: new Date().toISOString().split('T')[0] }
          : r
      )
    );

    // Update property
    const updatedProperty = { 
      ...currentProperty, 
      currentTenantId: undefined,
      status: 'vacant' as Property['status']
    };
    setCurrentProperty(updatedProperty);
    onUpdateProperty?.(updatedProperty);
    toast.success('Inquilino removido do imóvel');
  };

  const handleRegisterPayment = (payment: PaymentRecord) => {
    setPaymentHistory(prev => [payment, ...prev]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-display font-bold text-foreground">{currentProperty.name}</h2>
              
              {/* Status Badge with Edit */}
              {isEditingStatus ? (
                <Select 
                  value={currentProperty.status} 
                  onValueChange={(v) => handleStatusChange(v as Property['status'])}
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {statusOptions.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="group flex items-center gap-1.5"
                >
                  <Badge className={cn(status.className, "transition-all group-hover:opacity-80")}>
                    {status.label}
                  </Badge>
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{currentProperty.address}, {currentProperty.city}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEditProperty && (
              <Button variant="outline" size="icon" onClick={onEditProperty}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDeleteProperty && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O imóvel "{currentProperty.name}" será removido permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeleteProperty} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="tenant">Inquilino</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="inventory">Inventário</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Bed className="w-5 h-5 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{currentProperty.bedrooms}</p>
                  <p className="text-xs text-muted-foreground">Quartos</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Bath className="w-5 h-5 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{currentProperty.bathrooms}</p>
                  <p className="text-xs text-muted-foreground">Banheiros</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Car className="w-5 h-5 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{currentProperty.parkingSpaces}</p>
                  <p className="text-xs text-muted-foreground">Vagas</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 text-center">
                  <Package className="w-5 h-5 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">{currentProperty.usefulArea}</p>
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
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(currentProperty.monthlyRent)}</p>
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
                  <p className="text-2xl font-bold text-foreground">{new Date(currentProperty.acquisitionDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(currentProperty.acquisitionCost)}</p>
                </div>
              </div>

              {/* Utilities */}
              {currentProperty.utilities && (
                <div className="bg-secondary/30 rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">Contas e Utilidades</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'water' as const, label: 'Água', icon: Droplets },
                      { key: 'electricity' as const, label: 'Luz', icon: Zap },
                      { key: 'gas' as const, label: 'Gás', icon: Flame },
                      { key: 'condo' as const, label: 'Condomínio', icon: Building },
                    ].map(({ key, label, icon: Icon }) => {
                      const config = currentProperty.utilities?.[key];
                      if (!config?.enabled) return null;
                      return (
                        <div
                          key={key}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border border-border"
                        >
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium text-foreground">{label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            config.responsible === 'holding'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary text-muted-foreground'
                          }`}>
                            {config.responsible === 'holding' ? 'Holding' : 'Inquilino'}
                          </span>
                        </div>
                      );
                    })}
                    {!currentProperty.utilities?.water?.enabled &&
                     !currentProperty.utilities?.electricity?.enabled &&
                     !currentProperty.utilities?.gas?.enabled &&
                     !currentProperty.utilities?.condo?.enabled && (
                      <p className="col-span-full text-sm text-muted-foreground text-center py-4">
                        Nenhuma conta configurada
                      </p>
                    )}
                  </div>
                </div>
              )}
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
                    <span className="font-medium text-foreground">{formatCurrency(currentProperty.monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border text-destructive">
                    <span>(-) IPTU</span>
                    <span>{formatCurrency(currentProperty.iptu)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border text-destructive">
                    <span>(-) Condomínio</span>
                    <span>{formatCurrency(currentProperty.condoFee)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border text-destructive">
                    <span>(-) IR (estimado)</span>
                    <span>{formatCurrency(currentProperty.monthlyRent * 0.05)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-success/10 rounded-lg px-3">
                    <span className="font-semibold text-success">Lucro Líquido</span>
                    <span className="font-bold text-success">{formatCurrency(netMonthly - currentProperty.monthlyRent * 0.05)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tenant" className="space-y-6">
              {/* Current Tenant */}
              {currentTenant ? (
                <div className="bg-secondary/30 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-foreground">Inquilino Atual</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRemoveTenant}
                      className="text-destructive hover:text-destructive"
                    >
                      Encerrar Contrato
                    </Button>
                  </div>
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">E-mail</span>
                      <span className="text-foreground">{currentTenant.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-secondary/30 rounded-xl">
                  <p className="text-muted-foreground mb-4">Sem inquilino ativo</p>
                  <Button onClick={() => setShowAssignTenant(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Vincular Inquilino
                  </Button>
                </div>
              )}

              {/* Add Tenant Button if there's already one */}
              {currentTenant && (
                <Button 
                  onClick={() => setShowAssignTenant(true)} 
                  variant="outline"
                  className="w-full gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Trocar Inquilino
                </Button>
              )}

              {/* Rental History */}
              <div className="bg-secondary/30 rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Histórico de Locações</h3>
                {rentalHistoryState.length > 0 ? (
                  <div className="space-y-3">
                    {rentalHistoryState.map((rental) => {
                      const tenant = allTenants.find(t => t.id === rental.tenantId);
                      return (
                        <div key={rental.id} className="flex justify-between items-center py-2 border-b border-border">
                          <div>
                            <p className="font-medium text-foreground">{tenant?.name || 'Inquilino Removido'}</p>
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

            <TabsContent value="payments" className="space-y-6">
              {/* Register Payment Button */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Histórico de Pagamentos</h3>
                <Button onClick={() => setShowPaymentModal(true)} className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Registrar Pagamento
                </Button>
              </div>

              {/* Payment History */}
              {paymentHistory.length > 0 ? (
                <div className="bg-secondary/30 rounded-xl p-5">
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => {
                      const statusInfo = paymentStatusConfig[payment.status];
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div key={payment.id} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={cn("w-5 h-5", statusInfo.className)} />
                            <div>
                              <p className="font-medium text-foreground">
                                {new Date(payment.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Venc: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                                {payment.paidDate && ` • Pago: ${new Date(payment.paidDate).toLocaleDateString('pt-BR')}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                            <Badge className={cn("text-xs", statusInfo.className, "bg-transparent")}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-secondary/30 rounded-xl">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhum pagamento registrado</p>
                  <p className="text-sm text-muted-foreground mt-1">Clique em "Registrar Pagamento" para adicionar</p>
                </div>
              )}
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

      {/* Assign Tenant Modal */}
      <AssignTenantModal
        open={showAssignTenant}
        onClose={() => setShowAssignTenant(false)}
        propertyId={currentProperty.id}
        propertyName={currentProperty.name}
        tenants={allTenants}
        onAssign={handleAssignTenant}
      />

      {/* Register Payment Modal */}
      <RegisterPaymentModal
        open={showPaymentModal}
        property={currentProperty}
        tenant={currentTenant}
        onClose={() => setShowPaymentModal(false)}
        onRegister={handleRegisterPayment}
      />
    </div>
  );
}
