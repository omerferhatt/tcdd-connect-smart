import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Station } from '@/lib/railway-data';
import TCDDApiService from '@/lib/tcdd-api';
import { fetchStationsCached } from '@/lib/station-cache';
import { Check, ChevronsUpDown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Popular destinations (correct TCDD API station IDs / tcddId values)
// These IDs must match the tcddId fields in TURKISH_STATIONS (railway-data.ts)
const popularDestinations = [
  { id: 1325, name: 'İstanbul (Söğütlüçeşme)' },
  { id: 1322, name: 'İstanbul (Halkalı)' },
  { id: 98, name: 'Ankara Gar' },
  { id: 87, name: 'Eskişehir' },
  { id: 103, name: 'Konya' },
  { id: 180, name: 'İzmir (Basmane)' },
  { id: 130, name: 'Kayseri' },
  { id: 140, name: 'Sivas' },
];

// Convert TCDD Station to Railway Station
// Legacy converter kept for compatibility if needed with direct API result shape
// function convertTCDDStation(tcddStation: any): Station { /* no longer used */ }

interface StationSelectorProps {
  label: string;
  placeholder: string;
  value: Station | null;
  onChange: (station: Station | null) => void;
  disabled?: boolean;
  type?: 'departure' | 'arrival';
  excludeStation?: Station | null;
  className?: string;
}

export function StationSelector({ 
  label,
  placeholder,
  value, 
  onChange, 
  disabled = false,
  type,
  excludeStation,
  className 
}: StationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Normalize strings for search: lowercase (Turkish aware) and remove diacritics so
  // user typing without accents still finds matches (e.g., 'izmit' -> 'izmit', 'İzmit' -> 'izmit').
  const normalize = (str: string) => {
    if (!str) return '';
    // Turkish-specific canonicalization before general folding.
    // Map variants to basic ASCII so user may omit diacritics (e.g. 'cankiri' finds 'Çankırı').
    return str
      // Handle dotted / dotless I explicitly first
      .replace(/İ/g, 'I')
      .replace(/ı/g, 'i')
      // Uppercase diacritics to ASCII base (will lowercase later)
      .replace(/[Çç]/g, 'c')
      .replace(/[Ğğ]/g, 'g')
      .replace(/[Şş]/g, 's')
      .replace(/[Öö]/g, 'o')
      .replace(/[Üü]/g, 'u')
      // Remaining to lowercase (ASCII)
      .toLowerCase()
      // Unicode normalize then strip combining marks (defensive; most already replaced)
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const list = await fetchStationsCached();
        if (!active) return;
        // convert
        setStations(list.map(s => ({
          id: s.id.toString(),
          name: s.name,
          city: '',
          region: '',
          tcddId: s.id
        })));
      } catch (e) {
        console.error('Failed to load stations (cache):', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const normalizedSearch = normalize(searchValue);
  const filteredStations = stations.filter(station => {
    if (excludeStation && station.id === excludeStation.id) {
      return false;
    }
    
    if (!normalizedSearch) {
      return true;
    }
    
    const normName = normalize(station.name);
    const normCity = normalize(station.city);
    return normName.includes(normalizedSearch) || normCity.includes(normalizedSearch);
  });

  const showPopularDestinations = !searchValue && filteredStations.length > 0;
  const availablePopularStations = popularDestinations.filter(popular => {
    if (excludeStation && popular.id.toString() === excludeStation.id) {
      return false;
    }
    return stations.some(station => station.tcddId === popular.id);
  });

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={`station-selector-${type}`}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={`station-selector-${type}`}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
            disabled={disabled}
          >
            {value ? (
              <div className="flex items-center gap-2 truncate">
                <span className="truncate">{value.name}</span>
                {value.city && value.city !== value.name && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {value.city}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="İstasyon ara..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  İstasyonlar yükleniyor...
                </div>
              ) : (
                <>
                  {showPopularDestinations && availablePopularStations.length > 0 && (
                    <CommandGroup heading="Popüler Destinasyonlar">
                      {availablePopularStations.map((popularStation) => {
                        const fullStation = stations.find(s => s.tcddId === popularStation.id);
                        if (!fullStation) return null;
                        
                        return (
                          <CommandItem
                            key={popularStation.id}
                            value={popularStation.name}
                            onSelect={() => {
                              onChange(fullStation);
                              setOpen(false);
                            }}
                          >
                            <Star className="mr-2 h-4 w-4 text-yellow-500" />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="truncate">{fullStation.name}</span>
                              {fullStation.city && fullStation.city !== fullStation.name && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {fullStation.city}
                                </Badge>
                              )}
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                value?.id === fullStation.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}

                  {filteredStations.length === 0 ? (
                    <CommandEmpty>İstasyon bulunamadı.</CommandEmpty>
                  ) : (
                    <CommandGroup heading={showPopularDestinations ? "Tüm İstasyonlar" : undefined}>
                      {filteredStations.slice(0, 50).map((station) => (
                        <CommandItem
                          key={station.id}
                          value={station.name}
                          onSelect={() => {
                            onChange(station);
                            setOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="truncate">{station.name}</span>
                            {station.city && station.city !== station.name && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {station.city}
                              </Badge>
                            )}
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              value?.id === station.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
