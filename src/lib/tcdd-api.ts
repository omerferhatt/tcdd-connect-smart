// TCDD API integration service

export interface TCDDStation {
  id: number;
  name: string;
  cityId?: number;
  cityName?: string;
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
  private static readonly UNIT_ID = '3895';
  
  // Note: In a real application, you would need to implement proper authentication
  // This token will expire and would need to be refreshed
  private static authToken: string | null = null;

  static async getAuthToken(): Promise<string> {
    // In a real implementation, you would authenticate with TCDD and get a valid token
    // For demo purposes, we'll use a placeholder approach
    if (!this.authToken) {
      throw new Error('Authentication required. Please implement TCDD login flow.');
    }
    return this.authToken;
  }

  static setAuthToken(token: string) {
    this.authToken = token;
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

      const requestBody: TCDDSearchRequest = {
        searchRoutes: [{
          departureStationId: fromStationId,
          departureStationName: fromStation.name,
          arrivalStationId: toStationId,
          arrivalStationName: toStation.name,
          departureDate: `${departureDate} 12:00:00`
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
          'Content-Type': 'application/json',
          'Origin': 'https://ebilet.tcddtasimacilik.gov.tr',
          'User-Agent': 'Mozilla/5.0 (compatible; TCDDConnectedTravels/1.0)',
          'unit-id': this.UNIT_ID
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
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
    // Transform the TCDD API response to our internal format
    // The actual structure would depend on the API response format
    if (!Array.isArray(apiData)) {
      return [];
    }

    return apiData.map((train: any) => ({
      trainNumber: train.trainNumber || train.trainName || 'Unknown',
      departureTime: train.departureTime || '00:00',
      arrivalTime: train.arrivalTime || '00:00',
      duration: train.duration || 0,
      price: train.price || 0,
      availableSeats: train.availableSeats || 0,
      wagonType: train.wagonType || 'Standard'
    }));
  }

  static findStationByName(name: string): TCDDStation | undefined {
    const normalizedName = name.toLowerCase().trim();
    return TCDD_STATIONS.find(station => 
      station.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(station.name.toLowerCase())
    );
  }

  static findStationsByQuery(query: string): TCDDStation[] {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    return TCDD_STATIONS.filter(station =>
      station.name.toLowerCase().includes(normalizedQuery)
    ).slice(0, 10);
  }
}

export default TCDDApiService;