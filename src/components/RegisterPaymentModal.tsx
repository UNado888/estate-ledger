import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Property, Tenant, PaymentRecord } from '@/types';
import { toast } from 'sonner';

interface RegisterPaymentModalProps {
  open: boolean;
  property: Property;
  tenant: Tenant | null;
  onClose: () => void;
  onRegister: (payment: PaymentRecord) => void;
}

const months = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export function RegisterPaymentModal({ open, property, tenant, onClose, onRegister }: RegisterPaymentModalProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

  const [formData, setFormData] = useState({
    month: currentMonth,
    year: currentYear.toString(),
    dueDate: '',
    paidDate: new Date().toISOString().split('T')[0],
    amount: property.monthlyRent.toString(),
    status: 'paid' as PaymentRecord['status'],
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount) {
      toast.error('Informe o valor do pagamento');
      return;
    }

    const monthYear = `${formData.year}-${formData.month}`;
    const dueDate = formData.dueDate || `${monthYear}-10`; // Default due date day 10

    const payment: PaymentRecord = {
      id: Date.now().toString(),
      month: monthYear,
      dueDate: dueDate,
      paidDate: formData.status === 'paid' ? formData.paidDate : undefined,
      amount: Number(formData.amount),
      status: formData.status,
    };

    onRegister(payment);
    toast.success('Pagamento registrado com sucesso!');
    onClose();

    // Reset form
    setFormData({
      month: currentMonth,
      year: currentYear.toString(),
      dueDate: '',
      paidDate: new Date().toISOString().split('T')[0],
      amount: property.monthlyRent.toString(),
      status: 'paid',
      notes: '',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Registrar Pagamento</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Imóvel</p>
          <p className="font-medium">{property.name}</p>
          {tenant && (
            <>
              <p className="text-sm text-muted-foreground mt-2">Inquilino</p>
              <p className="font-medium">{tenant.name}</p>
            </>
          )}
          <p className="text-sm text-muted-foreground mt-2">Aluguel Mensal</p>
          <p className="font-medium text-primary">{formatCurrency(property.monthlyRent)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Month/Year Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mês de Referência</Label>
              <Select value={formData.month} onValueChange={(v) => handleChange('month', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={formData.year} onValueChange={(v) => handleChange('year', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status do Pagamento</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="late">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
            />
          </div>

          {/* Paid Date - only show if status is paid */}
          {formData.status === 'paid' && (
            <div className="space-y-2">
              <Label htmlFor="paidDate">Data do Pagamento</Label>
              <Input
                id="paidDate"
                type="date"
                value={formData.paidDate}
                onChange={(e) => handleChange('paidDate', e.target.value)}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Pagamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
