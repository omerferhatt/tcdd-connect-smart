import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { JourneyCard } from './JourneyCard';
import { Journey, Station } from '@/lib/railway-data';
import { Train, Warning, Info } from '@phosphor-icons/react';

interface SearchResultsProps {
  journeys: Journey[];
  fromStation: Station;
  toStation: Station;
  loading?: boolean;
}

export function SearchResults({ journeys, fromStation, toStation, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-lg">Rotalar aranıyor...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (journeys.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <Alert>
            <Warning size={16} />
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <strong>{fromStation.name}</strong> - <strong>{toStation.name}</strong> 
                  arası için hiç seyahat seçeneği bulunamadı.
                </div>
                <div className="text-sm">
                  Öneriler:
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Farklı tarihler deneyin</li>
                    <li>Yakın istasyonları kontrol edin</li>
                    <li>Otobüs veya uçak alternatiflerini değerlendirin</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const directJourneys = journeys.filter(j => j.connectionCount === 0);
  const connectedJourneys = journeys.filter(j => j.connectionCount > 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Train size={24} />
            <span>
              {fromStation.name} → {toStation.name}
            </span>
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">
              {journeys.length} seçenek bulundu
            </Badge>
            {directJourneys.length > 0 && (
              <Badge variant="default">
                {directJourneys.length} direkt sefer
              </Badge>
            )}
            {connectedJourneys.length > 0 && (
              <Badge variant="secondary">
                {connectedJourneys.length} aktarmalı sefer
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Direct journeys */}
      {directJourneys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Direkt Seferler
          </h3>
          <div className="space-y-3">
            {directJourneys.map(journey => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </div>
        </div>
      )}

      {/* Connected journeys */}
      {connectedJourneys.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Aktarmalı Seferler
            </h3>
            
            {directJourneys.length === 0 && (
              <Alert className="mb-4">
                <Info size={16} />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Direkt sefer bulunamadı.</strong> Ancak aktarmalı seçenekler mevcut!
                    </div>
                    <div className="text-sm">
                      Bu rotalar TCDD'nin gerçek istasyon bağlantıları kullanılarak bulunmuştur. 
                      Aktarma sürelerini ve ayrı bilet satın alma gereksinimini dikkate alın.
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="space-y-3">
            {connectedJourneys.map(journey => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </div>
        </div>
      )}

      {/* Info footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="font-medium">💡 Faydalı İpuçları:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Aktarmalı seferlerde biletlerinizi ayrı ayrı satın almanız gerekebilir</li>
              <li>Aktarma sürelerini dikkate alarak istasyona erken varın</li>
              <li>Bagaj taşımak için ek süre hesaplayın</li>
              <li>Resmi TCDD web sitesinden güncel bilet durumunu kontrol edin</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}