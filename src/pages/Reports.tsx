import { FileText, Download, Calendar, Building2, Users, TrendingUp } from 'lucide-react';
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
import { mockProperties } from '@/data/mockData';

export default function Reports() {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('12');

  const reportTypes = [
    {
      id: 'executive',
      title: 'Relatório Executivo',
      description: 'Visão consolidada do portfólio com KPIs principais e análise de performance.',
      icon: TrendingUp,
      color: 'bg-primary/10 text-primary',
    },
    {
      id: 'property',
      title: 'Relatório por Imóvel',
      description: 'Análise detalhada de um ativo específico com histórico financeiro e inquilinos.',
      icon: Building2,
      color: 'bg-success/10 text-success',
    },
    {
      id: 'tenant',
      title: 'Relatório de Inquilinos',
      description: 'Lista completa de locatários com status de pagamentos e avaliações.',
      icon: Users,
      color: 'bg-warning/10 text-warning',
    },
    {
      id: 'dre',
      title: 'DRE Consolidado',
      description: 'Demonstrativo de resultados com receitas, despesas e lucro líquido.',
      icon: FileText,
      color: 'bg-chart-accent/10 text-chart-accent',
    },
  ];

  const handleGenerateReport = (reportId: string) => {
    // In a real app, this would generate a PDF
    console.log(`Generating ${reportId} report for property ${selectedProperty} over ${selectedPeriod} months`);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Gere relatórios executivos em PDF para análise offline</p>
        </div>
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
              {mockProperties.map((property) => (
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
              <SelectItem value="60">Últimos 5 anos</SelectItem>
              <SelectItem value="120">Últimos 10 anos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <Card key={report.id} className="card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.color}`}>
                  <report.icon className="w-6 h-6" />
                </div>
              </div>
              <CardTitle className="font-display">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full gap-2" 
                onClick={() => handleGenerateReport(report.id)}
              >
                <Download className="w-4 h-4" />
                Gerar PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Relatórios Recentes</h3>
        <div className="space-y-3">
          {[
            { name: 'Relatório Executivo - Janeiro 2024', date: '15/01/2024', size: '2.4 MB' },
            { name: 'DRE Consolidado - Q4 2023', date: '05/01/2024', size: '1.8 MB' },
            { name: 'Relatório Edifício Aurora - 2023', date: '20/12/2023', size: '3.1 MB' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{report.name}</p>
                  <p className="text-sm text-muted-foreground">{report.date} • {report.size}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
