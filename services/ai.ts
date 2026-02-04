import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AstroData, AiInsights } from "../types";

// Initialize Gemini Client Lazily
const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("Missing Gemini API Key. Please configure VITE_GEMINI_API_KEY in .env.local or Vercel Environment Variables.");
  }
  return new GoogleGenAI({ apiKey });
};

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
  let ai;
  try {
    ai = getAiClient();
  } catch (e) {
    console.warn("Gemini Client Init Failed:", e);
    // Return mock/empty or throw? 
    // Since this is critical for insights, we probably can't proceed with Gemini.
    // We could try OpenRouter here too if we implemented a fallback for insights, 
    // but for now, let's throw or return null to avoid crash loop.
    throw e;
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

  // AI Safety & Hallucination Check
  try {
      const rawData = response.text || "{}";
      const data = JSON.parse(rawData);

      // Simple Schema Validation (Hallucination Guard)
      if (!data.lagnaAnalysis || !data.moonAnalysis || !data.lifePhaseAnalysis) {
          throw new Error("AI Hallucination Detected: Missing core analysis sections.");
      }
      
      return data;
  } catch (e) {
      console.error("AI Safety Check Failed:", e);
      // Policy: Return templated response; log incident
      return {
          lagnaAnalysis: { headline: "Pattern Unclear", content: "We couldn't map your pattern securely this time. Please try again." },
          moonAnalysis: { headline: "Emotional Baseline", tone: "Neutral", content: "Analysis unavailable.", nakshatraContent: "N/A" },
          lifePhaseAnalysis: { headline: "Current Phase", theme: "Review", description: "Data momentarily unavailable." },
          lifeAreas: {
              career: { status: "Stable", insight: "Focus on current tasks." },
              wealth: { status: "Stable", insight: "Maintain balance." },
              relationships: { status: "Sensitive", insight: "Practice patience." },
              energy: { status: "Moderate", insight: "Rest well." }
          }
      };
  }
}

export async function askVedAgyaChat(question: string, userProfile: UserProfile): Promise<string> {
  let ai;
  try {
    ai = getAiClient();
  } catch (e) {
     // If Gemini Key is missing, try OpenRouter directly
     try {
        return await callOpenRouterChat(question, userProfile);
     } catch (err) {
        return "I'm unable to connect to my knowledge base right now. Please check the API configuration.";
     }
  }

  const model = "gemini-2.5-flash";
  
  const context = userProfile.astroData 
    ? `Chart Context: Ascendant ${userProfile.astroData.ascendant}, Moon ${userProfile.astroData.moonSign}, Dasha ${userProfile.astroData.currentMahadasha}.`
    : `Chart Context: Unknown time. Basing on user reported patterns: ${JSON.stringify(userProfile.questionnaireAnswers)}`;

  const liveContext = userProfile.currentLocation 
    ? `Live Context: User is currently at Lat/Lng (${userProfile.currentLocation.lat}, ${userProfile.currentLocation.lng}) in Timezone ${userProfile.currentTimezone}.` 
    : `Live Context: Timezone ${userProfile.currentTimezone || 'Unknown'}.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `User Question: "${question}"\n\n${context}\n${liveContext}`,
      config: {
        systemInstruction: VEDAGYA_SYSTEM_INSTRUCTION + "\nProvide a concise, 2-paragraph reflective answer. Do not give a direct Yes/No.",
      }
    });

    return response.text || "I'm processing your patterns differently today. Could you rephrase?";
  } catch (error) {
    console.warn("Gemini API failed, attempting OpenRouter fallback...", error);
    try {
      return await callOpenRouterChat(question, userProfile);
    } catch (orError) {
      console.error("OpenRouter fallback failed:", orError);
      return "I'm having trouble connecting to the stars right now. Please try again later.";
    }
  }
}

// OpenRouter Fallback Logic
async function callOpenRouterChat(question: string, userProfile: UserProfile): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OpenRouter API Key missing");
    }

    const context = userProfile.astroData 
      ? `Chart Context: Ascendant ${userProfile.astroData.ascendant}, Moon ${userProfile.astroData.moonSign}, Dasha ${userProfile.astroData.currentMahadasha}.`
      : `Chart Context: Unknown time. Basing on user reported patterns: ${JSON.stringify(userProfile.questionnaireAnswers)}`;

    const liveContext = userProfile.currentLocation 
      ? `Live Context: User is currently at Lat/Lng (${userProfile.currentLocation.lat}, ${userProfile.currentLocation.lng}) in Timezone ${userProfile.currentTimezone}.` 
      : `Live Context: Timezone ${userProfile.currentTimezone || 'Unknown'}.`;

    const systemPrompt = VEDAGYA_SYSTEM_INSTRUCTION + "\nProvide a concise, 2-paragraph reflective answer. Do not give a direct Yes/No.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin, // Required by OpenRouter
            "X-Title": "VedAgya"
        },
        body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free", // Using a free/reliable fallback
            "messages": [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": `User Question: "${question}"\n\n${context}\n${liveContext}` }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I couldn't interpret the pattern this time.";
}