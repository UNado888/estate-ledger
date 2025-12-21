import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Tenant } from '@/types';
import { toast } from 'sonner';

interface EditTenantModalProps {
  open: boolean;
  tenant: Tenant | null;
  onClose: () => void;
  onSave: (tenant: Tenant) => void;
}

export function EditTenantModal({ open, tenant, onClose, onSave }: EditTenantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    documentType: 'cpf' as Tenant['documentType'],
    email: '',
    phone: '',
    guarantorName: '',
    guarantorDocument: '',
    hasInsurance: false,
    rating: 3,
    status: 'candidate' as Tenant['status'],
    notes: '',
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        document: tenant.document,
        documentType: tenant.documentType,
        email: tenant.email,
        phone: tenant.phone,
        guarantorName: tenant.guarantorName || '',
        guarantorDocument: tenant.guarantorDocument || '',
        hasInsurance: tenant.hasInsurance,
        rating: tenant.rating,
        status: tenant.status,
        notes: tenant.notes || '',
      });
    }
  }, [tenant]);

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.document || !formData.email || !formData.phone || !tenant) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const updatedTenant: Tenant = {
      ...tenant,
      name: formData.name,
      document: formData.document,
      documentType: formData.documentType,
      email: formData.email,
      phone: formData.phone,
      guarantorName: formData.guarantorName || undefined,
      guarantorDocument: formData.guarantorDocument || undefined,
      hasInsurance: formData.hasInsurance,
      rating: formData.rating,
      status: formData.status,
      notes: formData.notes || undefined,
    };

    onSave(updatedTenant);
    toast.success('Inquilino atualizado com sucesso!');
    onClose();
  };

  const formatDocument = (value: string, type: 'cpf' | 'cnpj') => {
    const numbers = value.replace(/\D/g, '');
    if (type === 'cpf') {
      return numbers
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    } else {
      return numbers
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Editar Inquilino</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type Selection */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleChange('documentType', 'cpf')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                formData.documentType === 'cpf'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              Pessoa Física (CPF)
            </button>
            <button
              type="button"
              onClick={() => handleChange('documentType', 'cnpj')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                formData.documentType === 'cnpj'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              Pessoa Jurídica (CNPJ)
            </button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {formData.documentType === 'cpf' ? 'Nome Completo' : 'Razão Social'} *
              </Label>
              <Input
                id="name"
                placeholder={formData.documentType === 'cpf' ? 'Nome completo' : 'Razão social'}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">
                {formData.documentType === 'cpf' ? 'CPF' : 'CNPJ'} *
              </Label>
              <Input
                id="document"
                placeholder={formData.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                value={formData.document}
                onChange={(e) => handleChange('document', formatDocument(e.target.value, formData.documentType))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidate">Candidato</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="former">Antigo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Guarantor Info */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Fiador (Opcional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guarantorName">Nome do Fiador</Label>
                <Input
                  id="guarantorName"
                  placeholder="Nome completo"
                  value={formData.guarantorName}
                  onChange={(e) => handleChange('guarantorName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guarantorDocument">CPF do Fiador</Label>
                <Input
                  id="guarantorDocument"
                  placeholder="000.000.000-00"
                  value={formData.guarantorDocument}
                  onChange={(e) => handleChange('guarantorDocument', formatDocument(e.target.value, 'cpf'))}
                />
              </div>
            </div>
          </div>

          {/* Insurance */}
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div>
              <Label htmlFor="hasInsurance" className="text-base font-medium">Seguro Fiança</Label>
              <p className="text-sm text-muted-foreground">O inquilino possui seguro fiança contratado?</p>
            </div>
            <Switch
              id="hasInsurance"
              checked={formData.hasInsurance}
              onCheckedChange={(checked) => handleChange('hasInsurance', checked)}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Avaliação</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleChange('rating', star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= formData.rating 
                        ? 'fill-warning text-warning' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Anotações sobre o inquilino..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
