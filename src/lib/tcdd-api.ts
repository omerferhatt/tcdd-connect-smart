// TCDD API integration service

export interface TCDDStation {
  id: number;
  name: string;
  cityId?: number;
  cityName?: string;
  lat?: number;
  lng?: number;
  active?: boolean;
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

export interface TCDDTrainAvailability {
  trainNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number;
  availableSeats: number;
  wagonType: string;
}

export interface TCDDApiResponse {
  success: boolean;
  data: TCDDTrainAvailability[];
  message?: string;
}

export interface TCDDStationPair {
  departure: number;
  arrival: number;
}

// Cached stations and pairs
let cachedStations: TCDDStation[] | null = null;
let cachedStationPairs: TCDDStationPair[] | null = null;

// Known TCDD stations with their API IDs
export const TCDD_STATIONS: TCDDStation[] = [
  { id: 98, name: 'ANKARA GAR' },
  { id: 1325, name: 'İSTANBUL(SÖĞÜTLÜÇEŞME)' },
  { id: 1322, name: 'İSTANBUL(PENDIK)' },
  { id: 1326, name: 'İSTANBUL(HALKALB)' },
  { id: 1327, name: 'İSTANBUL(YEDİKULE)' },
  { id: 1328, name: 'İSTANBUL(SİRKECİ)' },
  { id: 87, name: 'ESKİŞEHİR' },
  { id: 103, name: 'KONYA' },
  { id: 89, name: 'AFYONKARAHİSAR' },
  { id: 92, name: 'KÜTAHYA' },
  { id: 100, name: 'KARAMAN' },
  { id: 160, name: 'ADANA' },
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
  { id: 82, name: 'KOCAELİ(İZMİT)' }
];

class TCDDApiService {
  private static readonly BASE_URL = 'https://web-api-prod-ytp.tcddtasimacilik.gov.tr/tms';
  private static readonly CDN_URL = 'https://cdn-api-prod-ytp.tcddtasimacilik.gov.tr/datas';
  private static readonly UNIT_ID = '3895';
  
  // Developer auth token that's always valid
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
      
      // Transform the API response to match our interface
      const stations: TCDDStation[] = [];
      if (Array.isArray(data)) {
        stations.push(...data.map((station: any) => ({
          id: station.id || station.stationId,
          name: station.name || station.stationName || 'Unknown',
          cityId: station.cityId,
          cityName: station.cityName,
          lat: station.lat || station.latitude,
          lng: station.lng || station.longitude,
          active: station.active !== false
        })));
      } else if (data.stations && Array.isArray(data.stations)) {
        stations.push(...data.stations.map((station: any) => ({
          id: station.id || station.stationId,
          name: station.name || station.stationName || 'Unknown',
          cityId: station.cityId,
          cityName: station.cityName,
          lat: station.lat || station.latitude,
          lng: station.lng || station.longitude,
          active: station.active !== false
        })));
      }

      // Filter out invalid stations and cache the result
      cachedStations = stations.filter(s => s.id && s.name && s.name !== 'Unknown');
      
      console.log(`Fetched ${cachedStations.length} stations from TCDD API`);
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
      
      // Transform the API response
      const pairs: TCDDStationPair[] = [];
      if (Array.isArray(data)) {
        pairs.push(...data.map((pair: any) => ({
          departure: pair.departure || pair.departureStationId || pair.from,
          arrival: pair.arrival || pair.arrivalStationId || pair.to
        })));
      } else if (data.pairs && Array.isArray(data.pairs)) {
        pairs.push(...data.pairs.map((pair: any) => ({
          departure: pair.departure || pair.departureStationId || pair.from,
          arrival: pair.arrival || pair.arrivalStationId || pair.to
        })));
      }

      // Cache the result
      cachedStationPairs = pairs.filter(p => p.departure && p.arrival);
      
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
      return pairs.some(pair => 
        pair.departure === fromStationId && pair.arrival === toStationId
      );
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
      
      const fromStation = TCDD_STATIONS.find(s => s.id === fromStationId);
      const toStation = TCDD_STATIONS.find(s => s.id === toStationId);
      
      if (!fromStation || !toStation) {
        throw new Error('Invalid station IDs');
      }

      // Format date correctly for TCDD API (DD-MM-YYYY HH:mm:ss)
      const requestBody: TCDDSearchRequest = {
        searchRoutes: [{
          departureStationId: fromStationId,
          departureStationName: fromStation.name,
          arrivalStationId: toStationId,
          arrivalStationName: toStation.name,
          departureDate: `${departureDate} 09:00:00`
        }],
        passengerTypeCounts: [{
          id: 0, // Adult passenger type
          count: 1
        }],
        searchReservation: false,
        searchType: 'DOMESTIC'
      };

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

      const data = await response.json();
      
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

  private static transformApiResponse(apiData: any): TCDDTrainAvailability[] {
    // Handle TCDD API response structure
    if (!apiData) return [];
    
    // Check if response has routes or trains array
    let trains = [];
    if (Array.isArray(apiData)) {
      trains = apiData;
    } else if (apiData.routes && Array.isArray(apiData.routes)) {
      trains = apiData.routes;
    } else if (apiData.data && Array.isArray(apiData.data)) {
      trains = apiData.data;
    } else if (apiData.trains && Array.isArray(apiData.trains)) {
      trains = apiData.trains;
    } else {
      console.warn('Unexpected API response format:', apiData);
      return [];
    }

    return trains.map((train: any) => {
      // Handle different possible field names from TCDD API
      const trainNumber = train.trainNumber || train.trainName || train.number || 'Bilinmiyor';
      const departureTime = train.departureTime || train.departure || train.kalkis || '00:00';
      const arrivalTime = train.arrivalTime || train.arrival || train.varis || '00:00';
      
      // Calculate duration if not provided
      let duration = train.duration || train.sure || 0;
      if (!duration && departureTime && arrivalTime) {
        try {
          const [depHour, depMin] = departureTime.split(':').map(Number);
          const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
          duration = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
          if (duration < 0) duration += 24 * 60; // Handle next day arrival
        } catch (e) {
          duration = 0;
        }
      }
      
      // Handle price - TCDD API might return price in different formats
      let price = 0;
      if (train.price !== undefined) {
        price = typeof train.price === 'number' ? train.price : parseFloat(train.price) || 0;
      } else if (train.fiyat !== undefined) {
        price = typeof train.fiyat === 'number' ? train.fiyat : parseFloat(train.fiyat) || 0;
      } else if (train.minPrice !== undefined) {
        price = typeof train.minPrice === 'number' ? train.minPrice : parseFloat(train.minPrice) || 0;
      }
      
      // Handle available seats
      const availableSeats = train.availableSeats || train.bos_koltuk || train.capacity || 0;
      
      // Handle wagon type
      const wagonType = train.wagonType || train.vagon_tipi || train.type || 'Standart';

      return {
        trainNumber,
        departureTime,
        arrivalTime,
        duration,
        price,
        availableSeats,
        wagonType
      };
    }).filter(train => train.trainNumber !== 'Bilinmiyor'); // Filter out invalid entries
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
          station.name.toLowerCase().includes(normalizedQuery) ||
          (station.cityName && station.cityName.toLowerCase().includes(normalizedQuery))
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