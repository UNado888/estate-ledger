import { useState, useMemo } from 'react';
import { mockProperties } from '@/data/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UtilityPaymentRecord, UtilityType, Property } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Droplets, 
  Zap, 
  Flame, 
  Building, 
  Check, 
  Clock, 
  AlertTriangle, 
  Receipt, 
  Download,
  CheckCheck,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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

export default function UtilitiesDashboard() {
  const [utilityPayments, setUtilityPayments] = useLocalStorage<UtilityPaymentRecord[]>('imobiliaria-utility-payments', []);
  
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterType, setFilterType] = useState<UtilityType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'late'>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Set<string>>(new Set());
  const [showQuickPayDialog, setShowQuickPayDialog] = useState(false);
  const [quickPayDate, setQuickPayDate] = useState(new Date().toISOString().slice(0, 10));

  const properties = mockProperties;

  const propertyMap = useMemo(() => {
    const map: Record<string, Property> = {};
    properties.forEach(p => { map[p.id] = p; });
    return map;
  }, [properties]);

  const availableYears = useMemo(() => {
    const years = new Set(utilityPayments.map(p => p.referenceMonth.slice(0, 4)));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [utilityPayments]);

  const availableMonths = [
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

  const filteredPayments = useMemo(() => {
    return utilityPayments
      .filter(p => filterProperty === 'all' || p.propertyId === filterProperty)
      .filter(p => filterType === 'all' || p.utilityType === filterType)
      .filter(p => filterStatus === 'all' || p.status === filterStatus)
      .filter(p => filterYear === 'all' || p.referenceMonth.startsWith(filterYear))
      .filter(p => filterMonth === 'all' || p.referenceMonth.endsWith(`-${filterMonth}`))
      .sort((a, b) => new Date(b.referenceMonth).getTime() - new Date(a.referenceMonth).getTime());
  }, [utilityPayments, filterProperty, filterType, filterStatus, filterYear, filterMonth]);

  // Global stats
  const globalStats = useMemo(() => {
    const total = utilityPayments.reduce((sum, p) => sum + p.amount, 0);
    const paid = utilityPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = utilityPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const late = utilityPayments.filter(p => p.status === 'late').reduce((sum, p) => sum + p.amount, 0);
    
    // Current month vs last month
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
    
    const currentMonthTotal = utilityPayments
      .filter(p => p.referenceMonth === currentMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    const lastMonthTotal = utilityPayments
      .filter(p => p.referenceMonth === lastMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    
    const variation = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    
    return { total, paid, pending, late, currentMonthTotal, lastMonthTotal, variation };
  }, [utilityPayments]);

  // Stats by utility type
  const statsByType = useMemo(() => {
    const result: Record<UtilityType, { total: number; count: number; pending: number }> = {
      water: { total: 0, count: 0, pending: 0 },
      electricity: { total: 0, count: 0, pending: 0 },
      gas: { total: 0, count: 0, pending: 0 },
      condo: { total: 0, count: 0, pending: 0 },
    };

    utilityPayments.forEach(p => {
      result[p.utilityType].total += p.amount;
      result[p.utilityType].count += 1;
      if (p.status !== 'paid') result[p.utilityType].pending += p.amount;
    });

    return result;
  }, [utilityPayments]);

  // Stats by property
  const statsByProperty = useMemo(() => {
    const result: Record<string, { total: number; pending: number; count: number }> = {};
    
    utilityPayments.forEach(p => {
      if (!result[p.propertyId]) {
        result[p.propertyId] = { total: 0, pending: 0, count: 0 };
      }
      result[p.propertyId].total += p.amount;
      result[p.propertyId].count += 1;
      if (p.status !== 'paid') result[p.propertyId].pending += p.amount;
    });

    return result;
  }, [utilityPayments]);

  // Chart data - last 6 months by type
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

    utilityPayments.forEach(p => {
      if (last6Months[p.referenceMonth]) {
        last6Months[p.referenceMonth][p.utilityType] = 
          (last6Months[p.referenceMonth][p.utilityType] as number) + p.amount;
      }
    });

    return Object.values(last6Months);
  }, [utilityPayments]);

  // Pie chart data
  const pieData = useMemo(() => {
    return Object.entries(statsByType)
      .filter(([_, data]) => data.total > 0)
      .map(([type, data]) => ({
        name: utilityConfig[type as UtilityType].label,
        value: data.total,
        color: utilityConfig[type as UtilityType].color,
      }));
  }, [statsByType]);

  // Status distribution data
  const statusPieData = useMemo(() => {
    const paid = utilityPayments.filter(p => p.status === 'paid').length;
    const pending = utilityPayments.filter(p => p.status === 'pending').length;
    const late = utilityPayments.filter(p => p.status === 'late').length;
    
    return [
      { name: 'Pago', value: paid, color: 'hsl(142, 76%, 36%)' },
      { name: 'Pendente', value: pending, color: 'hsl(48, 96%, 53%)' },
      { name: 'Atrasado', value: late, color: 'hsl(0, 84%, 60%)' },
    ].filter(d => d.value > 0);
  }, [utilityPayments]);

  // Selectable payments (pending/late)
  const selectablePayments = useMemo(() => {
    return filteredPayments.filter(p => p.status !== 'paid');
  }, [filteredPayments]);

  const handleToggleSelect = (paymentId: string) => {
    setSelectedPaymentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPaymentIds.size === selectablePayments.length) {
      setSelectedPaymentIds(new Set());
    } else {
      setSelectedPaymentIds(new Set(selectablePayments.map(p => p.id)));
    }
  };

  const handleQuickPayConfirm = () => {
    if (selectedPaymentIds.size === 0) return;

    const today = quickPayDate || new Date().toISOString().slice(0, 10);
    
    setUtilityPayments(prev => 
      prev.map(payment => {
        if (selectedPaymentIds.has(payment.id) && payment.status !== 'paid') {
          return { ...payment, status: 'paid', paidDate: today };
        }
        return payment;
      })
    );

    toast.success(`${selectedPaymentIds.size} conta(s) marcada(s) como paga(s)`);
    setSelectedPaymentIds(new Set());
    setShowQuickPayDialog(false);
  };

  const selectedTotal = useMemo(() => {
    return utilityPayments
      .filter(p => selectedPaymentIds.has(p.id))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [utilityPayments, selectedPaymentIds]);

  if (utilityPayments.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard de Utilidades</h1>
          <p className="text-muted-foreground">Visão consolidada de todas as contas</p>
        </div>
        
        <div className="text-center py-20 bg-secondary/30 rounded-xl">
          <Receipt className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Nenhuma conta registrada</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Registre contas de utilidades nos imóveis do seu portfólio para visualizar o dashboard consolidado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard de Utilidades</h1>
          <p className="text-muted-foreground">Visão consolidada de todas as contas</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Total Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(globalStats.total)}</p>
            <p className="text-xs text-muted-foreground mt-1">{utilityPayments.length} pagamentos</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCurrency(globalStats.paid)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {utilityPayments.filter(p => p.status === 'paid').length} contas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Pendentes + Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(globalStats.pending + globalStats.late)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {utilityPayments.filter(p => p.status !== 'paid').length} contas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {globalStats.variation >= 0 ? (
                <TrendingUp className="w-4 h-4 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 text-success" />
              )}
              Variação Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-2xl font-bold",
              globalStats.variation >= 0 ? "text-destructive" : "text-success"
            )}>
              {globalStats.variation >= 0 ? '+' : ''}{globalStats.variation.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">vs. mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Utility Type Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['water', 'electricity', 'gas', 'condo'] as UtilityType[]).map(type => {
          const config = utilityConfig[type];
          const Icon = config.icon;
          const data = statsByType[type];
          
          if (data.count === 0) return null;
          
          return (
            <Card key={type} className="bg-card border-border">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5" style={{ color: config.color }} />
                  <span className="font-medium text-foreground">{config.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(data.total)}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{data.count} pagamentos</span>
                  {data.pending > 0 && (
                    <span className="text-xs text-warning">{formatCurrency(data.pending)} pendente</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Evolution */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Evolução por Tipo (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `R$${v}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '8px' 
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      utilityConfig[name as UtilityType]?.label || name
                    ]}
                  />
                  <Legend formatter={(value) => utilityConfig[value as UtilityType]?.label || value} />
                  <Bar dataKey="water" fill={utilityConfig.water.color} stackId="a" />
                  <Bar dataKey="electricity" fill={utilityConfig.electricity.color} stackId="a" />
                  <Bar dataKey="gas" fill={utilityConfig.gas.color} stackId="a" />
                  <Bar dataKey="condo" fill={utilityConfig.condo.color} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Charts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Distribuição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* By Type */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Por Tipo</p>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px' 
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Status */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Por Status</p>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {statusPieData.map(item => (
                  <div key={item.name} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Costs by Property */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Custos por Imóvel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(statsByProperty).map(([propertyId, data]) => {
              const property = propertyMap[propertyId];
              if (!property) return null;
              
              return (
                <div key={propertyId} className="bg-secondary/50 rounded-lg p-4">
                  <p className="font-medium text-foreground text-sm truncate">{property.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{property.address}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-foreground">{formatCurrency(data.total)}</span>
                    {data.pending > 0 && (
                      <Badge variant="outline" className="text-warning border-warning/50">
                        {formatCurrency(data.pending)} pend.
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle className="text-foreground">Histórico de Pagamentos</CardTitle>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={filterProperty} onValueChange={setFilterProperty}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Imóvel" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todos imóveis</SelectItem>
                  {properties.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todos anos</SelectItem>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todos meses</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={(v) => setFilterType(v as UtilityType | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todas contas</SelectItem>
                  {Object.entries(utilityConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todos status</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="late">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Pay Bar */}
            {selectablePayments.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="select-all-global"
                    checked={selectedPaymentIds.size === selectablePayments.length && selectablePayments.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all-global" className="text-sm text-foreground cursor-pointer">
                    {selectedPaymentIds.size > 0 
                      ? `${selectedPaymentIds.size} selecionada(s) - ${formatCurrency(selectedTotal)}`
                      : `Selecionar todas pendentes (${selectablePayments.length})`
                    }
                  </label>
                </div>
                {selectedPaymentIds.size > 0 && (
                  <Button
                    size="sm"
                    onClick={() => setShowQuickPayDialog(true)}
                    className="gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Pagamento Rápido
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum pagamento encontrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pago em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map(payment => {
                    const property = propertyMap[payment.propertyId];
                    const config = utilityConfig[payment.utilityType];
                    const Icon = config.icon;
                    const status = statusConfig[payment.status];
                    const StatusIcon = status.icon;
                    const isSelectable = payment.status !== 'paid';
                    
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {isSelectable && (
                            <Checkbox
                              checked={selectedPaymentIds.has(payment.id)}
                              onCheckedChange={() => handleToggleSelect(payment.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">
                            {property?.name || 'Desconhecido'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: config.color }} />
                            <span className="text-sm">{config.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(payment.referenceMonth + '-01').toLocaleDateString('pt-BR', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1", status.className)}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.paidDate 
                            ? new Date(payment.paidDate).toLocaleDateString('pt-BR')
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Pay Dialog */}
      <AlertDialog open={showQuickPayDialog} onOpenChange={setShowQuickPayDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Pagamento Rápido</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a marcar {selectedPaymentIds.size} conta(s) como paga(s), 
              totalizando {formatCurrency(selectedTotal)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="quick-pay-date-global">Data do Pagamento</Label>
            <Input
              id="quick-pay-date-global"
              type="date"
              value={quickPayDate}
              onChange={(e) => setQuickPayDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleQuickPayConfirm}>
              Confirmar Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
