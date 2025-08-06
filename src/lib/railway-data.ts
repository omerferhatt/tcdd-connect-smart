import TCDDApiService, { TCDDTrainAvailability } from './tcdd-api';

export interface Station {
  id: string;
  name: string;
  city: string;
  region: string;
  tcddId?: number; // TCDD API station ID
}

export interface RouteSegment {
  id: string;
  from: Station;
  to: Station;
  departure: string;
  arrival: string;
  duration: number; // minutes
  trainNumber: string;
  price: number; // TL
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
  { id: 'ist-pendik', name: 'İstanbul (Pendik)', city: 'İstanbul', region: 'Marmara', tcddId: 1322 },
  { id: 'ist-halkali', name: 'İstanbul (Halkalı)', city: 'İstanbul', region: 'Marmara', tcddId: 1326 },
  { id: 'ank', name: 'Ankara Gar', city: 'Ankara', region: 'İç Anadolu', tcddId: 98 },
  { id: 'koc', name: 'Kocaeli (İzmit)', city: 'Kocaeli', region: 'Marmara', tcddId: 82 },
  { id: 'esk', name: 'Eskişehir', city: 'Eskişehir', region: 'İç Anadolu', tcddId: 87 },
  { id: 'kon', name: 'Konya', city: 'Konya', region: 'İç Anadolu', tcddId: 103 },
  { id: 'izm', name: 'İzmir (Basmane)', city: 'İzmir', region: 'Ege', tcddId: 180 },
  { id: 'izm-alsancak', name: 'İzmir (Alsancak)', city: 'İzmir', region: 'Ege', tcddId: 181 },
  { id: 'ada', name: 'Adana', city: 'Adana', region: 'Akdeniz', tcddId: 160 },
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
  { id: 'tok', name: 'Tokat', city: 'Tokat', region: 'Karadeniz', tcddId: 145 }
];

// Mock route data - in a real app, this would come from TCDD API
export const MOCK_ROUTES: RouteSegment[] = [
  // Istanbul connections
  { id: 'ist-koc', from: TURKISH_STATIONS[0], to: TURKISH_STATIONS[2], departure: '08:00', arrival: '09:30', duration: 90, trainNumber: 'B540', price: 25 },
  { id: 'ist-esk', from: TURKISH_STATIONS[0], to: TURKISH_STATIONS[3], departure: '09:15', arrival: '13:45', duration: 270, trainNumber: 'B552', price: 85 },
  { id: 'ist-izm', from: TURKISH_STATIONS[0], to: TURKISH_STATIONS[5], departure: '22:30', arrival: '08:45', duration: 615, trainNumber: 'İE', price: 120 },
  
  // Kocaeli connections  
  { id: 'koc-ank', from: TURKISH_STATIONS[2], to: TURKISH_STATIONS[1], departure: '10:15', arrival: '14:30', duration: 255, trainNumber: 'B544', price: 75 },
  { id: 'koc-esk', from: TURKISH_STATIONS[2], to: TURKISH_STATIONS[3], departure: '11:00', arrival: '14:15', duration: 195, trainNumber: 'B546', price: 60 },
  
  // Eskişehir connections
  { id: 'esk-ank', from: TURKISH_STATIONS[3], to: TURKISH_STATIONS[1], departure: '15:00', arrival: '17:15', duration: 135, trainNumber: 'B548', price: 45 },
  { id: 'esk-kon', from: TURKISH_STATIONS[3], to: TURKISH_STATIONS[4], departure: '16:30', arrival: '20:45', duration: 255, trainNumber: 'B550', price: 70 },
  { id: 'esk-afv', from: TURKISH_STATIONS[3], to: TURKISH_STATIONS[16], departure: '12:20', arrival: '14:50', duration: 150, trainNumber: 'B554', price: 55 },
  
  // Ankara connections
  { id: 'ank-kay', from: TURKISH_STATIONS[1], to: TURKISH_STATIONS[8], departure: '18:00', arrival: '21:30', duration: 210, trainNumber: 'B556', price: 65 },
  { id: 'ank-siv', from: TURKISH_STATIONS[1], to: TURKISH_STATIONS[9], departure: '20:15', arrival: '02:45', duration: 390, trainNumber: 'B558', price: 95 },
  { id: 'ank-kon', from: TURKISH_STATIONS[1], to: TURKISH_STATIONS[4], departure: '07:30', arrival: '11:15', duration: 225, trainNumber: 'B560', price: 70 },
  
  // Regional connections
  { id: 'kay-siv', from: TURKISH_STATIONS[8], to: TURKISH_STATIONS[9], departure: '22:00', arrival: '01:15', duration: 195, trainNumber: 'B562', price: 50 },
  { id: 'siv-sam', from: TURKISH_STATIONS[9], to: TURKISH_STATIONS[10], departure: '03:30', arrival: '08:45', duration: 315, trainNumber: 'B564', price: 80 },
  { id: 'siv-mal', from: TURKISH_STATIONS[9], to: TURKISH_STATIONS[11], departure: '04:00', arrival: '09:30', duration: 330, trainNumber: 'B566', price: 85 },
  { id: 'mal-eli', from: TURKISH_STATIONS[11], to: TURKISH_STATIONS[14], departure: '10:15', arrival: '12:45', duration: 150, trainNumber: 'B568', price: 45 },
  { id: 'eli-erz', from: TURKISH_STATIONS[14], to: TURKISH_STATIONS[13], departure: '13:30', arrival: '17:15', duration: 225, trainNumber: 'B570', price: 70 },
  { id: 'erz-kar', from: TURKISH_STATIONS[13], to: TURKISH_STATIONS[12], departure: '18:00', arrival: '22:30', duration: 270, trainNumber: 'B572', price: 75 },
  
  // İzmir region
  { id: 'izm-afv', from: TURKISH_STATIONS[5], to: TURKISH_STATIONS[16], departure: '14:30', arrival: '17:45', duration: 195, trainNumber: 'B574', price: 60 },
  { id: 'afv-den', from: TURKISH_STATIONS[16], to: TURKISH_STATIONS[17], departure: '18:30', arrival: '21:15', duration: 165, trainNumber: 'B576', price: 50 },
  { id: 'izm-den', from: TURKISH_STATIONS[5], to: TURKISH_STATIONS[17], departure: '09:00', arrival: '13:30', duration: 270, trainNumber: 'B578', price: 85 },
  
  // Mediterranean region
  { id: 'ada-mer', from: TURKISH_STATIONS[6], to: TURKISH_STATIONS[7], departure: '16:45', arrival: '18:30', duration: 105, trainNumber: 'B580', price: 35 },
  { id: 'mer-ada', from: TURKISH_STATIONS[7], to: TURKISH_STATIONS[6], departure: '19:15', arrival: '21:00', duration: 105, trainNumber: 'B582', price: 35 },
  
  // Black Sea region
  { id: 'sam-ama', from: TURKISH_STATIONS[10], to: TURKISH_STATIONS[23], departure: '12:30', arrival: '15:45', duration: 195, trainNumber: 'B584', price: 60 },
  { id: 'ama-tok', from: TURKISH_STATIONS[23], to: TURKISH_STATIONS[24], departure: '16:30', arrival: '18:15', duration: 105, trainNumber: 'B586', price: 40 }
];

export function findStations(query: string): Station[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return TURKISH_STATIONS.filter(station => 
    station.name.toLowerCase().includes(lowerQuery) ||
    station.city.toLowerCase().includes(lowerQuery)
  ).slice(0, 8);
}

export function findDirectRoutes(fromId: string, toId: string): RouteSegment[] {
  return MOCK_ROUTES.filter(route => 
    route.from.id === fromId && route.to.id === toId
  );
}

export function findConnectedRoutes(fromId: string, toId: string, maxConnections: number = 2): Journey[] {
  const journeys: Journey[] = [];
  
  // Add direct routes
  const directRoutes = findDirectRoutes(fromId, toId);
  directRoutes.forEach(route => {
    journeys.push({
      id: `direct-${route.id}`,
      segments: [route],
      totalDuration: route.duration,
      totalPrice: route.price,
      connectionCount: 0
    });
  });
  
  // Find one-connection routes
  if (maxConnections >= 1) {
    const fromRoutes = MOCK_ROUTES.filter(route => route.from.id === fromId);
    
    fromRoutes.forEach(firstSegment => {
      const secondSegments = MOCK_ROUTES.filter(route => 
        route.from.id === firstSegment.to.id && route.to.id === toId
      );
      
      secondSegments.forEach(secondSegment => {
        // Check if connection is feasible (at least 30 minutes transfer time)
        const firstArrival = parseTime(firstSegment.arrival);
        const secondDeparture = parseTime(secondSegment.departure);
        
        let transferTime = secondDeparture - firstArrival;
        if (transferTime < 0) transferTime += 24 * 60; // Next day
        
        if (transferTime >= 30 && transferTime <= 8 * 60) { // 30 min to 8 hours
          journeys.push({
            id: `1conn-${firstSegment.id}-${secondSegment.id}`,
            segments: [firstSegment, secondSegment],
            totalDuration: firstSegment.duration + secondSegment.duration + transferTime,
            totalPrice: firstSegment.price + secondSegment.price,
            connectionCount: 1
          });
        }
      });
    });
  }
  
  // Find two-connection routes
  if (maxConnections >= 2) {
    const fromRoutes = MOCK_ROUTES.filter(route => route.from.id === fromId);
    
    fromRoutes.forEach(firstSegment => {
      const middleRoutes = MOCK_ROUTES.filter(route => 
        route.from.id === firstSegment.to.id && route.to.id !== toId
      );
      
      middleRoutes.forEach(secondSegment => {
        const finalSegments = MOCK_ROUTES.filter(route => 
          route.from.id === secondSegment.to.id && route.to.id === toId
        );
        
        finalSegments.forEach(thirdSegment => {
          // Check both connections are feasible
          const firstArrival = parseTime(firstSegment.arrival);
          const secondDeparture = parseTime(secondSegment.departure);
          const secondArrival = parseTime(secondSegment.arrival);
          const thirdDeparture = parseTime(thirdSegment.departure);
          
          let transfer1 = secondDeparture - firstArrival;
          if (transfer1 < 0) transfer1 += 24 * 60;
          
          let transfer2 = thirdDeparture - secondArrival;
          if (transfer2 < 0) transfer2 += 24 * 60;
          
          if (transfer1 >= 30 && transfer1 <= 8 * 60 && transfer2 >= 30 && transfer2 <= 8 * 60) {
            journeys.push({
              id: `2conn-${firstSegment.id}-${secondSegment.id}-${thirdSegment.id}`,
              segments: [firstSegment, secondSegment, thirdSegment],
              totalDuration: firstSegment.duration + secondSegment.duration + thirdSegment.duration + transfer1 + transfer2,
              totalPrice: firstSegment.price + secondSegment.price + thirdSegment.price,
              connectionCount: 2
            });
          }
        });
      });
    });
  }
  
  // Sort by total duration, then by connection count
  return journeys.sort((a, b) => {
    if (a.totalDuration !== b.totalDuration) {
      return a.totalDuration - b.totalDuration;
    }
    return a.connectionCount - b.connectionCount;
  }).slice(0, 10); // Limit to top 10 results
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
  // First try direct routes from API
  const journeys: Journey[] = [];
  
  if (fromStation.tcddId && toStation.tcddId) {
    try {
      // Format date for API (DD-MM-YYYY format as required by TCDD API)
      let dateString = '';
      if (departureDate) {
        const day = departureDate.getDate().toString().padStart(2, '0');
        const month = (departureDate.getMonth() + 1).toString().padStart(2, '0');
        const year = departureDate.getFullYear();
        dateString = `${day}-${month}-${year}`;
      } else {
        // Use tomorrow if no date provided (TCDD doesn't allow same-day booking typically)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const day = tomorrow.getDate().toString().padStart(2, '0');
        const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
        const year = tomorrow.getFullYear();
        dateString = `${day}-${month}-${year}`;
      }
      
      console.log(`Searching TCDD API: ${fromStation.name} -> ${toStation.name} on ${dateString}`);
      
      const apiResponse = await TCDDApiService.searchTrainAvailability(
        fromStation.tcddId,
        toStation.tcddId,
        dateString
      );
      
      if (apiResponse.success && apiResponse.data.length > 0) {
        // Convert API response to our Journey format
        apiResponse.data.forEach(train => {
          const segment: RouteSegment = {
            id: `api-${train.trainNumber}`,
            from: fromStation,
            to: toStation,
            departure: train.departureTime,
            arrival: train.arrivalTime,
            duration: train.duration,
            trainNumber: train.trainNumber,
            price: train.price
          };
          
          journeys.push({
            id: `api-direct-${train.trainNumber}`,
            segments: [segment],
            totalDuration: train.duration,
            totalPrice: train.price,
            connectionCount: 0
          });
        });
        
        console.log(`Found ${journeys.length} direct routes from API`);
      } else {
        console.log('No direct routes found from API, message:', apiResponse.message);
      }
    } catch (error) {
      console.warn('API search failed, falling back to mock data:', error);
      throw error; // Re-throw to trigger fallback in calling code
    }
  } else {
    console.log('Stations do not have TCDD IDs, using mock data');
    throw new Error('Stations do not have TCDD API IDs');
  }
  
  // Try to find connected routes if no direct routes found
  if (journeys.length === 0) {
    console.log('No direct routes found, searching for connected routes...');
    const connectedJourneys = await findConnectedRoutesWithAPI(fromStation, toStation, departureDate);
    journeys.push(...connectedJourneys);
  }
  
  return journeys.sort((a, b) => {
    if (a.totalDuration !== b.totalDuration) {
      return a.totalDuration - b.totalDuration;
    }
    return a.connectionCount - b.connectionCount;
  }).slice(0, 10);
}

async function findConnectedRoutesWithAPI(
  fromStation: Station, 
  toStation: Station, 
  departureDate: Date
): Promise<Journey[]> {
  const journeys: Journey[] = [];
  const dateStr = `${departureDate.getDate().toString().padStart(2, '0')}-${(departureDate.getMonth() + 1).toString().padStart(2, '0')}-${departureDate.getFullYear()}`;
  
  // Get real stations from API
  const allStations = await TCDDApiService.getAllStations();
  
  // Convert TCDD stations to our Station format for major hubs
  const majorHubTcddIds = [98, 87, 180, 160, 82]; // Ankara, Eskişehir, İzmir, Adana, Kocaeli
  const majorHubs = allStations
    .filter(tcddStation => 
      majorHubTcddIds.includes(tcddStation.id) &&
      tcddStation.id !== fromStation.tcddId && 
      tcddStation.id !== toStation.tcddId
    )
    .map(tcddStation => ({
      id: `tcdd-${tcddStation.id}`,
      name: tcddStation.name,
      city: tcddStation.cityName || tcddStation.name,
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
        firstLegResponse.data.forEach((firstTrain, i) => {
          secondLegResponse.data.forEach((secondTrain, j) => {
            // Parse times to check if connection is feasible
            const firstArrival = parseTimeToMinutes(firstTrain.arrivalTime);
            const secondDeparture = parseTimeToMinutes(secondTrain.departureTime);
            
            // Allow at least 30 minutes for connection
            const connectionTime = secondDeparture - firstArrival;
            if (connectionTime >= 30 && connectionTime <= 360) { // Max 6 hours wait
              const firstSegment: RouteSegment = {
                id: `segment-${hub.id}-${i}-1`,
                from: fromStation,
                to: hub,
                departure: firstTrain.departureTime,
                arrival: firstTrain.arrivalTime,
                duration: firstTrain.duration,
                trainNumber: firstTrain.trainNumber,
                price: firstTrain.price
              };
              
              const secondSegment: RouteSegment = {
                id: `segment-${hub.id}-${j}-2`,
                from: hub,
                to: toStation,
                departure: secondTrain.departureTime,
                arrival: secondTrain.arrivalTime,
                duration: secondTrain.duration,
                trainNumber: secondTrain.trainNumber,
                price: secondTrain.price
              };
              
              const totalDuration = secondSegment.duration + firstSegment.duration + connectionTime;
              
              journeys.push({
                id: `journey-${hub.id}-${i}-${j}`,
                segments: [firstSegment, secondSegment],
                totalDuration,
                totalPrice: firstTrain.price + secondTrain.price,
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