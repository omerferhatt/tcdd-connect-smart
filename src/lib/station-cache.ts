import TCDDApiService from './tcdd-api';
import { TURKISH_STATIONS } from './railway-data';

export interface CachedStation {
  id: number;
  name: string;
  cityId?: number;
  districtId?: number;
  latitude?: number;
  longitude?: number;
}

interface StationCacheState {
  stations: CachedStation[] | null;
  lastFetched: number | null;
  promise: Promise<CachedStation[] | null> | null;
}

const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const state: StationCacheState = {
  stations: null,
  lastFetched: null,
  promise: null
};

function isFresh(): boolean {
  return !!state.stations && !!state.lastFetched && (Date.now() - state.lastFetched) < CACHE_TTL_MS;
}

export async function fetchStationsCached(): Promise<CachedStation[]> {
  if (isFresh()) return state.stations!;
  if (state.promise) {
    const existing = await state.promise;
    if (existing) return existing;
  }
  state.promise = (async () => {
    try {
      const list = await TCDDApiService.getAllStations();
      state.stations = list.map(s => ({
        id: (s as any).id,
        name: (s as any).name,
        cityId: (s as any).cityId,
        districtId: (s as any).districtId,
        latitude: (s as any).latitude,
        longitude: (s as any).longitude
      }));
      state.lastFetched = Date.now();
      return state.stations;
    } catch (e) {
      // Fallback to static list converting
      state.stations = TURKISH_STATIONS.map(st => ({ id: st.tcddId || parseInt(st.id,10) || -1, name: st.name }));
      state.lastFetched = Date.now();
      return state.stations;
    } finally {
      state.promise = null;
    }
  })();
  return (await state.promise) || [];
}

export function searchStationsCached(query: string, excludeId?: number): CachedStation[] {
  if (!state.stations) return [];
  const q = query.trim().toLowerCase();
  return state.stations.filter(s => {
    if (excludeId && s.id === excludeId) return false;
    if (!q) return true;
    return s.name.toLowerCase().includes(q);
  });
}

export function clearStationCache() {
  state.stations = null;
  state.lastFetched = null;
  state.promise = null;
}
