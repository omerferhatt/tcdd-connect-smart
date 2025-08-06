export interface Station {
  id: string;
  name: string;
  city: string;
  region: string;
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
  { id: 'ist', name: 'İstanbul (Pendik)', city: 'İstanbul', region: 'Marmara' },
  { id: 'ank', name: 'Ankara', city: 'Ankara', region: 'İç Anadolu' },
  { id: 'koc', name: 'Kocaeli (İzmit)', city: 'Kocaeli', region: 'Marmara' },
  { id: 'esk', name: 'Eskişehir', city: 'Eskişehir', region: 'İç Anadolu' },
  { id: 'kon', name: 'Konya', city: 'Konya', region: 'İç Anadolu' },
  { id: 'izm', name: 'İzmir (Basmane)', city: 'İzmir', region: 'Ege' },
  { id: 'ada', name: 'Adana', city: 'Adana', region: 'Akdeniz' },
  { id: 'mer', name: 'Mersin', city: 'Mersin', region: 'Akdeniz' },
  { id: 'kay', name: 'Kayseri', city: 'Kayseri', region: 'İç Anadolu' },
  { id: 'siv', name: 'Sivas', city: 'Sivas', region: 'İç Anadolu' },
  { id: 'sam', name: 'Samsun', city: 'Samsun', region: 'Karadeniz' },
  { id: 'mal', name: 'Malatya', city: 'Malatya', region: 'Doğu Anadolu' },
  { id: 'kar', name: 'Kars', city: 'Kars', region: 'Doğu Anadolu' },
  { id: 'erz', name: 'Erzurum', city: 'Erzurum', region: 'Doğu Anadolu' },
  { id: 'eli', name: 'Elazığ', city: 'Elazığ', region: 'Doğu Anadolu' },
  { id: 'div', name: 'Divriği', city: 'Sivas', region: 'İç Anadolu' },
  { id: 'afy', name: 'Afyonkarahisar', city: 'Afyonkarahisar', region: 'Ege' },
  { id: 'den', name: 'Denizli', city: 'Denizli', region: 'Ege' },
  { id: 'bal', name: 'Balıkesir', city: 'Balıkesir', region: 'Marmara' },
  { id: 'ban', name: 'Bandırma', city: 'Balıkesir', region: 'Marmara' },
  { id: 'zon', name: 'Zonguldak', city: 'Zonguldak', region: 'Karadeniz' },
  { id: 'kas', name: 'Kastamonu', city: 'Kastamonu', region: 'Karadeniz' },
  { id: 'cank', name: 'Çankırı', city: 'Çankırı', region: 'İç Anadolu' },
  { id: 'ama', name: 'Amasya', city: 'Amasya', region: 'Karadeniz' },
  { id: 'tok', name: 'Tokat', city: 'Tokat', region: 'Karadeniz' }
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