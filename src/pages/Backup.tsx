import { HardDrive, RefreshCw, CheckCircle, AlertCircle, Clock, FolderOpen, Database, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function Backup() {
  const [autoBackup, setAutoBackup] = useState(true);
  const [nasPath, setNasPath] = useState('\\\\NAS\\Backups\\Holding');

  const backupHistory = [
    { date: '18/01/2024 14:30', status: 'success', size: '245 MB', duration: '2m 15s' },
    { date: '17/01/2024 14:30', status: 'success', size: '244 MB', duration: '2m 08s' },
    { date: '16/01/2024 14:30', status: 'success', size: '243 MB', duration: '2m 22s' },
    { date: '15/01/2024 14:30', status: 'error', size: '-', duration: '-' },
    { date: '14/01/2024 14:30', status: 'success', size: '241 MB', duration: '2m 05s' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Configurações de Backup</h1>
          <p className="text-muted-foreground">Gerencie backups automáticos para o NAS local</p>
        </div>
        <Button className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Executar Backup Agora
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Último Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Hoje, 14:30</p>
                <p className="text-sm text-muted-foreground">245 MB em 2m 15s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximo Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Amanhã, 14:30</p>
                <p className="text-sm text-muted-foreground">Agendado automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Armazenamento NAS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Usado: 12.4 GB</span>
                <span className="text-muted-foreground">Livre: 487.6 GB</span>
              </div>
              <Progress value={2.5} className="h-2" />
              <p className="text-xs text-muted-foreground">2.5% de 500 GB utilizados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações
            </CardTitle>
            <CardDescription>Configure os parâmetros de backup automático</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-backup" className="font-medium">Backup Automático</Label>
                <p className="text-sm text-muted-foreground">Executa backup diário às 14:30</p>
              </div>
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nas-path">Caminho do NAS</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nas-path"
                    value={nasPath}
                    onChange={(e) => setNasPath(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="secondary">Testar</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Retenção de Backups</Label>
              <p className="text-sm text-muted-foreground">Manter últimos 30 backups (aproximadamente 7.5 GB)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Database className="w-5 h-5" />
              Banco de Dados
            </CardTitle>
            <CardDescription>Informações do PostgreSQL local</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Host</p>
                <p className="font-mono text-foreground">localhost:5432</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Database</p>
                <p className="font-mono text-foreground">holding_db</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Tamanho</p>
                <p className="font-mono text-foreground">156 MB</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Tabelas</p>
                <p className="font-mono text-foreground">12</p>
              </div>
            </div>
            <Button variant="outline" className="w-full gap-2">
              <Database className="w-4 h-4" />
              Verificar Conexão
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Histórico de Backups</CardTitle>
          <CardDescription>Últimos 5 backups realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((backup, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  {backup.status === 'success' ? (
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">{backup.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {backup.status === 'success' ? `${backup.size} • ${backup.duration}` : 'Falha na conexão com NAS'}
                    </p>
                  </div>
                </div>
                {backup.status === 'success' && (
                  <Button variant="ghost" size="sm">Restaurar</Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
