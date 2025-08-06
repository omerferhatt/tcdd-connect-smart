import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { Station, Journey, findConnectedRoutes } from './lib/railway-data';
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

  const handleSearch = async (fromStation: Station, toStation: Station) => {
    setLoading(true);
    setCurrentSearch({ from: fromStation, to: toStation });
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const results = findConnectedRoutes(fromStation.id, toStation.id, 2);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">
              TCDD Bağlantılı Seyahatler
            </h1>
            <p className="text-muted-foreground">
              Resmi sitede görünmeyen aktarmalı tren bağlantılarını keşfedin
            </p>
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
          <div className="text-center text-sm text-muted-foreground">
            <p>
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
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}

export default App;