import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PropertyImageUploadProps {
  imageUrl?: string;
  onChange: (imageUrl: string | undefined) => void;
}

export function PropertyImageUpload({ imageUrl, onChange }: PropertyImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <Label>Foto do Imóvel</Label>
      <div className="flex items-center gap-4">
        <div
          onClick={() => inputRef.current?.click()}
          className="relative w-32 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors flex items-center justify-center overflow-hidden group"
        >
          {imageUrl ? (
            <>
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs">Adicionar</span>
            </div>
          )}
        </div>
        {imageUrl && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-destructive hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Remover
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
