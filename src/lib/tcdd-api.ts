// TCDD API integration service

// Station data from stations.json API
export interface TCDDStation {
  id: number;
  stationNumber?: string;
  areaCode?: number;
  name: string;
  stationStatus?: {
    id: number;
    name: string | null;
    detail: string | null;
  };
  stationType?: {
    id: number;
    name: string | null;
    detail: string | null;
  };
  unitId?: number;
  cityId?: number;
  districtId?: number;
  neighbourhoodId?: number;
  uicCode?: string | null;
  technicalUnit?: string;
  stationChefId?: number;
  detail?: string | null;
  showOnQuery?: boolean;
  passengerDrop?: boolean;
  ticketSaleActive?: boolean;
  active?: boolean;
  email?: string;
  orangeDeskEmail?: string | null;
  address?: string;
  longitude?: number;
  latitude?: number;
  altitude?: number;
  startKm?: number;
  endKm?: number;
  showOnMap?: boolean;
  passengerAdmission?: boolean;
  disabledAccessibility?: boolean;
  IATACode?: string | null;
}

// Station pairs data from station-pairs-INTERNET.json API  
export interface TCDDStationPair {
  id: number;
  unitId?: number;
  areaCode?: number;
  name: string;
  stationCode?: string;
  stationStatus?: {
    id: number;
    name: string | null;
    detail: string | null;
  };
  stationType?: {
    id: number;
    name: string | null;
    detail: string | null;
  };
  district?: {
    id: number;
    name: string;
    city: {
      id: number;
      name: string;
      country: {
        id: number;
        name: string;
        code: string;
      };
      latitude: number;
      longitude: number;
      timezone: string;
    };
    latitude: number;
    longitude: number;
  };
  passengerDrop?: boolean;
  ticketSaleActive?: boolean;
  longitude?: number;
  latitude?: number;
  altitude?: number;
  international?: boolean;
  domestic?: boolean;
  pairs?: number[]; // Array of station IDs this station connects to
  stationTrainTypes?: string[];
  IATACode?: string | null;
}

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

// Train availability response structure
export interface TCDDBookingClass {
  id: number;
  trainId: number;
  bookingClassId: number;
  capacity: number;
}

export interface TCDDSegment {
  id: number;
  departureTime: number; // Unix timestamp in milliseconds
  arrivalTime: number; // Unix timestamp in milliseconds
  stops: boolean;
  duration: number; // in minutes
  stopDuration: number;
  distance: number;
  segment: {
    id: number;
    name: string;
    departureStation: TCDDStation;
    arrivalStation: TCDDStation;
    lineId: number;
    lineOrder: number;
  };
}

export interface TCDDTrain {
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
  minPrice: {
    type: string | null;
    priceAmount: number;
    priceCurrency: string;
  };
  reservationLockTime: number;
  reservable: boolean;
  bookingClassCapacities: TCDDBookingClass[];
  segments: TCDDSegment[];
}

export interface TCDDTrainAvailability {
  trains: TCDDTrain[];
}

export interface TCDDTrainLeg {
  trainAvailabilities: TCDDTrainAvailability[];
}

export interface TCDDApiResponse {
  success: boolean;
  data: any[];
  message?: string;
}

export interface TCDDSearchResponse {
  trainLegs: TCDDTrainLeg[];
}

// Cached stations and pairs
let cachedStations: TCDDStation[] | null = null;
let cachedStationPairs: TCDDStationPair[] | null = null;

// Known TCDD stations with their API IDs - Updated from real API
export const TCDD_STATIONS: TCDDStation[] = [
  { id: 98, name: 'ANKARA GAR' },
  { id: 1325, name: 'İSTANBUL(SÖĞÜTLÜÇEŞME)' },
  { id: 48, name: 'İSTANBUL(PENDİK)' },
  { id: 1323, name: 'İSTANBUL(BOSTANCI)' },
  { id: 1322, name: 'İSTANBUL(HALKALB)' }, 
  { id: 1327, name: 'İSTANBUL(YEDİKULE)' },
  { id: 1328, name: 'İSTANBUL(SİRKECİ)' },
  { id: 20, name: 'GEBZE' },
  { id: 1135, name: 'İZMİT YHT' },
  { id: 5, name: 'ARİFİYE' },
  { id: 87, name: 'ESKİŞEHİR' },
  { id: 103, name: 'KONYA' },
  { id: 89, name: 'AFYONKARAHİSAR' },
  { id: 92, name: 'KÜTAHYA' },
  { id: 100, name: 'KARAMAN' },
  { id: 753, name: 'ADANA' },
  { id: 170, name: 'MERSİN' },
  { id: 130, name: 'KAYSERİ' },
  { id: 140, name: 'SİVAS' },
  { id: 150, name: 'ERZURUM' },
  { id: 151, name: 'KARS' },
  { id: 148, name: 'ELAZIĞ' },
  { id: 147, name: 'MALATYA' },
  { id: 180, name: 'İZMİR BASMANE' },
  { id: 181, name: 'İZMİR ALSANCAK' },
  { id: 185, name: 'DENİZLİ' },
  { id: 77, name: 'BALIKESİR' },
  { id: 79, name: 'BANDIRMA' },
  { id: 200, name: 'ZONGULDAK' },
  { id: 120, name: 'SAMSUN' },
  { id: 125, name: 'AMASYA' },
  { id: 145, name: 'TOKAT' },
  { id: 95, name: 'ÇANKIRI' },
  { id: 677, name: 'GÖLCÜK' }
];

class TCDDApiService {
  private static readonly BASE_URL = 'https://web-api-prod-ytp.tcddtasimacilik.gov.tr/tms';
  private static readonly CDN_URL = 'https://cdn-api-prod-ytp.tcddtasimacilik.gov.tr/datas';
  private static readonly UNIT_ID = '3895';
  
  // Developer auth token (always valid, no need to reauthorize as per user request)
  private static authToken: string | null = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlVFFicDhDMmpiakp1cnUzQVk2a0ZnV186U29MQXZIMmJ5bTJ2OUg5THhRIn0.eyJleHAiOjE3MjEzODQ0NzAsImlhdCI6MTcyMTM4NDQxMCwianRpIjoiYWFlNjVkNzgtNmRkZS00ZGY4LWEwZWYtYjRkNzZiYjZlODNjIiwiaXNzIjoiaHR0cDovL3l0cC1wcm9kLW1hc3RlcjEudGNkZHRhc2ltYWNpbGlrLmdvdi50cjo4MDgwL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiMDAzNDI3MmMtNTc2Yi00OTBlLWJhOTgtNTFkMzc1NWNhYjA3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidG1zIiwic2Vzc2lvbl9zdGF0ZSI6IjAwYzM4NTJiLTg1YjEtNDMxNS04OGIwLWQ0MWMxMTcyYzA0MSIsImFjciI6IjEiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1tYXN0ZXIiLCJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgZW1haWwgcHJvZmlsZSIsInNpZCI6IjAwYzM4NTJiLTg1YjEtNDMxNS04OGIwLWQ0MWMxMTcyYzA0MSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoid2ViIiwiZ2l2ZW5fbmFtZSI6IiIsImZhbWlseV9uYW1lIjoiIn0.AIW_4Qws2wfwxyVg8dgHRT9jB3qNavob2C4mEQIQGl3urzW2jALPx-e51ZwHUb-TXB-X2RPHakonxKnWG6tDIP5aKhiidzXDcr6pDDoYU5DnQhMg1kywyOaMXsjLFjuYN5PAyGUMh6YSOVsg1PzNh-5GrJF44pS47JnB9zk03Pr08napjsZPoRB-5N4GQ49cnx7ePC82Y7YIc-gTew2baqKQPz9_v381Gbm2V38PZDH9KldlcWut7kqQYJFMJ7dkM_entPJn9lFk7R5h5j_06OlQEpWRMQTn9SQ1AYxxmZxBu5XYMKDkn4rzIIVCkdTPJNCt5PvjENjClKFeUA1DOg';

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
  static async fetchStations(): Promise<TCDDStation[]> {
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
            stationNumber: station.stationNumber,
            areaCode: station.areaCode,
            name: station.name,
            stationStatus: station.stationStatus,
            stationType: station.stationType,
            unitId: station.unitId,
            cityId: station.cityId,
            districtId: station.districtId,
            neighbourhoodId: station.neighbourhoodId,
            uicCode: station.uicCode,
            technicalUnit: station.technicalUnit,
            stationChefId: station.stationChefId,
            detail: station.detail,
            showOnQuery: station.showOnQuery,
            passengerDrop: station.passengerDrop,
            ticketSaleActive: station.ticketSaleActive,
            active: station.active,
            email: station.email,
            orangeDeskEmail: station.orangeDeskEmail,
            address: station.address,
            longitude: station.longitude,
            latitude: station.latitude,
            altitude: station.altitude,
            startKm: station.startKm,
            endKm: station.endKm,
            showOnMap: station.showOnMap,
            passengerAdmission: station.passengerAdmission,
            disabledAccessibility: station.disabledAccessibility,
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
  static async fetchStationPairs(): Promise<TCDDStationPair[]> {
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
          );
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

  // Check if a direct route exists between two stations
  static async hasDirectRoute(fromStationId: number, toStationId: number): Promise<boolean> {
    try {
      const pairs = await this.fetchStationPairs();
      const fromStation = pairs.find(p => p.id === fromStationId);
      return fromStation ? fromStation.pairs?.includes(toStationId) || false : false;
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
      const formattedDate = `${day}-${month}-${year} 09:00:00`;

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

      const data: TCDDSearchResponse = await response.json();
      console.log('TCDD API Response:', JSON.stringify(data, null, 2));
      
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

  private static transformApiResponse(apiData: TCDDSearchResponse): any[] {
    // Handle the real TCDD API response structure
    if (!apiData || !apiData.trainLegs || !Array.isArray(apiData.trainLegs)) {
      console.warn('No train legs found in API response');
      return [];
    }
    
    const trains: any[] = [];
    
    for (const trainLeg of apiData.trainLegs) {
      if (!trainLeg.trainAvailabilities || !Array.isArray(trainLeg.trainAvailabilities)) {
        continue;
      }
      
      for (const availability of trainLeg.trainAvailabilities) {
        if (!availability.trains || !Array.isArray(availability.trains)) {
          continue;
        }
        
        for (const train of availability.trains) {
          // Calculate total journey time from segments
          let totalDuration = 0;
          let totalDistance = 0;
          let departureTime = '';
          let arrivalTime = '';
          
          if (train.segments && train.segments.length > 0) {
            // Get departure time from first segment
            const firstSegment = train.segments[0];
            const lastSegment = train.segments[train.segments.length - 1];
            
            departureTime = new Date(firstSegment.departureTime).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit'
            });
            
            arrivalTime = new Date(lastSegment.arrivalTime).toLocaleTimeString('tr-TR', {
              hour: '2-digit', 
              minute: '2-digit'
            });
            
            // Sum up duration and distance from all segments
            totalDuration = train.segments.reduce((sum, segment) => sum + segment.duration, 0);
            totalDistance = train.segments.reduce((sum, segment) => sum + segment.distance, 0);
          }
          
          // Get available capacity from booking classes
          let availableSeats = 0;
          if (train.bookingClassCapacities && train.bookingClassCapacities.length > 0) {
            availableSeats = train.bookingClassCapacities.reduce((sum, capacity) => sum + capacity.capacity, 0);
          }
          
          trains.push({
            trainNumber: train.number || 'Unknown',
            trainName: train.name || train.commercialName || 'Unknown',
            trainType: train.type || 'Unknown',
            departureTime,
            arrivalTime,
            duration: totalDuration, // in minutes
            distance: Math.round(totalDistance * 100) / 100, // round to 2 decimal places
            price: train.minPrice?.priceAmount || 0,
            currency: train.minPrice?.priceCurrency || 'TRY',
            availableSeats,
            reservable: train.reservable || false,
            segments: train.segments?.map(segment => ({
              departureStation: segment.segment.departureStation.name,
              arrivalStation: segment.segment.arrivalStation.name,
              departureTime: new Date(segment.departureTime).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              arrivalTime: new Date(segment.arrivalTime).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              duration: segment.duration,
              distance: segment.distance,
              stops: segment.stops
            })) || []
          });
        }
      }
    }

    console.log(`Transformed ${trains.length} trains from API response`);
    return trains;
  }

  static async findStationByName(name: string): Promise<TCDDStation | undefined> {
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

  static async findStationsByQuery(query: string): Promise<TCDDStation[]> {
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

  // Get all stations for dropdown/autocomplete
  static async getAllStations(): Promise<TCDDStation[]> {
    try {
      return await this.fetchStations();
    } catch (error) {
      console.error('Error getting all stations:', error);
      return TCDD_STATIONS;
    }
  }
}

export default TCDDApiService;