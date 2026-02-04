import React from 'react';
import { Layout, Card, Badge } from '../components/UI';
import { Screen, NavProps } from '../types';
import { Sparkles, Activity, Heart, Briefcase, DollarSign, Zap, Clock, AlertCircle } from 'lucide-react';

// Shared Detail Wrapper for consistency
const DetailWrapper: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onBack: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, onBack, children }) => (
  <Layout showBack onBack={onBack}>
    <div className="mb-6 flex items-start gap-4">
      {icon && <div className="p-3 bg-white rounded-2xl shadow-sm border border-primary/10 text-primary">{icon}</div>}
      <div>
        <h1 className="font-serif text-3xl text-primary">{title}</h1>
        {subtitle && <p className="text-primary/60 text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </Layout>
);

export const LagnaDetailScreen: React.FC<NavProps> = ({ setScreen, birthPrecision, userProfile }) => {
  if (birthPrecision !== 'Exact') {
    return (
        <DetailWrapper title="Ascendant" subtitle="Birth Time Required" icon={<AlertCircle />} onBack={() => setScreen(Screen.Home)}>
            <Card>
                <p className="text-sm text-primary/80 leading-relaxed mb-4">
                    Your Lagna cannot be safely determined without time.
                </p>
                <p className="text-sm text-primary/80 leading-relaxed">
                    We’re focusing on stable patterns (Moon, life phase).
                </p>
            </Card>
        </DetailWrapper>
    )
  }
  return (
    <DetailWrapper title={`${userProfile.astroData?.ascendant} Ascendant`} subtitle="Your Core Self" icon={<Sparkles />} onBack={() => setScreen(Screen.Home)}>
        <Card>
        <h3 className="font-serif text-lg mb-3">{userProfile.aiInsights?.lagnaAnalysis.headline || "The Pattern"}</h3>
        <p className="text-sm text-primary/80 leading-relaxed mb-4">
            {userProfile.aiInsights?.lagnaAnalysis.content || "Loading your pattern analysis..."}
        </p>
        
        {userProfile.astroData?.timezone && (
           <div className="pt-4 border-t border-primary/5 mt-2">
             <p className="text-[10px] text-primary/40 uppercase tracking-widest">Calculation Context</p>
             <p className="text-xs text-primary/60 font-mono mt-1">
               Timezone: {userProfile.astroData.timezone} (GMT {userProfile.astroData.timezoneOffset && userProfile.astroData.timezoneOffset > 0 ? '+' : ''}{userProfile.astroData.timezoneOffset})
             </p>
           </div>
        )}
        </Card>
    </DetailWrapper>
  );
};

export const MoonDetailScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => (
  <DetailWrapper title={`${userProfile.astroData?.moonSign} Moon`} subtitle="Your Emotional Landscape" icon={<Activity />} onBack={() => setScreen(Screen.Home)}>
    <Card>
      <h3 className="font-serif text-lg mb-3">{userProfile.aiInsights?.moonAnalysis.headline || "Emotional Core"}</h3>
      <p className="text-sm text-primary/80 leading-relaxed mb-4">
         {userProfile.aiInsights?.moonAnalysis.content}
      </p>
      <div className="flex gap-2">
         <Badge active>{userProfile.aiInsights?.moonAnalysis.tone || "Reflective"}</Badge>
      </div>
    </Card>
    <Card onClick={() => setScreen(Screen.MoonNakshatra)} className="cursor-pointer hover:bg-white/50">
       <div className="flex justify-between items-center">
          <span className="text-sm font-medium">View {userProfile.astroData?.moonNakshatra} Pattern</span>
          <span className="text-lg">→</span>
       </div>
    </Card>
  </DetailWrapper>
);

export const MoonNakshatraScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => (
  <DetailWrapper title={`${userProfile.astroData?.moonNakshatra} Nakshatra`} subtitle="Inner Pattern" onBack={() => setScreen(Screen.MoonDetail)}>
    <Card className="bg-white">
      <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-4">Core Tendency</h3>
      <p className="text-sm text-primary/80 mb-6">{userProfile.aiInsights?.moonAnalysis.nakshatraContent || "Loading Nakshatra details..."}</p>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <h4 className="text-xs font-bold uppercase tracking-widest text-green-700 mb-2">When Balanced</h4>
            <p className="text-sm text-green-800">Intuitive, nourishing, and emotionally connected.</p>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-700 mb-2">When Disturbed</h4>
            <p className="text-sm text-red-800">Overly sensitive, moody, or withdrawn.</p>
        </div>
      </div>
    </Card>
  </DetailWrapper>
);

export const DashaOverviewScreen: React.FC<NavProps> = ({ setScreen, birthPrecision, userProfile }) => (
  <DetailWrapper title={birthPrecision === 'Exact' ? `${userProfile.astroData?.currentMahadasha} Mahadasha` : "Growth Phase"} subtitle="Current Life Cycle" icon={<Clock size={24}/>} onBack={() => setScreen(Screen.Home)}>
    <Card className="bg-secondary/5 border-secondary/20">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-secondary">Current Phase</span>
      </div>
      <p className="text-lg font-serif mb-2">{userProfile.aiInsights?.lifePhaseAnalysis.headline}</p>
      <p className="text-sm text-primary/80 leading-relaxed">
        {userProfile.aiInsights?.lifePhaseAnalysis.description}
      </p>
    </Card>

    <div>
       <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-3 pl-1">Current Sub-Period (Antardasha)</h3>
       <Card>
         <div className="flex justify-between mb-2">
            <span className="font-medium">{userProfile.astroData?.currentAntardasha} Sub-period</span>
         </div>
         <p className="text-sm text-primary/70">
           This specific window brings a nuance to your current phase.
         </p>
       </Card>
    </div>
  </DetailWrapper>
);

export const LifeAreasSnapshotScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => (
  <Layout title="Life Areas" showBack onBack={() => setScreen(Screen.Home)}>
     <div className="grid grid-cols-2 gap-4 mt-4">
        <Card onClick={() => setScreen(Screen.CareerInsight)} className="flex flex-col gap-4 items-center text-center hover:bg-white transition-colors cursor-pointer">
           <Briefcase className="text-primary/60" />
           <div>
             <h3 className="font-serif text-lg">Career</h3>
             <p className="text-xs text-secondary mt-1">{userProfile.aiInsights?.lifeAreas.career.status}</p>
           </div>
        </Card>
        <Card onClick={() => setScreen(Screen.WealthInsight)} className="flex flex-col gap-4 items-center text-center hover:bg-white transition-colors cursor-pointer">
           <DollarSign className="text-primary/60" />
           <div>
             <h3 className="font-serif text-lg">Wealth</h3>
             <p className="text-xs text-primary/40 mt-1">{userProfile.aiInsights?.lifeAreas.wealth.status}</p>
           </div>
        </Card>
        <Card onClick={() => setScreen(Screen.RelationshipInsight)} className="flex flex-col gap-4 items-center text-center hover:bg-white transition-colors cursor-pointer">
           <Heart className="text-primary/60" />
           <div>
             <h3 className="font-serif text-lg">Relations</h3>
             <p className="text-xs text-primary/40 mt-1">{userProfile.aiInsights?.lifeAreas.relationships.status}</p>
           </div>
        </Card>
        <Card onClick={() => setScreen(Screen.HealthEnergy)} className="flex flex-col gap-4 items-center text-center hover:bg-white transition-colors cursor-pointer">
           <Zap className="text-primary/60" />
           <div>
             <h3 className="font-serif text-lg">Energy</h3>
             <p className="text-xs text-primary/40 mt-1">{userProfile.aiInsights?.lifeAreas.energy.status}</p>
           </div>
        </Card>
     </div>
  </Layout>
);

export const CareerInsightScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => (
  <DetailWrapper title="Career Insight" subtitle="Work & Purpose" onBack={() => setScreen(Screen.LifeAreasSnapshot)}>
    <Card className="border-l-4 border-l-secondary">
      <h3 className="font-medium mb-2">Current Tone</h3>
      <p className="text-sm text-primary/80 leading-relaxed">
        {userProfile.aiInsights?.lifeAreas.career.insight}
      </p>
    </Card>
  </DetailWrapper>
);

export const WealthInsightScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => (
    <DetailWrapper title="Wealth Insight" subtitle="Flow & Stability" onBack={() => setScreen(Screen.LifeAreasSnapshot)}>
      <Card>
        <p className="text-sm text-primary/80">
          {userProfile.aiInsights?.lifeAreas.wealth.insight}
        </p>
      </Card>
    </DetailWrapper>
);

export const RelationshipInsightScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => (
    <DetailWrapper title="Relations" subtitle="Connection & Empathy" onBack={() => setScreen(Screen.LifeAreasSnapshot)}>
      <Card>
        <p className="text-sm text-primary/80">
          {userProfile.aiInsights?.lifeAreas.relationships.insight}
        </p>
      </Card>
    </DetailWrapper>
);

export const HealthEnergyScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => (
    <DetailWrapper title="Health & Energy" subtitle="Vitality Rhythms" onBack={() => setScreen(Screen.LifeAreasSnapshot)}>
      <Card>
        <p className="text-sm text-primary/80">
          {userProfile.aiInsights?.lifeAreas.energy.insight}
        </p>
      </Card>
    </DetailWrapper>
);

// Generic placeholder for Screen 11 (Current Phase) - often accessed via Home
export const CurrentLifePhaseScreen: React.FC<NavProps> = ({ setScreen, birthPrecision, userProfile }) => (
   <DashaOverviewScreen setScreen={setScreen} currentScreen={Screen.CurrentLifePhase} birthPrecision={birthPrecision} setBirthPrecision={() => {}} userProfile={userProfile} updateUserProfile={() => {}} />
);