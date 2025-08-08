// TCDD API integration service

// TCDD (Turkish State Railways) API Response Types
// Generated from actual JSON data structures

// ============================================================================
// SHARED/COMMON INTERFACES
// ============================================================================

export interface StationStatus {
  id: number;
  name: string | null;
  detail: string | null;
}

export interface StationType {
  id: number;
  name: string | null;
  detail: string | null;
}

export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface District {
  id: number;
  name: string;
  countryId?: number;
  // Additional fields can be added if needed
}

export interface CarAvailability {
  trainCarId: number;
  trainCarName: string | null;
  cabinClass: CabinClass;
  availability: number;
  pricingList: PricingItem[];
  additionalServices: unknown[];
}

export interface TrainCar {
  id: number;
  name: string;
  trainId: number;
  templateId: number;
  carIndex: number;
  unlabeled: boolean;
  capacity: number;
  cabinClassId: number;
  availabilities: CarAvailability[];
}

export interface TrainSegment {
  departureStationId?: number;
  arrivalStationId?: number;
  departureTime?: string;
  arrivalTime: string;
}

export interface BookingClassAvailability {
  bookingClass: BookingClass;
  price: number;
  currency: string;
  availability: number;
}

export interface CabinClassInfo {
  cabinClass: CabinClass;
  availabilityCount: number;
  minPrice: number | null;
  minPriceCurrency: string | null;
  bookingClassAvailabilities: BookingClassAvailability[];
}

export interface AvailableFareInfo {
  fareFamily: FareFamily;
  cabinClasses: CabinClassInfo[];
}

export interface CabinClassAvailability {
  cabinClass: CabinClass;
  availabilityCount: number;
}

export interface Train {
  id: number;
  number: string;
  name: string;
  commercialName: string;
  type: string;
  line: string | null;
  reversed: boolean;
  scheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  minPrice: Price;
  reservationLockTime: number;
  reservable: boolean;
  bookingClassCapacities: BookingClassCapacity[];
  segments: TrainSegmentDetail[];
  cars: TrainCar[];
  trainSegments: TrainSegment[];
  totalDistance: number;
  availableFareInfo: AvailableFareInfo[];
  cabinClassAvailabilities: CabinClassAvailability[];
  trainDate: number;
  trainNumber: string;
  skipsDay: boolean;
}

export interface TrainAvailability {
  trains: Train[];
  totalTripTime: number;
  minPrice: number;
  connection: boolean;
  dayChanged: boolean;
}

export interface TrainLeg {
  trainAvailabilities: TrainAvailability[];
  resultCount: number;
}

export interface TCDDTrainAvailabilityResponse {
  trainLegs: TrainLeg[];
  legCount: number;
  roundTripDiscount: number;
  maxRegionalTrainsRoundTripDays: number;
}

// ============================================================================
// STATION PAIRS API INTERFACES (station-pairs.json)
// ============================================================================

export interface StationPair {
  id: number;
  unitId: number;
  areaCode: number;
  name: string;
  stationCode: string;
  stationStatus: StationStatus;
  stationType: StationType;
  district: District | null;
  passengerDrop: boolean;
  ticketSaleActive: boolean;
  longitude: number;
  latitude: number;
  altitude: number;
  international: boolean;
  domestic: boolean;
  pairs: number[];
  salesChannels: unknown[] | null;
  stationTrainTypes: string[];
  IATACode: string | null;
}

// The station pairs API response type
export type TCDDStationPairsResponse = StationPair[];

// ============================================================================
// LEGACY INTERFACES FOR BACKWARD COMPATIBILITY
// ============================================================================

export interface TCDDRoute {
  departureStationId: number;
  departureStationName: string;
  arrivalStationId: number;
  arrivalStationName: string;
  departureDate: string;
}

export interface TCDDPassengerType {
  id: number;
  count: number;
}

export interface TCDDSearchRequest {
  searchRoutes: TCDDRoute[];
  passengerTypeCounts: TCDDPassengerType[];
  searchReservation: boolean;
  searchType: 'DOMESTIC' | 'INTERNATIONAL';
}

// Legacy response types - mapped to new interfaces
export type TrainAvailabilityData = TCDDTrainAvailabilityResponse;

// Legacy aliases for backward compatibility  
export type TCDDBookingClass = BookingClassCapacity;
export type TCDDSegment = TrainSegmentDetail;
export type TCDDTrain = Train;
export type TCDDTrainAvailability = TrainAvailability;
export type TCDDTrainLeg = TrainLeg;
export type TCDDStation = Station;
export type TCDDStationPair = StationPair;

export interface TCDDApiResponse {
  success: boolean;
  data: any[];
  message?: string;
}

export interface TCDDSearchResponse extends TCDDTrainAvailabilityResponse {
  totalTripTime: number; // This is in milliseconds
  minPrice: number;
  connection: boolean;
  dayChanged: boolean;
}

// Items data from items.json API
export interface TCDDItem {
  id: number;
  itemType: {
    id: number;
    name: string;
    image: string;
    order: number;
  };
  name: string;
  image: string;
  saleable: boolean;
  colSize: number;
  rowSize: number;
  order: number;
  cabinClassId: number;
  maleImage: string;
  femaleImage: string;
  selectedImage: string;
  itemProperties: Array<{
    id: number;
    name: string;
    characteristic: boolean;
  }>;
  active: boolean;
}

export interface TCDDItemsResponse {
  items: TCDDItem[];
  lastUpdateTime: string; // "YYYY-MM-DD HH:mm:ss"
  updated: boolean;
}

// Cached stations and pairs
let cachedStations: Station[] | null = null;
let cachedStationPairs: StationPair[] | null = null;
let cachedItems: TCDDItem[] | null = null;

// Known TCDD stations with their API IDs - Simplified fallback structure
const createFallbackStation = (id: number, name: string): Station => ({
  id,
  name,
  stationNumber: '',
  areaCode: 0,
  stationStatus: { id: 1, name: null, detail: null },
  stationType: { id: 1, name: null, detail: null },
  unitId: 0,
  cityId: 0,
  districtId: 0,
  neighbourhoodId: 0,
  uicCode: null,
  technicalUnit: '',
  stationChefId: 0,
  detail: null,
  showOnQuery: true,
  passengerDrop: true,
  ticketSaleActive: true,
  active: true,
  email: '',
  orangeDeskEmail: null,
  address: '',
  longitude: 0,
  latitude: 0,
  altitude: 0,
  startKm: 0,
  endKm: 0,
  showOnMap: false,
  passengerAdmission: false,
  disabledAccessibility: false,
  phones: null,
  workingDays: null,
  hardwares: null,
  physicalProperties: null,
  stationPlatforms: null,
  salesChannels: [],
  IATACode: null
});

export const TCDD_STATIONS: Station[] = [
  createFallbackStation(98, 'ANKARA GAR'),
  createFallbackStation(1325, 'İSTANBUL(SÖĞÜTLÜÇEŞME)'),
  createFallbackStation(48, 'İSTANBUL(PENDİK)'),
  createFallbackStation(1323, 'İSTANBUL(BOSTANCI)'),
  createFallbackStation(1322, 'İSTANBUL(HALKALB)'),
  createFallbackStation(1327, 'İSTANBUL(YEDİKULE)'),
  createFallbackStation(1328, 'İSTANBUL(SİRKECİ)'),
  createFallbackStation(20, 'GEBZE'),
  createFallbackStation(1135, 'İZMİT YHT'),
  createFallbackStation(5, 'ARİFİYE'),
  createFallbackStation(87, 'ESKİŞEHİR'),
  createFallbackStation(103, 'KONYA'),
  createFallbackStation(89, 'AFYONKARAHİSAR'),
  createFallbackStation(92, 'KÜTAHYA'),
  createFallbackStation(100, 'KARAMAN'),
  createFallbackStation(753, 'ADANA'),
  createFallbackStation(170, 'MERSİN'),
  createFallbackStation(130, 'KAYSERİ'),
  createFallbackStation(140, 'SİVAS'),
  createFallbackStation(150, 'ERZURUM'),
  createFallbackStation(151, 'KARS'),
  createFallbackStation(148, 'ELAZIĞ'),
  createFallbackStation(147, 'MALATYA'),
  createFallbackStation(180, 'İZMİR BASMANE'),
  createFallbackStation(181, 'İZMİR ALSANCAK'),
  createFallbackStation(185, 'DENİZLİ'),
  createFallbackStation(77, 'BALIKESİR'),
  createFallbackStation(79, 'BANDIRMA'),
  createFallbackStation(200, 'ZONGULDAK'),
  createFallbackStation(120, 'SAMSUN'),
  createFallbackStation(125, 'AMASYA'),
  createFallbackStation(145, 'TOKAT'),
  createFallbackStation(95, 'ÇANKIRI'),
  createFallbackStation(677, 'GÖLCÜK')
];

class TCDDApiService {
  private static readonly BASE_URL = 'https://web-api-prod-ytp.tcddtasimacilik.gov.tr/tms';
  private static readonly CDN_URL = 'https://cdn-api-prod-ytp.tcddtasimacilik.gov.tr/datas';
  private static readonly UNIT_ID = '3895';
  
  // Developer auth token (always valid, no need to reauthorize as per user request)
  private static authToken: string | null = '***REMOVED***';
  
  // Settings
  public static showSoldOutTrains: boolean = true; // Show all trains including sold out ones
  public static enableSameTrainConnections: boolean = true; // Enable same-train seat changes

  static async getAuthToken(): Promise<string> {
    // Return the developer token that's always valid
    if (!this.authToken) {
      throw new Error('Authentication token not configured');
    }
    return this.authToken;
  }

  static setAuthToken(token: string) {
    this.authToken = token;
  }

  // Fetch all stations from TCDD API
  static async fetchStations(): Promise<Station[]> {
    try {
      if (cachedStations) {
        return cachedStations;
      }

      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.CDN_URL}/stations.json?environment=dev&userId=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'tr',
          'Authorization': token,
          'sec-ch-ua-platform': '"Windows"',
          'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          'sec-ch-ua-mobile': '?0',
          'unit-id': this.UNIT_ID,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed when fetching stations');
        }
        throw new Error(`Failed to fetch stations: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the real API response to match our interface
      if (Array.isArray(data)) {
        cachedStations = data
          .filter((station: any) => 
            station.id && 
            station.name && 
            station.showOnQuery === true && 
            station.active === true &&
            station.passengerDrop === true
          )
          .map((station: any) => ({
            id: station.id,
            stationNumber: station.stationNumber || '',
            areaCode: station.areaCode || 0,
            name: station.name,
            stationStatus: station.stationStatus || { id: 0, name: null, detail: null },
            stationType: station.stationType || { id: 0, name: null, detail: null },
            unitId: station.unitId || 0,
            cityId: station.cityId || 0,
            districtId: station.districtId || 0,
            neighbourhoodId: station.neighbourhoodId || 0,
            uicCode: station.uicCode,
            technicalUnit: station.technicalUnit || '',
            stationChefId: station.stationChefId || 0,
            detail: station.detail,
            showOnQuery: station.showOnQuery || false,
            passengerDrop: station.passengerDrop || false,
            ticketSaleActive: station.ticketSaleActive || false,
            active: station.active || false,
            email: station.email || '',
            orangeDeskEmail: station.orangeDeskEmail,
            address: station.address || '',
            longitude: station.longitude || 0,
            latitude: station.latitude || 0,
            altitude: station.altitude || 0,
            startKm: station.startKm || 0,
            endKm: station.endKm || 0,
            showOnMap: station.showOnMap || false,
            passengerAdmission: station.passengerAdmission || false,
            disabledAccessibility: station.disabledAccessibility || false,
            phones: station.phones || null,
            workingDays: station.workingDays || null,
            hardwares: station.hardwares || null,
            physicalProperties: station.physicalProperties || null,
            stationPlatforms: station.stationPlatforms || null,
            salesChannels: station.salesChannels || [],
            IATACode: station.IATACode
          }));
      } else {
        throw new Error('Unexpected stations API response format');
      }
      
      console.log(`Fetched ${cachedStations.length} active stations from TCDD API`);
      return cachedStations;
      
    } catch (error) {
      console.error('Error fetching stations from TCDD API:', error);
      // Fallback to hardcoded stations
      return TCDD_STATIONS;
    }
  }

  // Fetch station pairs (which routes are available)
  static async fetchStationPairs(): Promise<StationPair[]> {
    try {
      if (cachedStationPairs) {
        return cachedStationPairs;
      }

      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.CDN_URL}/station-pairs-INTERNET.json?environment=dev&userId=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'tr',
          'Authorization': token,
          'sec-ch-ua-platform': '"Windows"',
          'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          'sec-ch-ua-mobile': '?0',
          'unit-id': this.UNIT_ID,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed when fetching station pairs');
        }
        throw new Error(`Failed to fetch station pairs: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the real API response 
      if (Array.isArray(data)) {
        cachedStationPairs = data
          .filter((station: any) => 
            station.id && 
            station.name && 
            station.pairs && 
            Array.isArray(station.pairs) &&
            station.domestic === true
          )
          .map((station: any) => ({
            id: station.id,
            unitId: station.unitId || 0,
            areaCode: station.areaCode || 0,
            name: station.name,
            stationCode: station.stationCode || '',
            stationStatus: station.stationStatus || { id: 0, name: null, detail: null },
            stationType: station.stationType || { id: 0, name: null, detail: null },
            district: station.district,
            passengerDrop: station.passengerDrop || false,
            ticketSaleActive: station.ticketSaleActive || false,
            longitude: station.longitude || 0,
            latitude: station.latitude || 0,
            altitude: station.altitude || 0,
            international: station.international || false,
            domestic: station.domestic || false,
            pairs: station.pairs || [],
            salesChannels: station.salesChannels || null,
            stationTrainTypes: station.stationTrainTypes || [],
            IATACode: station.IATACode
          }));
      } else {
        throw new Error('Unexpected station pairs API response format');
      }
      
      console.log(`Fetched ${cachedStationPairs.length} station pairs from TCDD API`);
      return cachedStationPairs;
      
    } catch (error) {
      console.error('Error fetching station pairs from TCDD API:', error);
      return [];
    }
  }

  // Fetch items from TCDD API (cabin class information)
  static async fetchItems(): Promise<TCDDItem[]> {
    try {
      if (cachedItems) {
        return cachedItems;
      }

      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.CDN_URL}/items.json?environment=dev&userId=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'tr',
          'Authorization': token,
          'sec-ch-ua-platform': '"Windows"',
          'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          'sec-ch-ua-mobile': '?0',
          'unit-id': this.UNIT_ID,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed when fetching items');
        }
        throw new Error(`Failed to fetch items: HTTP ${response.status}`);
      }

      const data: TCDDItemsResponse = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        cachedItems = data.items.filter(item => item.active === true);
      } else {
        throw new Error('Unexpected items API response format');
      }
      
      console.log(`Fetched ${cachedItems.length} active items from TCDD API`);
      return cachedItems;
      
    } catch (error) {
      console.error('Error fetching items from TCDD API:', error);
      return [];
    }
  }
  static async hasDirectRoute(fromStationId: number, toStationId: number): Promise<boolean> {
    try {
      const pairs = await this.fetchStationPairs();
      const fromStation = pairs.find(p => p.id === fromStationId);
      return fromStation ? fromStation.pairs.includes(toStationId) : false;
    } catch (error) {
      console.error('Error checking direct route:', error);
      return false;
    }
  }

  static async searchTrainAvailability(
    fromStationId: number,
    toStationId: number,
    departureDate: string = new Date().toISOString().split('T')[0]
  ): Promise<TCDDApiResponse> {
    try {
      const token = await this.getAuthToken();
      
      // Get station names from the cached stations or fallback list
      const stations = await this.fetchStations();
      const fromStation = stations.find(s => s.id === fromStationId) || TCDD_STATIONS.find(s => s.id === fromStationId);
      const toStation = stations.find(s => s.id === toStationId) || TCDD_STATIONS.find(s => s.id === toStationId);
      
      if (!fromStation || !toStation) {
        throw new Error('Invalid station IDs');
      }

      // Format date correctly for TCDD API (DD-MM-YYYY HH:mm:ss)
      const [year, month, day] = departureDate.split('-');
      const formattedDate = `${day}-${month}-${year} 00:00:00`;

      const requestBody: TCDDSearchRequest = {
        searchRoutes: [{
          departureStationId: fromStationId,
          departureStationName: fromStation.name,
          arrivalStationId: toStationId,
          arrivalStationName: toStation.name,
          departureDate: formattedDate
        }],
        passengerTypeCounts: [{
          id: 0, // Adult passenger type
          count: 1
        }],
        searchReservation: false,
        searchType: 'DOMESTIC'
      };

      console.log('TCDD API Request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.BASE_URL}/train/train-availability?environment=dev&userId=1`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'tr',
          'Authorization': token,
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
          'Origin': 'https://ebilet.tcddtasimacilik.gov.tr',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'unit-id': this.UNIT_ID
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your token.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TCDDTrainAvailabilityResponse = await response.json();
      console.log('TCDD API Response:', JSON.stringify(data, null, 2));
      
      // Debug: Log the number of trains found in the response
      const totalTrains = data.trainLegs?.reduce((count, leg) => {
        return count + (leg.trainAvailabilities?.reduce((trainCount, avail) => {
          return trainCount + (avail.trains?.length || 0);
        }, 0) || 0);
      }, 0) || 0;
      console.log(`Raw API response contains ${totalTrains} trains`);
      
      return {
        success: true,
        data: this.transformApiResponse(data),
        message: 'Success'
      };

    } catch (error) {
      console.error('TCDD API Error:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private static transformApiResponse(apiData: TCDDTrainAvailabilityResponse): any[] {
    // Handle the real TCDD API response structure
    if (!apiData || !apiData.trainLegs || !Array.isArray(apiData.trainLegs)) {
      console.warn('No train legs found in API response');
      return [];
    }
    
    const trains: any[] = [];
    let totalProcessed = 0;
    let totalFiltered = 0;
    
    console.log(`🔍 Processing ${apiData.trainLegs.length} train legs from API response`);
    
    for (const trainLeg of apiData.trainLegs) {
      if (!trainLeg.trainAvailabilities || !Array.isArray(trainLeg.trainAvailabilities)) {
        continue;
      }
      
      for (const availability of trainLeg.trainAvailabilities) {
        if (!availability.trains || !Array.isArray(availability.trains)) {
          continue;
        }
        
        for (const train of availability.trains) {
          totalProcessed++;
          console.log(`📋 Processing train ${train.number || 'Unknown'} (${totalProcessed})`);
          
          // Calculate total journey time from segments
          let totalDuration = 0;
          let totalDistance = 0;
          let departureTime = '';
          let arrivalTime = '';
          let departureTimestamp = 0;
          
          if (train.segments && train.segments.length > 0) {
            // Get departure time from first segment
            const firstSegment = train.segments[0];
            const lastSegment = train.segments[train.segments.length - 1];
            
            // Handle date calculations properly to avoid negative hours
            const departureDate = new Date(firstSegment.departureTime);
            const arrivalDate = new Date(lastSegment.arrivalTime);
            
            departureTimestamp = departureDate.getTime();
            
            // Format times properly - show only time, not date
            departureTime = departureDate.toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            });
            
            arrivalTime = arrivalDate.toLocaleTimeString('tr-TR', {
              hour: '2-digit', 
              minute: '2-digit'
            });
            
            // If arrival is next day, add +1 indicator
            if (arrivalDate.getDate() !== departureDate.getDate()) {
              arrivalTime += ' +1';
            }
            
            // Calculate total duration in minutes correctly
            const totalTimeMs = arrivalDate.getTime() - departureDate.getTime();
            totalDuration = Math.round(totalTimeMs / (1000 * 60)); // Convert to minutes
            
            // Sum up distance from all segments
            totalDistance = train.segments.reduce((sum, segment) => sum + segment.distance, 0);
          }
          
          // Get available seats and pricing from the most accurate sources
          let availableSeats = 0;
          let bestPrice = 0;
          const seatCategories: any[] = [];
          
          // Try to get best pricing from train.availableFareInfo (most accurate pricing)
          if (train.availableFareInfo && train.availableFareInfo.length > 0) {
            // Find minimum price across all fare classes
            const allPrices: number[] = [];
            
            for (const fareInfo of train.availableFareInfo) {
              if (fareInfo.cabinClasses && fareInfo.cabinClasses.length > 0) {
                for (const cabinClass of fareInfo.cabinClasses) {
                  if (cabinClass.minPrice && cabinClass.minPrice > 0) {
                    allPrices.push(cabinClass.minPrice);
                  }
                  // Also get availability count (ACTUAL available seats)
                  availableSeats += cabinClass.availabilityCount || 0;
                  
                  // Extract seat category information
                  if (cabinClass.availabilityCount > 0) {
                    seatCategories.push({
                      categoryId: cabinClass.cabinClass.id,
                      categoryName: cabinClass.cabinClass.name || 'Unknown',
                      categoryCode: cabinClass.cabinClass.code || 'UNK',
                      availableSeats: cabinClass.availabilityCount || 0,
                      price: cabinClass.minPrice || 0,
                      currency: cabinClass.minPriceCurrency || 'TRY'
                    });
                  }
                }
              }
            }
            
            if (allPrices.length > 0) {
              bestPrice = Math.min(...allPrices);
            }
          }
          
          // Fallback pricing from train.minPrice if no fare info available
          if (bestPrice === 0 && train.minPrice?.priceAmount) {
            bestPrice = train.minPrice.priceAmount;
          }
          
          // If still no available seats from fare info, try other sources (prioritize availability over capacity)
          if (availableSeats === 0) {
            // Try to get seats from train.cars (available seats per car)
            if (train.cars && train.cars.length > 0) {
              for (const car of train.cars) {
                if (car.availabilities && car.availabilities.length > 0) {
                  for (const carAvail of car.availabilities) {
                    availableSeats += carAvail.availability || 0;
                    
                    // Extract seat categories from car availabilities if not already collected
                    if (seatCategories.length === 0 && carAvail.availability > 0) {
                      seatCategories.push({
                        categoryId: carAvail.cabinClass.id,
                        categoryName: carAvail.cabinClass.name || 'Unknown',
                        categoryCode: carAvail.cabinClass.code || 'UNK',
                        availableSeats: carAvail.availability || 0,
                        price: carAvail.pricingList?.[0]?.basePrice?.priceAmount || 0,
                        currency: carAvail.pricingList?.[0]?.basePrice?.priceCurrency || 'TRY'
                      });
                    }
                  }
                }
              }
            }
            // Fallback to train's cabinClassAvailabilities (available seats per cabin class)
            else if (train.cabinClassAvailabilities && train.cabinClassAvailabilities.length > 0) {
              train.cabinClassAvailabilities.forEach(cabinAvail => {
                availableSeats += cabinAvail.availabilityCount;
                
                // Extract seat categories from cabin class availabilities if not already collected
                if (seatCategories.length === 0 && cabinAvail.availabilityCount > 0) {
                  seatCategories.push({
                    categoryId: cabinAvail.cabinClass.id,
                    categoryName: cabinAvail.cabinClass.name || 'Unknown',
                    categoryCode: cabinAvail.cabinClass.code || 'UNK',
                    availableSeats: cabinAvail.availabilityCount || 0,
                    price: bestPrice, // Use the best price found
                    currency: train.minPrice?.priceCurrency || 'TRY'
                  });
                }
              });
            }
            // AVOID using bookingClassCapacities as it shows total capacity, not available seats
            // Only use it if absolutely no other data is available and mark it clearly
            else if (train.bookingClassCapacities && train.bookingClassCapacities.length > 0) {
              console.warn(`Using total capacity for train ${train.number} - actual availability unknown`);
              // Don't use capacity data as it's misleading - better to show 0 or unknown
              availableSeats = 0; // Changed from showing capacity to showing 0
            }
          }
          
          // Filter out trains with no available seats or no price information
          // Skip trains that have neither available seats nor price (completely unavailable)
          // TEMPORARY: Be more lenient with filtering to debug the issue
          if (availableSeats === 0 && bestPrice === 0 && !train.name && !train.number) {
            totalFiltered++;
            console.warn(`❌ Skipping train - completely empty record`);
            continue;
          }
          
          // Show trains that have price but zero available seats (sold out) if user wants to see them
          // This allows users to see the full schedule even if seats are sold out
          if (availableSeats === 0 && bestPrice > 0 && !TCDDApiService.showSoldOutTrains) {
            totalFiltered++;
            console.warn(`❌ Skipping train ${train.number} - sold out (0 available seats). Enable 'Show Sold Out Trains' to see it.`);
            continue;
          }
          
          // Create preliminary train data for economy seat checking
          const preliminaryTrainData = { seatCategories, availableSeats, trainNumber: train.number };
          
          // Additional filtering for economy seats in connected searches
          const economySeats = TCDDApiService.getEconomySeats(preliminaryTrainData);
          if (economySeats === 0 && !TCDDApiService.showSoldOutTrains) {
            totalFiltered++;
            console.warn(`❌ Skipping train ${train.number} - no economy seats available. Enable 'Show Sold Out Trains' to see it.`);
            continue;
          }
          
          // DEBUG: Log every train that passes filtering
          console.log(`✅ Including train ${train.number || 'Unknown'}: ${availableSeats} seats (${economySeats} economy), ${bestPrice} TRY, departing ${departureTime}`);
          if (seatCategories.length > 0) {
            console.log(`🪑 Seat categories for ${train.number}:`, seatCategories.map(cat => `${cat.categoryName}(${cat.categoryCode}): ${cat.availableSeats} seats @ ${cat.price}${cat.currency}`).join(', '));
          }
          if (train.trainSegments && train.trainSegments.length > 0) {
            console.log(`🛤️ Train ${train.number} has ${train.trainSegments.length} trainSegments:`, train.trainSegments.map(ts => `${ts.departureStationId} → ${ts.arrivalStationId}`).join(', '));
          } else {
            console.log(`⚠️ Train ${train.number} has no trainSegments in raw data`);
          }
          
          const trainData = {
            trainNumber: train.number || 'Unknown',
            trainName: train.name || train.commercialName || 'Unknown',
            trainType: train.type || 'Unknown',
            departureTime,
            arrivalTime,
            departureTimestamp, // For sorting
            duration: totalDuration, // in minutes
            distance: Math.round(totalDistance * 100) / 100, // round to 2 decimal places
            price: bestPrice,
            currency: train.minPrice?.priceCurrency || 'TRY',
            availableSeats,
            seatCategories, // Include detailed seat categories
            reservable: train.reservable || false,
            segments: train.segments?.map(segment => {
              const segmentDepartureDate = new Date(segment.departureTime);
              const segmentArrivalDate = new Date(segment.arrivalTime);
              
              return {
                departureStation: segment.segment.departureStation.name,
                arrivalStation: segment.segment.arrivalStation.name,
                departureTime: segmentDepartureDate.toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                arrivalTime: segmentArrivalDate.toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) + (segmentArrivalDate.getDate() !== segmentDepartureDate.getDate() ? ' +1' : ''),
                duration: segment.duration,
                distance: segment.distance,
                stops: segment.stops
              };
            }) || [],
            trainSegments: train.trainSegments || [] // Preserve the trainSegments data for intermediate stations
          };
          
          console.log(`Train ${trainData.trainNumber}: ${trainData.availableSeats} seats, ${trainData.price} TRY`);
          trains.push(trainData);
        }
      }
    }

    // Sort trains by departure time
    trains.sort((a, b) => a.departureTimestamp - b.departureTimestamp);

    console.log(`📊 SUMMARY: Processed ${totalProcessed} trains, filtered out ${totalFiltered}, returning ${trains.length} trains`);
    return trains;
  }

  static async findStationByName(name: string): Promise<Station | undefined> {
    try {
      const stations = await this.fetchStations();
      const normalizedName = name.toLowerCase().trim();
      return stations.find(station => 
        station.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(station.name.toLowerCase())
      );
    } catch (error) {
      console.error('Error finding station by name:', error);
      // Fallback to hardcoded stations
      const normalizedName = name.toLowerCase().trim();
      return TCDD_STATIONS.find(station => 
        station.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(station.name.toLowerCase())
      );
    }
  }

  static async findStationsByQuery(query: string): Promise<Station[]> {
    if (!query.trim()) return [];
    
    try {
      const stations = await this.fetchStations();
      const normalizedQuery = query.toLowerCase().trim();
      return stations
        .filter(station =>
          station.name.toLowerCase().includes(normalizedQuery)
        )
        .slice(0, 10);
    } catch (error) {
      console.error('Error finding stations by query:', error);
      // Fallback to hardcoded stations
      const normalizedQuery = query.toLowerCase().trim();
      return TCDD_STATIONS.filter(station =>
        station.name.toLowerCase().includes(normalizedQuery)
      ).slice(0, 10);
    }
  }

  // Find same-train connections (A to C via B on the same train, just changing seats/tickets)
  static async findSameTrainConnections(
    fromStationId: number,
    toStationId: number,
    departureDate: string = new Date().toISOString().split('T')[0],
    options?: {
      signal?: AbortSignal;
      onIntermediateStation?: (stationId: number, stationName: string) => void; // progress
      onConnectionFound?: (route: any) => void; // emit route incrementally
    }
  ): Promise<any[]> {
    if (!this.enableSameTrainConnections) {
      return [];
    }

    const originName = await this.getStationName(fromStationId);
    const destinationName = await this.getStationName(toStationId);
    console.log(`🚂 Searching for same-train connections from ${originName} (${fromStationId}) to ${destinationName} (${toStationId}) using trainSegments`);
    
    try {
      // First, get all direct trains from origin to find trains that pass through intermediate stations
      const directResponse = await this.searchTrainAvailability(
        fromStationId,
        toStationId,
        departureDate
      );

      if (!directResponse.success || directResponse.data.length === 0) {
        console.log(`❌ No direct trains found from ${fromStationId} to ${toStationId}`);
        return [];
      }

      const sameTrainRoutes: any[] = [];

      // 1. Filter direct trains to those with economy seats and segment data
      const directTrains = directResponse.data.filter(t => {
        const ok = !!t.trainSegments && t.trainSegments.length > 0 && this.getEconomySeats(t) > 0;
        if (!ok) {
          if (!t.trainSegments || t.trainSegments.length === 0) {
            console.log(`⚠️ Train ${t.trainNumber} has no trainSegments data`);
          } else {
            console.log(`⚠️ Skipping train ${t.trainNumber} - no economy seats available`);
          }
        }
        return ok;
      });

      if (directTrains.length === 0) {
        console.log('❌ No eligible direct trains with segment data and economy seats');
        return [];
      }

      // 2. Build a map of intermediateStationId -> Set(trainNumber) for all direct trains
      const stationToTrains = new Map<number, Set<string>>();
      for (const train of directTrains) {
        if (options?.signal?.aborted) break;
        const allStationIds = new Set<number>();
        for (const segment of train.trainSegments) {
          allStationIds.add(segment.departureStationId);
          allStationIds.add(segment.arrivalStationId);
        }
        allStationIds.delete(fromStationId);
        allStationIds.delete(toStationId);
        for (const stationId of allStationIds) {
          if (!stationToTrains.has(stationId)) stationToTrains.set(stationId, new Set());
          stationToTrains.get(stationId)!.add(train.trainNumber);
        }
      }

      const uniqueIntermediateStations = Array.from(stationToTrains.keys());
      console.log(`🚉 Unique intermediate stations across all direct trains: ${uniqueIntermediateStations.join(', ')}`);
      if (uniqueIntermediateStations.length === 0) {
        console.log('⚠️ No intermediate stations found across direct trains');
        return [];
      }

      // 3. Simple in-memory availability cache to avoid duplicate API calls (key: from-to-date)
      const availabilityCache = new Map<string, any>();
      const fetchAvailability = async (a: number, b: number) => {
        const key = `${a}-${b}-${departureDate}`;
        if (availabilityCache.has(key)) return availabilityCache.get(key);
        const resp = await this.searchTrainAvailability(a, b, departureDate);
        availabilityCache.set(key, resp);
        return resp;
      };

      // 4. Process each intermediate station once
      for (const intermediateStationId of uniqueIntermediateStations) {
        if (options?.signal?.aborted) break;
        const intermediateName = await this.getStationName(intermediateStationId);
        // Emit progress once per station
        options?.onIntermediateStation?.(intermediateStationId, intermediateName);
        try {
          // Perform the two leg availability searches (cached)
            const [originToIntermediateResponse, intermediateToDestinationResponse] = await Promise.all([
              fetchAvailability(fromStationId, intermediateStationId),
              fetchAvailability(intermediateStationId, toStationId)
            ]);

          if (!originToIntermediateResponse.success || !intermediateToDestinationResponse.success) {
            console.log(`⚠️ Availability search failed for station ${intermediateStationId}`);
            continue;
          }

          const trainsPassingStation = stationToTrains.get(intermediateStationId)!; // set of trainNumbers

          for (const trainNumber of trainsPassingStation) {
            if (options?.signal?.aborted) break;
            // Check that this train appears in both leg responses
            const firstLegTrain = originToIntermediateResponse.data.find((t: any) => t.trainNumber === trainNumber);
            const secondLegTrain = intermediateToDestinationResponse.data.find((t: any) => t.trainNumber === trainNumber);
            if (!firstLegTrain || !secondLegTrain) {
              continue; // train not bookable as two separate tickets
            }

            // Economy seats on both legs
            const econFirst = this.getEconomySeats(firstLegTrain);
            const econSecond = this.getEconomySeats(secondLegTrain);
            if (econFirst === 0 || econSecond === 0) continue;

            const sameTrainRoute = {
              id: `same-train-${trainNumber}-${intermediateStationId}`,
              trainNumber: trainNumber,
              connectionType: 'same-train',
              intermediateStation: intermediateStationId,
              firstLeg: {
                trainNumber: trainNumber,
                trainName: firstLegTrain.trainName,
                fromStation: fromStationId,
                fromStationName: originName,
                toStation: intermediateStationId,
                toStationName: intermediateName,
                departureTime: firstLegTrain.departureTime,
                arrivalTime: firstLegTrain.arrivalTime,
                duration: firstLegTrain.duration,
                price: firstLegTrain.price,
                availableSeats: firstLegTrain.availableSeats,
                seatCategories: firstLegTrain.seatCategories || [],
                economySeats: econFirst
              },
              secondLeg: {
                trainNumber: trainNumber,
                trainName: secondLegTrain.trainName,
                fromStation: intermediateStationId,
                fromStationName: intermediateName,
                toStation: toStationId,
                toStationName: destinationName,
                departureTime: secondLegTrain.departureTime,
                arrivalTime: secondLegTrain.arrivalTime,
                duration: secondLegTrain.duration,
                price: secondLegTrain.price,
                availableSeats: secondLegTrain.availableSeats,
                seatCategories: secondLegTrain.seatCategories || [],
                economySeats: econSecond
              },
              totalDuration: (firstLegTrain.duration || 0) + (secondLegTrain.duration || 0),
              totalPrice: (firstLegTrain.price || 0) + (secondLegTrain.price || 0),
              totalEconomySeats: Math.min(econFirst, econSecond),
              note: 'Aynı trende koltuk değiştirerek gidilebilir'
            };

            sameTrainRoutes.push(sameTrainRoute);
            options?.onConnectionFound?.(sameTrainRoute);
            console.log(`✅ Found same-train connection: ${trainNumber} via ${intermediateName} (${sameTrainRoute.totalEconomySeats} economy seats)`);
          }
        } catch (err) {
          console.warn(`Error processing intermediate station ${intermediateStationId} (${intermediateName}):`, err);
          continue;
        }
      }

      console.log(`🎯 Found ${sameTrainRoutes.length} same-train connections using aggregated intermediate stations`);
      return sameTrainRoutes;
      
    } catch (error) {
      console.error('Error finding same-train connections:', error);
      return [];
    }
  }

  // Helper method to extract economy seat count from train data
  static getEconomySeats(train: any): number {
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

  // Helper method to get station name from ID
  static async getStationName(stationId: number): Promise<string> {
    try {
      const stations = await this.fetchStations();
      const station = stations.find(s => s.id === stationId);
      return station ? station.name : `Station ${stationId}`;
    } catch (error) {
      return `Station ${stationId}`;
    }
  }

  // Get all stations for dropdown/autocomplete
  static async getAllStations(): Promise<Station[]> {
    try {
      return await this.fetchStations();
    } catch (error) {
      console.error('Error getting all stations:', error);
      return TCDD_STATIONS;
    }
  }
}

export default TCDDApiService;