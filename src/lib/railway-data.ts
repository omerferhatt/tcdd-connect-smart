import TCDDApiService from './tcdd-api';
import { routeGraph, ConnectedRoute } from './route-finder';

export interface Station {
  id: string;
  name: string;
  city: string;
  region: string;
  tcddId?: number; // TCDD API station ID
}

export interface SeatCategory {
  categoryId: number;
  categoryName: string;
  categoryCode: string;
  availableSeats: number;
  price: number;
  currency: string;
}

export interface RouteSegment {
  id: string;
  from: Station;
  to: Station;
  departure: string;
  arrival: string;
  duration: number; // minutes
  trainNumber: string;
  price: number; // TL - minimum price
  availableSeats?: number; // Total available seats (for backward compatibility)
  seatCategories?: SeatCategory[]; // Detailed seat categories
  departureTimestamp?: number; // For accurate sorting
}

export interface Journey {
  id: string;
  segments: RouteSegment[];
  totalDuration: number;
  totalPrice: number;
  connectionCount: number;
}

export const TURKISH_STATIONS: Station[] = [
  { id: 'ist', name: 'İstanbul (Söğütlüçeşme)', city: 'İstanbul', region: 'Marmara', tcddId: 1325 },
  { id: 'ist-pendik', name: 'İstanbul (Pendik)', city: 'İstanbul', region: 'Marmara', tcddId: 48 },
  { id: 'ist-bostanci', name: 'İstanbul (Bostancı)', city: 'İstanbul', region: 'Marmara', tcddId: 1323 },
  { id: 'ist-halkali', name: 'İstanbul (Halkalı)', city: 'İstanbul', region: 'Marmara', tcddId: 1322 },
  { id: 'ank', name: 'Ankara Gar', city: 'Ankara', region: 'İç Anadolu', tcddId: 98 },
  { id: 'gebze', name: 'Gebze', city: 'Kocaeli', region: 'Marmara', tcddId: 20 },
  { id: 'izmit', name: 'İzmit YHT', city: 'Kocaeli', region: 'Marmara', tcddId: 1135 },
  { id: 'arifiye', name: 'Arifiye', city: 'Sakarya', region: 'Marmara', tcddId: 5 },
  { id: 'esk', name: 'Eskişehir', city: 'Eskişehir', region: 'İç Anadolu', tcddId: 87 },
  { id: 'kon', name: 'Konya', city: 'Konya', region: 'İç Anadolu', tcddId: 103 },
  { id: 'izm', name: 'İzmir (Basmane)', city: 'İzmir', region: 'Ege', tcddId: 180 },
  { id: 'izm-alsancak', name: 'İzmir (Alsancak)', city: 'İzmir', region: 'Ege', tcddId: 181 },
  { id: 'ada', name: 'Adana', city: 'Adana', region: 'Akdeniz', tcddId: 753 },
  { id: 'mer', name: 'Mersin', city: 'Mersin', region: 'Akdeniz', tcddId: 170 },
  { id: 'kay', name: 'Kayseri', city: 'Kayseri', region: 'İç Anadolu', tcddId: 130 },
  { id: 'siv', name: 'Sivas', city: 'Sivas', region: 'İç Anadolu', tcddId: 140 },
  { id: 'sam', name: 'Samsun', city: 'Samsun', region: 'Karadeniz', tcddId: 120 },
  { id: 'mal', name: 'Malatya', city: 'Malatya', region: 'Doğu Anadolu', tcddId: 147 },
  { id: 'kar', name: 'Kars', city: 'Kars', region: 'Doğu Anadolu', tcddId: 151 },
  { id: 'erz', name: 'Erzurum', city: 'Erzurum', region: 'Doğu Anadolu', tcddId: 150 },
  { id: 'eli', name: 'Elazığ', city: 'Elazığ', region: 'Doğu Anadolu', tcddId: 148 },
  { id: 'afy', name: 'Afyonkarahisar', city: 'Afyonkarahisar', region: 'Ege', tcddId: 89 },
  { id: 'den', name: 'Denizli', city: 'Denizli', region: 'Ege', tcddId: 185 },
  { id: 'bal', name: 'Balıkesir', city: 'Balıkesir', region: 'Marmara', tcddId: 77 },
  { id: 'ban', name: 'Bandırma', city: 'Balıkesir', region: 'Marmara', tcddId: 79 },
  { id: 'zon', name: 'Zonguldak', city: 'Zonguldak', region: 'Karadeniz', tcddId: 200 },
  { id: 'kut', name: 'Kütahya', city: 'Kütahya', region: 'Ege', tcddId: 92 },
  { id: 'cank', name: 'Çankırı', city: 'Çankırı', region: 'İç Anadolu', tcddId: 95 },
  { id: 'ama', name: 'Amasya', city: 'Amasya', region: 'Karadeniz', tcddId: 125 },
  { id: 'tok', name: 'Tokat', city: 'Tokat', region: 'Karadeniz', tcddId: 145 },
  { id: 'golcuk', name: 'Gölcük', city: 'Kocaeli', region: 'Marmara', tcddId: 677 }
];

// Mock route data - in a real app, this would come from TCDD API

export function findStations(query: string): Station[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return TURKISH_STATIONS.filter(station => 
    station.name.toLowerCase().includes(lowerQuery) ||
    station.city.toLowerCase().includes(lowerQuery)
  ).slice(0, 8);
}


function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}dk`;
  if (mins === 0) return `${hours}sa`;
  return `${hours}sa ${mins}dk`;
}

export function formatPrice(price: number): string {
  return `${price} ₺`;
}

// API Integration Functions

export async function searchTrainsWithAPI(fromStation: Station, toStation: Station, departureDate?: Date): Promise<Journey[]> {
  // Initialize the route graph-based search
  const journeys: Journey[] = [];
  
  if (fromStation.tcddId && toStation.tcddId) {
    try {
      // Format date for API (YYYY-MM-DD format) - ensure correct date formatting
      let actualDate = new Date();
      if (departureDate) {
        // Use the date directly without timezone adjustment to prevent date shifting
        actualDate = new Date(departureDate);
        console.log(`Using selected date: ${actualDate.toISOString().split('T')[0]} from input: ${departureDate.toISOString()}`);
      } else {
        // Use tomorrow if no date provided
        actualDate.setDate(actualDate.getDate() + 1);
      }
      
      console.log(`Searching TCDD API with route graph: ${fromStation.name} -> ${toStation.name} on ${actualDate.toISOString().split('T')[0]}`);
      
      // Use the new route graph system to find connected routes
      const connectedRoutes = await routeGraph.findConnectedRoutes(
        fromStation.tcddId,
        toStation.tcddId,
        actualDate,
        2 // Max 2 connections
      );
      
      if (connectedRoutes.length > 0) {
        console.log(`🚂 Route graph returned ${connectedRoutes.length} connected routes`);
        // Convert ConnectedRoute to Journey format
        connectedRoutes.forEach((route: ConnectedRoute, index: number) => {
          const segments: RouteSegment[] = route.segments.map((segment, segIndex) => ({
            id: `route-${index}-segment-${segIndex}`,
            from: {
              id: `tcdd-${segment.fromStationId}`,
              name: segment.fromStationName,
              city: segment.fromStationName,
              region: 'Unknown',
              tcddId: segment.fromStationId
            },
            to: {
              id: `tcdd-${segment.toStationId}`,
              name: segment.toStationName,
              city: segment.toStationName,
              region: 'Unknown',
              tcddId: segment.toStationId
            },
            departure: segment.trains.length > 0 ? segment.trains[0].departureTime || '00:00' : '00:00',
            arrival: segment.trains.length > 0 ? segment.trains[0].arrivalTime || '00:00' : '00:00',
            duration: segment.trains.length > 0 ? segment.trains[0].duration || 0 : 0,
            trainNumber: segment.trains.length > 0 ? segment.trains[0].trainNumber || 'Unknown' : 'Unknown',
            price: segment.trains.length > 0 ? segment.trains[0].price || 0 : 0,
            availableSeats: segment.trains.length > 0 ? segment.trains[0].availableSeats || 0 : 0,
            seatCategories: segment.trains.length > 0 ? segment.trains[0].seatCategories || [] : [],
            departureTimestamp: segment.trains.length > 0 ? segment.trains[0].departureTimestamp || 0 : 0
          }));
          
          journeys.push({
            id: `connected-route-${index}`,
            segments,
            totalDuration: route.totalDuration,
            totalPrice: route.totalPrice,
            connectionCount: route.connectionCount
          });
        });
        
        console.log(`Found ${journeys.length} routes (${connectedRoutes.filter(r => r.connectionCount === 0).length} direct, ${connectedRoutes.filter(r => r.connectionCount > 0).length} connected) from route graph`);
      } else {
        console.log('No routes found from route graph, trying fallback...');
        
        // Fallback to direct API search if route graph doesn't find anything
        const dateString = actualDate.toISOString().split('T')[0];
        const apiResponse = await TCDDApiService.searchTrainAvailability(
          fromStation.tcddId,
          toStation.tcddId,
          dateString
        );
        
        if (apiResponse.success && apiResponse.data.length > 0) {
          // Convert API response to our Journey format
          apiResponse.data.forEach((train: any, index: number) => {
            const segment: RouteSegment = {
              id: `api-${train.trainNumber}-${index}`,
              from: fromStation,
              to: toStation,
              departure: train.departureTime || '00:00',
              arrival: train.arrivalTime || '00:00',
              duration: train.duration || 0,
              trainNumber: train.trainNumber || train.trainName || 'Unknown',
              price: train.price || 0,
              availableSeats: train.availableSeats || 0,
              seatCategories: train.seatCategories || [],
              departureTimestamp: train.departureTimestamp || 0
            };
            
            journeys.push({
              id: `api-direct-${train.trainNumber}-${index}`,
              segments: [segment],
              totalDuration: train.duration || 0,
              totalPrice: train.price || 0,
              connectionCount: 0
            });
          });
          
          console.log(`Found ${journeys.length} direct routes from fallback API`);
        }
      }
    } catch (error) {
      console.warn('Route graph search failed:', error);
      throw error; // Re-throw to trigger fallback in calling code
    }
  } else {
    console.log('Stations do not have TCDD IDs, using mock data');
    throw new Error('Stations do not have TCDD API IDs');
  }
  
  // Sort by connection count first (direct routes first), then by departure time
  return journeys.sort((a, b) => {
    if (a.connectionCount !== b.connectionCount) {
      return a.connectionCount - b.connectionCount; // Prefer direct routes
    }
    // Use timestamp if available, otherwise parse time strings
    const aTime = a.segments[0].departureTimestamp || parseTimeToMinutes(a.segments[0].departure);
    const bTime = b.segments[0].departureTimestamp || parseTimeToMinutes(b.segments[0].departure);
    return aTime - bTime;
  }); // Remove limit to show all available options
}

// NEW: Find connected alternatives for a specific departure time
export async function findConnectedAlternatives(
  fromStation: Station,
  toStation: Station,
  departureDate: Date,
  targetDepartureTime: string
): Promise<Journey[]> {
  const journeys: Journey[] = [];

  // Check if stations have TCDD IDs
  if (!fromStation.tcddId || !toStation.tcddId) {
    console.warn('Stations missing TCDD IDs for connected alternatives search');
    return journeys;
  }

  try {
    console.log(`🔍 Finding connected alternatives for ${targetDepartureTime} departure`);
    
    // Use route graph to find connected alternatives
    const connectedRoutes = await routeGraph.findConnectedAlternatives(
      fromStation.tcddId,
      toStation.tcddId,
      departureDate,
      targetDepartureTime
    );
    
    if (connectedRoutes.length > 0) {
      console.log(`🚂 Found ${connectedRoutes.length} connected alternatives`);
      // Convert ConnectedRoute to Journey format
      connectedRoutes.forEach((route: ConnectedRoute, index: number) => {
        const segments: RouteSegment[] = route.segments.map((segment, segIndex) => ({
          id: `alt-${index}-segment-${segIndex}`,
          from: {
            id: `tcdd-${segment.fromStationId}`,
            name: segment.fromStationName,
            city: segment.fromStationName,
            region: 'Unknown',
            tcddId: segment.fromStationId
          },
          to: {
            id: `tcdd-${segment.toStationId}`,
            name: segment.toStationName,
            city: segment.toStationName,
            region: 'Unknown',
            tcddId: segment.toStationId
          },
          departure: segment.trains.length > 0 ? segment.trains[0].departureTime || '00:00' : '00:00',
          arrival: segment.trains.length > 0 ? segment.trains[0].arrivalTime || '00:00' : '00:00',
          duration: segment.trains.length > 0 ? segment.trains[0].duration || 0 : 0,
          trainNumber: segment.trains.length > 0 ? segment.trains[0].trainNumber || 'Unknown' : 'Unknown',
          price: segment.trains.length > 0 ? segment.trains[0].price || 0 : 0,
          availableSeats: segment.trains.length > 0 ? segment.trains[0].availableSeats || 0 : 0,
          seatCategories: segment.trains.length > 0 ? segment.trains[0].seatCategories || [] : [],
          departureTimestamp: segment.trains.length > 0 ? segment.trains[0].departureTimestamp || 0 : 0
        }));
        
        journeys.push({
          id: `connected-alt-${index}`,
          segments,
          totalDuration: route.totalDuration,
          totalPrice: route.totalPrice,
          connectionCount: route.connectionCount
        });
      });
    }
    
  } catch (error) {
    console.error('Error in findConnectedAlternatives:', error);
  }

  return journeys;
}

// Streaming version: yields partial journeys as they are discovered
export async function* streamConnectedAlternatives(
  fromStation: Station,
  toStation: Station,
  departureDate: Date,
  targetDepartureTime: string,
  options?: { signal?: AbortSignal; onProgress?: (stationName: string) => void }
): AsyncGenerator<{ journey?: Journey; station?: string; done?: boolean }, void, unknown> {
  if (!fromStation.tcddId || !toStation.tcddId) {
    return;
  }
  try {
    const dateStr = departureDate.toISOString().split('T')[0];
    let index = 0;
    type Event = { journey?: Journey; station?: string };
    const queue: Event[] = [];
    let finished = false;
    const pushStation = (name: string) => {
      queue.push({ station: name });
      options?.onProgress?.(name);
    };
    const pushJourney = (j: Journey) => queue.push({ journey: j });

    // Fire API search but don't await until we drained queue later
    const apiPromise = TCDDApiService.findSameTrainConnections(
      fromStation.tcddId,
      toStation.tcddId,
      dateStr,
      {
        signal: options?.signal,
        onIntermediateStation: (_id, stationName) => {
          if (options?.signal?.aborted) return;
          pushStation(stationName);
        },
        onConnectionFound: (route) => {
          if (options?.signal?.aborted) return;
          const dep = route.firstLeg?.departureTime;
          if (!dep) return;
          if (dep.slice(0,5) !== targetDepartureTime.slice(0,5)) return;
          const segments: RouteSegment[] = [
            {
              id: `stream-alt-${index}-segment-0`,
              from: {
                id: `tcdd-${route.firstLeg.fromStation}`,
                name: route.firstLeg.fromStationName,
                city: route.firstLeg.fromStationName,
                region: 'Unknown',
                tcddId: route.firstLeg.fromStation
              },
              to: {
                id: `tcdd-${route.firstLeg.toStation}`,
                name: route.firstLeg.toStationName,
                city: route.firstLeg.toStationName,
                region: 'Unknown',
                tcddId: route.firstLeg.toStation
              },
              departure: route.firstLeg.departureTime,
              arrival: route.firstLeg.arrivalTime,
              duration: route.firstLeg.duration || 0,
              trainNumber: route.firstLeg.trainNumber,
              price: route.firstLeg.price || 0,
              availableSeats: route.firstLeg.availableSeats || 0,
              seatCategories: route.firstLeg.seatCategories || [],
              departureTimestamp: 0
            },
            {
              id: `stream-alt-${index}-segment-1`,
              from: {
                id: `tcdd-${route.secondLeg.fromStation}`,
                name: route.secondLeg.fromStationName,
                city: route.secondLeg.fromStationName,
                region: 'Unknown',
                tcddId: route.secondLeg.fromStation
              },
              to: {
                id: `tcdd-${route.secondLeg.toStation}`,
                name: route.secondLeg.toStationName,
                city: route.secondLeg.toStationName,
                region: 'Unknown',
                tcddId: route.secondLeg.toStation
              },
              departure: route.secondLeg.departureTime,
              arrival: route.secondLeg.arrivalTime,
              duration: route.secondLeg.duration || 0,
              trainNumber: route.secondLeg.trainNumber,
              price: route.secondLeg.price || 0,
              availableSeats: route.secondLeg.availableSeats || 0,
              seatCategories: route.secondLeg.seatCategories || [],
              departureTimestamp: 0
            }
          ];
          const journey: Journey = {
            id: `stream-connected-alt-${index}`,
            segments,
            totalDuration: route.totalDuration || (segments[0].duration + segments[1].duration),
            totalPrice: route.totalPrice || (segments[0].price + segments[1].price),
            connectionCount: 1
          };
          index++;
          pushJourney(journey);
        }
      }
    ).finally(() => { finished = true; });

    // Drain queue as events arrive
    while (!finished || queue.length > 0) {
      if (options?.signal?.aborted) break;
      const event = queue.shift();
      if (event) {
        if (event.station) {
          yield { station: event.station };
        } else if (event.journey) {
          yield { journey: event.journey };
        }
      } else {
        // nothing yet, wait a tick
        await new Promise(r => setTimeout(r, 60));
      }
    }
    await apiPromise; // ensure completion
  } catch (e) {
    // swallow errors in streaming to avoid breaking UI
  } finally {
    yield { done: true };
  }
}

async function findConnectedRoutesWithAPI(
  fromStation: Station, 
  toStation: Station, 
  departureDate?: Date
): Promise<Journey[]> {
  const journeys: Journey[] = [];
  
  // Format date for API - use the same logic as main search
  let dateStr = '';
  if (departureDate) {
    // Use the date directly without timezone adjustment to prevent date shifting
    const year = departureDate.getFullYear();
    const month = (departureDate.getMonth() + 1).toString().padStart(2, '0');
    const day = departureDate.getDate().toString().padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  } else {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const day = tomorrow.getDate().toString().padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  }
  
  // Get real stations from API
  const allStations = await TCDDApiService.getAllStations();
  
  // Convert TCDD stations to our Station format for major hubs
  const majorHubTcddIds = [98, 87, 180, 753, 20, 1135]; // Ankara, Eskişehir, İzmir, Adana, Gebze, İzmit YHT
  const majorHubs = allStations
    .filter(tcddStation => 
      majorHubTcddIds.includes(tcddStation.id) &&
      tcddStation.id !== fromStation.tcddId && 
      tcddStation.id !== toStation.tcddId
    )
    .map(tcddStation => ({
      id: `tcdd-${tcddStation.id}`,
      name: tcddStation.name,
      city: tcddStation.name,
      region: 'Unknown',
      tcddId: tcddStation.id
    }));
  
  for (const hub of majorHubs) {
    if (!hub.tcddId || !fromStation.tcddId || !toStation.tcddId) continue;
    
    try {
      // Check if routes exist before making API calls
      const hasFirstLeg = await TCDDApiService.hasDirectRoute(fromStation.tcddId, hub.tcddId);
      const hasSecondLeg = await TCDDApiService.hasDirectRoute(hub.tcddId, toStation.tcddId);
      
      if (!hasFirstLeg || !hasSecondLeg) {
        continue;
      }
      
      // Search from origin to hub
      const firstLegResponse = await TCDDApiService.searchTrainAvailability(
        fromStation.tcddId,
        hub.tcddId,
        dateStr
      );
      
      // Search from hub to destination
      const secondLegResponse = await TCDDApiService.searchTrainAvailability(
        hub.tcddId,
        toStation.tcddId,
        dateStr
      );
      
      if (firstLegResponse.success && secondLegResponse.success &&
          firstLegResponse.data.length > 0 && secondLegResponse.data.length > 0) {
        
        // Combine compatible train schedules
        firstLegResponse.data.forEach((firstTrain: any, i: number) => {
          secondLegResponse.data.forEach((secondTrain: any, j: number) => {
            // Parse times to check if connection is feasible
            const firstArrival = parseTimeToMinutes(firstTrain.arrivalTime || '00:00');
            const secondDeparture = parseTimeToMinutes(secondTrain.departureTime || '00:00');
            
            // Allow at least 30 minutes for connection
            let connectionTime = secondDeparture - firstArrival;
            if (connectionTime < 0) connectionTime += 24 * 60; // Next day
            
            if (connectionTime >= 30 && connectionTime <= 360) { // Max 6 hours wait
              const firstSegment: RouteSegment = {
                id: `segment-${hub.id}-${i}-1`,
                from: fromStation,
                to: hub,
                departure: firstTrain.departureTime || '00:00',
                arrival: firstTrain.arrivalTime || '00:00',
                duration: firstTrain.duration || 0,
                trainNumber: firstTrain.trainNumber || firstTrain.trainName || 'Unknown',
                price: firstTrain.price || 0,
                availableSeats: firstTrain.availableSeats || 0,
                seatCategories: firstTrain.seatCategories || [],
                departureTimestamp: firstTrain.departureTimestamp || 0
              };
              
              const secondSegment: RouteSegment = {
                id: `segment-${hub.id}-${j}-2`,
                from: hub,
                to: toStation,
                departure: secondTrain.departureTime || '00:00',
                arrival: secondTrain.arrivalTime || '00:00',
                duration: secondTrain.duration || 0,
                trainNumber: secondTrain.trainNumber || secondTrain.trainName || 'Unknown',
                price: secondTrain.price || 0,
                availableSeats: secondTrain.availableSeats || 0,
                seatCategories: secondTrain.seatCategories || [],
                departureTimestamp: secondTrain.departureTimestamp || 0
              };
              
              const totalDuration = (firstTrain.duration || 0) + (secondTrain.duration || 0) + connectionTime;
              
              journeys.push({
                id: `journey-${hub.id}-${i}-${j}`,
                segments: [firstSegment, secondSegment],
                totalDuration,
                totalPrice: (firstTrain.price || 0) + (secondTrain.price || 0),
                connectionCount: 1
              });
            }
          });
        });
      }
    } catch (error) {
      console.warn(`Failed to find connections through ${hub.name}:`, error);
      continue;
    }
  }
  
  return journeys.sort((a, b) => {
    if (a.totalDuration !== b.totalDuration) {
      return a.totalDuration - b.totalDuration;
    }
    return a.connectionCount - b.connectionCount;
  }).slice(0, 5); // Limit connected routes
}

function parseTimeToMinutes(timeStr: string): number {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  } catch (error) {
    console.warn('Failed to parse time:', timeStr);
    return 0;
  }
}