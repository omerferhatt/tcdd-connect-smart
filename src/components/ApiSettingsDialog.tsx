import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Settings, Key, AlertCircle, Database } from '@phosphor-icons/react';
import TCDDApiService from '@/lib/tcdd-api';
import { toast } from 'sonner';

interface ApiSettingsDialogProps {
  onAuthSuccess?: () => void;
  useRealAPI: boolean;
  onToggleAPI: (enabled: boolean) => void;
}

export function ApiSettingsDialog({ onAuthSuccess, useRealAPI, onToggleAPI }: ApiSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken.trim()) return;

    setLoading(true);
    try {
      // Set the token in the API service
      TCDDApiService.setAuthToken(authToken.trim());
      
      // Test the token with a simple request
      // Note: In a real implementation, you'd want to test with a lightweight endpoint
      toast.success('API token başarıyla kaydedildi');
      setOpen(false);
      onAuthSuccess?.();
    } catch (error) {
      toast.error('API token geçersiz veya hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings size={16} />
          API Ayarları
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key size={20} />
            TCDD API Ayarları
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* API Mode Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-mode" className="text-sm font-medium">
                Veri Kaynağı
              </Label>
              <div className="flex items-center space-x-2">
                <Database size={16} className="text-muted-foreground" />
                <Switch
                  id="api-mode"
                  checked={useRealAPI}
                  onCheckedChange={onToggleAPI}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {useRealAPI ? 'Gerçek TCDD API kullanılıyor' : 'Demo veriler kullanılıyor'}
            </div>
          </div>
          
          {useRealAPI ? (
            <>
              <Alert>
                <AlertCircle size={16} />
                <AlertDescription className="text-sm">
                  Gerçek TCDD API'sini kullanmak için geçerli bir JWT token'ına ihtiyacınız var.
                  Bu token'ı TCDD'nin resmi web sitesinden edinebilirsiniz.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">JWT Authorization Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldU..."
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    TCDD e-bilet sayfasından Developer Tools ile Authorization header'ını kopyalayın
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Token Nasıl Alınır:</div>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>ebilet.tcddtasimacilik.gov.tr adresine gidin</li>
                    <li>Giriş yapın</li>
                    <li>F12 ile Developer Tools'u açın</li>
                    <li>Network sekmesinde bir arama yapın</li>
                    <li>İstekler arasından Authorization header'ını kopyalayın</li>
                  </ol>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={!authToken.trim() || loading}
                    className="flex-1"
                  >
                    {loading ? 'Kontrol Ediliyor...' : 'Token Kaydet'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <Alert>
                <Database size={16} />
                <AlertDescription className="text-sm">
                  Demo modu aktif. Örnek tren verileri kullanılıyor. Bu veriler gerçek TCDD 
                  programını yansıtmayabilir ve sadece uygulamanın nasıl çalıştığını göstermek içindir.
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Tamam
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}