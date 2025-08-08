// Route finding system using node-based graph for connected trips
import TCDDApiService, { StationPair, Station } from './tcdd-api';

export interface RouteNode {
  stationId: number;
  stationName: string;
  connections: number[]; // Array of station IDs this node connects to
}

export interface RouteSegment {
  fromStationId: number;
  fromStationName: string;
  toStationId: number;
  toStationName: string;
  trains: any[]; // Train options for this segment
  distance?: number;
  duration?: number;
}

export interface ConnectedRoute {
  segments: RouteSegment[];
  totalDistance: number;
  totalDuration: number;
  totalPrice: number;
  connectionCount: number;
  transferStations: string[];
  minTransferTime: number; // Minimum transfer time in minutes
}

class RouteGraph {
  private nodes: Map<number, RouteNode> = new Map();
  private stationPairs: StationPair[] = [];
  private stations: Station[] = [];
  private initialized = false;

  constructor() {
    // Initialize lazily when needed
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      // Load station pairs and stations data
      this.stationPairs = await TCDDApiService.fetchStationPairs();
      this.stations = await TCDDApiService.fetchStations();
      
      // Build the graph nodes
      this.buildNodes();
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize route graph:', error);
      throw error;
    }
  }

  private buildNodes() {
    // Create nodes from station pairs data
    for (const stationPair of this.stationPairs) {
      if (!stationPair.pairs || stationPair.pairs.length === 0) {
        continue;
      }

      const node: RouteNode = {
        stationId: stationPair.id,
        stationName: stationPair.name,
        connections: stationPair.pairs
      };

      this.nodes.set(stationPair.id, node);
    }

    console.log(`🗺️ Route graph initialized with ${this.nodes.size} stations`);
    
    // Log some sample connections for debugging
    for (const [stationId, node] of this.nodes) {
      if (node.connections.length > 0) {
        console.log(`📍 ${node.stationName} (${stationId}) connects to ${node.connections.length} stations: ${node.connections.slice(0, 3).join(', ')}${node.connections.length > 3 ? '...' : ''}`);
        break; // Just log one example
      }
    }

    // Ensure reverse connections (if A connects to B, B should connect to A)
    const additionalConnections: Map<number, Set<number>> = new Map();

    for (const [stationId, node] of this.nodes) {
      for (const connectedStationId of node.connections) {
        if (!additionalConnections.has(connectedStationId)) {
          additionalConnections.set(connectedStationId, new Set());
        }
        additionalConnections.get(connectedStationId)!.add(stationId);
      }
    }

    // Add reverse connections
    for (const [stationId, connections] of additionalConnections) {
      const node = this.nodes.get(stationId);
      if (node) {
        // Merge existing connections with new reverse connections
        const allConnections = new Set([...node.connections, ...connections]);
        node.connections = Array.from(allConnections);
      }
    }
  }

  public async findConnectedRoutes(
    fromStationId: number,
    toStationId: number,
    departureDate: Date,
    maxConnections: number = 1
  ): Promise<ConnectedRoute[]> {
    await this.ensureInitialized();

    const routes: ConnectedRoute[] = [];

    // Check if stations exist in graph
    const fromNode = this.nodes.get(fromStationId);
    const toNode = this.nodes.get(toStationId);
    
    if (!fromNode || !toNode) {
      return [];
    }
    
    // Try direct route first
    try {
      const dateStr = departureDate.toISOString().split('T')[0];
      const directResponse = await TCDDApiService.searchTrainAvailability(fromStationId, toStationId, dateStr);
      
      if (directResponse.success && directResponse.data && directResponse.data.length > 0) {
        // Create separate routes for each train (instead of grouping all trains in one segment)
        directResponse.data.forEach((train, index) => {
          const segment: RouteSegment = {
            fromStationId,
            fromStationName: this.getStationName(fromStationId),
            toStationId,
            toStationName: this.getStationName(toStationId),
            trains: [train] // Each segment contains only one train
          };

          const directRoute: ConnectedRoute = {
            segments: [segment],
            totalDistance: train.distance || 0,
            totalDuration: train.duration || 0,
            totalPrice: train.price || 0,
            connectionCount: 0,
            transferStations: [],
            minTransferTime: 0
          };
          
          routes.push(directRoute);
        });
        
        console.log(`Created ${directResponse.data.length} direct route options from ${this.getStationName(fromStationId)} to ${this.getStationName(toStationId)}`);
      }
    } catch (error) {
      console.error('Direct route search failed:', error);
    }

    // Find same-train connections (staying on same train, just changing seats)
    // NOTE: Disabled by default - only find connected trains when specifically requested
    /*
    try {
      const dateStr = departureDate.toISOString().split('T')[0];
      const sameTrainConnections = await TCDDApiService.findSameTrainConnections(fromStationId, toStationId, dateStr);
      
      sameTrainConnections.forEach((train, index) => {
        const segment: RouteSegment = {
          fromStationId,
          fromStationName: this.getStationName(fromStationId),
          toStationId,
          toStationName: this.getStationName(toStationId),
          trains: [train]
        };

        const sameTrainRoute: ConnectedRoute = {
          segments: [segment],
          totalDistance: train.distance || 0,
          totalDuration: train.duration || 0,
          totalPrice: train.price || 0,
          connectionCount: 0.5, // Special marker for same-train connections
          transferStations: [train.intermediateStation],
          minTransferTime: 0
        };
        
        routes.push(sameTrainRoute);
      });
      
      if (sameTrainConnections.length > 0) {
        console.log(`Created ${sameTrainConnections.length} same-train connection options`);
      }
    } catch (error) {
      console.error('Same-train connection search failed:', error);
    }
    */

    console.log(`🎯 Route finder returning only direct routes by default - connected trips available on demand`);

    // Skip multi-train connected routes - only search for same-train connections
    console.log(`🔍 Skipping connected routes search - only showing direct routes by default`);
    // const connectedRoutes = await this.findConnectedRoutesRecursive(
    //   fromStationId,
    //   toStationId,
    //   departureDate,
    //   maxConnections,
    //   [],
    //   new Set()
    // );
    // console.log(`🔗 Found ${connectedRoutes.length} connected routes from recursive search`);
    // routes.push(...connectedRoutes);

    // Sort routes by preference: direct routes only
    routes.sort((a, b) => {
      return a.totalDuration - b.totalDuration;
    });

    // Remove duplicates - only direct routes
    const deduplicatedRoutes = this.removeDuplicateRoutes(routes);
    
    // Only return direct routes (connectionCount === 0)
    const directRoutes = deduplicatedRoutes.filter(r => r.connectionCount === 0);
    
    console.log(`🎯 Route finder returning ${directRoutes.length} direct routes`);
    return directRoutes;
  }

  public async findConnectedAlternatives(
    fromStationId: number,
    toStationId: number,
    departureDate: Date,
    targetDepartureTime: string // Format: "HH:MM"
  ): Promise<ConnectedRoute[]> {
    await this.ensureInitialized();

    console.log(`🔍 Finding connected alternatives for ${targetDepartureTime} departure from ${this.getStationName(fromStationId)} to ${this.getStationName(toStationId)}`);

    const routes: ConnectedRoute[] = [];

    // Find same-train connections for the specific time
    try {
      const dateStr = departureDate.toISOString().split('T')[0];
      const sameTrainConnections = await TCDDApiService.findSameTrainConnections(fromStationId, toStationId, dateStr);
      
      // Filter same-train connections to only include those that depart at the target time
      const timeFilteredConnections = sameTrainConnections.filter(connection => {
        if (connection.firstLeg && connection.firstLeg.departureTime) {
          const trainTimeSlot = this.extractTimeSlot(connection.firstLeg.departureTime);
          const targetTimeSlot = this.extractTimeSlot(targetDepartureTime);
          return trainTimeSlot === targetTimeSlot;
        }
        return false;
      });

      timeFilteredConnections.forEach((connection, index) => {
        // Create a two-segment route: origin → intermediate → destination
        if (connection.firstLeg && connection.secondLeg && connection.intermediateStation) {
          const firstSegment: RouteSegment = {
            fromStationId: connection.firstLeg.fromStation,
            fromStationName: connection.firstLeg.fromStationName,
            toStationId: connection.firstLeg.toStation,
            toStationName: connection.firstLeg.toStationName,
            trains: [{
              trainNumber: connection.firstLeg.trainNumber,
              trainName: connection.firstLeg.trainName + ' (1. Etap)',
              departureTime: connection.firstLeg.departureTime,
              arrivalTime: connection.firstLeg.arrivalTime,
              duration: connection.firstLeg.duration,
              price: connection.firstLeg.price,
              availableSeats: connection.firstLeg.availableSeats,
              seatCategories: connection.firstLeg.seatCategories,
              departureTimestamp: 0 // We can calculate this if needed
            }]
          };

          const secondSegment: RouteSegment = {
            fromStationId: connection.secondLeg.fromStation,
            fromStationName: connection.secondLeg.fromStationName,
            toStationId: connection.secondLeg.toStation,
            toStationName: connection.secondLeg.toStationName,
            trains: [{
              trainNumber: connection.secondLeg.trainNumber,
              trainName: connection.secondLeg.trainName + ' (2. Etap)',
              departureTime: connection.secondLeg.departureTime,
              arrivalTime: connection.secondLeg.arrivalTime,
              duration: connection.secondLeg.duration,
              price: connection.secondLeg.price,
              availableSeats: connection.secondLeg.availableSeats,
              seatCategories: connection.secondLeg.seatCategories,
              departureTimestamp: 0 // We can calculate this if needed
            }]
          };

          const sameTrainRoute: ConnectedRoute = {
            segments: [firstSegment, secondSegment],
            totalDistance: 0, // Could be calculated from segments
            totalDuration: connection.totalDuration || 0,
            totalPrice: connection.totalPrice || 0,
            connectionCount: 1, // This is a real connection (same train, different tickets)
            transferStations: [connection.intermediateStation],
            minTransferTime: 0 // No waiting time since it's the same train
          };
          
          routes.push(sameTrainRoute);
        }
      });
      
      if (timeFilteredConnections.length > 0) {
        console.log(`✅ Found ${timeFilteredConnections.length} same-train alternatives for ${targetDepartureTime}`);
      }
    } catch (error) {
      console.error('Same-train alternatives search failed:', error);
    }

    // Sort by total duration
    routes.sort((a, b) => a.totalDuration - b.totalDuration);

    console.log(`🎯 Found ${routes.length} connected alternatives for ${targetDepartureTime} departure`);
    return routes;
  }

  private async findConnectedRoutesRecursive(
    fromStationId: number,
    toStationId: number,
    departureDate: Date,
    maxConnections: number,
    currentPath: number[],
    visited: Set<number>
  ): Promise<ConnectedRoute[]> {
    if (maxConnections <= 0 || visited.has(fromStationId)) {
      console.log(`🚫 Stopping recursive search: maxConnections=${maxConnections}, visited=${visited.has(fromStationId)}`);
      return [];
    }

    const routes: ConnectedRoute[] = [];
    const fromNode = this.nodes.get(fromStationId);
    
    if (!fromNode) {
      console.log(`❌ No node found for station ${fromStationId}`);
      return [];
    }

    console.log(`📍 Searching connections from ${this.getStationName(fromStationId)} (${fromStationId}) to ${this.getStationName(toStationId)} (${toStationId})`);
    visited.add(fromStationId);

    // Prioritize major hub stations for connections
    const majorHubs = [98, 1325, 48, 87, 20, 1135, 180, 753]; // Ankara, İstanbul, Eskişehir, etc.
    
    // Sort connections to prioritize major hubs and avoid illogical routes
    const sortedConnections = fromNode.connections
      .filter(id => !this.isIllogicalRoute(fromStationId, id, toStationId))
      .sort((a, b) => {
        const aIsMajorHub = majorHubs.includes(a) ? 1 : 0;
        const bIsMajorHub = majorHubs.includes(b) ? 1 : 0;
        return bIsMajorHub - aIsMajorHub; // Major hubs first
      })
      .slice(0, 8); // Limit connections to explore

    console.log(`🔗 Found ${fromNode.connections.length} total connections, ${sortedConnections.length} after filtering for ${this.getStationName(fromStationId)}`);
    
    for (const intermediateStationId of sortedConnections) {
      if (visited.has(intermediateStationId)) {
        console.log(`⚠️ Skipping ${this.getStationName(intermediateStationId)} - already visited`);
        continue;
      }

      console.log(`🔍 Trying connection through ${this.getStationName(intermediateStationId)} (${intermediateStationId})`);
      
      try {
        // Search for trains from current station to intermediate station
        const dateStr = departureDate.toISOString().split('T')[0];
        const firstLegResponse = await TCDDApiService.searchTrainAvailability(
          fromStationId,
          intermediateStationId,
          dateStr
        );

        if (!firstLegResponse.success || firstLegResponse.data.length === 0) {
          continue;
        }

        // Check if intermediate station connects to destination
        const intermediateNode = this.nodes.get(intermediateStationId);
        if (intermediateNode && intermediateNode.connections.includes(toStationId)) {
          const bestFirstTrain = this.findBestTrain(firstLegResponse.data);
          const firstTrainArrival = this.calculateArrivalTime(departureDate, bestFirstTrain);
          const minTransferTime = 45; // minutes
          const earliestSecondDeparture = new Date(firstTrainArrival.getTime() + minTransferTime * 60000);
          
          const sameDayDateStr = departureDate.toISOString().split('T')[0];
          const secondLegResponse = await TCDDApiService.searchTrainAvailability(
            intermediateStationId,
            toStationId,
            sameDayDateStr
          );
          
          if (secondLegResponse.success && secondLegResponse.data.length > 0) {
            // Filter valid connections (same-day, reasonable transfer time)
            const validSecondTrains = secondLegResponse.data.filter(train => {
              if (!train.departureTime) return false;
              
              const trainDepartureTime = this.parseTrainTime(train.departureTime, departureDate);
              const isValidConnection = trainDepartureTime >= earliestSecondDeparture;
              const isSameDay = trainDepartureTime.toDateString() === departureDate.toDateString();
              const transferHours = (trainDepartureTime.getTime() - firstTrainArrival.getTime()) / (1000 * 60 * 60);
              const isReasonableTransfer = transferHours <= 8;
              
              return isValidConnection && isSameDay && isReasonableTransfer;
            });
            
            if (validSecondTrains.length > 0) {
              const bestSecondTrain = this.findBestTrain(validSecondTrains);
              
              const firstSegment: RouteSegment = {
                fromStationId,
                fromStationName: this.getStationName(fromStationId),
                toStationId: intermediateStationId,
                toStationName: this.getStationName(intermediateStationId),
                trains: firstLegResponse.data
              };
              
              const secondSegment: RouteSegment = {
                fromStationId: intermediateStationId,
                fromStationName: this.getStationName(intermediateStationId),
                toStationId,
                toStationName: this.getStationName(toStationId),
                trains: validSecondTrains
              };
              
              const connectedRoute: ConnectedRoute = {
                segments: [firstSegment, secondSegment],
                totalDistance: (bestFirstTrain.distance || 0) + (bestSecondTrain.distance || 0),
                totalDuration: (bestFirstTrain.duration || 0) + (bestSecondTrain.duration || 0) + minTransferTime,
                totalPrice: (bestFirstTrain.price || 0) + (bestSecondTrain.price || 0),
                connectionCount: 1,
                transferStations: [this.getStationName(intermediateStationId)],
                minTransferTime: minTransferTime
              };
              
              routes.push(connectedRoute);
            }
          }
        }
        
        // Limit routes to prevent too many API calls
        if (routes.length >= 5) {
          break;
        }
      } catch (error) {
        console.error(`Error searching route segment ${fromStationId} -> ${intermediateStationId}:`, error);
        continue;
      }
    }

    visited.delete(fromStationId);
    return routes;
  }

  private isIllogicalRoute(fromStationId: number, intermediateStationId: number, toStationId: number): boolean {
    // Define known geographical relationships to avoid obviously wrong routes
    const knownIllogicalRoutes = [
      // İzmit -> İstanbul -> Ankara is illogical (İstanbul is west of İzmit, Ankara is east)
      { from: 1135, via: [48, 1325], to: 98 },
      { from: 1135, via: [48, 1325], to: 87 },
      { from: 98, via: [48, 1325], to: 1135 },
      { from: 87, via: [48, 1325], to: 1135 },
      // İzmir -> İstanbul -> eastern cities
      { from: 180, via: [48, 1325], to: 98 },
      { from: 180, via: [48, 1325], to: 87 },
      { from: 98, via: [48, 1325], to: 180 },
      { from: 87, via: [48, 1325], to: 180 },
    ];
    
    // Check if this route matches any known illogical pattern
    for (const illogicalRoute of knownIllogicalRoutes) {
      if (illogicalRoute.from === fromStationId && 
          illogicalRoute.via.includes(intermediateStationId) && 
          illogicalRoute.to === toStationId) {
        return true;
      }
    }
    
    // Additional geographical logic
    const stationGroups = {
      istanbul: [48, 1325],
      ankara: [98],
      izmit: [1135],
      eskisehir: [87],
      izmir: [180],
      gebze: [20],
    };
    
    // Check if going through İstanbul is geographically illogical
    if (stationGroups.istanbul.includes(intermediateStationId)) {
      if (stationGroups.izmit.includes(fromStationId) && 
          (stationGroups.ankara.includes(toStationId) || stationGroups.eskisehir.includes(toStationId))) {
        return true;
      }
      
      if ((stationGroups.ankara.includes(fromStationId) || stationGroups.eskisehir.includes(fromStationId)) &&
          stationGroups.izmit.includes(toStationId)) {
        return true;
      }
    }
    
    return false;
  }

  private findBestTrain(trains: any[]): any {
    if (trains.length === 0) return {};
    
    // Prefer trains with earliest departure time
    return trains.reduce((best, current) => {
      if (!best.departureTimestamp) return current;
      if (!current.departureTimestamp) return best;
      
      return current.departureTimestamp < best.departureTimestamp ? current : best;
    });
  }

  private filterSameTrainByTimeSlot(directRoutes: ConnectedRoute[], sameTrainRoutes: ConnectedRoute[]): ConnectedRoute[] {
    if (directRoutes.length === 0) {
      // No direct routes, keep all same-train routes
      return sameTrainRoutes;
    }

    // Create a set of time slots that have direct trains with economy seats available
    const directTimeSlotsWithEconomySeats = new Set<string>();
    
    directRoutes.forEach(directRoute => {
      if (directRoute.segments.length > 0 && directRoute.segments[0].trains.length > 0) {
        const train = directRoute.segments[0].trains[0];
        if (train.departureTime) {
          // Check if this direct train has economy seats available
          const economySeats = this.getEconomySeats(train);
          if (economySeats > 0) {
            // Extract time slot (hour and minute) from departure time
            const timeSlot = this.extractTimeSlot(train.departureTime);
            if (timeSlot) {
              directTimeSlotsWithEconomySeats.add(timeSlot);
              console.log(`📋 Direct train at ${timeSlot} has ${economySeats} economy seats - will filter same-train connections`);
            }
          } else {
            console.log(`⚠️ Direct train at ${train.departureTime} has no economy seats - keeping same-train connections`);
          }
        }
      }
    });

    // Filter same-train routes to exclude those with conflicting time slots (only if direct has economy seats)
    const filteredSameTrainRoutes = sameTrainRoutes.filter(sameTrainRoute => {
      if (sameTrainRoute.segments.length > 0 && sameTrainRoute.segments[0].trains.length > 0) {
        const train = sameTrainRoute.segments[0].trains[0];
        if (train.departureTime) {
          const timeSlot = this.extractTimeSlot(train.departureTime);
          if (timeSlot && directTimeSlotsWithEconomySeats.has(timeSlot)) {
            console.log(`🚫 Filtering out same-train connection at ${timeSlot} - direct train has economy seats available`);
            return false; // Exclude this same-train route
          }
        }
      }
      return true; // Keep this same-train route
    });

    console.log(`⏰ Economy seat filtering: ${directTimeSlotsWithEconomySeats.size} direct time slots with economy seats, filtered ${sameTrainRoutes.length - filteredSameTrainRoutes.length} same-train routes`);
    
    return filteredSameTrainRoutes;
  }

  private extractTimeSlot(departureTime: string): string | null {
    try {
      // Handle time formats like "06:00", "06:30", "14:15", etc.
      // Remove any extra characters like "+1" for next day
      const cleanTime = departureTime.replace(/\s*\+1\s*/, '').trim();
      
      // Match HH:MM format
      const timeMatch = cleanTime.match(/^(\d{1,2}):(\d{2})$/);
      if (timeMatch) {
        const hours = timeMatch[1].padStart(2, '0');
        const minutes = timeMatch[2];
        return `${hours}:${minutes}`;
      }
      
      return null;
    } catch (error) {
      console.warn(`Error parsing departure time: ${departureTime}`, error);
      return null;
    }
  }

  private getEconomySeats(train: any): number {
    // First try to get economy seats from seat categories
    if (train.seatCategories && Array.isArray(train.seatCategories)) {
      const economyCategories = train.seatCategories.filter((category: any) => 
        category.categoryCode && (
          category.categoryCode.toLowerCase().includes('eco') ||
          category.categoryCode.toLowerCase().includes('ekonomi') ||
          category.categoryName?.toLowerCase().includes('economy') ||
          category.categoryName?.toLowerCase().includes('ekonomi')
        )
      );
      
      if (economyCategories.length > 0) {
        const economySeats = economyCategories.reduce((sum: number, cat: any) => sum + (cat.availableSeats || 0), 0);
        console.log(`🎫 Found ${economySeats} economy seats for train ${train.trainNumber} from categories`);
        return economySeats;
      }
    }
    
    // Fallback to total available seats if no economy categories found
    const totalSeats = train.availableSeats || 0;
    console.log(`⚠️ No economy categories found for train ${train.trainNumber}, using total seats: ${totalSeats}`);
    return totalSeats;
  }

  private calculateArrivalTime(departureDate: Date, train: any): Date {
    // Use actual arrival time if available
    if (train.arrivalTime) {
      return this.parseTrainTime(train.arrivalTime, departureDate);
    }
    
    // Calculate from departure time and duration
    if (train.departureTime && train.duration) {
      const departureTime = this.parseTrainTime(train.departureTime, departureDate);
      return new Date(departureTime.getTime() + train.duration * 60 * 1000);
    }
    
    // Fallback: use duration from base departure date
    if (train.duration) {
      return new Date(departureDate.getTime() + train.duration * 60 * 1000);
    }
    
    // Default to 2 hours if no duration specified
    return new Date(departureDate.getTime() + 2 * 60 * 60 * 1000);
  }

  private parseTrainTime(timeString: string, baseDate: Date): Date {
    let time = timeString.trim();
    let isNextDay = false;
    
    // Check for next day indicator
    if (time.includes('+1')) {
      isNextDay = true;
      time = time.replace(' +1', '').trim();
    }
    
    // Parse hours and minutes
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return new Date(baseDate);
    }
    
    // Create date with the parsed time
    const resultDate = new Date(baseDate);
    resultDate.setHours(hours, minutes, 0, 0);
    
    // Add a day if it's marked as next day
    if (isNextDay) {
      resultDate.setDate(resultDate.getDate() + 1);
    }
    
    return resultDate;
  }

  private getStationName(stationId: number): string {
    // Try station pairs first
    const stationPair = this.stationPairs.find(sp => sp.id === stationId);
    if (stationPair) {
      return stationPair.name;
    }

    // Then try stations
    const station = this.stations.find(s => s.id === stationId);
    if (station) {
      return station.name;
    }

    return `Station ${stationId}`;
  }

  private removeDuplicateRoutes(routes: ConnectedRoute[]): ConnectedRoute[] {
    const seen = new Set<string>();
    const uniqueRoutes: ConnectedRoute[] = [];

    for (const route of routes) {
      // Create a signature for the route based on stations visited
      const stationSequence = route.segments.map(s => `${s.fromStationId}-${s.toStationId}`).join('|');
      
      // For direct routes (single segment with one train each), include train number to avoid treating different trains as duplicates
      // For same-train connections, use special handling
      // For connected routes (multiple segments), use the route path and connection count to identify duplicates
      let routeSignature: string;
      
      if (route.connectionCount === 0 && route.segments.length === 1) {
        // Direct route: include train number to distinguish different trains on same route
        const trainNumber = route.segments[0].trains[0]?.trainNumber || 'unknown';
        routeSignature = `direct:${stationSequence}:${trainNumber}`;
      } else if (route.connectionCount === 0.5) {
        // Same-train connection: include train number and intermediate station
        const trainNumber = route.segments[0].trains[0]?.trainNumber || 'unknown';
        const intermediateStation = route.transferStations[0] || 'unknown';
        routeSignature = `same-train:${stationSequence}:${trainNumber}:${intermediateStation}`;
      } else {
        // Connected route: use route path and total characteristics
        routeSignature = `connected:${stationSequence}:${route.connectionCount}:${route.totalDuration}:${route.totalPrice}`;
      }
      
      if (!seen.has(routeSignature)) {
        seen.add(routeSignature);
        uniqueRoutes.push(route);
      } else {
        console.log(`🔄 Removing duplicate route with signature: ${routeSignature}`);
      }
    }

    console.log(`✂️ Removed ${routes.length - uniqueRoutes.length} duplicate routes, keeping ${uniqueRoutes.length} unique routes`);
    return uniqueRoutes;
  }
  // Utility methods for debugging and analysis
  public async getConnectionInfo(fromStationId: number, toStationId: number): Promise<{
    hasDirectConnection: boolean;
    possibleTransferStations: number[];
  }> {
    await this.ensureInitialized();

    const fromNode = this.nodes.get(fromStationId);
    const toNode = this.nodes.get(toStationId);

    if (!fromNode || !toNode) {
      return {
        hasDirectConnection: false,
        possibleTransferStations: []
      };
    }

    const hasDirectConnection = fromNode.connections.includes(toStationId);
    
    // Find stations that connect to both origin and destination
    const possibleTransferStations = fromNode.connections.filter(stationId => {
      const transferNode = this.nodes.get(stationId);
      return transferNode && transferNode.connections.includes(toStationId);
    });

    return {
      hasDirectConnection,
      possibleTransferStations
    };
  }
}

// Create singleton instance
const routeGraph = new RouteGraph();

export { routeGraph };
export default RouteGraph;