import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Info } from 'lucide-react';
import { SeatCategory } from '@/lib/railway-data';
import { cn } from '@/lib/utils';

interface SeatCategoryDisplayProps {
  seatCategories?: SeatCategory[];
  totalSeats?: number;
  className?: string;
}

export function SeatCategoryDisplay({ seatCategories, totalSeats, className }: SeatCategoryDisplayProps) {
  // If no seat categories provided, fall back to simple total display
  if (!seatCategories || seatCategories.length === 0) {
    if (totalSeats !== undefined) {
      return (
        <div className={cn("flex items-center gap-1", className)}>
          <Users size={14} className="text-muted-foreground" />
          <Badge 
            variant={getSeatsBadgeVariant(totalSeats)}
            className={cn(
              "text-xs",
              totalSeats === 0 ? "!text-white !bg-red-600" : ""
            )}
          >
            {getSeatsText(totalSeats)}
          </Badge>
        </div>
      );
    }
    return null;
  }

  // Calculate total from categories
  const total = seatCategories.reduce((sum, category) => sum + category.availableSeats, 0);
  
  // Show simple view if only one category
  if (seatCategories.length === 1) {
    const category = seatCategories[0];
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Users size={14} className="text-muted-foreground" />
        <Badge 
          variant={getSeatsBadgeVariant(category.availableSeats)}
          className={cn(
            "text-xs",
            category.availableSeats === 0 ? "!text-white !bg-red-600" : ""
          )}
        >
          {getSeatsText(category.availableSeats)} ({category.categoryCode})
        </Badge>
      </div>
    );
  }

  // Show popover for multiple categories
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Users size={14} className="text-muted-foreground" />
      <Popover>
        <PopoverTrigger asChild>
          <Badge 
            variant={getSeatsBadgeVariant(total)}
            className={cn(
              "text-xs cursor-pointer hover:bg-opacity-80 flex items-center gap-1",
              total === 0 ? "!text-white !bg-red-600" : ""
            )}
          >
            {getSeatsText(total)}
            <Info size={10} />
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="end">
          <div className="space-y-2">
            <div className="text-sm font-medium">Uygun Koltuk Kategorileri</div>
            {seatCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="font-medium">{category.categoryName}</span>
                  <span className="text-muted-foreground">({category.categoryCode})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getSeatsBadgeVariant(category.availableSeats)}
                    className="text-xs"
                  >
                    {category.availableSeats} koltuk
                  </Badge>
                  <span className="font-medium">{category.price} ₺</span>
                </div>
              </div>
            ))}
            <div className="border-t pt-2 flex items-center justify-between text-sm font-medium">
              <span>Toplam</span>
              <span>{total} koltuk</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Helper functions (you might want to move these to utils if they don't exist)
function getSeatsBadgeVariant(seats: number): "default" | "secondary" | "destructive" | "outline" {
  if (seats === 0) return "destructive";
  if (seats < 5) return "outline";
  if (seats < 10) return "secondary";
  return "default";
}

function getSeatsText(seats: number): string {
  if (seats === 0) return "Yer yok";
  if (seats === 1) return "1 yer";
  return `${seats} yer`;
}
