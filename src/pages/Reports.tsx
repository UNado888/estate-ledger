import { FileText, Download, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';
import { mockProperties, mockRentalHistory as initialRentalHistory } from '@/data/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Property, RentalHistory } from '@/types';
import { useReportData } from '@/hooks/useReportData';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Reports() {
  const [properties] = useLocalStorage<Property[]>('imobiliaria-properties', mockProperties);
  const [rentalHistory] = useLocalStorage<RentalHistory[]>('imobiliaria-rental-history', initialRentalHistory);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('12');

  const { monthlyData, summaryData, propertyBreakdown, paymentStatusData } = useReportData({
    properties,
    rentalHistory,
    selectedProperty,
    selectedPeriod,
  });

  const revenueChartConfig = {
    revenue: { label: 'Receita', color: 'hsl(var(--primary))' },
    expected: { label: 'Esperado', color: 'hsl(var(--muted-foreground))' },
  };

  const delinquencyChartConfig = {
    paid: { label: 'Em dia', color: 'hsl(var(--success))' },
    late: { label: 'Atrasados', color: 'hsl(var(--warning))' },
    pending: { label: 'Pendentes', color: 'hsl(var(--destructive))' },
  };

  const handleExportPDF = () => {
    // In a real app, this would generate a PDF
    console.log('Exporting report as PDF...');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise de receitas, inadimplência e histórico de pagamentos</p>
        </div>
        <Button onClick={handleExportPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card border border-border rounded-xl">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-2 block">Imóvel</label>
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Imóveis</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[200px]">
          <label className="text-sm text-muted-foreground mb-2 block">Período</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Último ano</SelectItem>
              <SelectItem value="24">Últimos 2 anos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(summaryData.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success">+12%</span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Inadimplência</p>
                <p className="text-2xl font-bold text-foreground">{summaryData.delinquencyRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingDown className="w-4 h-4 text-success" />
              <span className="text-success">-2.3%</span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagamentos em Dia</p>
                <p className="text-2xl font-bold text-foreground">{summaryData.paidOnTime}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              De {summaryData.paidOnTime + summaryData.latePayments + summaryData.pendingPayments} pagamentos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-foreground">{summaryData.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              Aguardando pagamento
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Receita Mensal</CardTitle>
            <CardDescription>Comparativo entre receita realizada e esperada</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="monthLabel" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => (
                      <span className="font-medium">{formatCurrency(Number(value))}</span>
                    )}
                  />} 
                />
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  fill="transparent"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Status dos Pagamentos</CardTitle>
            <CardDescription>Distribuição por situação</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={delinquencyChartConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Delinquency by Month */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Histórico de Inadimplência</CardTitle>
          <CardDescription>Pagamentos atrasados e pendentes por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={delinquencyChartConfig} className="h-[300px] w-full">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="monthLabel" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="paid" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="late" stackId="a" fill="hsl(var(--warning))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Property Breakdown Table */}
      {selectedProperty === 'all' && propertyBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Desempenho por Imóvel</CardTitle>
            <CardDescription>Receita e inadimplência de cada propriedade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Imóvel</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Receita Total</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Pagamentos Atrasados</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Taxa Inadimplência</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyBreakdown.map((item) => (
                    <tr key={item.propertyId} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{item.propertyName}</td>
                      <td className="py-3 px-4 text-sm text-right text-foreground">{formatCurrency(item.totalRevenue)}</td>
                      <td className="py-3 px-4 text-sm text-right text-foreground">{item.latePayments}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.delinquencyRate > 20 
                            ? 'bg-destructive/10 text-destructive' 
                            : item.delinquencyRate > 10 
                              ? 'bg-warning/10 text-warning' 
                              : 'bg-success/10 text-success'
                        }`}>
                          {item.delinquencyRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
