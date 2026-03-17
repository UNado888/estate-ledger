import { PropertyUtilities, UtilityResponsible } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Droplets, Zap, Flame, Building } from 'lucide-react';

interface UtilitiesConfigProps {
  utilities: PropertyUtilities;
  onChange: (utilities: PropertyUtilities) => void;
}

const utilityItems = [
  { key: 'water' as const, label: 'Água', icon: Droplets },
  { key: 'electricity' as const, label: 'Luz', icon: Zap },
  { key: 'gas' as const, label: 'Gás', icon: Flame },
  { key: 'condo' as const, label: 'Condomínio', icon: Building },
];

const responsibleOptions = [
  { value: 'holding', label: 'Holding' },
  { value: 'tenant', label: 'Inquilino' },
];

export const defaultUtilities: PropertyUtilities = {
  water: { enabled: false, responsible: 'tenant' },
  electricity: { enabled: false, responsible: 'tenant' },
  gas: { enabled: false, responsible: 'tenant' },
  condo: { enabled: false, responsible: 'tenant' },
};

export function UtilitiesConfig({ utilities, onChange }: UtilitiesConfigProps) {
  const handleToggle = (key: keyof PropertyUtilities, enabled: boolean) => {
    onChange({
      ...utilities,
      [key]: { ...utilities[key], enabled },
    });
  };

  const handleResponsibleChange = (key: keyof PropertyUtilities, responsible: UtilityResponsible) => {
    onChange({
      ...utilities,
      [key]: { ...utilities[key], responsible },
    });
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Contas e Utilidades</Label>
      <p className="text-sm text-muted-foreground">
        Selecione quais contas podem ficar pendentes e quem é responsável
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {utilityItems.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
              utilities[key].enabled
                ? 'border-primary bg-primary/5'
                : 'border-border bg-secondary/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <Switch
                checked={utilities[key].enabled}
                onCheckedChange={(checked) => handleToggle(key, checked)}
              />
              <Icon className={`w-5 h-5 ${utilities[key].enabled ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`font-medium ${utilities[key].enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {utilities[key].enabled && (
              <Select
                value={utilities[key].responsible}
                onValueChange={(v) => handleResponsibleChange(key, v as UtilityResponsible)}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {responsibleOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}