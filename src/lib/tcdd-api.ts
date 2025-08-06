// TCDD API integration service

// Station data from stations.json API
export interface TCDDStation {
  id: number;
  stationNumber: string;
  areaCode: number;
  name: string;
  stationStatus: {
    id: number;
    name: string | null;
    detail: string | null;
  };
  stationType: {
    id: number;
    name: string | null;
    detail: string | null;
  };
  unitId: number;
  cityId: number;
  districtId: number;
  neighbourhoodId: number;
  uicCode: string | null;
  technicalUnit: string | null;
  stationChefId: number;
  detail: string | null;
  showOnQuery: boolean;
  passengerDrop: boolean;
  ticketSaleActive: boolean;
  active: boolean;
  email: string;
  orangeDeskEmail: string | null;
  address: string;
  longitude: number;
  latitude: number;
  altitude: number;
  startKm: number;
  endKm: number;
  showOnMap: boolean;
  passengerAdmission: boolean;
  disabledAccessibility: boolean;
  phones: string | null;
  workingDays: string | null;
  hardwares: string | null;
  physicalProperties: string | null;
  stationPlatforms: string | null;
  salesChannels: Array<{
    id: number;
    station: {
      id: number;
      stationNumber: string | null;
      areaCode: number;
      name: string | null;
      stationStatus: null;
      stationType: null;
      unitId: number;
      cityId: number;
      districtId: number;
      neighbourhoodId: number;
      uicCode: string | null;
      technicalUnit: string | null;
      stationChefId: number;
      detail: string | null;
      showOnQuery: boolean;
      passengerDrop: boolean;
      ticketSaleActive: boolean;
      active: boolean;
      email: string | null;
      orangeDeskEmail: string | null;
      address: string | null;
      longitude: number;
      latitude: number;
      altitude: number;
      startKm: number;
      endKm: number;
      showOnMap: boolean;
      passengerAdmission: boolean;
      disabledAccessibility: boolean;
      phones: null;
      workingDays: null;
      hardwares: null;
      physicalProperties: null;
      stationPlatforms: null;
      salesChannels: null;
      IATACode: string | null;
    };
    saleChannelId: number;
  }> | null;
  IATACode: string | null;
}

// Station pairs data from station-pairs-INTERNET.json API  
export interface TCDDStationPair {
  id: number;
  unitId: number;
  areaCode: number;
  name: string;
  stationCode: string;
  stationStatus: {
    id: number;
    name: string | null;
    detail: string | null;
  };
  stationType: {
    id: number;
    name: string | null;
    detail: string | null;
  };
  district: {
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
  } | null;
  passengerDrop: boolean;
  ticketSaleActive: boolean;
  longitude: number;
  latitude: number;
  altitude: number;
  international: boolean;
  domestic: boolean;
  pairs: number[]; // Array of station IDs this station connects to
  salesChannels: string | null;
  stationTrainTypes: string[] | null;
  IATACode: string | null;
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
    departureStation: {
      id: number;
      stationNumber: string;
      areaCode: number;
      name: string;
      stationStatus: {
        id: number;
        name: string | null;
        detail: string | null;
      };
      stationType: {
        id: number;
        name: string | null;
        detail: string | null;
      };
      unitId: number;
      cityId: number;
      districtId: number;
      neighbourhoodId: number | string | null;
      uicCode: string | null;
      technicalUnit: string | null;
      stationChefId: number;
      detail: string | null;
      showOnQuery: boolean;
      passengerDrop: boolean;
      ticketSaleActive: boolean;
      active: boolean;
      email: string;
      orangeDeskEmail: string | null;
      address: string | null;
      longitude: number;
      latitude: number;
      altitude: number;
      startKm: number;
      endKm: number;
      showOnMap: boolean;
      passengerAdmission: boolean;
      disabledAccessibility: boolean;
      phones: string | null;
      workingDays: string | null;
      hardwares: string | null;
      physicalProperties: string | null;
      stationPlatforms: string | null;
      salesChannels: string | null;
      IATACode: string | null;
    };
    arrivalStation: {
      id: number;
      stationNumber: string;
      areaCode: number;
      name: string;
      stationStatus: {
        id: number;
        name: string | null;
        detail: string | null;
      };
      stationType: {
        id: number;
        name: string | null;
        detail: string | null;
      };
      unitId: number;
      cityId: number;
      districtId: number;
      neighbourhoodId: number | string | null;
      uicCode: string | null;
      technicalUnit: string | null;
      stationChefId: number;
      detail: string | null;
      showOnQuery: boolean;
      passengerDrop: boolean;
      ticketSaleActive: boolean;
      active: boolean;
      email: string;
      orangeDeskEmail: string | null;
      address: string;
      longitude: number;
      latitude: number;
      altitude: number;
      startKm: number;
      endKm: number;
      showOnMap: boolean;
      passengerAdmission: boolean;
      disabledAccessibility: boolean;
      phones: string | null;
      workingDays: string | null;
      hardwares: string | null;
      physicalProperties: string | null;
      stationPlatforms: string | null;
      salesChannels: string | null;
      IATACode: string | null;
    };
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
  cars: Array<{
    id: number;
    name: string;
    trainId: number;
    templateId: number;
    carIndex: number;
    unlabeled: boolean;
    capacity: number;
    cabinClassId: number;
    availabilities: Array<{
      trainCarId: number;
      trainCarName: string | null;
      cabinClass: {
        id: number;
        code: string;
        name: string;
        additionalServices: null;
        bookingClassModels: null;
        showAvailabilityOnQuery: boolean;
      } | null;
      availability: number;
      pricingList: Array<{
        basePricingId: number;
        bookingClass: {
          id: number;
          code: string;
          name: string;
          cabinClass: {
            id: number;
            code: string | null;
            name: string | null;
            additionalServices: null;
            bookingClassModels: null;
            showAvailabilityOnQuery: boolean;
          };
          fareFamily: {
            id: number;
            name: string;
          };
        };
        cabinClassId: number;
        basePricingType: string;
        fareBasis: {
          code: string;
          factor: number;
          price: {
            type: string | null;
            priceAmount: number;
            priceCurrency: string;
          };
        };
        basePrice: {
          type: string | null;
          priceAmount: number;
          priceCurrency: string;
        };
        crudePrice: {
          type: string | null;
          priceAmount: number;
          priceCurrency: string;
        };
        baseTransportationCost: {
          type: string | null;
          priceAmount: number;
          priceCurrency: string;
        };
        availability: number;
      }>;
      additionalServices: Array<{
        additionalService: {
          id: number;
          additionalServiceTypeId: number;
          name: string;
          description: string;
          code: string;
          active: boolean;
          freeForPermi: boolean;
          actAsGroup: boolean;
          basePrice: Array<{
            id: number;
            additionalServiceId: number;
            type: string;
            priceAmount: number;
            priceCurrency: string;
            startDate: string;
            endDate: string;
          }>;
          pricingPeriods: string | null;
        };
        priceAmount: number;
        currency: string;
      }>;
    }>;
  }>;
}

export interface TCDDTrainLeg {
  trainAvailabilities: TCDDTrainAvailability[];
  trainSegments: Array<{
    departureStationId: number;
    arrivalStationId: number;
    departureTime: string; // "YYYY-MM-DDTHH:mm:ss"
    arrivalTime: string; // "YYYY-MM-DDTHH:mm:ss"
  }>;
  totalDistance: number;
  availableFareInfo: Array<{
    fareFamily: {
      id: number;
      name: string;
    };
    cabinClasses: Array<{
      cabinClass: {
        id: number;
        code: string;
        name: string;
        additionalServices: null;
        bookingClassModels: null;
        showAvailabilityOnQuery: boolean;
      };
      availabilityCount: number;
      minPrice: number;
      minPriceCurrency: string;
      bookingClassAvailabilities: Array<{
        bookingClass: {
          id: number;
          code: string;
          name: string;
          cabinClass: {
            id: number;
            code: string | null;
            name: string | null;
            additionalServices: null;
            bookingClassModels: null;
            showAvailabilityOnQuery: boolean;
          };
          fareFamily: {
            id: number;
            name: string;
          };
        };
        price: number;
        currency: string;
        availability: number;
      }>;
    }>;
  }>;
  cabinClassAvailabilities: Array<{
    cabinClass: {
      id: number;
      code: string;
      name: string;
      additionalServices: null;
      bookingClassModels: null;
      showAvailabilityOnQuery: boolean;
    };
    availabilityCount: number;
  }>;
  trainDate: number; // Unix timestamp in milliseconds
  trainNumber: string;
  skipsDay: boolean;
}

export interface TCDDApiResponse {
  success: boolean;
  data: any[];
  message?: string;
}

export interface TCDDSearchResponse {
  trainLegs: TCDDTrainLeg[];
  totalTripTime: number; // This is in milliseconds
  minPrice: number;
  connection: boolean;
  dayChanged: boolean;
}

// Cached stations and pairs
let cachedStations: TCDDStation[] | null = null;
let cachedStationPairs: TCDDStationPair[] | null = null;

// Known TCDD stations with their API IDs - Simplified fallback structure
const createFallbackStation = (id: number, name: string): TCDDStation => ({
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
  technicalUnit: null,
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
  salesChannels: null,
  IATACode: null
});

export const TCDD_STATIONS: TCDDStation[] = [
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
            technicalUnit: station.technicalUnit,
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
            phones: station.phones,
            workingDays: station.workingDays,
            hardwares: station.hardwares,
            physicalProperties: station.physicalProperties,
            stationPlatforms: station.stationPlatforms,
            salesChannels: station.salesChannels,
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
            salesChannels: station.salesChannels,
            stationTrainTypes: station.stationTrainTypes,
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

  // Check if a direct route exists between two stations
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
          
          // Get available capacity from booking classes and availabilities
          let availableSeats = 0;
          
          // Try to get seats from availability.cars first (most accurate for available seats)
          if (availability.cars && availability.cars.length > 0) {
            for (const car of availability.cars) {
              if (car.availabilities && car.availabilities.length > 0) {
                for (const carAvail of car.availabilities) {
                  availableSeats += carAvail.availability || 0;
                }
              }
            }
          }
          // Fallback to trainLeg's cabinClassAvailabilities (available seats per cabin class)
          else if (trainLeg.cabinClassAvailabilities && trainLeg.cabinClassAvailabilities.length > 0) {
            availableSeats = trainLeg.cabinClassAvailabilities.reduce((sum, cabinAvail) => sum + cabinAvail.availabilityCount, 0);
          } 
          // Last fallback to train's bookingClassCapacities (total capacity, not available)
          else if (train.bookingClassCapacities && train.bookingClassCapacities.length > 0) {
            // Note: This is capacity, not availability - might not be accurate for actual available seats
            availableSeats = train.bookingClassCapacities.reduce((sum, capacity) => sum + capacity.capacity, 0);
          }
          
          trains.push({
            trainNumber: train.number || 'Unknown',
            trainName: train.name || train.commercialName || 'Unknown',
            trainType: train.type || 'Unknown',
            departureTime,
            arrivalTime,
            departureTimestamp, // For sorting
            duration: totalDuration, // in minutes
            distance: Math.round(totalDistance * 100) / 100, // round to 2 decimal places
            price: train.minPrice?.priceAmount || 0,
            currency: train.minPrice?.priceCurrency || 'TRY',
            availableSeats,
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
            }) || []
          });
        }
      }
    }

    // Sort trains by departure time
    trains.sort((a, b) => a.departureTimestamp - b.departureTimestamp);

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