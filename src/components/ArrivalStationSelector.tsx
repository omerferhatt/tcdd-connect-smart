import React from 'react';
import { StationSelector } from './StationSelector';
import { Station } from '@/lib/railway-data';

interface ArrivalStationSelectorProps {
  value: Station | null;
  onChange: (station: Station | null) => void;
  disabled?: boolean;
  excludeStation?: Station | null;
  className?: string;
}

export function ArrivalStationSelector({ 
  value, 
  onChange, 
  disabled, 
  excludeStation,
  className 
}: ArrivalStationSelectorProps) {
  return (
    <StationSelector
      label="Nereye"
      placeholder="Varış istasyonu seçin..."
      value={value}
      onChange={onChange}
      disabled={disabled}
      type="arrival"
      excludeStation={excludeStation}
      className={className}
    />
  );
}
