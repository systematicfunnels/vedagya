export enum Screen {
  Splash = 'Splash',
  Login = 'Login',
  // Onboarding Flow
  BirthDateQuestion = 'BirthDateQuestion', // Do you know date?
  BirthDateInput = 'BirthDateInput',       // Enter Date + Place
  BirthTimeQuestion = 'BirthTimeQuestion', // Do you know time?
  BirthTimeInput = 'BirthTimeInput',       // Enter Exact Time
  BirthTimeConfidence = 'BirthTimeConfidence', // Morning/Evening etc
  NoDateAge = 'NoDateAge',                 // Age input for no date
  LifeEventsQA = 'LifeEventsQA',           // Tuning for No Time
  PatternQuestionnaire = 'PatternQuestionnaire', // For No Date
  
  PersonalDetails = 'PersonalDetails',
  InterestSelection = 'InterestSelection',
  Processing = 'Processing',
  
  // Core
  Home = 'Home',
  ReportsLibrary = 'ReportsLibrary',
  MenuNotifications = 'MenuNotifications',
  
  // Details
  LagnaDetail = 'LagnaDetail',
  MoonDetail = 'MoonDetail',
  MoonNakshatra = 'MoonNakshatra',
  CurrentLifePhase = 'CurrentLifePhase',
  DashaOverview = 'DashaOverview',
  LifeAreasSnapshot = 'LifeAreasSnapshot',
  CareerInsight = 'CareerInsight',
  WealthInsight = 'WealthInsight',
  RelationshipInsight = 'RelationshipInsight',
  HealthEnergy = 'HealthEnergy',
  
  // Tools
  AskVedAgyaEntry = 'AskVedAgyaEntry',
  AskVedAgyaResponse = 'AskVedAgyaResponse',
}

export type BirthPrecision = 'Exact' | 'Approximate' | 'DateOnly' | 'None';

export interface AstroData {
  ascendant: string;
  moonSign: string;
  moonNakshatra: string;
  currentMahadasha: string;
  currentAntardasha: string;
  planetaryPositions: Record<string, string>; // e.g., Sun: 'Leo'
  
  // New fields for v1
  strength?: any; // Result from /vedic/strength
  yogas?: string[]; // Result from /vedic/yogas (extracted names)
  panchang?: any; // Result from /vedic/panchang
  
  // Debug/Confirmation
  timezone?: string;
  timezoneOffset?: number;
}

export interface AiInsights {
  lagnaAnalysis: {
    headline: string;
    content: string;
  };
  moonAnalysis: {
    headline: string;
    tone: string; // e.g., "Reflective", "Intense"
    content: string;
    nakshatraContent: string;
  };
  lifePhaseAnalysis: {
    headline: string; // e.g., "Jupiter Phase"
    theme: string; // e.g., "Expansion & Wisdom"
    description: string;
  };
  lifeAreas: {
    career: { status: 'Active' | 'Stable' | 'Sensitive'; insight: string };
    wealth: { status: 'Active' | 'Stable' | 'Sensitive'; insight: string };
    relationships: { status: 'Active' | 'Stable' | 'Sensitive'; insight: string };
    energy: { status: 'High' | 'Moderate' | 'Low'; insight: string };
  };
}

export interface UserProfile {
  name: string;
  gender: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  age: string;
  birthPrecision: BirthPrecision;
  interests: string[];
  questionnaireAnswers: Record<string, any>;
  
  // Data from Astro API
  astroData: AstroData | null;
  
  // Generated Content from AI
  aiInsights: AiInsights | null;
  
  // Live Tracking
  currentLocation?: { lat: number; lng: number } | null;
  currentTimezone?: string;
}

export interface NavProps {
  setScreen: (screen: Screen) => void;
  currentScreen: Screen;
  birthPrecision: BirthPrecision;
  setBirthPrecision: (p: BirthPrecision) => void;
  userProfile: UserProfile;
  updateUserProfile: (data: Partial<UserProfile>) => void;
}