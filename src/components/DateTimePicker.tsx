import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarDays } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
  minDate?: Date;
  className?: string;
}

export function DateTimePicker({ 
  label, 
  value, 
  onChange, 
  disabled = false, 
  minDate,
  className 
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(value);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      onChange(newDate);
      setIsOpen(false);
    }
  };

  const handleTimeChange = (type: 'hour' | 'minute', newValue: string) => {
    const newDate = new Date(value);
    
    if (type === 'hour') {
      newDate.setHours(parseInt(newValue, 10));
    } else {
      newDate.setMinutes(parseInt(newValue, 10));
    }
    
    onChange(newDate);
  };

  // Generate hour and minute options
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      
      <div className="flex gap-2">
        {/* Date Picker */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarDays size={16} className="mr-2" />
              {formatDate(value)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const checkDate = new Date(date);
                checkDate.setHours(0, 0, 0, 0);
                
                if (checkDate < today) return true;
                if (minDate && checkDate < minDate) return true;
                
                // Don't allow dates more than 60 days in the future
                const maxDate = new Date();
                maxDate.setDate(maxDate.getDate() + 60);
                if (checkDate > maxDate) return true;
                
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Time Picker */}
        <div className="flex gap-1">
          <Select 
            value={value.getHours().toString().padStart(2, '0')} 
            onValueChange={(v) => handleTimeChange('hour', v)} 
            disabled={disabled}
          >
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hours.map(hour => (
                <SelectItem key={hour} value={hour}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="flex items-center text-muted-foreground">:</span>
          
          <Select 
            value={(Math.floor(value.getMinutes() / 5) * 5).toString().padStart(2, '0')} 
            onValueChange={(v) => handleTimeChange('minute', v)} 
            disabled={disabled}
          >
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {minutes.map(minute => (
                <SelectItem key={minute} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {formatDate(value)} - {formatTime(value)}
      </div>
    </div>
  );
}