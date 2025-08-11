import React, { useState } from 'react';
import { useKV } from './hooks/use-kv';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { Station, Journey, searchTrainsWithAPI } from './lib/railway-data';
import TCDDApiService from './lib/tcdd-api';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

interface SearchHistory {
  id: string;
  from: Station;
  to: Station;
  timestamp: number;
}

function App() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [currentSearch, setCurrentSearch] = useState<{ from: Station; to: Station; departureDate: Date } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useKV<SearchHistory[]>('search-history', []);
  // Removed feature toggles: always use live data
  const [showSoldOutTrains] = useKV<boolean>('show-sold-out-trains', false); // retain persistence but no UI
  const [enableSameTrainConnections] = useKV<boolean>('enable-same-train-connections', true);
  const [hideDisabledOnlyTrains, setHideDisabledOnlyTrains] = useKV<boolean>('hide-disabled-only-trains', false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const handleSearch = async (fromStation: Station, toStation: Station, departureDate: Date) => {
    setLoading(true);
    setCurrentSearch({ from: fromStation, to: toStation, departureDate });
    
    // Update TCDD API service settings
    TCDDApiService.showSoldOutTrains = showSoldOutTrains;
    TCDDApiService.enableSameTrainConnections = enableSameTrainConnections;
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let results: Journey[] = [];
      
      try {
        results = await searchTrainsWithAPI(fromStation, toStation, departureDate);
        setApiStatus('connected');
        if (results.length === 0) {
          toast.info('Sefer bulunamadı');
        }
      } catch (error) {
        setApiStatus('error');
        console.error('Veri alma hatası:', error);
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        if (errorMessage.toLowerCase().includes('auth')) {
          toast.error('Yetkilendirme hatası: oturum gerektirebilir.');
        } else {
          toast.error('Veri alınamadı. Daha sonra tekrar deneyin.');
        }
        results = [];
      }
      
      setJourneys(results);
      
      // Add to search history
      const newSearch: SearchHistory = {
        id: Date.now().toString(),
        from: fromStation,
        to: toStation,
        timestamp: Date.now()
      };
      
      setSearchHistory((currentHistory) => {
        const filtered = currentHistory.filter(
          search => !(search.from.id === fromStation.id && search.to.id === toStation.id)
        );
        return [newSearch, ...filtered].slice(0, 10); // Keep last 10 searches
      });
      
      if (results.length === 0) {
  toast.error(`${fromStation.name} - ${toStation.name} arası sefer bulunamadı`);
      } else {
        const directCount = results.filter(j => j.connectionCount === 0).length;
        const connectedCount = results.filter(j => j.connectionCount > 0).length;
        
        if (directCount > 0 && connectedCount > 0) {
          toast.success(`${directCount} direkt sefer ve ${connectedCount} aktarmalı seçenek bulundu`);
        } else if (directCount > 0) {
          toast.success(`${directCount} direkt sefer bulundu`);
        } else if (connectedCount > 0) {
          toast.success(`${connectedCount} aktarmalı rota bulundu! Direkt sefer mevcut değil.`);
        }
      }
    } catch (error) {
      toast.error('Arama sırasında bir hata oluştu');
      console.error('Search error:', error);
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                TCDD Bağlantılı Seyahatler
              </h1>
              <p className="text-muted-foreground">
                Resmi sitede görünmeyen aktarmalı tren bağlantılarını keşfedin. 
                TCDD'nin gerçek istasyon ağı verisi kullanılarak alternatif rotalar bulunur.
              </p>
            </div>
            
            {/* API Status and Settings */}
            {apiStatus === 'error' && (
              <div className="text-xs text-destructive bg-muted/50 border border-destructive/30 rounded p-2 max-w-md mx-auto">
                Canlı veriye ulaşılamadı. Daha sonra tekrar deneyin.
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Search form */}
          <SearchForm 
            onSearch={handleSearch} 
            loading={loading} 
            hideDisabledOnlyTrains={hideDisabledOnlyTrains}
            onToggleHideDisabledOnly={setHideDisabledOnlyTrains}
          />
          
          {/* Search results */}
          {currentSearch && (
            <SearchResults
              journeys={journeys}
              fromStation={currentSearch.from}
              toStation={currentSearch.to}
              departureDate={currentSearch.departureDate}
              loading={loading}
              hideDisabledOnlyTrains={hideDisabledOnlyTrains}
            />
          )}
          
          {/* Welcome message when no search has been made */}
          {!currentSearch && !loading && (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto space-y-4">
                <h2 className="text-2xl font-semibold">
                  Hoş Geldiniz! 🚆
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  TCDD'nin resmi web sitesinde bulamadığınız aktarmalı seyahat seçeneklerini 
                  keşfetmek için yukarıdaki formu kullanın. Örneğin İstanbul-Ankara arası 
                  direkt bilet yoksa, Kocaeli aktarmalı seçenekleri gösterebiliriz.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="text-lg font-medium mb-2">🎯 Akıllı Arama</div>
                    <div className="text-sm text-muted-foreground">
                      Direkt sefer olmadığında aktarmalı rotaları otomatik bulur
                    </div>
                  </div>
                  
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="text-lg font-medium mb-2">⏱️ Gerçek Zamanlar</div>
                    <div className="text-sm text-muted-foreground">
                      Aktarma sürelerini hesaplayarak uygun bağlantıları gösterir
                    </div>
                  </div>
                  
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="text-lg font-medium mb-2">💰 Fiyat Bilgisi</div>
                    <div className="text-sm text-muted-foreground">
                      Toplam seyahat maliyetini segment bazında hesaplar
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                Bu uygulama TCDD'nin resmi bir uygulaması değildir. 
                Bilet satın almak için{' '}
                <a 
                  href="https://ebilet.tcddtasimacilik.gov.tr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  resmi TCDD web sitesini
                </a>
                {' '}kullanın.
              </p>
              
              <div className="text-xs bg-muted rounded p-2 max-w-2xl mx-auto">
                <strong>Akıllı Rota Sistemi:</strong> Bu uygulama istasyon ağı üzerinden grafik tabanlı algoritma ile
                aktarmalı rotalar üretir. Veri erişimi başarısız olursa lütfen daha sonra tekrar deneyin.
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}

export default App;