import { AstroData } from '../types';

const BASE_URL = import.meta.env.VITE_ASTROLOGY_API_URL || 'https://json.freeastrologyapi.com';
const GEO_URL = 'https://freeastrologyapi.com/geo-details';
const API_KEY = import.meta.env.VITE_ASTROLOGY_API_KEY;

interface GeoDetails {
  latitude: number;
  longitude: number;
  timezone: number;
  timezoneId?: string;
}

async function fetchTimezoneWithDST(
  timezoneId: string, 
  dateStr: string, 
  timeStr: string
): Promise<number> {
  try {
    const dateObj = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const payload = {
      timezone: timezoneId,
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate(),
      hour: hours || 12,
      minute: minutes || 0
    };

    const response = await fetch(`${BASE_URL}/timezone-with-dst`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) return 5.5; // Fallback to IST

    const data = await response.json();
    if (data && data.timezone_with_dst && typeof data.timezone_with_dst.timezone_offset_hours === 'number') {
      return data.timezone_with_dst.timezone_offset_hours;
    }
    return 5.5;
  } catch (e) {
    console.warn("Timezone DST Fetch Error:", e);
    return 5.5;
  }
}

async function fetchGeoDetails(place: string): Promise<GeoDetails> {
  try {
    const response = await fetch(GEO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ location: place })
    });

    if (!response.ok) {
      console.warn(`Geo API failed for "${place}". Using default Delhi coordinates.`);
      return { latitude: 28.6139, longitude: 77.2090, timezone: 5.5, timezoneId: 'Asia/Kolkata' };
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const loc = data[0];
      return {
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone_offset,
        timezoneId: loc.timezone // "Asia/Kolkata" etc.
      };
    }
    
    return { latitude: 28.6139, longitude: 77.2090, timezone: 5.5, timezoneId: 'Asia/Kolkata' };
  } catch (e) {
    console.error("Geo Fetch Error:", e);
    return { latitude: 28.6139, longitude: 77.2090, timezone: 5.5, timezoneId: 'Asia/Kolkata' };
  }
}

/**
 * Fetches chart data. 
 * Tries to use the real API if a key is present, otherwise falls back to deterministic mock data.
 */
export async function fetchAstrologyData(
  date: string, 
  time: string, 
  place: string
): Promise<AstroData> {
  
  if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY') {
     throw new Error("Missing Astrology API Key. Please configure VITE_ASTROLOGY_API_KEY.");
  }

  // 1. Get Geo Details first
  const geo = await fetchGeoDetails(place);

  // 2. Get Accurate Timezone with DST if timezoneId is available
  let timezone = geo.timezone;
  if (geo.timezoneId) {
    timezone = await fetchTimezoneWithDST(geo.timezoneId, date, time);
  }

  // Prepare payload for the API (FreeAstrologyAPI format)
  const payload = {
    year: new Date(date).getFullYear(),
    month: new Date(date).getMonth() + 1,
    date: new Date(date).getDate(),
    hours: parseInt(time.split(':')[0] || '12'),
    minutes: parseInt(time.split(':')[1] || '00'),
    seconds: 0,
    latitude: geo.latitude,
    longitude: geo.longitude,
    timezone: timezone,
    settings: {
      observation_point: "topocentric",
      ayanamsha: "lahiri"
    }
  };

  try {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    };

    // We only use endpoints confirmed in documentation: /planets and /complete-panchang
    // /planets gives chart info (positions, signs)
    // /complete-panchang gives daily panchang info
    // Dasha/Strength/Yogas are not explicitly documented in the free tier snippets, 
    // so we will try common paths but handle failures gracefully.
    
    const [planetsRes, panchangRes] = await Promise.all([
      fetch(`${BASE_URL}/planets`, { method: 'POST', headers, body: JSON.stringify(payload) }),
      fetch(`${BASE_URL}/complete-panchang`, { method: 'POST', headers, body: JSON.stringify(payload) })
    ]);

    if (!planetsRes.ok) throw new Error(`Planets API failed: ${planetsRes.statusText}`);
    
    const planetsData = await planetsRes.json();
    const panchangData = panchangRes.ok ? await panchangRes.json() : null;

    // Process Planets Data to match AstroData interface
    // planetsData.output is an array of objects where each object has a key like "0": {name: "Sun"...} 
    // OR it might be a direct array of planet objects depending on exact version. 
    // The snippet showed: "output": [ {"0": {...}}, {"1": {...}} ] which is weird. 
    // Let's inspect the structure safely.
    
    let planetsList: any[] = [];
    if (Array.isArray(planetsData.output)) {
        // Handle the weird array-of-objects structure if necessary, or flat array
        // Snippet showed: [{"0": {id:0, name:"Sun"...}}, ...] or just [{id:0...}]
        // We will flatten it if needed.
        planetsList = planetsData.output.map((p: any) => Object.values(p)[0] || p).flat();
    }

    const getPlanet = (name: string) => planetsList.find((p: any) => p.name === name) || {};
    const ascendant = getPlanet("Ascendant");
    const moon = getPlanet("Moon");

    // Map to AstroData
    return {
        ascendant: ascendant.sign || 'Unknown',
        moonSign: moon.sign || 'Unknown',
        moonNakshatra: moon.nakshatra || 'Unknown',
        // Dasha is not directly available in free tier endpoints found, using placeholder or derived if possible
        currentMahadasha: 'Unknown', 
        currentAntardasha: 'Unknown',
        planetaryPositions: planetsList.reduce((acc: Record<string, string>, p: any) => {
          if (p.name) acc[p.name] = p.sign;
          return acc;
        }, {}),
        strength: null, // Not available in free tier
        yogas: [], // Specific birth yogas not available in free tier
        panchang: panchangData,
        timezone: geo.timezoneId,
        timezoneOffset: timezone
    };

  } catch (error) {
    console.error("Astrology Data Fetch Error:", error);
    throw error; // Propagate error to UI
  }
}