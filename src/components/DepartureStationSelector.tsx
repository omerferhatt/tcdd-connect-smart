import React from 'react';
import { StationSelector } from './StationSelector';
import { Station } from '@/lib/railway-data';

interface DepartureStationSelectorProps {
  value: Station | null;
  onChange: (station: Station | null) => void;
  disabled?: boolean;
  excludeStation?: Station | null;
  className?: string;
}

export function DepartureStationSelector({ 
  value, 
  onChange, 
  disabled, 
  excludeStation,
  className 
}: DepartureStationSelectorProps) {
  return (
    <StationSelector
      label="Nereden"
      placeholder="Kalkış istasyonu seçin..."
      value={value}
      onChange={onChange}
      disabled={disabled}
      type="departure"
      excludeStation={excludeStation}
      className={className}
    />
  );
}
