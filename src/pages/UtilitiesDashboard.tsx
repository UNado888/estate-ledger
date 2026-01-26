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
  Wallet,
  Calculator,
  CalendarDays,
  Target,
  Settings2,
  X,
  History,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Scale
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
  LineChart,
  Line,
  ComposedChart,
  Area,
  ReferenceLine,
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
  
  // Budget goals state
  type UtilityBudgets = Record<UtilityType, number>;
  const [budgetGoals, setBudgetGoals] = useLocalStorage<UtilityBudgets>('imobiliaria-utility-budgets', {
    water: 0,
    electricity: 0,
    gas: 0,
    condo: 0,
  });
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [editingBudgets, setEditingBudgets] = useState<UtilityBudgets>({ ...budgetGoals });
  
  // Budget history state - stores monthly snapshots of budgets and actual spending
  type BudgetHistoryRecord = {
    month: string; // YYYY-MM format
    budgets: UtilityBudgets;
    actual: UtilityBudgets;
    total: { budget: number; actual: number };
  };
  const [budgetHistory, setBudgetHistory] = useLocalStorage<BudgetHistoryRecord[]>('imobiliaria-budget-history', []);

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

  // Monthly averages and projections
  const monthlyAnalysis = useMemo(() => {
    // Group payments by month
    const monthlyTotals: Record<string, number> = {};
    const monthlyByType: Record<string, Record<UtilityType, number>> = {};
    
    utilityPayments.forEach(p => {
      if (!monthlyTotals[p.referenceMonth]) {
        monthlyTotals[p.referenceMonth] = 0;
        monthlyByType[p.referenceMonth] = { water: 0, electricity: 0, gas: 0, condo: 0 };
      }
      monthlyTotals[p.referenceMonth] += p.amount;
      monthlyByType[p.referenceMonth][p.utilityType] += p.amount;
    });
    
    const months = Object.keys(monthlyTotals).sort();
    const monthCount = months.length;
    
    // Calculate averages
    const totalSum = Object.values(monthlyTotals).reduce((a, b) => a + b, 0);
    const monthlyAverage = monthCount > 0 ? totalSum / monthCount : 0;
    
    // Average by type
    const avgByType: Record<UtilityType, number> = { water: 0, electricity: 0, gas: 0, condo: 0 };
    (['water', 'electricity', 'gas', 'condo'] as UtilityType[]).forEach(type => {
      const typeTotal = utilityPayments
        .filter(p => p.utilityType === type)
        .reduce((sum, p) => sum + p.amount, 0);
      const typeMonths = new Set(utilityPayments.filter(p => p.utilityType === type).map(p => p.referenceMonth)).size;
      avgByType[type] = typeMonths > 0 ? typeTotal / typeMonths : 0;
    });
    
    // Calculate trend (last 3 months vs previous 3 months)
    const sortedMonths = months.slice(-6);
    let trend = 0;
    if (sortedMonths.length >= 4) {
      const recentMonths = sortedMonths.slice(-3);
      const olderMonths = sortedMonths.slice(0, 3);
      const recentAvg = recentMonths.reduce((sum, m) => sum + (monthlyTotals[m] || 0), 0) / recentMonths.length;
      const olderAvg = olderMonths.reduce((sum, m) => sum + (monthlyTotals[m] || 0), 0) / olderMonths.length;
      trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    }
    
    // Project next 3 months based on average + trend
    const now = new Date();
    const projections: { month: string; projected: number; water: number; electricity: number; gas: number; condo: number }[] = [];
    const trendMultiplier = 1 + (trend / 100);
    
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = futureDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const projectedTotal = monthlyAverage * Math.pow(trendMultiplier, i / 3);
      
      projections.push({
        month: monthLabel,
        projected: projectedTotal,
        water: avgByType.water * Math.pow(trendMultiplier, i / 3),
        electricity: avgByType.electricity * Math.pow(trendMultiplier, i / 3),
        gas: avgByType.gas * Math.pow(trendMultiplier, i / 3),
        condo: avgByType.condo * Math.pow(trendMultiplier, i / 3),
      });
    }
    
    // Annual projection
    const annualProjection = monthlyAverage * 12;
    
    return {
      monthlyAverage,
      avgByType,
      trend,
      projections,
      annualProjection,
      monthCount,
    };
  }, [utilityPayments]);

  // Current month spending by type (for budget comparison)
  const currentMonthByType = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    
    const result: Record<UtilityType, number> = {
      water: 0,
      electricity: 0,
      gas: 0,
      condo: 0,
    };
    
    utilityPayments
      .filter(p => p.referenceMonth === currentMonth)
      .forEach(p => {
        result[p.utilityType] += p.amount;
      });
    
    return result;
  }, [utilityPayments]);

  // Budget progress calculation
  const budgetProgress = useMemo(() => {
    return (['water', 'electricity', 'gas', 'condo'] as UtilityType[]).map(type => {
      const budget = budgetGoals[type];
      const spent = currentMonthByType[type];
      const avg = monthlyAnalysis.avgByType[type];
      const percentage = budget > 0 ? Math.min((spent / budget) * 100, 150) : 0;
      const isOverBudget = budget > 0 && spent > budget;
      const remaining = budget > 0 ? budget - spent : 0;
      
      return {
        type,
        budget,
        spent,
        avg,
        percentage,
        isOverBudget,
        remaining,
      };
    });
  }, [budgetGoals, currentMonthByType, monthlyAnalysis.avgByType]);

  // Comparative budget analysis - tracks which types exceed budget most across history
  const budgetComparativeAnalysis = useMemo(() => {
    // Calculate historical averages of budget adherence per type
    const typePerformance: Record<UtilityType, { 
      avgPerformance: number; 
      timesExceeded: number; 
      totalExcess: number;
      totalSavings: number;
      monthsTracked: number;
      trend: 'improving' | 'worsening' | 'stable';
    }> = {
      water: { avgPerformance: 0, timesExceeded: 0, totalExcess: 0, totalSavings: 0, monthsTracked: 0, trend: 'stable' },
      electricity: { avgPerformance: 0, timesExceeded: 0, totalExcess: 0, totalSavings: 0, monthsTracked: 0, trend: 'stable' },
      gas: { avgPerformance: 0, timesExceeded: 0, totalExcess: 0, totalSavings: 0, monthsTracked: 0, trend: 'stable' },
      condo: { avgPerformance: 0, timesExceeded: 0, totalExcess: 0, totalSavings: 0, monthsTracked: 0, trend: 'stable' },
    };

    // Get monthly spending grouped by type and month
    const monthlyByType: Record<string, Record<UtilityType, number>> = {};
    utilityPayments.forEach(p => {
      if (!monthlyByType[p.referenceMonth]) {
        monthlyByType[p.referenceMonth] = { water: 0, electricity: 0, gas: 0, condo: 0 };
      }
      monthlyByType[p.referenceMonth][p.utilityType] += p.amount;
    });

    const months = Object.keys(monthlyByType).sort();
    
    // For each type, calculate performance vs budget across all months
    (['water', 'electricity', 'gas', 'condo'] as UtilityType[]).forEach(type => {
      const budget = budgetGoals[type];
      if (budget <= 0) return;

      let totalPerformance = 0;
      let performanceCount = 0;
      const recentPerformances: number[] = [];

      months.forEach(month => {
        const spent = monthlyByType[month]?.[type] || 0;
        if (spent > 0) {
          const performance = (spent / budget) * 100;
          totalPerformance += performance;
          performanceCount++;
          recentPerformances.push(performance);

          if (spent > budget) {
            typePerformance[type].timesExceeded++;
            typePerformance[type].totalExcess += (spent - budget);
          } else {
            typePerformance[type].totalSavings += (budget - spent);
          }
        }
      });

      typePerformance[type].avgPerformance = performanceCount > 0 ? totalPerformance / performanceCount : 0;
      typePerformance[type].monthsTracked = performanceCount;

      // Calculate trend from last 3 months vs previous 3
      if (recentPerformances.length >= 4) {
        const recent = recentPerformances.slice(-3);
        const older = recentPerformances.slice(-6, -3);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        if (recentAvg < olderAvg - 5) {
          typePerformance[type].trend = 'improving';
        } else if (recentAvg > olderAvg + 5) {
          typePerformance[type].trend = 'worsening';
        }
      }
    });

    // Sort by most problematic (highest avg performance = most over budget)
    const sortedTypes = (['water', 'electricity', 'gas', 'condo'] as UtilityType[])
      .filter(type => budgetGoals[type] > 0)
      .sort((a, b) => typePerformance[b].avgPerformance - typePerformance[a].avgPerformance);

    const worstType = sortedTypes[0] || null;
    const bestType = sortedTypes[sortedTypes.length - 1] || null;

    // Chart data for bar comparison
    const chartData = sortedTypes.map(type => ({
      type,
      name: utilityConfig[type].label,
      avgPerformance: typePerformance[type].avgPerformance,
      timesExceeded: typePerformance[type].timesExceeded,
      monthsTracked: typePerformance[type].monthsTracked,
      exceedRate: typePerformance[type].monthsTracked > 0 
        ? (typePerformance[type].timesExceeded / typePerformance[type].monthsTracked) * 100 
        : 0,
      totalExcess: typePerformance[type].totalExcess,
      totalSavings: typePerformance[type].totalSavings,
      trend: typePerformance[type].trend,
      fill: utilityConfig[type].color,
    }));

    return {
      typePerformance,
      sortedTypes,
      worstType,
      bestType,
      chartData,
      hasData: sortedTypes.length > 0,
    };
  }, [utilityPayments, budgetGoals]);

  // Budget history chart data - combines historical records with current month
  const budgetHistoryChartData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    
    // Get monthly spending data for the last 6 months
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push(date.toISOString().slice(0, 7));
    }
    
    // Calculate actual spending by month
    const actualByMonth: Record<string, UtilityBudgets> = {};
    utilityPayments.forEach(p => {
      if (!actualByMonth[p.referenceMonth]) {
        actualByMonth[p.referenceMonth] = { water: 0, electricity: 0, gas: 0, condo: 0 };
      }
      actualByMonth[p.referenceMonth][p.utilityType] += p.amount;
    });
    
    // Merge with budget history
    const historyMap: Record<string, BudgetHistoryRecord> = {};
    budgetHistory.forEach(record => {
      historyMap[record.month] = record;
    });
    
    // Build chart data
    return last6Months.map(month => {
      const date = new Date(month + '-01');
      const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      const actual = actualByMonth[month] || { water: 0, electricity: 0, gas: 0, condo: 0 };
      const totalActual = actual.water + actual.electricity + actual.gas + actual.condo;
      
      // For current month, use current budget goals; for past months, use history or current goals
      const historicalBudget = historyMap[month]?.budgets || (month === currentMonth ? budgetGoals : budgetGoals);
      const totalBudget = historicalBudget.water + historicalBudget.electricity + historicalBudget.gas + historicalBudget.condo;
      
      // Calculate performance percentage (how much of budget was used)
      const performance = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
      const savings = totalBudget - totalActual;
      const status = totalBudget === 0 ? 'none' : totalActual <= totalBudget ? 'ok' : 'over';
      
      return {
        month,
        label,
        actual: totalActual,
        budget: totalBudget,
        water: actual.water,
        electricity: actual.electricity,
        gas: actual.gas,
        condo: actual.condo,
        performance,
        savings,
        status,
      };
    });
  }, [utilityPayments, budgetHistory, budgetGoals]);

  // Auto-save budget history at end of each month
  const handleSaveBudgetSnapshot = () => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    
    // Check if we already have a record for current month
    const existingIndex = budgetHistory.findIndex(r => r.month === currentMonth);
    
    const actual: UtilityBudgets = { ...currentMonthByType };
    const totalActual = actual.water + actual.electricity + actual.gas + actual.condo;
    const totalBudget = budgetGoals.water + budgetGoals.electricity + budgetGoals.gas + budgetGoals.condo;
    
    const newRecord: BudgetHistoryRecord = {
      month: currentMonth,
      budgets: { ...budgetGoals },
      actual,
      total: { budget: totalBudget, actual: totalActual },
    };
    
    if (existingIndex >= 0) {
      // Update existing record
      setBudgetHistory(prev => prev.map((r, i) => i === existingIndex ? newRecord : r));
    } else {
      // Add new record
      setBudgetHistory(prev => [...prev, newRecord].slice(-12)); // Keep last 12 months
    }
    
    toast.success('Snapshot do mês salvo no histórico');
  };

  const handleSaveBudgets = () => {
    setBudgetGoals(editingBudgets);
    setShowBudgetDialog(false);
    toast.success('Metas de orçamento atualizadas');
  };

  const handleOpenBudgetDialog = () => {
    setEditingBudgets({ ...budgetGoals });
    setShowBudgetDialog(true);
  };

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

      {/* Monthly Analysis Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Média Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(monthlyAnalysis.monthlyAverage)}</p>
            <p className="text-xs text-muted-foreground mt-1">baseado em {monthlyAnalysis.monthCount} meses</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Projeção Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(monthlyAnalysis.annualProjection)}</p>
            <p className="text-xs text-muted-foreground mt-1">estimativa 12 meses</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Próximo Mês (Est.)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(monthlyAnalysis.projections[0]?.projected || 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{monthlyAnalysis.projections[0]?.month}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {monthlyAnalysis.trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-destructive" />
              ) : (
                <TrendingDown className="w-4 h-4 text-success" />
              )}
              Tendência (3 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-2xl font-bold",
              monthlyAnalysis.trend >= 0 ? "text-destructive" : "text-success"
            )}>
              {monthlyAnalysis.trend >= 0 ? '+' : ''}{monthlyAnalysis.trend.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">últimos 3 vs anteriores</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Goals Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Target className="w-5 h-5" />
              Metas de Gastos Mensais
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleOpenBudgetDialog}>
              <Settings2 className="w-4 h-4 mr-2" />
              Configurar Metas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgetProgress.every(b => b.budget === 0) ? (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhuma meta definida</p>
              <p className="text-xs text-muted-foreground mt-1">Configure metas para acompanhar seus gastos</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleOpenBudgetDialog}>
                Definir Metas
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetProgress.map(item => {
                if (item.budget === 0) return null;
                
                const config = utilityConfig[item.type];
                const Icon = config.icon;
                
                return (
                  <div key={item.type} className="bg-secondary/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                        <span className="font-medium text-foreground">{config.label}</span>
                      </div>
                      <Badge 
                        variant={item.isOverBudget ? "destructive" : item.percentage > 80 ? "outline" : "secondary"}
                        className={cn(
                          item.isOverBudget && "bg-destructive text-destructive-foreground",
                          !item.isOverBudget && item.percentage > 80 && "border-warning text-warning"
                        )}
                      >
                        {item.isOverBudget ? 'Acima' : `${item.percentage.toFixed(0)}%`}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress 
                        value={Math.min(item.percentage, 100)} 
                        className={cn(
                          "h-3",
                          item.isOverBudget && "[&>div]:bg-destructive",
                          !item.isOverBudget && item.percentage > 80 && "[&>div]:bg-warning"
                        )}
                      />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Gasto: <span className={cn(
                            "font-medium",
                            item.isOverBudget ? "text-destructive" : "text-foreground"
                          )}>{formatCurrency(item.spent)}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Meta: <span className="font-medium text-foreground">{formatCurrency(item.budget)}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Média: {formatCurrency(item.avg)}/mês</span>
                        {item.isOverBudget ? (
                          <span className="text-destructive font-medium">
                            Excedido em {formatCurrency(Math.abs(item.remaining))}
                          </span>
                        ) : (
                          <span className="text-success">
                            Restante: {formatCurrency(item.remaining)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Dialog */}
      <AlertDialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Configurar Metas de Gastos
            </AlertDialogTitle>
            <AlertDialogDescription>
              Defina limites mensais para cada tipo de utilidade. Deixe em 0 para não monitorar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {(['water', 'electricity', 'gas', 'condo'] as UtilityType[]).map(type => {
              const config = utilityConfig[type];
              const Icon = config.icon;
              const avg = monthlyAnalysis.avgByType[type];
              
              return (
                <div key={type} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32">
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                    <span className="font-medium text-foreground text-sm">{config.label}</span>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                      <Input
                        type="number"
                        min="0"
                        step="50"
                        value={editingBudgets[type] || ''}
                        onChange={(e) => setEditingBudgets(prev => ({
                          ...prev,
                          [type]: parseFloat(e.target.value) || 0
                        }))}
                        className="pl-10"
                        placeholder="0,00"
                      />
                    </div>
                    {avg > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Média histórica: {formatCurrency(avg)}/mês
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 ml-2 text-xs"
                          onClick={() => setEditingBudgets(prev => ({
                            ...prev,
                            [type]: Math.ceil(avg / 50) * 50 // Round up to nearest 50
                          }))}
                        >
                          Usar como base
                        </Button>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveBudgets}>
              Salvar Metas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Budget History Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico: Performance vs Orçamento
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleSaveBudgetSnapshot}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Salvar Snapshot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {budgetHistoryChartData.every(d => d.budget === 0 && d.actual === 0) ? (
            <div className="text-center py-12 bg-secondary/30 rounded-lg">
              <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhum dado histórico disponível</p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure metas e registre pagamentos para visualizar o histórico
              </p>
            </div>
          ) : (
            <>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={budgetHistoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <YAxis 
                      yAxisId="left"
                      tickFormatter={(v) => `R$${v.toLocaleString()}`} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => `${v}%`} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      domain={[0, 150]}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px' 
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'performance') return [`${value.toFixed(1)}%`, 'Performance'];
                        if (name === 'actual') return [formatCurrency(value), 'Gasto Real'];
                        if (name === 'budget') return [formatCurrency(value), 'Orçamento'];
                        return [formatCurrency(value), name];
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        if (value === 'actual') return 'Gasto Real';
                        if (value === 'budget') return 'Orçamento';
                        if (value === 'performance') return 'Performance (%)';
                        return value;
                      }}
                    />
                    <ReferenceLine 
                      yAxisId="right" 
                      y={100} 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="5 5" 
                      label={{ value: '100%', fill: 'hsl(var(--destructive))', fontSize: 10 }}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="actual" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="budget" 
                      fill="hsl(var(--muted-foreground))" 
                      radius={[4, 4, 0, 0]}
                      opacity={0.4}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="performance" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              {/* Monthly summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
                {budgetHistoryChartData.map(item => {
                  const isOverBudget = item.status === 'over';
                  const hasNoBudget = item.status === 'none';
                  
                  return (
                    <div 
                      key={item.month} 
                      className={cn(
                        "rounded-lg p-3 text-center",
                        hasNoBudget && "bg-secondary/30",
                        !hasNoBudget && !isOverBudget && "bg-success/10 border border-success/30",
                        isOverBudget && "bg-destructive/10 border border-destructive/30"
                      )}
                    >
                      <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                      <p className="text-sm font-bold text-foreground mt-1">
                        {formatCurrency(item.actual)}
                      </p>
                      {!hasNoBudget && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            de {formatCurrency(item.budget)}
                          </p>
                          <Badge 
                            variant={isOverBudget ? "destructive" : "secondary"}
                            className={cn(
                              "mt-1 text-xs",
                              !isOverBudget && "bg-success/20 text-success hover:bg-success/30"
                            )}
                          >
                            {item.performance.toFixed(0)}%
                          </Badge>
                        </>
                      )}
                      {item.savings !== 0 && item.budget > 0 && (
                        <p className={cn(
                          "text-xs mt-1",
                          item.savings > 0 ? "text-success" : "text-destructive"
                        )}>
                          {item.savings > 0 ? 'Economia:' : 'Excesso:'} {formatCurrency(Math.abs(item.savings))}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                * A linha de 100% indica quando o gasto real iguala o orçamento. Acima = excedido, abaixo = economia.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Comparative Budget Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Análise Comparativa: Performance por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!budgetComparativeAnalysis.hasData ? (
            <div className="text-center py-12 bg-secondary/30 rounded-lg">
              <Scale className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Sem metas definidas para análise</p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure metas para ver qual tipo mais excede o orçamento
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleOpenBudgetDialog}>
                Definir Metas
              </Button>
            </div>
          ) : (
            <>
              {/* Summary Insight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {budgetComparativeAnalysis.worstType && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Maior Risco</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = utilityConfig[budgetComparativeAnalysis.worstType].icon;
                        return <Icon className="w-8 h-8" style={{ color: utilityConfig[budgetComparativeAnalysis.worstType].color }} />;
                      })()}
                      <div>
                        <p className="font-bold text-foreground text-lg">
                          {utilityConfig[budgetComparativeAnalysis.worstType].label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Média de {budgetComparativeAnalysis.typePerformance[budgetComparativeAnalysis.worstType].avgPerformance.toFixed(0)}% do orçamento
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <Badge variant="destructive">
                        {budgetComparativeAnalysis.typePerformance[budgetComparativeAnalysis.worstType].timesExceeded}x excedido
                      </Badge>
                      <span className="text-muted-foreground">
                        Total: {formatCurrency(budgetComparativeAnalysis.typePerformance[budgetComparativeAnalysis.worstType].totalExcess)} acima
                      </span>
                    </div>
                  </div>
                )}

                {budgetComparativeAnalysis.bestType && budgetComparativeAnalysis.bestType !== budgetComparativeAnalysis.worstType && (
                  <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium text-success">Melhor Performance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = utilityConfig[budgetComparativeAnalysis.bestType].icon;
                        return <Icon className="w-8 h-8" style={{ color: utilityConfig[budgetComparativeAnalysis.bestType].color }} />;
                      })()}
                      <div>
                        <p className="font-bold text-foreground text-lg">
                          {utilityConfig[budgetComparativeAnalysis.bestType].label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Média de {budgetComparativeAnalysis.typePerformance[budgetComparativeAnalysis.bestType].avgPerformance.toFixed(0)}% do orçamento
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <Badge className="bg-success/20 text-success hover:bg-success/30">
                        {formatCurrency(budgetComparativeAnalysis.typePerformance[budgetComparativeAnalysis.bestType].totalSavings)} economizados
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Comparative Bar Chart */}
              <div className="h-[280px] mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetComparativeAnalysis.chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      domain={[0, (dataMax: number) => Math.max(150, Math.ceil(dataMax / 10) * 10)]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={90}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: '8px' 
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'avgPerformance') return [`${value.toFixed(1)}%`, 'Performance Média'];
                        if (name === 'exceedRate') return [`${value.toFixed(1)}%`, 'Taxa de Excesso'];
                        return [value, name];
                      }}
                    />
                    <ReferenceLine 
                      x={100} 
                      stroke="hsl(var(--destructive))" 
                      strokeDasharray="5 5"
                      label={{ value: 'Meta', fill: 'hsl(var(--destructive))', fontSize: 11, position: 'top' }}
                    />
                    <Bar 
                      dataKey="avgPerformance" 
                      radius={[0, 4, 4, 0]}
                    >
                      {budgetComparativeAnalysis.chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.avgPerformance > 100 ? 'hsl(var(--destructive))' : entry.fill}
                          opacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Type Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {budgetComparativeAnalysis.chartData.map(item => {
                  const isOverBudget = item.avgPerformance > 100;
                  const Icon = utilityConfig[item.type].icon;
                  
                  return (
                    <div 
                      key={item.type} 
                      className={cn(
                        "rounded-lg p-4 border",
                        isOverBudget 
                          ? "bg-destructive/5 border-destructive/30" 
                          : "bg-secondary/30 border-border"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" style={{ color: item.fill }} />
                          <span className="font-medium text-foreground text-sm">{item.name}</span>
                        </div>
                        {item.trend !== 'stable' && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs",
                            item.trend === 'improving' ? "text-success" : "text-destructive"
                          )}>
                            {item.trend === 'improving' ? (
                              <ArrowDownRight className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            <span>{item.trend === 'improving' ? 'Melhorando' : 'Piorando'}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-bold text-foreground">
                            {item.avgPerformance.toFixed(0)}%
                          </span>
                          <Badge 
                            variant={isOverBudget ? "destructive" : "secondary"}
                            className={!isOverBudget ? "bg-success/20 text-success" : ""}
                          >
                            {isOverBudget ? 'Acima' : 'OK'}
                          </Badge>
                        </div>
                        
                        <Progress 
                          value={Math.min(item.avgPerformance, 150)} 
                          max={150}
                          className={cn(
                            "h-2",
                            isOverBudget && "[&>div]:bg-destructive"
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <span className="block">Excedeu</span>
                            <span className="font-medium text-foreground">{item.timesExceeded}x</span>
                          </div>
                          <div>
                            <span className="block">Meses</span>
                            <span className="font-medium text-foreground">{item.monthsTracked}</span>
                          </div>
                        </div>
                        
                        {item.totalExcess > 0 && (
                          <p className="text-xs text-destructive">
                            Total excedido: {formatCurrency(item.totalExcess)}
                          </p>
                        )}
                        {item.totalSavings > 0 && (
                          <p className="text-xs text-success">
                            Total economizado: {formatCurrency(item.totalSavings)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                * Performance média baseada no histórico de pagamentos vs metas definidas. 100% = exatamente na meta.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Average by Type Cards */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Média Mensal por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(['water', 'electricity', 'gas', 'condo'] as UtilityType[]).map(type => {
              const config = utilityConfig[type];
              const Icon = config.icon;
              const avg = monthlyAnalysis.avgByType[type];
              
              if (avg === 0) return null;
              
              return (
                <div key={type} className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                    <span className="font-medium text-foreground text-sm">{config.label}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(avg)}</p>
                  <p className="text-xs text-muted-foreground">média/mês</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Projection Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="w-5 h-5" />
            Projeção para os Próximos 3 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAnalysis.projections}>
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
                    name === 'projected' ? 'Total Projetado' : utilityConfig[name as UtilityType]?.label || name
                  ]}
                />
                <Legend formatter={(value) => 
                  value === 'projected' ? 'Total Projetado' : utilityConfig[value as UtilityType]?.label || value
                } />
                <Bar dataKey="water" fill={utilityConfig.water.color} stackId="a" />
                <Bar dataKey="electricity" fill={utilityConfig.electricity.color} stackId="a" />
                <Bar dataKey="gas" fill={utilityConfig.gas.color} stackId="a" />
                <Bar dataKey="condo" fill={utilityConfig.condo.color} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            * Projeções baseadas na média histórica e tendência dos últimos meses
          </p>
        </CardContent>
      </Card>

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

      {/* Comparative Chart - Property Comparison */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Comparativo de Gastos por Imóvel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={Object.entries(statsByProperty)
                  .map(([propertyId, data]) => {
                    const property = propertyMap[propertyId];
                    if (!property) return null;
                    
                    // Calculate totals by utility type for this property
                    const utilityBreakdown = utilityPayments
                      .filter(p => p.propertyId === propertyId)
                      .reduce((acc, p) => {
                        acc[p.utilityType] = (acc[p.utilityType] || 0) + p.amount;
                        return acc;
                      }, {} as Record<UtilityType, number>);
                    
                    return {
                      name: property.name.length > 20 ? property.name.slice(0, 20) + '...' : property.name,
                      fullName: property.name,
                      total: data.total,
                      pending: data.pending,
                      water: utilityBreakdown.water || 0,
                      electricity: utilityBreakdown.electricity || 0,
                      gas: utilityBreakdown.gas || 0,
                      condo: utilityBreakdown.condo || 0,
                    };
                  })
                  .filter(Boolean)
                  .sort((a, b) => (b?.total || 0) - (a?.total || 0))
                }
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  tickFormatter={(v) => `R$${v.toLocaleString()}`} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
                />
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
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullName || label;
                  }}
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

      {/* Costs by Property Summary */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Resumo por Imóvel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(statsByProperty)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([propertyId, data]) => {
              const property = propertyMap[propertyId];
              if (!property) return null;
              
              // Calculate percentage of total
              const percentOfTotal = globalStats.total > 0 
                ? ((data.total / globalStats.total) * 100).toFixed(1) 
                : 0;
              
              return (
                <div key={propertyId} className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">{property.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{property.address}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {percentOfTotal}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-foreground">{formatCurrency(data.total)}</span>
                    {data.pending > 0 && (
                      <Badge variant="outline" className="text-warning border-warning/50">
                        {formatCurrency(data.pending)} pend.
                      </Badge>
                    )}
                  </div>
                  {/* Mini breakdown */}
                  <div className="flex gap-1 mt-2">
                    {(['water', 'electricity', 'gas', 'condo'] as UtilityType[]).map(type => {
                      const typeTotal = utilityPayments
                        .filter(p => p.propertyId === propertyId && p.utilityType === type)
                        .reduce((sum, p) => sum + p.amount, 0);
                      if (typeTotal === 0) return null;
                      const Icon = utilityConfig[type].icon;
                      return (
                        <div 
                          key={type} 
                          className="flex items-center gap-1 text-xs text-muted-foreground"
                          title={`${utilityConfig[type].label}: ${formatCurrency(typeTotal)}`}
                        >
                          <Icon className="w-3 h-3" style={{ color: utilityConfig[type].color }} />
                        </div>
                      );
                    })}
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
