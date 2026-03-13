import { useState, useRef } from 'react';
import { UserPlus, Search, Star, FileText, Upload, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tenant, RentalHistory } from '@/types';
import { toast } from 'sonner';

interface AssignTenantModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  tenants: Tenant[];
  onAssign: (tenantId: string, rentalData: Omit<RentalHistory, 'id' | 'paymentHistory'>) => void;
  preSelectedTenantId?: string;
  isRenewal?: boolean;
  previousRent?: number;
}

export function AssignTenantModal({ 
  open, 
  onClose, 
  propertyId, 
  propertyName,
  tenants,
  onAssign 
}: AssignTenantModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyRent, setMonthlyRent] = useState('');
  const [contractDuration, setContractDuration] = useState('12');
  const [contractEndDate, setContractEndDate] = useState('');
  const [contractFile, setContractFile] = useState<{ name: string; base64: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-calc end date when start date or duration changes
  const calcEndDate = (start: string, months: number) => {
    if (!start) return '';
    const d = new Date(start);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (contractDuration) {
      setContractEndDate(calcEndDate(val, Number(contractDuration)));
    }
  };

  const handleDurationChange = (val: string) => {
    setContractDuration(val);
    if (startDate && val) {
      setContractEndDate(calcEndDate(startDate, Number(val)));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setContractFile({
        name: file.name,
        base64: reader.result as string,
      });
      toast.success(`Contrato "${file.name}" anexado`);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setContractFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const availableTenants = tenants.filter(t => 
    t.status !== 'former' &&
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.document.includes(searchTerm))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTenant) {
      toast.error('Selecione um inquilino');
      return;
    }

    if (!monthlyRent || Number(monthlyRent) <= 0) {
      toast.error('Informe o valor do aluguel');
      return;
    }

    if (!contractDuration) {
      toast.error('Informe a duração do contrato');
      return;
    }

    const endDate = contractEndDate || calcEndDate(startDate, Number(contractDuration));

    onAssign(selectedTenant.id, {
      propertyId,
      tenantId: selectedTenant.id,
      startDate,
      monthlyRent: Number(monthlyRent),
      contractDurationMonths: Number(contractDuration),
      contractEndDate: endDate,
      contractFileName: contractFile?.name,
      contractFileBase64: contractFile?.base64,
    });

    toast.success(`${selectedTenant.name} vinculado ao imóvel com sucesso!`);
    onClose();
    
    // Reset
    setSelectedTenant(null);
    setSearchTerm('');
    setMonthlyRent('');
    setContractDuration('12');
    setContractEndDate('');
    setContractFile(null);
    setStartDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Vincular Inquilino
          </DialogTitle>
          <DialogDescription>
            Adicionar inquilino ao imóvel: {propertyName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Search Tenants */}
          <div className="space-y-2">
            <Label>Buscar Inquilino</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nome ou documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tenant List */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableTenants.length > 0 ? (
              availableTenants.map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => setSelectedTenant(tenant)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedTenant?.id === tenant.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">{tenant.document}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < tenant.rating
                              ? 'fill-warning text-warning'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tenant.status === 'active' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {tenant.status === 'active' ? 'Ativo' : 'Candidato'}
                    </span>
                    {tenant.hasInsurance && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        Seguro
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                Nenhum inquilino encontrado
              </p>
            )}
          </div>

          {/* Contract Details */}
          {selectedTenant && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Dados do Contrato
              </h4>
              
              {/* Start Date & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Entrada</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractDuration">Duração do Contrato</Label>
                  <Select value={contractDuration} onValueChange={handleDurationChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                      <SelectItem value="18">18 meses</SelectItem>
                      <SelectItem value="24">24 meses</SelectItem>
                      <SelectItem value="30">30 meses</SelectItem>
                      <SelectItem value="36">36 meses</SelectItem>
                      <SelectItem value="48">48 meses</SelectItem>
                      <SelectItem value="60">60 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* End Date & Monthly Rent */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractEndDate">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Término do Contrato
                    </span>
                  </Label>
                  <Input
                    id="contractEndDate"
                    type="date"
                    value={contractEndDate || calcEndDate(startDate, Number(contractDuration))}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">Aluguel Mensal (R$)</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    placeholder="0,00"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                  />
                </div>
              </div>

              {/* Contract File Upload */}
              <div className="space-y-2">
                <Label>Anexar Contrato (PDF, imagem ou documento)</Label>
                {contractFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{contractFile.name}</p>
                      <p className="text-xs text-muted-foreground">Arquivo anexado</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-8 w-8"
                      onClick={handleRemoveFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Clique para selecionar o arquivo do contrato</span>
                    <span className="text-xs">PDF, JPG, PNG, DOCX — máx. 10MB</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedTenant}>
              Vincular Inquilino
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
