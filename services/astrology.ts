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
  
  // Validation Layer (Backend Responsibility)
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid birth data: Date format is incorrect.");
  }
  if (!time.match(/^\d{1,2}:\d{2}$/)) {
    throw new Error("Invalid birth data: Time must be in HH:MM format.");
  }
  if (!place || place.trim().length === 0) {
    throw new Error("Invalid birth data: Place cannot be empty.");
  }

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
    
    // Helper to map sign number (1-12) to name
    const SIGNS = [
      "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
      "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    const getSignName = (val: any) => {
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return SIGNS[val - 1] || 'Unknown';
        return 'Unknown';
    };

    // Extended Endpoints List
    const CHART_IDS = [
  'D1', 'D3', 'D8'
];

    // Parallel Fetching Strategy
    // 1. Core Data (Planets + Panchang) - Critical
    // 2. Extended Planets - High Value
    // 3. Divisional Charts - Comprehensive
    // 4. Navamsa (D9) - Specific Endpoint
    // 5. Hora (D2) - Specific Endpoint
    // 6. Chaturthamsa (D4) - Specific Endpoint
    // 7. Panchamsa (D5) - Specific Endpoint
    // 8. Shasthamsa (D6) - Specific Endpoint
    // 9. Saptamsa (D7) - Specific Endpoint
    // 10. Dasamsa (D10) - Specific Endpoint
    // 11. Rudramsa (D11) - Specific Endpoint
    // 12. Dwadasamsa (D12) - Specific Endpoint
    // 13. Shodasamsa (D16) - Specific Endpoint
    // 14. Vimsamsa (D20) - Specific Endpoint
    // 15. Siddhamsa (D24) - Specific Endpoint
    // 16. Nakshatramsa (D27) - Specific Endpoint
    // 17. Trimsamsa (D30) - Specific Endpoint
    // 18. Khavedamsa (D40) - Specific Endpoint
    // 19. Akshavedamsa (D45) - Specific Endpoint
    
    const [planetsRes, panchangRes, extendedRes, navamsaRes, horaRes, d4Res, d5Res, d6Res, d7Res, d10Res, d11Res, d12Res, d16Res, d20Res, d24Res, d27Res, d30Res, d40Res, d45Res, d60Res] = await Promise.all([
      fetch(`${BASE_URL}/planets`, { method: 'POST', headers, body: JSON.stringify(payload) }),
      fetch(`${BASE_URL}/complete-panchang`, { method: 'POST', headers, body: JSON.stringify(payload) }),
      fetch(`${BASE_URL}/planets/extended`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/navamsa-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d2-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d4-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d5-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d6-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d7-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d10-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d11-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d12-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d16-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d20-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d24-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d27-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d30-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
      fetch(`${BASE_URL}/d40-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
  fetch(`${BASE_URL}/d45-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null),
  fetch(`${BASE_URL}/d60-chart-info`, { method: 'POST', headers, body: JSON.stringify(payload) }).catch(() => null)
]);

    if (!planetsRes.ok) throw new Error(`Planets API failed: ${planetsRes.statusText}`);
    
    const planetsData = await planetsRes.json();
    const panchangData = panchangRes.ok ? await panchangRes.json() : null;
    const extendedData = (extendedRes && extendedRes.ok) ? await extendedRes.json() : [];

    // Fetch Divisional Charts (D-Charts)
    // We fetch these in parallel but handle failures gracefully as they might be tier-restricted
    const dChartPromises = CHART_IDS.map(async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/horo_chart/${id}`, { 
                method: 'POST', 
                headers, 
                body: JSON.stringify(payload) 
            });
            if (!res.ok) return { id, data: null };
            const data = await res.json();
            return { id, data };
        } catch (e) {
            return { id, data: null };
        }
    });

    const dChartsResults = await Promise.all(dChartPromises);
    const divisionalCharts: Record<string, any[]> = {}; // Store raw planet list for each chart
    
    // Process Navamsa separately
    if (navamsaRes && navamsaRes.ok) {
        const navData = await navamsaRes.json();
        if (navData.output) {
             // Flatten the object structure {"0": {...}, "1": {...}}
             const navList = Object.values(navData.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D9'] = navList;
        }
    }

    // Process Hora (D2) separately
    if (horaRes && horaRes.ok) {
        const horaData = await horaRes.json();
        if (horaData.output) {
             const horaList = Object.values(horaData.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D2'] = horaList;
        }
    }

    // Process Chaturthamsa (D4) separately
    if (d4Res && d4Res.ok) {
        const d4Data = await d4Res.json();
        if (d4Data.output) {
             const d4List = Object.values(d4Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D4'] = d4List;
        }
    }

    // Process Panchamsa (D5) separately
    if (d5Res && d5Res.ok) {
        const d5Data = await d5Res.json();
        if (d5Data.output) {
             const d5List = Object.values(d5Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D5'] = d5List;
        }
    }

    // Process Shasthamsa (D6) separately
    if (d6Res && d6Res.ok) {
        const d6Data = await d6Res.json();
        if (d6Data.output) {
             const d6List = Object.values(d6Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D6'] = d6List;
        }
    }

    // Process Saptamsa (D7) separately
    if (d7Res && d7Res.ok) {
        const d7Data = await d7Res.json();
        if (d7Data.output) {
             const d7List = Object.values(d7Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D7'] = d7List;
        }
    }

    // Process Dasamsa (D10) separately
    if (d10Res && d10Res.ok) {
        const d10Data = await d10Res.json();
        if (d10Data.output) {
             const d10List = Object.values(d10Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D10'] = d10List;
        }
    }

    // Process Rudramsa (D11) separately
    if (d11Res && d11Res.ok) {
        const d11Data = await d11Res.json();
        if (d11Data.output) {
             const d11List = Object.values(d11Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D11'] = d11List;
        }
    }

    // Process Dwadasamsa (D12) separately
    if (d12Res && d12Res.ok) {
        const d12Data = await d12Res.json();
        if (d12Data.output) {
             const d12List = Object.values(d12Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D12'] = d12List;
        }
    }

    // Process Shodasamsa (D16) separately
    if (d16Res && d16Res.ok) {
        const d16Data = await d16Res.json();
        if (d16Data.output) {
             const d16List = Object.values(d16Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D16'] = d16List;
        }
    }

    // Process Vimsamsa (D20) separately
    if (d20Res && d20Res.ok) {
        const d20Data = await d20Res.json();
        if (d20Data.output) {
             const d20List = Object.values(d20Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D20'] = d20List;
        }
    }

    // Process Siddhamsa (D24) separately
    if (d24Res && d24Res.ok) {
        const d24Data = await d24Res.json();
        if (d24Data.output) {
             const d24List = Object.values(d24Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D24'] = d24List;
        }
    }

    // Process Nakshatramsa (D27) separately
    if (d27Res && d27Res.ok) {
        const d27Data = await d27Res.json();
        if (d27Data.output) {
             const d27List = Object.values(d27Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D27'] = d27List;
        }
    }

    // Process Trimsamsa (D30) separately
    if (d30Res && d30Res.ok) {
        const d30Data = await d30Res.json();
        if (d30Data.output) {
             const d30List = Object.values(d30Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D30'] = d30List;
        }
    }

    // Process Khavedamsa (D40) separately
    if (d40Res && d40Res.ok) {
        const d40Data = await d40Res.json();
        if (d40Data.output) {
             const d40List = Object.values(d40Data.output).map((p: any) => ({
                 name: p.name,
                 current_sign: p.current_sign,
                 sign: getSignName(p.current_sign),
                 house: p.house_number,
                 isRetro: p.isRetro
             }));
             divisionalCharts['D40'] = d40List;
        }
    }

    // Process Akshavedamsa (D45) separately
    if (d45Res && d45Res.ok) {
        const d45Data = await d45Res.json();
        if (d45Data.output) {
      const d45List = Object.values(d45Data.output).map((p: any) => ({
        name: p.name,
        current_sign: p.current_sign,
        sign: getSignName(p.current_sign),
        house: p.house_number,
        isRetro: p.isRetro
      }));
      divisionalCharts['D45'] = d45List;
    }
  }

  // Process Shashtiamsa (D60) separately
  if (d60Res && d60Res.ok) {
    const d60Data = await d60Res.json();
    if (d60Data.output) {
      const d60List = Object.values(d60Data.output).map((p: any) => ({
        name: p.name,
        current_sign: p.current_sign,
        sign: getSignName(p.current_sign),
        house: p.house_number,
        isRetro: p.isRetro
      }));
      divisionalCharts['D60'] = d60List;
    }
  }

    dChartsResults.forEach(r => {
        if (r.data && r.data.output) {
             // Adapt based on actual response structure of horo_chart
             // Usually it returns a list of planets in that chart
             divisionalCharts[r.id] = r.data.output; 
        }
    });

    // Process Planets Data to match AstroData interface
    // The /planets endpoint returns a structure like:
    // "output": [ { "0": {name: "Ascendant"...}, "1": {name: "Sun"...} } ]
    
    let basicPlanetsList: any[] = [];
    if (Array.isArray(planetsData.output)) {
        basicPlanetsList = planetsData.output.flatMap((item: any) => {
            // If item has numerical keys "0", "1", etc., extract values
            if (item["0"]) return Object.values(item);
            return item;
        });
    }

    // Helper to normalize planet names (e.g., "Sun" vs "SUN")
    const normalizeName = (n: string) => n.toLowerCase();

    // Merge Basic and Extended Data
    // Extended data is preferred because it has more fields (Nakshatra, etc.)
    // But Basic data is more reliable for core positions if extended fails.
    
    // Parse Extended Response
    // The structure is { "output": { "Ascendant": {...}, "Sun": {...} } }
    let extendedList: any[] = [];
    if (extendedData && extendedData.output) {
         // Convert dictionary to array
         extendedList = Object.entries(extendedData.output).map(([key, val]: [string, any]) => ({
             name: key, // Use key as name (e.g., "Sun")
             ...val
         }));
    } else if (Array.isArray(extendedData)) {
         extendedList = extendedData;
    }
    
    // Create a unified map of planets
    const planetMap: Record<string, any> = {};

    // 1. Populate from Basic
    basicPlanetsList.forEach(p => {
        if (p.name) planetMap[normalizeName(p.name)] = {
            ...p,
            sign: getSignName(p.current_sign || p.sign) // Handle both formats
        };
    });

    // 2. Override/Enrich with Extended
    extendedList.forEach(p => {
        // Extended payload uses "name" or key
        const pName = p.localized_name || p.name;
        if (pName) {
            const key = normalizeName(pName);
            planetMap[key] = {
                ...planetMap[key],
                ...p,
                name: pName,
                // Map Extended fields to Standard fields
                sign: p.zodiac_sign_name || p.sign || planetMap[key]?.sign,
                signLord: p.zodiac_sign_lord || p.signLord,
                nakshatra: p.nakshatra_name || p.nakshatra,
                nakshatraLord: p.nakshatra_vimsottari_lord || p.nakshatraLord,
                nakshatra_pad: p.nakshatra_pada || p.nakshatra_pad,
                house: p.house_number || p.house
            };
        }
    });

    const getPlanet = (name: string) => planetMap[normalizeName(name)] || {};
    
    const ascendant = getPlanet("Ascendant");
    const moon = getPlanet("Moon");

    // Map to AstroData
    return {
        ascendant: ascendant.sign || 'Unknown',
        moonSign: moon.sign || 'Unknown',
        // Nakshatra might come from Extended Planet (moon) or Panchang
        moonNakshatra: moon.nakshatra || panchangData?.nakshatra?.details?.nak_name || 'Unknown',
        
        // Dasha is not directly available in free tier endpoints found, using placeholder or derived if possible
        currentMahadasha: 'Unknown', 
        currentAntardasha: 'Unknown',
        
        planetaryPositions: Object.values(planetMap).reduce((acc: Record<string, string>, p: any) => {
          if (p.name) acc[p.name] = p.sign;
          return acc;
        }, {}),
        
        strength: null, 
        yogas: [], 
        panchang: panchangData,
        
        // Extended Data
        extendedPlanets: Object.values(planetMap), // Returns the merged rich objects
        divisionalCharts: divisionalCharts,

        timezone: geo.timezoneId,
        timezoneOffset: timezone
    };

  } catch (error) {
    console.error("Astrology Data Fetch Error:", error);
    throw error; // Propagate error to UI
  }
}