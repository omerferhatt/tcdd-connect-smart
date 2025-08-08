import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Journey, formatDuration, formatPrice } from '@/lib/railway-data';
import { Train, Clock, ArrowRight, MapPin, Users } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { SeatCategoryDisplay } from './SeatCategoryDisplay';

interface JourneyCardProps {
  journey: Journey;
  onClick?: () => void;
}

export function JourneyCard({ journey, onClick }: JourneyCardProps) {
  const getConnectionBadgeVariant = (count: number) => {
    switch (count) {
      case 0: return 'default';
      case 1: return 'secondary';
      default: return 'outline';
    }
  };

  const getConnectionText = (count: number) => {
    switch (count) {
      case 0: return 'Direkt';
      case 1: return '1 Aktarma';
      default: return `${count} Aktarma`;
    }
  };

  return (
    <Card 
      className="w-full transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header with timing and price */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="text-xl font-semibold">
              {journey.segments[0].departure}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              <span className="text-sm">{formatDuration(journey.totalDuration)}</span>
            </div>
            <div className="text-xl font-semibold">
              {journey.segments[journey.segments.length - 1].arrival}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={getConnectionBadgeVariant(journey.connectionCount)}>
              {getConnectionText(journey.connectionCount)}
            </Badge>
            <div className="text-xl font-bold text-primary">
              {formatPrice(journey.totalPrice)}
            </div>
          </div>
        </div>

        {/* Route visualization */}
        <div className="space-y-3">
          {journey.segments.map((segment, index) => (
            <div key={segment.id}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Train size={16} />
                  <span>{segment.trainNumber}</span>
                </div>
                
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="font-medium">{segment.from.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {segment.departure}
                    </span>
                  </div>
                  
                  <ArrowRight size={16} className="text-muted-foreground" />
                  
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="font-medium">{segment.to.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {segment.arrival}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Available seats with categories */}
                  <SeatCategoryDisplay 
                    seatCategories={segment.seatCategories}
                    totalSeats={segment.availableSeats}
                  />
                  
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(segment.duration)}
                  </div>
                  
                  <div className="text-sm font-medium">
                    {formatPrice(segment.price)}
                  </div>
                </div>
              </div>
              
              {/* Connection info for multi-segment journeys */}
              {index < journey.segments.length - 1 && (
                <div className="ml-6 mt-2 mb-2">
                  <Separator className="mb-2" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>
                      {segment.to.name} istasyonunda aktarma
                      {/* Calculate transfer time */}
                      {(() => {
                        const arrivalTime = parseInt(segment.arrival.split(':')[0]) * 60 + parseInt(segment.arrival.split(':')[1]);
                        const nextDeparture = parseInt(journey.segments[index + 1].departure.split(':')[0]) * 60 + parseInt(journey.segments[index + 1].departure.split(':')[1]);
                        let transferTime = nextDeparture - arrivalTime;
                        if (transferTime < 0) transferTime += 24 * 60;
                        return ` (${formatDuration(transferTime)} bekleme)`;
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}