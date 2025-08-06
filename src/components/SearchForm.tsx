import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StationSearch } from './StationSearch';
import { Station } from '@/lib/railway-data';
import { MagnifyingGlass, ArrowsLeftRight } from '@phosphor-icons/react';

interface SearchFormProps {
  onSearch: (from: Station, to: Station) => void;
  loading?: boolean;
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromStation && toStation && fromStation.id !== toStation.id) {
      onSearch(fromStation, toStation);
    }
  };

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const canSearch = fromStation && toStation && fromStation.id !== toStation.id;
  const sameStation = fromStation && toStation && fromStation.id === toStation.id;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          TCDD Bağlantılı Seyahatler
        </CardTitle>
        <p className="text-muted-foreground text-center">
          Direkt bilet bulamadığınızda aktarmalı yolculuk seçeneklerini keşfedin
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <StationSearch
              label="Nereden"
              placeholder="İstanbul, Ankara, İzmir..."
              value={fromStation}
              onChange={setFromStation}
              disabled={loading}
            />
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSwapStations}
              disabled={loading}
              className="self-end mb-0.5"
            >
              <ArrowsLeftRight size={16} />
            </Button>
            
            <StationSearch
              label="Nereye"
              placeholder="Hedef istasyonu seçin..."
              value={toStation}
              onChange={setToStation}
              disabled={loading}
            />
          </div>

          {sameStation && (
            <div className="text-sm text-destructive text-center">
              Kalkış ve varış istasyonu aynı olamaz
            </div>
          )}

          <Button
            type="submit"
            disabled={!canSearch || loading}
            className="w-full text-lg py-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Rotalar aranıyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MagnifyingGlass size={20} />
                Seyahat Seçeneklerini Ara
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}