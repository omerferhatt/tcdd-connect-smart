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
      // Create a new date object to avoid mutation and set to noon
      const newDate = new Date(selectedDate);
      newDate.setHours(12, 0, 0, 0);
      onChange(newDate);
      setIsOpen(false);
    }
  };

  // Force today as minimum date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create a normalized value for the calendar to prevent timezone issues
  const normalizedValue = new Date(value);
  normalizedValue.setHours(12, 0, 0, 0);

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal min-h-10",
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
            selected={normalizedValue}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const checkDate = new Date(date);
              checkDate.setHours(0, 0, 0, 0);
              
              // Don't allow past dates
              if (checkDate < today) return true;
              if (minDate && checkDate < minDate) return true;
              
              // Don't allow dates more than 60 days in the future
              const maxDate = new Date();
              maxDate.setDate(maxDate.getDate() + 60);
              maxDate.setHours(23, 59, 59, 999);
              if (checkDate > maxDate) return true;
              
              return false;
            }}
            initialFocus
            fixedWeeks={true}
            showOutsideDays={true}
            className="rounded-md border"
            weekStartsOn={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}