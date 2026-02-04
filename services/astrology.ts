import { AstroData } from '../types';

const BASE_URL = import.meta.env.VITE_ASTROLOGY_API_URL || 'https://api.freeastrologyapi.com/api/v1';
const API_KEY = import.meta.env.VITE_ASTROLOGY_API_KEY;

/**
 * Fetches chart data. 
 * Tries to use the real API if a key is present, otherwise falls back to deterministic mock data.
 */
export async function fetchAstrologyData(
  date: string, 
  time: string, 
  place: string
): Promise<AstroData> {
  
  // Prepare payload for the API
  const payload = {
    day: new Date(date).getDate(),
    month: new Date(date).getMonth() + 1,
    year: new Date(date).getFullYear(),
    hour: parseInt(time.split(':')[0] || '12'),
    min: parseInt(time.split(':')[1] || '00'),
    lat: 28.6139, // Mock lat/long for "Place" logic if not geocoded
    lon: 77.2090,
    tzone: 5.5
  };

  try {
    if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY') {
       throw new Error("Missing Astrology API Key. Please configure VITE_ASTROLOGY_API_KEY.");
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    };

    const [chartRes, dashaRes, strengthRes, yogasRes, panchangRes] = await Promise.all([
      fetch(`${BASE_URL}/vedic/chart`, { method: 'POST', headers, body: JSON.stringify(payload) }),
      fetch(`${BASE_URL}/vedic/dasha`, { method: 'POST', headers, body: JSON.stringify(payload) }),
      fetch(`${BASE_URL}/vedic/strength`, { method: 'POST', headers, body: JSON.stringify(payload) }),
      fetch(`${BASE_URL}/vedic/yogas`, { method: 'POST', headers, body: JSON.stringify(payload) }),
      fetch(`${BASE_URL}/vedic/panchang`, { method: 'POST', headers, body: JSON.stringify(payload) })
    ]);

    if (!chartRes.ok) throw new Error(`Chart API failed: ${chartRes.statusText}`);
    if (!dashaRes.ok) throw new Error(`Dasha API failed: ${dashaRes.statusText}`);

    const chart = await chartRes.json();
    const dasha = await dashaRes.json();
    
    // Optional data - handle gracefully if they fail, but don't mock
    const strength = strengthRes.ok ? await strengthRes.json() : null;
    const yogas = yogasRes.ok ? await yogasRes.json() : null;
    const panchang = panchangRes.ok ? await panchangRes.json() : null;

    // Map API response to AstroData
    return {
        ascendant: chart.ascendant_sign || chart.ascendant || 'Unknown',
        moonSign: chart.planets?.Moon?.sign || chart.sign || 'Unknown',
        moonNakshatra: chart.planets?.Moon?.nakshatra || 'Unknown',
        currentMahadasha: dasha.mahadasha?.[0]?.planet || 'Unknown', 
        currentAntardasha: dasha.antardasha?.[0]?.planet || 'Unknown',
        planetaryPositions: Object.entries(chart.planets || {}).reduce((acc: Record<string, string>, [planet, data]: [string, any]) => {
          acc[planet] = data.sign;
          return acc;
        }, {}),
        strength,
        yogas: yogas ? (Array.isArray(yogas) ? yogas : (yogas.yogas || [])) : [],
        panchang
    };

  } catch (error) {
    console.error("Astrology Data Fetch Error:", error);
    throw error; // Propagate error to UI
  }
}