import { useState, useMemo } from 'react';
import { Property, UtilityPaymentRecord, UtilityType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Droplets, Zap, Flame, Building, Plus, Check, Clock, AlertTriangle, Receipt, Download, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { exportUtilityReportPDF } from '@/utils/pdfExport';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface UtilityPaymentsTabProps {
  property: Property;
  payments: UtilityPaymentRecord[];
  onAddPayment: (payment: UtilityPaymentRecord) => void;
  onUpdatePayment?: (payment: UtilityPaymentRecord) => void;
  onDeletePayment?: (paymentId: string) => void;
}

const utilityConfig: Record<UtilityType, { label: string; icon: typeof Droplets; color: string }> = {
  water: { label: 'Água', icon: Droplets, color: 'hsl(200, 80%, 50%)' },
  electricity: { label: 'Luz', icon: Zap, color: 'hsl(45, 90%, 50%)' },
  gas: { label: 'Gás', icon: Flame, color: 'hsl(15, 90%, 55%)' },
  condo: { label: 'Condomínio', icon: Building, color: 'hsl(260, 60%, 55%)' },
};

const statusConfig = {
  paid: { label: 'Pago', icon: Check, className: 'text-success' },
  pending: { label: 'Pendente', icon: Clock, className: 'text-warning' },
  late: { label: 'Atrasado', icon: AlertTriangle, className: 'text-destructive' },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export function UtilityPaymentsTab({ property, payments, onAddPayment, onUpdatePayment, onDeletePayment }: UtilityPaymentsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<UtilityPaymentRecord | null>(null);
  const [filterType, setFilterType] = useState<UtilityType | 'all'>('all');
  
  const initialFormData = {
    utilityType: 'water' as UtilityType,
    referenceMonth: new Date().toISOString().slice(0, 7),
    dueDate: '',
    paidDate: '',
    amount: '',
    status: 'pending' as 'paid' | 'pending' | 'late',
    notes: '',
  };
  
  const [formData, setFormData] = useState(initialFormData);

  const enabledUtilities = useMemo(() => {
    if (!property.utilities) return [];
    return (['water', 'electricity', 'gas', 'condo'] as UtilityType[]).filter(
      type => property.utilities?.[type]?.enabled
    );
  }, [property.utilities]);

  const filteredPayments = useMemo(() => {
    return payments
      .filter(p => filterType === 'all' || p.utilityType === filterType)
      .sort((a, b) => new Date(b.referenceMonth).getTime() - new Date(a.referenceMonth).getTime());
  }, [payments, filterType]);

  const chartData = useMemo(() => {
    const last6Months: Record<string, Record<UtilityType | 'month', string | number>> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      last6Months[monthKey] = {
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        water: 0,
        electricity: 0,
        gas: 0,
        condo: 0,
      };
    }

    payments.forEach(p => {
      if (last6Months[p.referenceMonth]) {
        last6Months[p.referenceMonth][p.utilityType] = 
          (last6Months[p.referenceMonth][p.utilityType] as number) + p.amount;
      }
    });

    return Object.values(last6Months);
  }, [payments]);

  const totals = useMemo(() => {
    const result: Record<UtilityType, { total: number; count: number; pending: number }> = {
      water: { total: 0, count: 0, pending: 0 },
      electricity: { total: 0, count: 0, pending: 0 },
      gas: { total: 0, count: 0, pending: 0 },
      condo: { total: 0, count: 0, pending: 0 },
    };

    payments.forEach(p => {
      result[p.utilityType].total += p.amount;
      result[p.utilityType].count += 1;
      if (p.status !== 'paid') result[p.utilityType].pending += p.amount;
    });

    return result;
  }, [payments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.dueDate) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const newPayment: UtilityPaymentRecord = {
      id: Date.now().toString(),
      propertyId: property.id,
      utilityType: formData.utilityType,
      referenceMonth: formData.referenceMonth,
      dueDate: formData.dueDate,
      paidDate: formData.status === 'paid' ? formData.paidDate || formData.dueDate : undefined,
      amount: parseFloat(formData.amount),
      status: formData.status,
      notes: formData.notes || undefined,
    };

    onAddPayment(newPayment);
    setShowAddModal(false);
    setFormData(initialFormData);
    toast.success('Conta registrada com sucesso');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.dueDate || !selectedPayment) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const updatedPayment: UtilityPaymentRecord = {
      ...selectedPayment,
      utilityType: formData.utilityType,
      referenceMonth: formData.referenceMonth,
      dueDate: formData.dueDate,
      paidDate: formData.status === 'paid' ? formData.paidDate || formData.dueDate : undefined,
      amount: parseFloat(formData.amount),
      status: formData.status,
      notes: formData.notes || undefined,
    };

    onUpdatePayment?.(updatedPayment);
    setShowEditModal(false);
    setSelectedPayment(null);
    setFormData(initialFormData);
    toast.success('Conta atualizada com sucesso');
  };

  const handleEdit = (payment: UtilityPaymentRecord) => {
    setSelectedPayment(payment);
    setFormData({
      utilityType: payment.utilityType,
      referenceMonth: payment.referenceMonth,
      dueDate: payment.dueDate,
      paidDate: payment.paidDate || '',
      amount: payment.amount.toString(),
      status: payment.status,
      notes: payment.notes || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPayment) {
      onDeletePayment?.(selectedPayment.id);
      setShowDeleteDialog(false);
      setSelectedPayment(null);
      toast.success('Conta excluída com sucesso');
    }
  };

  const handleExportPDF = () => {
    if (payments.length === 0) {
      toast.error('Nenhum pagamento para exportar');
      return;
    }
    exportUtilityReportPDF({ property, payments });
    toast.success('Relatório gerado com sucesso');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Contas e Utilidades</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportPDF} 
            className="gap-2" 
            disabled={payments.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2" disabled={enabledUtilities.length === 0}>
            <Plus className="w-4 h-4" />
            Registrar Conta
          </Button>
        </div>
      </div>

      {enabledUtilities.length === 0 ? (
        <div className="text-center py-12 bg-secondary/30 rounded-xl">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Nenhuma utilidade configurada</p>
          <p className="text-sm text-muted-foreground mt-1">Configure as utilidades no modal de edição do imóvel</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {enabledUtilities.map(type => {
              const config = utilityConfig[type];
              const Icon = config.icon;
              const data = totals[type];
              const responsible = property.utilities?.[type]?.responsible;
              
              return (
                <div
                  key={type}
                  className="bg-secondary/50 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                    <span className="text-sm font-medium text-foreground">{config.label}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(data.total)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{data.count} pagamentos</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", 
                      responsible === 'holding' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                    )}>
                      {responsible === 'holding' ? 'Holding' : 'Inquilino'}
                    </span>
                  </div>
                  {data.pending > 0 && (
                    <p className="text-xs text-warning mt-1">
                      {formatCurrency(data.pending)} pendente
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Chart */}
          {payments.length > 0 && (
            <div className="bg-secondary/30 rounded-xl p-5">
              <h4 className="font-medium text-foreground mb-4">Histórico (últimos 6 meses)</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `R$${v}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number, name: string) => [formatCurrency(value), utilityConfig[name as UtilityType]?.label || name]}
                    />
                    <Legend formatter={(value) => utilityConfig[value as UtilityType]?.label || value} />
                    {enabledUtilities.map(type => (
                      <Bar key={type} dataKey={type} fill={utilityConfig[type].color} stackId="a" />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Filter and Table */}
          <div className="bg-secondary/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">Histórico de Pagamentos</h4>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as UtilityType | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todas</SelectItem>
                  {enabledUtilities.map(type => (
                    <SelectItem key={type} value={type}>{utilityConfig[type].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Referência</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map(payment => {
                      const config = utilityConfig[payment.utilityType];
                      const status = statusConfig[payment.status];
                      const Icon = config.icon;
                      const StatusIcon = status.icon;

                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" style={{ color: config.color }} />
                              <span>{config.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.referenceMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                              {payment.paidDate && (
                                <p className="text-xs text-muted-foreground">
                                  Pago: {new Date(payment.paidDate).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <StatusIcon className={cn("w-4 h-4", status.className)} />
                              <Badge variant="outline" className={status.className}>
                                {status.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(payment)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum pagamento registrado</p>
            )}
          </div>
        </>
      )}

      {/* Add Payment Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Conta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <Select
                value={formData.utilityType}
                onValueChange={(v) => setFormData({ ...formData, utilityType: v as UtilityType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {enabledUtilities.map(type => (
                    <SelectItem key={type} value={type}>{utilityConfig[type].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mês de Referência</Label>
                <Input
                  type="month"
                  value={formData.referenceMonth}
                  onChange={(e) => setFormData({ ...formData, referenceMonth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento *</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as 'paid' | 'pending' | 'late' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="late">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.status === 'paid' && (
              <div className="space-y-2">
                <Label>Data do Pagamento</Label>
                <Input
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                placeholder="Observações opcionais"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Modal */}
      <Dialog open={showEditModal} onOpenChange={(open) => {
        setShowEditModal(open);
        if (!open) {
          setSelectedPayment(null);
          setFormData(initialFormData);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Conta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <Select
                value={formData.utilityType}
                onValueChange={(v) => setFormData({ ...formData, utilityType: v as UtilityType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {enabledUtilities.map(type => (
                    <SelectItem key={type} value={type}>{utilityConfig[type].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mês de Referência</Label>
                <Input
                  type="month"
                  value={formData.referenceMonth}
                  onChange={(e) => setFormData({ ...formData, referenceMonth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento *</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as 'paid' | 'pending' | 'late' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="late">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.status === 'paid' && (
              <div className="space-y-2">
                <Label>Data do Pagamento</Label>
                <Input
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                placeholder="Observações opcionais"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conta de{' '}
              {selectedPayment && utilityConfig[selectedPayment.utilityType]?.label} referente a{' '}
              {selectedPayment && new Date(selectedPayment.referenceMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}{' '}
              será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}