import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DepartureStationSelector } from './DepartureStationSelector';
import { ArrivalStationSelector } from './ArrivalStationSelector';
import { DateTimePicker } from './DateTimePicker';
import { Station } from '@/lib/railway-data';
import { MagnifyingGlass, ArrowsLeftRight } from '@phosphor-icons/react';

interface SearchFormProps {
  onSearch: (from: Station, to: Station, departureDate: Date) => void;
  loading?: boolean;
  hideDisabledOnlyTrains?: boolean;
  onToggleHideDisabledOnly?: (value: boolean) => void;
}

export function SearchForm({ onSearch, loading, hideDisabledOnlyTrains = false, onToggleHideDisabledOnly }: SearchFormProps) {
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [toStation, setToStation] = useState<Station | null>(null);
  
  // Initialize with tomorrow at noon as default departure time
  const getDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0); // Default to noon for better timezone handling
    return tomorrow;
  };
  
  const [departureDate, setDepartureDate] = useState<Date>(getDefaultDate());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromStation && toStation && fromStation.id !== toStation.id) {
      onSearch(fromStation, toStation, departureDate);
    }
  };

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // Use useCallback to prevent unnecessary re-renders of DateTimePicker
  const handleDateChange = useCallback((date: Date) => {
    setDepartureDate(date);
  }, []);

  const canSearch = fromStation && toStation && fromStation.id !== toStation.id;
  const sameStation = fromStation && toStation && fromStation.id === toStation.id;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">
          Seyahat Arama
        </CardTitle>
        <p className="text-muted-foreground text-center">
          Direkt bilet bulamadığınızda aktarmalı yolculuk seçeneklerini keşfedin
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <DepartureStationSelector
              value={fromStation}
              onChange={setFromStation}
              disabled={loading}
              excludeStation={toStation}
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
            
            <ArrivalStationSelector
              value={toStation}
              onChange={setToStation}
              disabled={loading}
              excludeStation={fromStation}
            />
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <DateTimePicker
              label="Gidiş Tarihi"
              value={departureDate}
              onChange={handleDateChange}
              disabled={loading}
              className="mx-auto max-w-md"
            />
          </div>

          {sameStation && (
            <div className="text-sm text-destructive text-center">
              Kalkış ve varış istasyonu aynı olamaz
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="hide-disabled-only"
                type="checkbox"
                className="h-4 w-4"
                checked={hideDisabledOnlyTrains}
                disabled={loading}
                onChange={(e) => onToggleHideDisabledOnly?.(e.target.checked)}
              />
              <label htmlFor="hide-disabled-only" className="text-sm select-none">
                Engelli koltukları gizle
              </label>
            </div>

            <Button
            type="submit"
            disabled={!canSearch || loading}
            className="w-full text-lg py-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Aranıyor...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MagnifyingGlass size={20} />
                Seyahat Seçeneklerini Ara
              </div>
            )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}