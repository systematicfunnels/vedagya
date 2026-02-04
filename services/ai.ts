import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AstroData, AiInsights } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const VEDAGYA_SYSTEM_INSTRUCTION = `
You are VedAgya, a Vedic astrology engine focused on explaining life patterns, emotional phases, and timing logic.
You are NOT a fortune teller. 
Tone: Calm, intelligent, emotionally safe, modern, minimal.
Rules:
1. Avoid drama, fear-mongering, or definitive predictions (e.g., "You will get married").
2. Use phrasing like "Energy is focused on...", "You may feel...", "This phase reflects...".
3. Focus on psychological and developmental archetypes (e.g., Saturn is "discipline/structure", not "bad luck").
`;

// Schema for structured insight generation
const InsightsSchema = {
  type: Type.OBJECT,
  properties: {
    lagnaAnalysis: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        content: { type: Type.STRING, description: "2-3 sentences on how they approach life based on Ascendant." }
      }
    },
    moonAnalysis: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        tone: { type: Type.STRING },
        content: { type: Type.STRING, description: "Emotional baseline description." },
        nakshatraContent: { type: Type.STRING, description: "Inner behavioral pattern when balanced vs disturbed." }
      }
    },
    lifePhaseAnalysis: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING, description: "Name of the phase, e.g. Jupiter Phase" },
        theme: { type: Type.STRING },
        description: { type: Type.STRING, description: "What this time period is about developmentally." }
      }
    },
    lifeAreas: {
      type: Type.OBJECT,
      properties: {
        career: { 
            type: Type.OBJECT, 
            properties: { 
                status: { type: Type.STRING, enum: ["Active", "Stable", "Sensitive"] },
                insight: { type: Type.STRING }
            } 
        },
        wealth: { 
            type: Type.OBJECT, 
            properties: { 
                status: { type: Type.STRING, enum: ["Active", "Stable", "Sensitive"] },
                insight: { type: Type.STRING }
            } 
        },
        relationships: { 
            type: Type.OBJECT, 
            properties: { 
                status: { type: Type.STRING, enum: ["Active", "Stable", "Sensitive"] },
                insight: { type: Type.STRING }
            } 
        },
        energy: { 
            type: Type.OBJECT, 
            properties: { 
                status: { type: Type.STRING, enum: ["High", "Moderate", "Low"] },
                insight: { type: Type.STRING }
            } 
        },
      }
    }
  }
};

export async function generateProfileInsights(userProfile: UserProfile): Promise<AiInsights> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("Missing Gemini API Key. Please configure VITE_GEMINI_API_KEY in .env.local");
  }

  const model = "gemini-2.5-flash";
  
  let promptContext = "";
  if (userProfile.birthPrecision === 'Exact' && userProfile.astroData) {
    promptContext = `
      User Data:
      Name: ${userProfile.name}
      Ascendant: ${userProfile.astroData.ascendant}
      Moon Sign: ${userProfile.astroData.moonSign}
      Moon Nakshatra: ${userProfile.astroData.moonNakshatra}
      Current Dasha: ${userProfile.astroData.currentMahadasha} / ${userProfile.astroData.currentAntardasha}
    `;
  } else {
    promptContext = `
      User Data (No Birth Time):
      Name: ${userProfile.name}
      Questionnaire Answers: ${JSON.stringify(userProfile.questionnaireAnswers)}
      Derive archetypes based on their self-reported patterns.
    `;
  }

  const response = await ai.models.generateContent({
    model: model,
    contents: `Generate a VedAgya profile insight based on this data: ${promptContext}`,
    config: {
      systemInstruction: VEDAGYA_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: InsightsSchema
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function askVedAgyaChat(question: string, userProfile: UserProfile): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("Missing Gemini API Key. Please configure VITE_GEMINI_API_KEY in .env.local");
  }

  const model = "gemini-2.5-flash";
  
  const context = userProfile.astroData 
    ? `Chart Context: Ascendant ${userProfile.astroData.ascendant}, Moon ${userProfile.astroData.moonSign}, Dasha ${userProfile.astroData.currentMahadasha}.`
    : `Chart Context: Unknown time. Basing on user reported patterns: ${JSON.stringify(userProfile.questionnaireAnswers)}`;

  const liveContext = userProfile.currentLocation 
    ? `Live Context: User is currently at Lat/Lng (${userProfile.currentLocation.lat}, ${userProfile.currentLocation.lng}) in Timezone ${userProfile.currentTimezone}.` 
    : `Live Context: Timezone ${userProfile.currentTimezone || 'Unknown'}.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: `User Question: "${question}"\n\n${context}\n${liveContext}`,
    config: {
      systemInstruction: VEDAGYA_SYSTEM_INSTRUCTION + "\nProvide a concise, 2-paragraph reflective answer. Do not give a direct Yes/No.",
    }
  });

  return response.text || "I'm processing your patterns differently today. Could you rephrase?";
}