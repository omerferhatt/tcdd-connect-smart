import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { findStations, Station } from '@/lib/railway-data';
import { MapPin } from '@phosphor-icons/react';

interface StationSearchProps {
  label: string;
  placeholder: string;
  value: Station | null;
  onChange: (station: Station | null) => void;
  disabled?: boolean;
}

export function StationSearch({ label, placeholder, value, onChange, disabled }: StationSearchProps) {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(value.name);
    }
  }, [value]);

  useEffect(() => {
    if (query.trim()) {
      const results = findStations(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setFocusedIndex(-1);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (!newQuery.trim()) {
      onChange(null);
    }
  };

  const handleSuggestionClick = (station: Station) => {
    setQuery(station.name);
    onChange(station);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          handleSuggestionClick(suggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
    }, 150);
  };

  return (
    <div className="relative">
      <Label htmlFor={label.toLowerCase().replace(' ', '-')} className="text-sm font-medium">
        {label}
      </Label>
      <Input
        ref={inputRef}
        id={label.toLowerCase().replace(' ', '-')}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        disabled={disabled}
        className="mt-1"
      />
      
      {showSuggestions && (
        <Card 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-popover border shadow-lg"
        >
          {suggestions.map((station, index) => (
            <div
              key={station.id}
              className={`flex items-center gap-3 p-3 cursor-pointer border-b last:border-b-0 transition-colors ${
                index === focusedIndex 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => handleSuggestionClick(station)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{station.name}</div>
                <div className="text-xs text-muted-foreground">
                  {station.city} • {station.region}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}