import { useState, useEffect, useMemo } from 'react';
import { Property, Tenant, RentalHistory, PaymentRecord, UtilityPaymentRecord, RentAdjustment } from '@/types';
import { X, MapPin, Bed, Bath, Car, Calendar, TrendingUp, DollarSign, Package, UserPlus, Edit2, Edit, Trash2, CreditCard, Check, Clock, AlertTriangle, Droplets, Zap, Flame, Building, Receipt, Users, Star, History, FileText, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockTenants, mockFurniture, mockRentalHistory } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { UtilityPaymentsTab } from './UtilityPaymentsTab';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
import { toast } from 'sonner';

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

// Inline editable payment row component
function PaymentRow({ payment, statusInfo, StatusIcon, monthLabel, formatCurrency, onMarkAsPaid, onChangeAmount }: {
  payment: PaymentRecord;
  statusInfo: { label: string; icon: typeof Check; className: string };
  StatusIcon: typeof Check;
  monthLabel: string;
  formatCurrency: (v: number) => string;
  onMarkAsPaid: (id: string) => void;
  onChangeAmount: (id: string, amount: number, type: 'reajuste' | 'juros_multa', notes?: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(payment.amount));
  const [editNotes, setEditNotes] = useState(payment.notes || '');
  const [adjustType, setAdjustType] = useState<'reajuste' | 'juros_multa'>('reajuste');

  const handleConfirm = () => {
    const val = parseFloat(editValue);
    if (val > 0) {
      onChangeAmount(payment.id, val, adjustType, editNotes || undefined);
      setEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg border",
        payment.status === 'paid' && "bg-success/5 border-success/20",
        payment.status === 'pending' && "bg-warning/5 border-warning/20",
        payment.status === 'late' && "bg-destructive/5 border-destructive/20"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusIcon className={cn("w-5 h-5", statusInfo.className)} />
          <div>
            <p className="font-medium text-foreground capitalize">{monthLabel}</p>
            <p className="text-xs text-muted-foreground">
              Venc: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
              {payment.paidDate && ` • Pago: ${new Date(payment.paidDate).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">R$</span>
              <input
                type="number"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirm();
                  if (e.key === 'Escape') setEditing(false);
                }}
                autoFocus
                className="w-24 h-8 px-2 text-sm rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleConfirm}>
                <Check className="w-4 h-4 text-success" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditing(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => { setEditValue(String(payment.amount)); setEditNotes(payment.notes || ''); setAdjustType('reajuste'); setEditing(true); }}
              className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
              title="Clique para alterar o valor"
            >
              {formatCurrency(payment.amount)}
              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
            </button>
          )}
          {payment.status !== 'paid' ? (
            <Button size="sm" onClick={() => onMarkAsPaid(payment.id)} className="gap-1.5">
              <Check className="w-4 h-4" />
              Pagar
            </Button>
          ) : (
            <Badge className="bg-success/10 text-success border-0">
              {statusInfo.label}
            </Badge>
          )}
        </div>
      </div>
      {/* Adjustment type selector + notes when editing */}
      {editing && (
        <div className="flex flex-col gap-2 pl-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdjustType('reajuste')}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition-colors font-medium",
                adjustType === 'reajuste'
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Reajuste de aluguel
            </button>
            <button
              onClick={() => setAdjustType('juros_multa')}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition-colors font-medium",
                adjustType === 'juros_multa'
                  ? "bg-warning text-warning-foreground border-warning"
                  : "bg-card text-muted-foreground border-border hover:border-warning/50"
              )}
            >
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Multa / Juros
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {adjustType === 'reajuste'
              ? '⬆️ O novo valor será aplicado a este e todos os meses seguintes.'
              : '⚠️ O ajuste será aplicado apenas a este mês (multa, juros, acordo).'}
          </p>
          <input
            type="text"
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            placeholder={adjustType === 'reajuste' ? "Motivo do reajuste (ex: IGPM, acordo...)" : "Motivo do ajuste (multa, juros, acordo...)"}
            onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }}
            className="w-full h-8 px-3 text-sm rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
      {/* Show saved notes */}
      {!editing && payment.notes && (
        <p className="text-xs text-muted-foreground italic pl-8">📝 {payment.notes}</p>
      )}
    </div>
  );
}

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
  // showPaymentModal removed - payments now use inline pay button
  const [allRentalHistory, setAllRentalHistory] = useLocalStorage<RentalHistory[]>('imobiliaria-rental-history', mockRentalHistory);
  const rentalHistoryState = allRentalHistory.filter(r => r.propertyId === property.id);
  const setRentalHistoryState = (updater: RentalHistory[] | ((prev: RentalHistory[]) => RentalHistory[])) => {
    setAllRentalHistory(prev => {
      const otherHistory = prev.filter(r => r.propertyId !== property.id);
      const propertyHistory = prev.filter(r => r.propertyId === property.id);
      const updated = typeof updater === 'function' ? updater(propertyHistory) : updater;
      return [...otherHistory, ...updated];
    });
  };
  // paymentHistory state removed - now uses rentalHistoryState directly
  const [allUtilityPayments, setAllUtilityPayments] = useLocalStorage<UtilityPaymentRecord[]>('imobiliaria-utility-payments', []);
  const [adjustmentHistory, setAdjustmentHistory] = useLocalStorage<RentAdjustment[]>(`imobiliaria-adjustments-${property.id}`, []);
  
  // Filter utility payments for this property
  const utilityPayments = allUtilityPayments.filter(p => p.propertyId === property.id);
  
  const handleAddUtilityPayment = (payment: UtilityPaymentRecord) => {
    setAllUtilityPayments(prev => [payment, ...prev]);
  };

  const handleUpdateUtilityPayment = (updatedPayment: UtilityPaymentRecord) => {
    setAllUtilityPayments(prev => 
      prev.map(p => p.id === updatedPayment.id ? updatedPayment : p)
    );
  };

  const handleDeleteUtilityPayment = (paymentId: string) => {
    setAllUtilityPayments(prev => prev.filter(p => p.id !== paymentId));
  };

  const status = statusConfig[currentProperty.status];
  const currentTenant = currentProperty.currentTenantId 
    ? allTenants.find(t => t.id === currentProperty.currentTenantId)
    : null;
  const furniture = mockFurniture.filter(f => f.propertyId === currentProperty.id);

  const totalInvestment = currentProperty.acquisitionCost + currentProperty.renovationCost;
  const roi = ((currentProperty.monthlyRent * 12) / totalInvestment * 100).toFixed(2);
  const netMonthly = currentProperty.monthlyRent - currentProperty.iptu - currentProperty.condoFee;
  const paybackYears = (totalInvestment / (netMonthly * 12)).toFixed(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

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

  // handleRegisterPayment removed - payments now use inline pay button

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
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="tenant">Inquilino</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="utilities" className="gap-1.5">
                <Receipt className="w-4 h-4" />
                Contas
              </TabsTrigger>
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
              {/* Tenant Financial History */}
              <div className="bg-secondary/30 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Histórico Financeiro por Inquilino</h3>
                </div>
                {rentalHistoryState.length > 0 ? (
                  <div className="space-y-4">
                    {rentalHistoryState.map((rental) => {
                      const tenant = allTenants.find(t => t.id === rental.tenantId);
                      const startDate = new Date(rental.startDate);
                      const endDate = rental.endDate ? new Date(rental.endDate) : new Date();
                      
                      // Calculate duration in months
                      const durationMonths = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                      const years = Math.floor(durationMonths / 12);
                      const months = durationMonths % 12;
                      const durationText = years > 0 
                        ? `${years} ano${years > 1 ? 's' : ''}${months > 0 ? ` e ${months} mês${months > 1 ? 'es' : ''}` : ''}`
                        : `${months} mês${months > 1 ? 'es' : ''}`;
                      
                      // Calculate total revenue from this tenant
                      const totalRevenue = durationMonths * rental.monthlyRent;
                      
                      // Calculate costs (IPTU + Condomínio + IR estimado)
                      const monthlyIR = rental.monthlyRent * 0.05;
                      const totalCosts = durationMonths * (currentProperty.iptu + currentProperty.condoFee + monthlyIR);
                      
                      // Net profit
                      const netProfit = totalRevenue - totalCosts;
                      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
                      
                      const isActive = !rental.endDate;
                      
                      return (
                        <div 
                          key={rental.id} 
                          className={cn(
                            "p-4 rounded-lg border",
                            isActive 
                              ? "bg-primary/5 border-primary/30" 
                              : "bg-card border-border"
                          )}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isActive ? "bg-primary/10" : "bg-secondary"
                              )}>
                                <Users className={cn(
                                  "w-5 h-5",
                                  isActive ? "text-primary" : "text-muted-foreground"
                                )} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-foreground">{tenant?.name || 'Inquilino Removido'}</p>
                                  {isActive && (
                                    <Badge className="bg-success/10 text-success text-xs">Ativo</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>
                                    {startDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} - {rental.endDate ? endDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Atual'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {tenant && [...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "w-4 h-4",
                                    i < tenant.rating ? "text-warning fill-warning" : "text-muted-foreground/30"
                                  )} 
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Delinquency Indicator */}
                          {(() => {
                            const latePayments = rental.paymentHistory.filter(p => p.status === 'late').length;
                            const pendingPayments = rental.paymentHistory.filter(p => p.status === 'pending').length;
                            const paidPayments = rental.paymentHistory.filter(p => p.status === 'paid').length;
                            const totalPayments = rental.paymentHistory.length;
                            const delinquencyRate = totalPayments > 0 ? ((latePayments + pendingPayments) / totalPayments) * 100 : 0;
                            const hasIssues = latePayments > 0 || pendingPayments > 0;
                            
                            return hasIssues || totalPayments > 0 ? (
                              <div className={cn(
                                "mb-3 p-3 rounded-lg border",
                                latePayments > 0 
                                  ? "bg-destructive/5 border-destructive/30" 
                                  : pendingPayments > 0 
                                    ? "bg-warning/5 border-warning/30"
                                    : "bg-success/5 border-success/30"
                              )}>
                                <div className="flex items-center gap-2 mb-2">
                                  {latePayments > 0 ? (
                                    <AlertTriangle className="w-4 h-4 text-destructive" />
                                  ) : pendingPayments > 0 ? (
                                    <Clock className="w-4 h-4 text-warning" />
                                  ) : (
                                    <Check className="w-4 h-4 text-success" />
                                  )}
                                  <span className={cn(
                                    "text-sm font-medium",
                                    latePayments > 0 
                                      ? "text-destructive" 
                                      : pendingPayments > 0 
                                        ? "text-warning"
                                        : "text-success"
                                  )}>
                                    {latePayments > 0 
                                      ? "Inadimplência Detectada" 
                                      : pendingPayments > 0 
                                        ? "Pagamentos Pendentes"
                                        : "Pagamentos em Dia"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-destructive" />
                                    <span className="text-muted-foreground">Atrasados:</span>
                                    <span className={cn("font-medium", latePayments > 0 ? "text-destructive" : "text-foreground")}>{latePayments}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-warning" />
                                    <span className="text-muted-foreground">Pendentes:</span>
                                    <span className={cn("font-medium", pendingPayments > 0 ? "text-warning" : "text-foreground")}>{pendingPayments}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-success" />
                                    <span className="text-muted-foreground">Pagos:</span>
                                    <span className="font-medium text-foreground">{paidPayments}</span>
                                  </div>
                                  {totalPayments > 0 && (
                                    <div className="flex items-center gap-1.5 ml-auto">
                                      <span className="text-muted-foreground">Taxa inadimplência:</span>
                                      <span className={cn(
                                        "font-medium",
                                        delinquencyRate > 20 
                                          ? "text-destructive" 
                                          : delinquencyRate > 0 
                                            ? "text-warning"
                                            : "text-success"
                                      )}>
                                        {delinquencyRate.toFixed(1)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null;
                          })()}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-background/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Permanência</p>
                              <p className="font-semibold text-foreground">{durationText}</p>
                              <p className="text-xs text-muted-foreground">{durationMonths} meses</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Aluguel Mensal</p>
                              <p className="font-semibold text-foreground">{formatCurrency(rental.monthlyRent)}</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Receita Total</p>
                              <p className="font-semibold text-primary">{formatCurrency(totalRevenue)}</p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Lucro Líquido</p>
                              <p className={cn(
                                "font-semibold",
                                netProfit >= 0 ? "text-success" : "text-destructive"
                              )}>
                                {formatCurrency(netProfit)}
                              </p>
                              <p className={cn(
                                "text-xs",
                                netProfit >= 0 ? "text-success/70" : "text-destructive/70"
                              )}>
                                {profitMargin.toFixed(1)}% margem
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Summary */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Total Inquilinos</p>
                          <p className="text-2xl font-bold text-foreground">{rentalHistoryState.length}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Receita Acumulada</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(
                              rentalHistoryState.reduce((acc, rental) => {
                                const startDate = new Date(rental.startDate);
                                const endDate = rental.endDate ? new Date(rental.endDate) : new Date();
                                const months = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                                return acc + (months * rental.monthlyRent);
                              }, 0)
                            )}
                          </p>
                        </div>
                        <div className="text-center col-span-2 sm:col-span-1">
                          <p className="text-sm text-muted-foreground">Lucro Acumulado</p>
                          <p className="text-2xl font-bold text-success">
                            {formatCurrency(
                              rentalHistoryState.reduce((acc, rental) => {
                                const startDate = new Date(rental.startDate);
                                const endDate = rental.endDate ? new Date(rental.endDate) : new Date();
                                const months = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                                const revenue = months * rental.monthlyRent;
                                const costs = months * (currentProperty.iptu + currentProperty.condoFee + rental.monthlyRent * 0.05);
                                return acc + (revenue - costs);
                              }, 0)
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">Nenhum histórico de inquilino registrado</p>
                  </div>
                )}
              </div>

              {/* Occupancy Timeline */}
              {rentalHistoryState.length > 0 && (() => {
                // Calculate timeline data
                const sortedRentals = [...rentalHistoryState].sort(
                  (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                );
                
                const timelineStart = new Date(Math.min(
                  ...sortedRentals.map(r => new Date(r.startDate).getTime()),
                  new Date(currentProperty.acquisitionDate).getTime()
                ));
                const timelineEnd = new Date();
                const totalDays = Math.max(1, (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
                
                // Generate year markers
                const years: number[] = [];
                for (let y = timelineStart.getFullYear(); y <= timelineEnd.getFullYear(); y++) {
                  years.push(y);
                }
                
                // Calculate occupancy stats
                const occupiedDays = sortedRentals.reduce((acc, rental) => {
                  const start = new Date(rental.startDate);
                  const end = rental.endDate ? new Date(rental.endDate) : new Date();
                  return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                }, 0);
                const occupancyRate = (occupiedDays / totalDays) * 100;
                
                // Color palette for different tenants
                const tenantColors = [
                  'bg-primary',
                  'bg-chart-2',
                  'bg-chart-3',
                  'bg-chart-4',
                  'bg-chart-5',
                ];
                
                return (
                  <div className="bg-secondary/30 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Timeline de Ocupação</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Taxa de ocupação:</span>
                          <span className={cn(
                            "font-bold",
                            occupancyRate >= 80 ? "text-success" : occupancyRate >= 50 ? "text-warning" : "text-destructive"
                          )}>
                            {occupancyRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timeline Bar */}
                    <div className="relative">
                      {/* Year markers */}
                      <div className="flex justify-between text-xs text-muted-foreground mb-2 px-1">
                        {years.map(year => {
                          const yearStart = new Date(year, 0, 1);
                          const position = Math.max(0, Math.min(100, 
                            ((yearStart.getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime())) * 100
                          ));
                          return (
                            <span 
                              key={year} 
                              className="absolute transform -translate-x-1/2"
                              style={{ left: `${position}%` }}
                            >
                              {year}
                            </span>
                          );
                        })}
                      </div>
                      
                      {/* Timeline track */}
                      <div className="relative h-12 bg-muted/50 rounded-lg mt-6 overflow-hidden">
                        {/* Vacant periods shown as background */}
                        <div className="absolute inset-0 bg-muted/30" />
                        
                        {/* Rental periods */}
                        <TooltipProvider>
                          {sortedRentals.map((rental, index) => {
                            const tenant = allTenants.find(t => t.id === rental.tenantId);
                            const start = new Date(rental.startDate);
                            const end = rental.endDate ? new Date(rental.endDate) : new Date();
                            
                            const leftPercent = ((start.getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime())) * 100;
                            const widthPercent = ((end.getTime() - start.getTime()) / (timelineEnd.getTime() - timelineStart.getTime())) * 100;
                            
                            const durationMonths = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                            const years = Math.floor(durationMonths / 12);
                            const months = durationMonths % 12;
                            const durationText = years > 0 
                              ? `${years} ano${years > 1 ? 's' : ''}${months > 0 ? ` e ${months} mês${months > 1 ? 'es' : ''}` : ''}`
                              : `${months} mês${months > 1 ? 'es' : ''}`;
                            
                            // Calculate financial data
                            const totalRevenue = durationMonths * rental.monthlyRent;
                            const totalCosts = durationMonths * (currentProperty.iptu + currentProperty.condoFee + rental.monthlyRent * 0.05);
                            const netProfit = totalRevenue - totalCosts;
                            
                            // Payment stats
                            const latePayments = rental.paymentHistory.filter(p => p.status === 'late').length;
                            const pendingPayments = rental.paymentHistory.filter(p => p.status === 'pending').length;
                            const paidPayments = rental.paymentHistory.filter(p => p.status === 'paid').length;
                            const hasPaymentIssues = latePayments > 0 || pendingPayments > 0;
                            
                            return (
                              <Tooltip key={rental.id} delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "absolute top-1 bottom-1 rounded cursor-pointer transition-all hover:opacity-80 hover:ring-2 hover:ring-primary/50",
                                      tenantColors[index % tenantColors.length],
                                      !rental.endDate && "animate-pulse"
                                    )}
                                    style={{
                                      left: `${Math.max(0, leftPercent)}%`,
                                      width: `${Math.min(100 - leftPercent, widthPercent)}%`,
                                    }}
                                  >
                                    {widthPercent > 15 && (
                                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground truncate px-2">
                                        {tenant?.name?.split(' ')[0] || 'Inquilino'}
                                      </span>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm p-0" side="top">
                                  <div className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                                    {/* Header */}
                                    <div className={cn(
                                      "px-4 py-3 text-primary-foreground",
                                      tenantColors[index % tenantColors.length]
                                    )}>
                                      <div className="flex items-center justify-between gap-3">
                                        <div>
                                          <p className="font-semibold">{tenant?.name || 'Inquilino Removido'}</p>
                                          <p className="text-xs opacity-90">
                                            {tenant?.documentType?.toUpperCase()}: {tenant?.document}
                                          </p>
                                        </div>
                                        {!rental.endDate && (
                                          <Badge className="bg-white/20 text-white text-xs">Ativo</Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-4 space-y-3">
                                      {/* Rating */}
                                      {tenant && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">Avaliação:</span>
                                          <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                              <Star 
                                                key={i} 
                                                className={cn(
                                                  "w-3.5 h-3.5",
                                                  i < tenant.rating ? "text-warning fill-warning" : "text-muted-foreground/30"
                                                )} 
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Period */}
                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                          <p className="text-muted-foreground">Período</p>
                                          <p className="font-medium text-foreground">
                                            {start.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} - {rental.endDate ? end.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Atual'}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Duração</p>
                                          <p className="font-medium text-foreground">{durationText}</p>
                                        </div>
                                      </div>
                                      
                                      {/* Financial */}
                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                          <p className="text-muted-foreground">Aluguel Mensal</p>
                                          <p className="font-medium text-foreground">{formatCurrency(rental.monthlyRent)}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Receita Total</p>
                                          <p className="font-medium text-primary">{formatCurrency(totalRevenue)}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                          <p className="text-muted-foreground">Lucro Líquido</p>
                                          <p className={cn("font-medium", netProfit >= 0 ? "text-success" : "text-destructive")}>
                                            {formatCurrency(netProfit)}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Seguro</p>
                                          <p className={cn("font-medium", tenant?.hasInsurance ? "text-success" : "text-warning")}>
                                            {tenant?.hasInsurance ? 'Sim' : 'Não'}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      {/* Payment Status */}
                                      {(rental.paymentHistory.length > 0 || hasPaymentIssues) && (
                                        <div className={cn(
                                          "p-2 rounded text-xs",
                                          latePayments > 0 
                                            ? "bg-destructive/10 border border-destructive/30" 
                                            : pendingPayments > 0 
                                              ? "bg-warning/10 border border-warning/30"
                                              : "bg-success/10 border border-success/30"
                                        )}>
                                          <div className="flex items-center gap-2 mb-1">
                                            {latePayments > 0 ? (
                                              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                                            ) : pendingPayments > 0 ? (
                                              <Clock className="w-3.5 h-3.5 text-warning" />
                                            ) : (
                                              <Check className="w-3.5 h-3.5 text-success" />
                                            )}
                                            <span className={cn(
                                              "font-medium",
                                              latePayments > 0 ? "text-destructive" : pendingPayments > 0 ? "text-warning" : "text-success"
                                            )}>
                                              {latePayments > 0 ? "Inadimplência" : pendingPayments > 0 ? "Pendências" : "Em dia"}
                                            </span>
                                          </div>
                                          <div className="flex gap-3 text-muted-foreground">
                                            <span>Pagos: <strong className="text-foreground">{paidPayments}</strong></span>
                                            <span>Atrasados: <strong className={latePayments > 0 ? "text-destructive" : "text-foreground"}>{latePayments}</strong></span>
                                            <span>Pendentes: <strong className={pendingPayments > 0 ? "text-warning" : "text-foreground"}>{pendingPayments}</strong></span>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Contact */}
                                      {tenant && (
                                        <div className="pt-2 border-t border-border text-xs">
                                          <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                              <span>📧</span>
                                              <span className="truncate max-w-[120px]">{tenant.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                              <span>📱</span>
                                              <span>{tenant.phone}</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </TooltipProvider>
                      </div>
                      
                      {/* Legend */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        {sortedRentals.map((rental, index) => {
                          const tenant = allTenants.find(t => t.id === rental.tenantId);
                          return (
                            <div key={rental.id} className="flex items-center gap-2">
                              <div className={cn(
                                "w-3 h-3 rounded",
                                tenantColors[index % tenantColors.length]
                              )} />
                              <span className="text-xs text-muted-foreground">
                                {tenant?.name?.split(' ').slice(0, 2).join(' ') || 'Inquilino'}
                                {!rental.endDate && ' (Atual)'}
                              </span>
                            </div>
                          );
                        })}
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-muted/50 border border-border" />
                          <span className="text-xs text-muted-foreground">Vago</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Tempo Total</p>
                        <p className="font-semibold text-foreground">
                          {Math.round(totalDays / 365)} anos
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Dias Ocupados</p>
                        <p className="font-semibold text-success">
                          {Math.round(occupiedDays)} dias
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Dias Vagos</p>
                        <p className="font-semibold text-warning">
                          {Math.round(totalDays - occupiedDays)} dias
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

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
              {(() => {
                const activeRental = rentalHistoryState.find(r => !r.endDate && r.propertyId === currentProperty.id);
                if (!activeRental) {
                  return (
                    <div className="text-center py-12 bg-secondary/30 rounded-xl">
                      <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Nenhum contrato ativo</p>
                      <p className="text-sm text-muted-foreground mt-1">Vincule um inquilino para gerenciar pagamentos</p>
                    </div>
                  );
                }

                const tenant = allTenants.find(t => t.id === activeRental.tenantId);
                const payments = [...activeRental.paymentHistory].sort((a, b) => b.month.localeCompare(a.month));
                const paidCount = payments.filter(p => p.status === 'paid').length;
                const lateCount = payments.filter(p => p.status === 'late').length;
                const pendingCount = payments.filter(p => p.status === 'pending').length;

                const handleMarkAsPaid = (paymentId: string) => {
                  setRentalHistoryState(prev =>
                    prev.map(r => {
                      if (r.id !== activeRental.id) return r;
                      return {
                        ...r,
                        paymentHistory: r.paymentHistory.map(p =>
                          p.id === paymentId
                            ? { ...p, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }
                            : p
                        ),
                      };
                    })
                  );
                  toast.success('Pagamento registrado como pago!');
                };

                const handleChangeAmount = (paymentId: string, newAmount: number, type: 'reajuste' | 'juros_multa', notes?: string) => {
                  const targetPayment = activeRental.paymentHistory.find(p => p.id === paymentId);
                  if (!targetPayment) return;

                  const previousAmount = targetPayment.amount;

                  // Record adjustment in history
                  const adjustment: RentAdjustment = {
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    previousAmount,
                    newAmount,
                    type,
                    notes: notes || undefined,
                    paymentMonth: targetPayment.month,
                  };
                  setAdjustmentHistory(prev => [adjustment, ...prev]);

                  if (type === 'reajuste') {
                    // Propagate to this and all future unpaid months + update base rent
                    setRentalHistoryState(prev =>
                      prev.map(r => {
                        if (r.id !== activeRental.id) return r;
                        return {
                          ...r,
                          monthlyRent: newAmount,
                          paymentHistory: r.paymentHistory.map(p =>
                            p.month >= targetPayment.month ? { ...p, amount: newAmount } : p
                          ),
                        };
                      })
                    );
                    const updatedProperty = { ...currentProperty, monthlyRent: newAmount };
                    setCurrentProperty(updatedProperty);
                    onUpdateProperty?.(updatedProperty);
                    toast.success(`Reajuste aplicado: ${formatCurrency(newAmount)} a partir de ${new Date(targetPayment.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`);
                  } else {
                    // Only change this specific payment (fine/interest)
                    setRentalHistoryState(prev =>
                      prev.map(r => {
                        if (r.id !== activeRental.id) return r;
                        return {
                          ...r,
                          paymentHistory: r.paymentHistory.map(p =>
                            p.id === paymentId ? { ...p, amount: newAmount, notes: notes || undefined } : p
                          ),
                        };
                      })
                    );
                    toast.success(`Multa/juros aplicado: ${formatCurrency(newAmount)} em ${new Date(targetPayment.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}${notes ? ` — ${notes}` : ''}`);
                  }
                };

                return (
                  <>
                    {/* Contract Summary */}
                    <div className="bg-secondary/30 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">Contrato Ativo</h3>
                        <Badge className="bg-success/10 text-success">Ativo</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Inquilino</p>
                          <p className="font-medium text-foreground">{tenant?.name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Início</p>
                          <p className="font-medium text-foreground">{new Date(activeRental.startDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Aluguel</p>
                          <p className="font-medium text-primary">{formatCurrency(activeRental.monthlyRent)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duração</p>
                          <p className="font-medium text-foreground">{payments.length} meses</p>
                        </div>
                      </div>
                      {/* Stats bar */}
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-success" />
                          <span className="text-muted-foreground">Pagos:</span>
                          <span className="font-semibold text-foreground">{paidCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-warning" />
                          <span className="text-muted-foreground">Pendentes:</span>
                          <span className="font-semibold text-foreground">{pendingCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-destructive" />
                          <span className="text-muted-foreground">Atrasados:</span>
                          <span className="font-semibold text-foreground">{lateCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Adjustment History */}
                    {adjustmentHistory.length > 0 && (
                      <div className="bg-secondary/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <History className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Histórico de Reajustes</h3>
                          <Badge variant="secondary" className="ml-auto">{adjustmentHistory.length}</Badge>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {adjustmentHistory.map((adj) => (
                            <div key={adj.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card text-sm">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  adj.type === 'reajuste' ? "bg-primary/10" : "bg-warning/10"
                                )}>
                                  {adj.type === 'reajuste' ? (
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                  ) : (
                                    <AlertTriangle className="w-4 h-4 text-warning" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">
                                    {adj.type === 'reajuste' ? 'Reajuste de aluguel' : 'Ajuste por atraso'}
                                    {adj.paymentMonth && (
                                      <span className="text-muted-foreground font-normal">
                                        {' — '}
                                        {new Date(adj.paymentMonth + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(adj.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    {adj.notes && ` • ${adj.notes}`}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground line-through">{formatCurrency(adj.previousAmount)}</p>
                                <p className={cn("font-semibold", adj.newAmount > adj.previousAmount ? "text-destructive" : "text-success")}>
                                  {formatCurrency(adj.newAmount)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payment List */}
                    <div className="bg-secondary/30 rounded-xl p-5">
                      <h3 className="font-semibold text-foreground mb-4">Pagamentos Mensais</h3>
                      <div className="space-y-2">
                        {payments.map((payment) => {
                          const statusInfo = paymentStatusConfig[payment.status];
                          const StatusIcon = statusInfo.icon;
                          const monthLabel = new Date(payment.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

                          return (
                            <PaymentRow
                              key={payment.id}
                              payment={payment}
                              statusInfo={statusInfo}
                              StatusIcon={StatusIcon}
                              monthLabel={monthLabel}
                              formatCurrency={formatCurrency}
                              onMarkAsPaid={handleMarkAsPaid}
                              onChangeAmount={handleChangeAmount}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </TabsContent>

            <TabsContent value="utilities">
              <UtilityPaymentsTab
                property={currentProperty}
                payments={utilityPayments}
                onAddPayment={handleAddUtilityPayment}
                onUpdatePayment={handleUpdateUtilityPayment}
                onDeletePayment={handleDeleteUtilityPayment}
              />
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

    </div>
  );
}
