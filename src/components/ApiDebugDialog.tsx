import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code, Copy } from '@phosphor-icons/react';
import { Station } from '@/lib/railway-data';
import { toast } from 'sonner';

interface ApiDebugDialogProps {
  fromStation?: Station;
  toStation?: Station;
}

export function ApiDebugDialog({ fromStation, toStation }: ApiDebugDialogProps) {
  const [open, setOpen] = useState(false);

  const generateCurlCommand = () => {
    if (!fromStation?.tcddId || !toStation?.tcddId) return '';
    
    const requestBody = {
      searchRoutes: [{
        departureStationId: fromStation.tcddId,
        departureStationName: fromStation.name.toUpperCase(),
        arrivalStationId: toStation.tcddId,
        arrivalStationName: toStation.name.toUpperCase(),
        departureDate: new Date().toISOString().split('T')[0] + ' 12:00:00'
      }],
      passengerTypeCounts: [{
        id: 0,
        count: 1
      }],
      searchReservation: false,
      searchType: 'DOMESTIC'
    };

    return `curl 'https://web-api-prod-ytp.tcddtasimacilik.gov.tr/tms/train/train-availability?environment=dev&userId=1' \\
  -H 'Accept: application/json, text/plain, */*' \\
  -H 'Accept-Language: tr' \\
  -H 'Authorization: YOUR_JWT_TOKEN_HERE' \\
  -H 'Connection: keep-alive' \\
  -H 'Content-Type: application/json' \\
  -H 'Origin: https://ebilet.tcddtasimacilik.gov.tr' \\
  -H 'User-Agent: Mozilla/5.0 (compatible; TCDDConnectedTravels/1.0)' \\
  -H 'unit-id: 3895' \\
  --data-raw '${JSON.stringify(requestBody, null, 2)}'`;
  };

  const generateJavaScriptCode = () => {
    if (!fromStation?.tcddId || !toStation?.tcddId) return '';
    
    const requestBody = {
      searchRoutes: [{
        departureStationId: fromStation.tcddId,
        departureStationName: fromStation.name.toUpperCase(),
        arrivalStationId: toStation.tcddId,
        arrivalStationName: toStation.name.toUpperCase(),
        departureDate: new Date().toISOString().split('T')[0] + ' 12:00:00'
      }],
      passengerTypeCounts: [{
        id: 0,
        count: 1
      }],
      searchReservation: false,
      searchType: 'DOMESTIC'
    };

    return `const searchTrains = async () => {
  const response = await fetch('https://web-api-prod-ytp.tcddtasimacilik.gov.tr/tms/train/train-availability?environment=dev&userId=1', {
    method: 'POST',
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'tr',
      'Authorization': 'YOUR_JWT_TOKEN_HERE',
      'Content-Type': 'application/json',
      'Origin': 'https://ebilet.tcddtasimacilik.gov.tr',
      'User-Agent': 'Mozilla/5.0 (compatible; TCDDConnectedTravels/1.0)',
      'unit-id': '3895'
    },
    body: JSON.stringify(${JSON.stringify(requestBody, null, 6)})
  });
  
  const data = await response.json();
  console.log(data);
};`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kod panoya kopyalandı');
  };

  const hasStations = fromStation?.tcddId && toStation?.tcddId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Code size={16} />
          API Kodu Görüntüle
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code size={20} />
            TCDD API Kod Örnekleri
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {hasStations ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{fromStation.name}</Badge>
                <span>→</span>
                <Badge variant="outline">{toStation.name}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Seçilen istasyonlar için API çağrısı örnekleri:
              </p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Kod örneklerini görmek için önce istasyon seçimi yapın.
            </div>
          )}
          
          {hasStations && (
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curl" className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">cURL Komutu</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateCurlCommand())}
                    className="gap-1"
                  >
                    <Copy size={14} />
                    Kopyala
                  </Button>
                </div>
                <ScrollArea className="h-64 w-full rounded border bg-muted p-4">
                  <pre className="text-xs">
                    <code>{generateCurlCommand()}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="javascript" className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">JavaScript Fetch</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateJavaScriptCode())}
                    className="gap-1"
                  >
                    <Copy size={14} />
                    Kopyala
                  </Button>
                </div>
                <ScrollArea className="h-64 w-full rounded border bg-muted p-4">
                  <pre className="text-xs">
                    <code>{generateJavaScriptCode()}</code>
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
            <strong>Önemli Notlar:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>JWT token'ı TCDD e-bilet sitesinden alınmalıdır</li>
              <li>Token'lar belirli süre sonra geçerliliğini yitirir</li>
              <li>unit-id değeri değişebilir, güncel değeri kontrol edin</li>
              <li>CORS politikaları nedeniyle tarayıcıdan direkt çağrı yapılamayabilir</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}