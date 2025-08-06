// Route finding system using node-based graph for connected trips
import TCDDApiService, { TCDDStationPair, TCDDStation } from './tcdd-api';

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
  private stationPairs: TCDDStationPair[] = [];
  private stations: TCDDStation[] = [];

  private initialized = false;

  constructor() {
    // Don't initialize in constructor - do it lazily when needed
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      // Load station pairs and stations data
      this.stationPairs = await TCDDApiService.fetchStationPairs();
      this.stations = await TCDDApiService.fetchStations();

      // Build the graph nodes
      this.buildNodes();
      
      console.log(`Route graph initialized with ${this.nodes.size} nodes from ${this.stationPairs.length} station pairs`);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize route graph:', error);
      throw error;
    }
  }

  private buildNodes() {
    // Create nodes from station pairs data
    for (const stationPair of this.stationPairs) {
      if (!stationPair.pairs || stationPair.pairs.length === 0) continue;

      const node: RouteNode = {
        stationId: stationPair.id,
        stationName: stationPair.name,
        connections: stationPair.pairs
      };

      this.nodes.set(stationPair.id, node);
    }

    // Also ensure we have reverse connections (if A connects to B, B should connect to A)
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
    maxConnections: number = 2
  ): Promise<ConnectedRoute[]> {
    await this.ensureInitialized(); // Ensure graph is initialized

    const routes: ConnectedRoute[] = [];

    console.log(`Finding routes from ${fromStationId} to ${toStationId} with max ${maxConnections} connections`);

    // First check for direct route
    const directRoute = await this.findDirectRoute(fromStationId, toStationId, departureDate);
    if (directRoute) {
      routes.push(directRoute);
      console.log(`Found direct route with ${directRoute.totalPrice} TRY`);
    } else {
      console.log('No direct route found, searching connected routes...');
    }

    // Always find connected routes (even if direct exists) to give users more options
    const connectedRoutes = await this.findConnectedRoutesRecursive(
      fromStationId,
      toStationId,
      departureDate,
      maxConnections,
      [],
      new Set()
    );

    routes.push(...connectedRoutes);
    console.log(`Found ${connectedRoutes.length} connected routes`);

    // Sort routes by preference: direct first, then by connection count, then by duration
    routes.sort((a, b) => {
      if (a.connectionCount !== b.connectionCount) {
        return a.connectionCount - b.connectionCount;
      }
      return a.totalDuration - b.totalDuration;
    });

    // Remove duplicate routes and limit to reasonable number
    const uniqueRoutes = this.removeDuplicateRoutes(routes);
    
    console.log(`Returning ${uniqueRoutes.length} unique routes`);
    return uniqueRoutes.slice(0, 15); // Increase to 15 routes to show more options
  }

  private async findDirectRoute(
    fromStationId: number,
    toStationId: number,
    departureDate: Date
  ): Promise<ConnectedRoute | null> {
    try {
      // Check if direct connection exists in graph
      const fromNode = this.nodes.get(fromStationId);
      if (!fromNode || !fromNode.connections.includes(toStationId)) {
        console.log(`No direct connection found between ${fromStationId} and ${toStationId} in graph`);
        return null;
      }

      // Search for trains on this direct route
      const dateStr = departureDate.toISOString().split('T')[0];
      console.log(`Searching direct route ${fromStationId} -> ${toStationId} on ${dateStr}`);
      
      const response = await TCDDApiService.searchTrainAvailability(fromStationId, toStationId, dateStr);

      if (!response.success || response.data.length === 0) {
        console.log(`No trains found for direct route ${fromStationId} -> ${toStationId}`);
        return null;
      }

      const fromStation = this.getStationName(fromStationId);
      const toStation = this.getStationName(toStationId);

      const segment: RouteSegment = {
        fromStationId,
        fromStationName: fromStation,
        toStationId,
        toStationName: toStation,
        trains: response.data
      };

      // Use actual data from trains
      const firstTrain = response.data[0];
      const totalDistance = firstTrain.distance || 0;
      const totalDuration = firstTrain.duration || 0;
      const totalPrice = firstTrain.price || 0;

      console.log(`Found direct route: ${fromStation} -> ${toStation}, ${response.data.length} trains, price: ${totalPrice} TRY`);

      return {
        segments: [segment],
        totalDistance,
        totalDuration,
        totalPrice,
        connectionCount: 0,
        transferStations: [],
        minTransferTime: 0
      };

    } catch (error) {
      console.error('Error finding direct route:', error);
      return null;
    }
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
      return [];
    }

    const routes: ConnectedRoute[] = [];
    const fromNode = this.nodes.get(fromStationId);
    
    if (!fromNode) {
      return [];
    }

    visited.add(fromStationId);

    // Prioritize major hub stations for connections
    const majorHubs = [98, 87, 180, 753, 20, 1135, 1325, 48]; // Ankara, Eskişehir, İzmir, Adana, Gebze, İzmit YHT, İstanbul Söğütlüçeşme, İstanbul Pendik
    
    // Sort connections to prioritize major hubs
    const sortedConnections = fromNode.connections.sort((a, b) => {
      const aIsMajorHub = majorHubs.includes(a) ? 1 : 0;
      const bIsMajorHub = majorHubs.includes(b) ? 1 : 0;
      return bIsMajorHub - aIsMajorHub; // Major hubs first
    });

    // Limit connections to explore for performance, but prioritize major hubs
    const connectionsToExplore = sortedConnections.slice(0, 15);

    for (const intermediateStationId of connectionsToExplore) {
      if (visited.has(intermediateStationId)) continue;

      // Skip if this intermediate station doesn't eventually connect to destination
      if (!this.canReachDestination(intermediateStationId, toStationId, maxConnections - 1, new Set(visited))) {
        continue;
      }

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

        // Calculate arrival time at intermediate station
        const bestFirstTrain = this.findBestTrain(firstLegResponse.data);
        const arrivalTime = this.calculateArrivalTime(departureDate, bestFirstTrain);
        const transferTime = 45; // Minimum 45 minutes transfer time for connections
        const nextDepartureTime = new Date(arrivalTime.getTime() + transferTime * 60000);

        if (intermediateStationId === toStationId) {
          // We've reached the destination
          const fromStation = this.getStationName(fromStationId);
          const toStation = this.getStationName(toStationId);

          const segment: RouteSegment = {
            fromStationId,
            fromStationName: fromStation,
            toStationId: intermediateStationId,
            toStationName: toStation,
            trains: firstLegResponse.data
          };

          routes.push({
            segments: [segment],
            totalDistance: bestFirstTrain.distance || 0,
            totalDuration: bestFirstTrain.duration || 0,
            totalPrice: bestFirstTrain.price || 0,
            connectionCount: currentPath.length,
            transferStations: currentPath.map(id => this.getStationName(id)),
            minTransferTime: transferTime
          });
        } else {
          // Continue searching from intermediate station
          if (maxConnections > 1) {
            const nextDepartureDate = nextDepartureTime;
            const remainingRoutes = await this.findConnectedRoutesRecursive(
              intermediateStationId,
              toStationId,
              nextDepartureDate,
              maxConnections - 1,
              [...currentPath, intermediateStationId],
              new Set(visited)
            );

            // Combine first leg with remaining routes
            for (const remainingRoute of remainingRoutes) {
              const fromStation = this.getStationName(fromStationId);
              const intermediateStation = this.getStationName(intermediateStationId);

              const firstSegment: RouteSegment = {
                fromStationId,
                fromStationName: fromStation,
                toStationId: intermediateStationId,
                toStationName: intermediateStation,
                trains: firstLegResponse.data
              };

              const combinedRoute: ConnectedRoute = {
                segments: [firstSegment, ...remainingRoute.segments],
                totalDistance: (bestFirstTrain.distance || 0) + remainingRoute.totalDistance,
                totalDuration: (bestFirstTrain.duration || 0) + remainingRoute.totalDuration + transferTime,
                totalPrice: (bestFirstTrain.price || 0) + remainingRoute.totalPrice,
                connectionCount: remainingRoute.connectionCount + 1,
                transferStations: [intermediateStation, ...remainingRoute.transferStations],
                minTransferTime: Math.max(transferTime, remainingRoute.minTransferTime)
              };

              routes.push(combinedRoute);
            }
          }
        }
      } catch (error) {
        console.error(`Error searching route segment ${fromStationId} -> ${intermediateStationId}:`, error);
        continue;
      }
    }

    visited.delete(fromStationId);
    return routes;
  }

  private canReachDestination(
    fromStationId: number,
    toStationId: number,
    maxDepth: number,
    visited: Set<number>
  ): boolean {
    if (maxDepth <= 0 || visited.has(fromStationId)) {
      return false;
    }

    const fromNode = this.nodes.get(fromStationId);
    if (!fromNode) {
      return false;
    }

    if (fromNode.connections.includes(toStationId)) {
      return true;
    }

    visited.add(fromStationId);

    for (const nextStationId of fromNode.connections) {
      if (this.canReachDestination(nextStationId, toStationId, maxDepth - 1, new Set(visited))) {
        visited.delete(fromStationId);
        return true;
      }
    }

    visited.delete(fromStationId);
    return false;
  }

  private findBestTrain(trains: any[]): any {
    if (trains.length === 0) return {};
    
    // Prefer trains with earliest departure time and reasonable price
    return trains.reduce((best, current) => {
      if (!best.departureTimestamp) return current;
      if (!current.departureTimestamp) return best;
      
      // Prefer earlier departure time
      if (current.departureTimestamp < best.departureTimestamp) {
        return current;
      }
      
      return best;
    });
  }

  private calculateArrivalTime(departureDate: Date, train: any): Date {
    if (!train.duration) {
      // Default to 2 hours if no duration specified
      return new Date(departureDate.getTime() + 2 * 60 * 60 * 1000);
    }
    
    return new Date(departureDate.getTime() + train.duration * 60 * 1000);
  }

  private getStationName(stationId: number): string {
    // First try to find in station pairs
    const stationPair = this.stationPairs.find(sp => sp.id === stationId);
    if (stationPair) {
      return stationPair.name;
    }

    // Then try in stations
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
      
      if (!seen.has(stationSequence)) {
        seen.add(stationSequence);
        uniqueRoutes.push(route);
      }
    }

    return uniqueRoutes;
  }

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