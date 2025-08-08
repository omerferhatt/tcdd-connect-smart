import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { JourneyCard } from './JourneyCard';
import { Journey, Station, findConnectedAlternatives, streamConnectedAlternatives } from '@/lib/railway-data';
import { Train, Warning, Info } from '@phosphor-icons/react';

interface SearchResultsProps {
  journeys: Journey[];
  fromStation: Station;
  toStation: Station;
  departureDate?: Date;
  loading?: boolean;
  hideDisabledOnlyTrains?: boolean;
}

export function SearchResults({ journeys, fromStation, toStation, departureDate, loading, hideDisabledOnlyTrains = false }: SearchResultsProps) {
  const [expandedJourney, setExpandedJourney] = useState<string | null>(null);
  const [connectedAlternatives, setConnectedAlternatives] = useState<Record<string, Journey[]>>({});
  const [loadingAlternatives, setLoadingAlternatives] = useState<Record<string, boolean>>({});
  const [searchProgress, setSearchProgress] = useState<Record<string, { currentStation?: string; done: boolean }>>({});
  const [abortControllers, setAbortControllers] = useState<Record<string, AbortController>>({});

  const handleJourneyClick = async (journey: Journey) => {
    // Only handle clicks on direct journeys (connectionCount === 0)
    if (journey.connectionCount !== 0 || !departureDate) {
      return;
    }

    const journeyId = journey.id;
    const isExpanded = expandedJourney === journeyId;

    if (isExpanded) {
      // Collapse if already expanded and abort in-flight search
      if (abortControllers[journeyId]) {
        abortControllers[journeyId].abort();
      }
      setExpandedJourney(null);
      return;
    }

    // Expand and load alternatives
    setExpandedJourney(journeyId);

    // Check if we already have alternatives for this journey
    if (connectedAlternatives[journeyId]) {
      return;
    }

    // Cancel any existing search for this journey
    if (abortControllers[journeyId]) {
      abortControllers[journeyId].abort();
    }

    const controller = new AbortController();
    setAbortControllers(prev => ({ ...prev, [journeyId]: controller }));

    setLoadingAlternatives(prev => ({ ...prev, [journeyId]: true }));
    setSearchProgress(prev => ({ ...prev, [journeyId]: { currentStation: undefined, done: false } }));
    setConnectedAlternatives(prev => ({ ...prev, [journeyId]: [] }));

    (async () => {
      try {
        const departureTime = journey.segments[0].departure;
        for await (const item of streamConnectedAlternatives(
          fromStation,
          toStation,
          departureDate,
          departureTime,
          {
            signal: controller.signal,
            onProgress: (stationName) => {
              setSearchProgress(prev => ({ ...prev, [journeyId]: { currentStation: stationName, done: false } }));
            }
          }
        )) {
          if (controller.signal.aborted) break;
          if (item.station) {
            // progress handled
          }
          if (item.journey) {
            const j = item.journey as Journey;
            if (hideDisabledOnlyTrains && isDisabledOnly(j)) {
              // skip disabled-only connected
            } else {
              setConnectedAlternatives(prev => ({
                ...prev,
                [journeyId]: [...(prev[journeyId] || []), j]
              }));
            }
          }
          if (item.done) {
            setSearchProgress(prev => ({ ...prev, [journeyId]: { ...prev[journeyId], done: true } }));
          }
        }
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          console.error('Error streaming connected alternatives:', error);
        }
      } finally {
        setLoadingAlternatives(prev => ({ ...prev, [journeyId]: false }));
      }
    })();
  };
  
  // Cleanup on unmount: abort all in-flight searches
  useEffect(() => {
    return () => {
      Object.values(abortControllers).forEach(c => c.abort());
    };
  }, [abortControllers]);
  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-lg">Seyahat seçenekleri aranıyor...</div>
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

  const isDisabledOnly = (j: Journey) => {
    const normalKeywords = ['pulman','ekonomi','economy','business','orta','standart'];
    let hasNormal = false;
    let hasDisabled = false;
    for (const seg of j.segments) {
      const cats: any[] = (seg as any).seatCategories || [];
      for (const c of cats) {
        const raw = (c.name || c.categoryName || '').toString().toLowerCase();
        const avail = c.availableSeats ?? c.available ?? 0;
        if (avail > 0) {
          if (raw.includes('engelli')) hasDisabled = true;
          if (normalKeywords.some(k => raw.includes(k))) hasNormal = true;
        }
      }
    }
    return hasDisabled && !hasNormal;
  };

  const filteredJourneys = hideDisabledOnlyTrains ? journeys.filter(j => !isDisabledOnly(j)) : journeys;
  const directJourneys = filteredJourneys.filter(j => j.connectionCount === 0);

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
              {directJourneys.length} direkt sefer bulundu
            </Badge>
            <Badge variant="secondary">
              Bağlantılı seçenekler için seferlere tıklayın
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Direct journeys only */}
      {directJourneys.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Direkt Seferler
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sefere tıklayarak bağlantılı alternatif seçenekleri görün
            </p>
          </div>
          
          <div className="space-y-3">
            {directJourneys.map(journey => (
              <div key={journey.id} className="space-y-2">
                <JourneyCard 
                  journey={journey} 
                  onClick={() => handleJourneyClick(journey)}
                />
                
                {/* Show connected alternatives when expanded */}
                {expandedJourney === journey.id && (
                  <div className="ml-4 pl-4 border-l-2 border-muted space-y-2">
                    {loadingAlternatives[journey.id] && (
                      <div className="flex items-center gap-2 p-4 text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          {searchProgress[journey.id]?.currentStation
                            ? `${searchProgress[journey.id].currentStation} bağlantılı seçenekler aranıyor...`
                            : 'Bağlantılı seçenekler aranıyor...'}
                        </span>
                      </div>
                    )}
                    {connectedAlternatives[journey.id]?.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-muted-foreground">
                          🔗 Aynı zamanda hareket eden bağlantılı seçenekler:
                        </div>
                        {connectedAlternatives[journey.id].map(altJourney => (
                          <JourneyCard 
                            key={altJourney.id} 
                            journey={altJourney}
                          />
                        ))}
                        {loadingAlternatives[journey.id] && (
                          <div className="text-xs text-muted-foreground pl-1">
                            Arama devam ediyor...
                          </div>
                        )}
                      </div>
                    ) : !loadingAlternatives[journey.id] ? (
                      <div className="p-4 text-sm text-muted-foreground">
                        Bu sefer için bağlantılı alternatif bulunamadı.
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {directJourneys.length === 0 && (
        <Alert>
          <Warning size={16} />
          <AlertDescription>
            <div className="space-y-2">
              <div>
                <strong>{fromStation.name}</strong> - <strong>{toStation.name}</strong> 
                arası için direkt sefer bulunamadı.
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
      )}

      {/* Info footer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="font-medium">💡 Faydalı İpuçları:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Direkt seferlere tıklayarak bağlantılı seçenekleri görüntüleyin</li>
              <li>Bağlantılı seferlerde aynı trende koltuk değişimi gerekebilir</li>
              <li>Resmi TCDD web sitesinden güncel bilet durumunu kontrol edin</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}