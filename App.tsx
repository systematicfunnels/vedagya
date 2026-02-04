import React, { useState } from 'react';
import { Screen, BirthPrecision, UserProfile } from './types';
import { 
  SplashScreen, 
  LoginScreen, 
  BirthDateQuestionScreen, 
  BirthDateInputScreen, 
  BirthTimeQuestionScreen, 
  BirthTimeInputScreen, 
  BirthTimeConfidenceScreen, 
  NoDateAgeScreen,
  LifeEventsQAScreen,
  PatternQuestionnaireScreen,
  PersonalDetailsScreen, 
  InterestSelectionScreen, 
  ProcessingScreen 
} from './screens/Onboarding';
import { 
  HomeScreen, 
  ReportsLibraryScreen, 
  MenuScreen 
} from './screens/Core';
import { 
  LagnaDetailScreen, 
  MoonDetailScreen, 
  MoonNakshatraScreen, 
  DashaOverviewScreen, 
  LifeAreasSnapshotScreen, 
  CareerInsightScreen, 
  WealthInsightScreen, 
  RelationshipInsightScreen, 
  HealthEnergyScreen, 
  CurrentLifePhaseScreen 
} from './screens/Details';
import { 
  AskVedAgyaEntryScreen, 
  AskVedAgyaResponseScreen 
} from './screens/Tools';

const App: React.FC = () => {
  const [currentScreen, setScreen] = useState<Screen>(Screen.Splash);
  const [birthPrecision, setBirthPrecision] = useState<BirthPrecision>('Exact');
  
  // Initialize with empty defaults
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    gender: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    age: '',
    birthPrecision: 'Exact',
    interests: [],
    questionnaireAnswers: {},
    astroData: null,
    aiInsights: null
  });

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const props = { 
    setScreen, 
    currentScreen, 
    birthPrecision, 
    setBirthPrecision,
    userProfile,
    updateUserProfile
  };

  const renderScreen = () => {
    switch (currentScreen) {
      // Onboarding
      case Screen.Splash: return <SplashScreen {...props} />;
      case Screen.Login: return <LoginScreen {...props} />;
      
      // New Branching Flow
      case Screen.BirthDateQuestion: return <BirthDateQuestionScreen {...props} />;
      case Screen.BirthDateInput: return <BirthDateInputScreen {...props} />;
      case Screen.BirthTimeQuestion: return <BirthTimeQuestionScreen {...props} />;
      case Screen.BirthTimeInput: return <BirthTimeInputScreen {...props} />;
      case Screen.BirthTimeConfidence: return <BirthTimeConfidenceScreen {...props} />;
      case Screen.NoDateAge: return <NoDateAgeScreen {...props} />;
      case Screen.LifeEventsQA: return <LifeEventsQAScreen {...props} />;
      case Screen.PatternQuestionnaire: return <PatternQuestionnaireScreen {...props} />;

      case Screen.PersonalDetails: return <PersonalDetailsScreen {...props} />;
      case Screen.InterestSelection: return <InterestSelectionScreen {...props} />;
      case Screen.Processing: return <ProcessingScreen {...props} />;
      
      // Core
      case Screen.Home: return <HomeScreen {...props} />;
      case Screen.ReportsLibrary: return <ReportsLibraryScreen {...props} />;
      case Screen.MenuNotifications: return <MenuScreen {...props} />;
      
      // Details
      case Screen.LagnaDetail: return <LagnaDetailScreen {...props} />;
      case Screen.MoonDetail: return <MoonDetailScreen {...props} />;
      case Screen.MoonNakshatra: return <MoonNakshatraScreen {...props} />;
      case Screen.DashaOverview: return <DashaOverviewScreen {...props} />;
      case Screen.CurrentLifePhase: return <CurrentLifePhaseScreen {...props} />;
      case Screen.LifeAreasSnapshot: return <LifeAreasSnapshotScreen {...props} />;
      case Screen.CareerInsight: return <CareerInsightScreen {...props} />;
      case Screen.WealthInsight: return <WealthInsightScreen {...props} />;
      case Screen.RelationshipInsight: return <RelationshipInsightScreen {...props} />;
      case Screen.HealthEnergy: return <HealthEnergyScreen {...props} />;

      // Tools
      case Screen.AskVedAgyaEntry: return <AskVedAgyaEntryScreen {...props} />;
      case Screen.AskVedAgyaResponse: return <AskVedAgyaResponseScreen {...props} />;
      
      default: return <SplashScreen {...props} />;
    }
  };

  return (
    <div className="antialiased text-gray-900 bg-[#F5F2F9] min-h-screen font-sans">
      {renderScreen()}
    </div>
  );
};

export default App;