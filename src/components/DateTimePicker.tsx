import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
      weekday: 'long',
      day: '2-digit',
      month: 'long', 
      year: 'numeric'
    }).format(date);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Keep the same time but update the date
      const newDate = new Date(selectedDate);
      newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
      onChange(newDate);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
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
    </div>
  );
}