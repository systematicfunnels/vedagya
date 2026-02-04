import React from 'react';
import { Layout, Card, Badge, Input } from '../components/UI';
import { Screen, NavProps } from '../types';
import { Search, Sun, Moon, Clock, Compass, ChevronRight, Lock, User, Bell, BookOpen, LogOut, Sparkles } from 'lucide-react';

// Screen 7: Home
export const HomeScreen: React.FC<NavProps> = ({ setScreen, birthPrecision, userProfile }) => {
  
  const hasChart = birthPrecision === 'Exact';
  const hasMoon = birthPrecision === 'Exact' || birthPrecision === 'Approximate' || birthPrecision === 'DateOnly';
  const userName = userProfile.name.split(' ')[0] || 'Guest';
  
  // Use AI insights or Fallbacks
  const insights = userProfile.aiInsights;
  const astro = userProfile.astroData;

  return (
    <Layout showMenu onMenu={() => setScreen(Screen.MenuNotifications)}>
      <div className="space-y-6">
        <div className="mb-2">
          <h1 className="font-serif text-3xl text-primary">Good evening, {userName}</h1>
          <p className="text-primary/60 text-sm mt-1">Ready to reflect on your day?</p>
        </div>

        {/* Search Bar */}
        <div 
          onClick={() => setScreen(Screen.AskVedAgyaEntry)}
          className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3.5 flex items-center gap-3 text-primary/40 cursor-pointer hover:border-primary/30 transition-colors shadow-sm"
        >
          <Search size={18} />
          <span className="text-sm">What is on your mind?</span>
        </div>

        {/* Dynamic Section: Blueprint / Patterns */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary/40">
                {hasChart ? 'Your Blueprint' : 'Personal Patterns'}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Lagna Card - Only if Exact Time */}
            {hasChart ? (
              <Card onClick={() => setScreen(Screen.LagnaDetail)} className="flex flex-col gap-3 hover:bg-white/60">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Sun size={16} />
                </div>
                <div>
                  <p className="text-xs text-primary/50 mb-1">Ascendant (Lagna)</p>
                  <p className="font-serif text-lg">{astro?.ascendant || '—'}</p>
                </div>
              </Card>
            ) : (
               <Card className="flex flex-col gap-3 hover:bg-white/60">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs text-primary/50 mb-1">Core Focus</p>
                  <p className="font-serif text-lg">{insights?.lagnaAnalysis?.headline || "—"}</p>
                </div>
              </Card>
            )}

            {/* Moon Card - Only if Date exists */}
            {hasMoon ? (
              <Card onClick={() => setScreen(Screen.MoonDetail)} className="flex flex-col gap-3 hover:bg-white/60">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Moon size={16} />
                </div>
                <div>
                  <p className="text-xs text-primary/50 mb-1">Moon Sign</p>
                  <p className="font-serif text-lg">{astro?.moonSign || '—'}</p>
                </div>
              </Card>
            ) : (
               <Card className="flex flex-col gap-3 hover:bg-white/60">
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Moon size={16} />
                </div>
                <div>
                  <p className="text-xs text-primary/50 mb-1">Emotional Style</p>
                  <p className="font-serif text-lg">{insights?.moonAnalysis?.tone || "—"}</p>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Active Time Period */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary/40">Current Timing</h2>
          </div>
          <Card onClick={() => setScreen(Screen.DashaOverview)} className="relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-secondary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-secondary" />
                <span className="text-xs font-medium text-secondary">
                    {hasChart ? 'MAHADASHA' : 'LIFE PHASE'}
                </span>
              </div>
              <h3 className="font-serif text-2xl mb-1">{insights?.lifePhaseAnalysis?.headline || "Growth Phase"}</h3>
              <p className="text-sm text-primary/70 mb-4 line-clamp-2">
                {insights?.lifePhaseAnalysis?.description || "A period of expansion, learning, and finding deeper meaning in your daily routines."}
              </p>
              <div className="flex items-center text-primary font-medium text-xs">
                Explore Timeline <ChevronRight size={14} className="ml-1" />
              </div>
            </div>
          </Card>
        </section>

        {/* Life Areas - Populated by AI */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary/40">Life Areas</h2>
          </div>
          <div className="space-y-3">
            <Card onClick={() => setScreen(Screen.LifeAreasSnapshot)} className="flex items-center justify-between py-4">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/5 rounded-lg"><Compass size={20} className="text-primary/70"/></div>
                  <div>
                    <h4 className="font-medium text-sm">Career & Purpose</h4>
                    <p className="text-xs text-primary/50">{insights?.lifeAreas?.career?.insight || "High activity phase"}</p>
                  </div>
               </div>
               <Badge active>{insights?.lifeAreas?.career?.status || "Active"}</Badge>
            </Card>
            <Card onClick={() => setScreen(Screen.RelationshipInsight)} className="flex items-center justify-between py-4">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/5 rounded-lg"><User size={20} className="text-primary/70"/></div>
                  <div>
                    <h4 className="font-medium text-sm">Relationships</h4>
                    <p className="text-xs text-primary/50">{insights?.lifeAreas?.relationships?.insight || "Requires patience"}</p>
                  </div>
               </div>
               <Badge>{insights?.lifeAreas?.relationships?.status || "Sensitive"}</Badge>
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
};

// Screen 20: Reports Library
export const ReportsLibraryScreen: React.FC<NavProps> = ({ setScreen, birthPrecision }) => (
  <Layout title="Library" showBack onBack={() => setScreen(Screen.Home)}>
    <div className="space-y-6">
       <Input placeholder="Search reports..." />
       
       <div className="grid gap-4">
         {birthPrecision === 'Exact' && (
            <Card className="relative overflow-hidden">
                <div className="absolute top-4 right-4"><Badge active>Free</Badge></div>
                <h3 className="font-serif text-xl mb-2 pr-12">Your Birth Chart Essence</h3>
                <p className="text-sm text-primary/60 mb-4">A complete breakdown of your foundational energy.</p>
                <div className="w-full h-1 bg-primary/10 rounded-full"><div className="w-full h-full bg-secondary rounded-full"></div></div>
                <p className="text-[10px] text-right mt-2 text-primary/40">Ready to view</p>
            </Card>
         )}

         <Card className="relative opacity-90">
            <div className="absolute top-4 right-4 text-primary/40"><Lock size={16} /></div>
            <h3 className="font-serif text-xl mb-2 pr-12">5-Year Career Projection</h3>
            <p className="text-sm text-primary/60 mb-4">Deep dive into professional rhythms.</p>
            <button className="text-xs font-bold text-primary border border-primary/20 px-4 py-2 rounded-lg">Unlock for $12</button>
         </Card>
         
         <Card className="relative opacity-90">
            <div className="absolute top-4 right-4 text-primary/40"><Lock size={16} /></div>
            <h3 className="font-serif text-xl mb-2 pr-12">Relationship Compatibility</h3>
            <p className="text-sm text-primary/60 mb-4">Understanding emotional overlaps.</p>
            <button className="text-xs font-bold text-primary border border-primary/20 px-4 py-2 rounded-lg">Unlock for $12</button>
         </Card>
       </div>
    </div>
  </Layout>
);

// Screen 21: Menu
export const MenuScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => (
  <Layout showBack onBack={() => setScreen(Screen.Home)}>
    <div className="flex flex-col items-center mb-8 pt-4">
      <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-serif text-3xl mb-4 shadow-xl shadow-primary/20">
        {userProfile.name ? userProfile.name[0] : 'G'}
      </div>
      <h2 className="font-serif text-2xl">{userProfile.name || 'Guest User'}</h2>
      <p className="text-sm text-primary/50">{userProfile.astroData?.ascendant} Ascendant • {userProfile.astroData?.moonSign} Moon</p>
    </div>

    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-4 pl-2">Notifications</h3>
        <Card className="mb-3 py-4 flex gap-4 items-start">
           <div className="mt-1 w-2 h-2 rounded-full bg-secondary shrink-0"></div>
           <div>
             <p className="text-sm font-medium">Phase Shift Alert</p>
             <p className="text-xs text-primary/60 mt-1">You are entering a {userProfile.astroData?.currentAntardasha} Antardasha next week. Expect a shift in perspective.</p>
           </div>
        </Card>
        <Card className="py-4 flex gap-4 items-start">
           <div className="mt-1 w-2 h-2 rounded-full bg-primary/20 shrink-0"></div>
           <div>
             <p className="text-sm font-medium">Self-Check Nudge</p>
             <p className="text-xs text-primary/60 mt-1">Moon is transiting your 8th house. You might feel more introverted today.</p>
           </div>
        </Card>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-2 pl-2">Account</h3>
        <div className="bg-white rounded-2xl overflow-hidden border border-primary/5">
          <button onClick={() => setScreen(Screen.ReportsLibrary)} className="w-full px-6 py-4 text-left text-sm flex items-center justify-between border-b border-primary/5 hover:bg-primary/5">
            <span className="flex items-center gap-3"><BookOpen size={18} className="text-primary/60"/> Library</span>
            <ChevronRight size={16} className="text-primary/30"/>
          </button>
          <button className="w-full px-6 py-4 text-left text-sm flex items-center justify-between border-b border-primary/5 hover:bg-primary/5">
             <span className="flex items-center gap-3"><Bell size={18} className="text-primary/60"/> Settings</span>
             <ChevronRight size={16} className="text-primary/30"/>
          </button>
          <button onClick={() => setScreen(Screen.Splash)} className="w-full px-6 py-4 text-left text-sm flex items-center justify-between text-red-400 hover:bg-red-50">
             <span className="flex items-center gap-3"><LogOut size={18} /> Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </Layout>
);