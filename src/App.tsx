import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { ApiSettingsDialog } from './components/ApiSettingsDialog';
import { ApiDebugDialog } from './components/ApiDebugDialog';
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
  const [currentSearch, setCurrentSearch] = useState<{ from: Station; to: Station } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useKV<SearchHistory[]>('search-history', []);
  const [useRealAPI, setUseRealAPI] = useKV<boolean>('use-real-api', true);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  const handleSearch = async (fromStation: Station, toStation: Station, departureDate: Date) => {
    setLoading(true);
    setCurrentSearch({ from: fromStation, to: toStation });
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let results: Journey[] = [];
      
      if (useRealAPI) {
        // Try real API first
        try {
          results = await searchTrainsWithAPI(fromStation, toStation, departureDate);
          setApiStatus('connected');
          if (results.length > 0) {
            toast.success('TCDD API\'den gerçek veriler alındı');
          } else {
            toast.info('TCDD API\'den sonuç gelmedi, demo veriler kullanılıyor');
            // Fall back to mock data
            const { findConnectedRoutes } = await import('./lib/railway-data');
            results = findConnectedRoutes(fromStation.id, toStation.id, 2);
          }
        } catch (error) {
          setApiStatus('error');
          console.error('API Error Details:', error);
          
          const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
          if (errorMessage.includes('Authentication')) {
            toast.error('TCDD API kimlik doğrulama hatası. API Ayarları\'ndan geçerli token girin.');
          } else {
            toast.warning('TCDD API\'ye bağlanılamadı, demo veriler kullanılıyor');
          }
          
          // Fall back to mock data
          const { findConnectedRoutes } = await import('./lib/railway-data');
          results = findConnectedRoutes(fromStation.id, toStation.id, 2);
        }
      } else {
        // Use mock data
        const { findConnectedRoutes } = await import('./lib/railway-data');
        results = findConnectedRoutes(fromStation.id, toStation.id, 2);
        setApiStatus('unknown');
        toast.info('Demo modu aktif - örnek veriler kullanılıyor');
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
        
        if (directCount > 0) {
          toast.success(`${directCount} direkt sefer ve ${connectedCount} aktarmalı seçenek bulundu`);
        } else {
          toast.info(`${connectedCount} aktarmalı seçenek bulundu`);
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
                Resmi sitede görünmeyen aktarmalı tren bağlantılarını keşfedin
              </p>
            </div>
            
            {/* API Status and Settings */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus === 'connected' ? 'bg-green-500' : 
                  apiStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
                <span className="text-muted-foreground">
                  {apiStatus === 'connected' ? 'Gerçek API Bağlı' : 
                   apiStatus === 'error' ? 'API Hatası - Demo Modu' : 'Gerçek API Modu'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useRealAPI}
                    onChange={(e) => setUseRealAPI(e.target.checked)}
                    className="mr-1"
                  />
                  Gerçek TCDD API Kullan (Varsayılan)
                </label>
              </div>
              
              <div className="flex gap-2">
                <ApiSettingsDialog 
                  onAuthSuccess={() => {
                    setApiStatus('connected');
                    toast.success('API bağlantısı kuruldu!');
                  }}
                />
                
                <ApiDebugDialog 
                  fromStation={currentSearch?.from}
                  toStation={currentSearch?.to}
                />
              </div>
            </div>
            
            {useRealAPI && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 max-w-md mx-auto">
                ✅ Gerçek TCDD API aktif! Geliştirici token kullanılıyor.
                API hata verirse otomatik olarak demo verilere geçilir.
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Search form */}
          <SearchForm onSearch={handleSearch} loading={loading} />
          
          {/* Search results */}
          {currentSearch && (
            <SearchResults
              journeys={journeys}
              fromStation={currentSearch.from}
              toStation={currentSearch.to}
              loading={loading}
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
                  href="https://bilet.tcdd.gov.tr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  resmi TCDD web sitesini
                </a>
                {' '}kullanın.
              </p>
              
              <div className="text-xs bg-muted rounded p-2 max-w-2xl mx-auto">
                <strong>API Entegrasyonu:</strong> Bu uygulama TCDD'nin gerçek API'sini kullanıyor. 
                Geliştirici token otomatik yapılandırılmıştır. API hata verirse demo veriler kullanılır.
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