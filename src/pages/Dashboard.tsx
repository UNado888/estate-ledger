import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  PieChart
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { PropertyCard } from '@/components/PropertyCard';
import { AlertItem } from '@/components/AlertItem';
import { mockProperties, mockTenants, mockFinancialHistory, mockRentalHistory } from '@/data/mockData';
import { usePaymentAlerts } from '@/hooks/usePaymentAlerts';
import {
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function Dashboard() {
  // Calculate metrics
  const totalProperties = mockProperties.length;
  const rentedProperties = mockProperties.filter(p => p.status === 'rented').length;
  const vacantProperties = mockProperties.filter(p => p.status === 'vacant').length;
  const occupancyRate = ((rentedProperties / totalProperties) * 100).toFixed(1);
  
  const totalMonthlyRevenue = mockProperties
    .filter(p => p.status === 'rented')
    .reduce((sum, p) => sum + p.monthlyRent, 0);
  
  const totalPortfolioValue = mockProperties.reduce((sum, p) => sum + p.currentMarketValue, 0);
  const totalAcquisitionCost = mockProperties.reduce((sum, p) => sum + p.acquisitionCost + p.renovationCost, 0);
  const totalEquity = totalPortfolioValue - totalAcquisitionCost;
  const equityPercent = ((totalEquity / totalAcquisitionCost) * 100).toFixed(1);

  const activeTenants = mockTenants.filter(t => t.status === 'active').length;
  
  // Generate automatic alerts
  const paymentAlerts = usePaymentAlerts({ 
    properties: mockProperties, 
    rentalHistory: mockRentalHistory 
  });
  const unreadAlerts = paymentAlerts;

  // Chart data - last 12 months
  const revenueData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const monthStr = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    
    const monthRecords = mockFinancialHistory.filter(r => {
      const recordDate = new Date(r.month);
      return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === date.getFullYear();
    });
    
    const grossRevenue = monthRecords.reduce((sum, r) => sum + r.grossRevenue, 0);
    const netRevenue = monthRecords.reduce((sum, r) => sum + r.netRevenue, 0);
    
    return { name: monthStr, bruto: grossRevenue, liquido: netRevenue };
  });

  // Property type distribution
  const typeDistribution = [
    { name: 'Apartamentos', value: mockProperties.filter(p => p.type === 'apartment').length, color: 'hsl(221, 83%, 53%)' },
    { name: 'Casas', value: mockProperties.filter(p => p.type === 'house').length, color: 'hsl(142, 71%, 45%)' },
    { name: 'Comercial', value: mockProperties.filter(p => p.type === 'commercial').length, color: 'hsl(38, 92%, 50%)' },
  ];

  // ROI comparison
  const roiComparison = mockProperties.map(p => ({
    name: p.name.split(' ')[0],
    roi: Number(((p.monthlyRent * 12) / (p.acquisitionCost + p.renovationCost) * 100).toFixed(2)),
    valorização: Number((((p.currentMarketValue - p.acquisitionCost - p.renovationCost) / (p.acquisitionCost + p.renovationCost)) * 100).toFixed(1)),
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    return `R$ ${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard Global</h1>
          <p className="text-muted-foreground">Visão consolidada do portfólio imobiliário</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita Mensal"
          value={formatCurrency(totalMonthlyRevenue)}
          subtitle="líquido estimado"
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 8.2, label: 'vs mês anterior' }}
          variant="success"
        />
        <StatCard
          title="Valor do Portfólio"
          value={formatCurrency(totalPortfolioValue)}
          subtitle={`${equityPercent}% equity`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 12.5, label: 'YoY' }}
          variant="default"
        />
        <StatCard
          title="Taxa de Ocupação"
          value={`${occupancyRate}%`}
          subtitle={`${rentedProperties}/${totalProperties} imóveis`}
          icon={<Building2 className="w-5 h-5" />}
          variant={Number(occupancyRate) >= 80 ? 'success' : 'warning'}
        />
        <StatCard
          title="Inquilinos Ativos"
          value={activeTenants}
          subtitle="contratos vigentes"
          icon={<Users className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Evolução da Receita (12 meses)</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorBruto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLiquido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="bruto" 
                  stroke="hsl(221, 83%, 53%)" 
                  fillOpacity={1} 
                  fill="url(#colorBruto)"
                  name="Receita Bruta"
                />
                <Area 
                  type="monotone" 
                  dataKey="liquido" 
                  stroke="hsl(142, 71%, 45%)" 
                  fillOpacity={1} 
                  fill="url(#colorLiquido)"
                  name="Receita Líquida"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Distribuição por Tipo</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
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
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {typeDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI Chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Comparativo ROI x Valorização por Imóvel</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roiComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                dataKey="name" 
                type="category"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={80}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend />
              <Bar dataKey="roi" fill="hsl(221, 83%, 53%)" name="ROI Anual" radius={[0, 4, 4, 0]} />
              <Bar dataKey="valorização" fill="hsl(142, 71%, 45%)" name="Valorização" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties Quick View */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground">Imóveis em Destaque</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockProperties.slice(0, 2).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Alertas ({unreadAlerts.length})
            </h3>
          </div>
          <div className="space-y-3">
            {unreadAlerts.slice(0, 3).map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
