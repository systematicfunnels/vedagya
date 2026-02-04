import React, { useEffect, useState } from 'react';
import { Layout, Button, Input, Card } from '../components/UI';
import { Screen, NavProps } from '../types';
import { Moon, Loader2, Sparkles, Calendar, Clock, MapPin, HelpCircle, ChevronRight } from 'lucide-react';
import { fetchAstrologyData } from '../services/astrology';
import { generateProfileInsights } from '../services/ai';

// --- Shared Components ---

const QuizView: React.FC<{
  title: string;
  intro: React.ReactNode;
  questions: { question: string; options: string[] }[];
  onComplete: (answers: number[]) => void;
  onBack: () => void;
}> = ({ title, intro, questions, onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 is intro
  const [answers, setAnswers] = useState<number[]>([]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const startQuiz = () => setCurrentIndex(0);

  if (currentIndex === -1) {
    return (
      <Layout title={title} showBack onBack={onBack}>
        <div className="flex flex-col h-full justify-center">
          <div className="mb-6">{intro}</div>
          <Button onClick={startQuiz}>Start</Button>
        </div>
      </Layout>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <Layout title={title} showBack onBack={() => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
        else setCurrentIndex(-1);
    }}>
      <div className="flex flex-col h-full">
         <div className="w-full h-1 bg-primary/5 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
         </div>
         
         <div className="animate-fade-in">
           <span className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-2 block">Question {currentIndex + 1} of {questions.length}</span>
           <h2 className="font-serif text-xl mb-6 leading-relaxed">{currentQ.question}</h2>
           
           <div className="space-y-3 pb-8">
              {currentQ.options.map((opt, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full p-4 rounded-xl bg-white/50 border border-primary/10 text-left text-sm hover:bg-white hover:border-primary/30 transition-colors flex justify-between items-center group"
                >
                  <span className="text-primary/80 group-hover:text-primary">{opt}</span>
                  <ChevronRight size={16} className="text-primary/20 group-hover:text-primary/60" />
                </button>
              ))}
           </div>
         </div>
      </div>
    </Layout>
  );
};


// Screen 1: Splash
export const SplashScreen: React.FC<NavProps> = ({ setScreen }) => (
  <div onClick={() => setScreen(Screen.Login)} className="h-screen w-full flex flex-col items-center justify-center bg-primary text-white relative overflow-hidden cursor-pointer">
    <div className="absolute inset-0 opacity-10">
      <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M50 10 L90 50 L50 90 L10 50 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
      </svg>
    </div>
    <div className="z-10 flex flex-col items-center text-center px-8">
      <div className="mb-8">
         <Sparkles strokeWidth={1} size={48} className="text-secondary opacity-80" />
      </div>
      <h1 className="font-serif text-2xl mb-6 text-white/90 font-light">Astrology. But finally explained.</h1>
      <p className="font-sans text-sm text-white/60 max-w-xs leading-relaxed mb-12">
        Move beyond prediction. Understand the logic of your life patterns through Vedic wisdom.
      </p>
      <div className="w-full max-w-[200px]">
        <Button variant="secondary" onClick={() => setScreen(Screen.Login)}>Get Started</Button>
      </div>
    </div>
  </div>
);

// Screen 2: Login
export const LoginScreen: React.FC<NavProps> = ({ setScreen }) => (
  <Layout>
    <div className="flex flex-col h-full justify-center pt-10">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Moon strokeWidth={1} className="text-primary" />
        </div>
        <h2 className="font-serif text-2xl mb-2 text-primary">Welcome</h2>
        <p className="text-primary/60 text-sm">Begin your journey of self-reflection.</p>
      </div>
      <div className="space-y-2">
        <Input placeholder="Email Address" type="email" />
        <Input placeholder="Mobile Number" type="tel" />
      </div>
      <div className="mt-8">
        <Button onClick={() => setScreen(Screen.BirthDateQuestion)}>Continue</Button>
      </div>
      <p className="text-center mt-6 text-xs text-primary/40 leading-relaxed px-8">
        We respect your data privacy deeply. Your birth chart is calculated securely and never shared.
      </p>
    </div>
  </Layout>
);

// --- BRANCHING LOGIC STARTS ---

// Step 3a: Do you know Date?
export const BirthDateQuestionScreen: React.FC<NavProps> = ({ setScreen, setBirthPrecision, updateUserProfile }) => (
  <Layout title="Birth Details" showBack onBack={() => setScreen(Screen.Login)}>
    <div className="flex flex-col h-full justify-center">
      <div className="mb-8 text-center">
        <Calendar size={48} strokeWidth={1} className="text-primary/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl mb-2">Do you know your date of birth?</h2>
        <p className="text-primary/60 text-sm">The date helps us map the planetary positions at the start of your life.</p>
      </div>
      <div className="space-y-4">
        <Button onClick={() => setScreen(Screen.BirthDateInput)}>Yes, I know the exact date</Button>
        <Button variant="outline" onClick={() => {
            setBirthPrecision('None');
            updateUserProfile({ birthPrecision: 'None' });
            setScreen(Screen.NoDateAge);
        }}>I only know month & year</Button>
        <Button variant="outline" onClick={() => {
            setBirthPrecision('None');
            updateUserProfile({ birthPrecision: 'None' });
            setScreen(Screen.NoDateAge);
        }}>I know roughly my age / year</Button>
        <Button variant="outline" onClick={() => {
            setBirthPrecision('None');
            updateUserProfile({ birthPrecision: 'None' });
            setScreen(Screen.NoDateAge);
        }}>I'm not sure</Button>
      </div>
    </div>
  </Layout>
);

// Step 3b: Enter Date + Place
export const BirthDateInputScreen: React.FC<NavProps> = ({ setScreen, userProfile, updateUserProfile }) => {
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (!userProfile.birthDate || !userProfile.birthPlace) {
      setError("Please enter both date and place of birth.");
      return;
    }
    setError(null);
    setScreen(Screen.BirthTimeQuestion);
  };

  return (
  <Layout title="Birth Details" showBack onBack={() => setScreen(Screen.BirthDateQuestion)}>
     <div className="flex flex-col h-full">
      <div className="w-full h-1 bg-primary/5 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-primary w-1/4 rounded-full"></div>
      </div>
      <h2 className="font-serif text-2xl mb-2">Tell us about your birth details</h2>
      <p className="text-primary/60 text-sm mb-8">This sets the foundation of your chart.</p>
      
      <Input 
        label="Date of Birth" 
        type="date" 
        placeholder="DD / MM / YYYY" 
        value={userProfile.birthDate}
        onChange={(e) => {
           updateUserProfile({ birthDate: e.target.value });
           setError(null);
        }}
      />
      <Input 
        label="Place of Birth" 
        type="text" 
        placeholder="City, Country" 
        value={userProfile.birthPlace}
        onChange={(e) => {
           updateUserProfile({ birthPlace: e.target.value });
           setError(null);
        }}
      />
      <p className="text-xs text-primary/40 mt-2">Please choose your birth city, not where you live now.</p>
      
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      <div className="mt-auto pt-8">
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  </Layout>
);
};

// Step 3c: Do you know Time?
export const BirthTimeQuestionScreen: React.FC<NavProps> = ({ setScreen, setBirthPrecision, updateUserProfile }) => (
  <Layout title="Birth Time" showBack onBack={() => setScreen(Screen.BirthDateInput)}>
    <div className="flex flex-col h-full justify-center">
      <div className="mb-8 text-center">
        <Clock size={48} strokeWidth={1} className="text-primary/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl mb-2">Do you know your birth time?</h2>
        <p className="text-primary/60 text-sm">Exact time determines your "Ascendant" (Lagna), which changes every 2 hours.</p>
      </div>
      <div className="space-y-3">
        <Button onClick={() => setScreen(Screen.BirthTimeInput)}>Yes, I know my exact time</Button>
        <Button variant="outline" onClick={() => {
          setBirthPrecision('Approximate');
          updateUserProfile({ birthPrecision: 'Approximate' });
          setScreen(Screen.BirthTimeConfidence);
        }}>I know approximate time</Button>
        <Button variant="outline" onClick={() => {
          setBirthPrecision('DateOnly');
          updateUserProfile({ birthPrecision: 'DateOnly' });
          setScreen(Screen.LifeEventsQA);
        }}>I don't know my birth time</Button>
      </div>
    </div>
  </Layout>
);

// Step 3d: Exact Time Input
export const BirthTimeInputScreen: React.FC<NavProps> = ({ setScreen, setBirthPrecision, updateUserProfile, userProfile }) => {
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!userProfile.birthTime) {
      setError("Please enter your birth time.");
      return;
    }
    setError(null);
    setBirthPrecision('Exact');
    updateUserProfile({ birthPrecision: 'Exact' });
    setScreen(Screen.PersonalDetails);
  };

  return (
  <Layout title="Exact Time" showBack onBack={() => setScreen(Screen.BirthTimeQuestion)}>
    <div className="flex flex-col h-full">
      <div className="w-full h-1 bg-primary/5 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-primary w-1/2 rounded-full"></div>
      </div>
      <h2 className="font-serif text-2xl mb-2">Enter Time</h2>
      <p className="text-primary/60 text-sm mb-8">Usually found on birth certificates.</p>
      <Input 
        label="Time of Birth" 
        type="time" 
        value={userProfile.birthTime}
        onChange={(e) => {
           updateUserProfile({ birthTime: e.target.value });
           setError(null);
        }}
      />
      <p className="text-xs text-primary/40 mt-1 mb-8">If your birth certificate shows a different format, just enter the closest time you see there.</p>
      
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="mt-auto pt-8">
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  </Layout>
);
};

// Step 3e: Approx Time (Rectification Lite)
export const BirthTimeConfidenceScreen: React.FC<NavProps> = ({ setScreen, setBirthPrecision, updateUserProfile }) => (
  <Layout title="Rough Estimate" showBack onBack={() => setScreen(Screen.BirthTimeQuestion)}>
     <div className="flex flex-col h-full">
        <h2 className="font-serif text-2xl mb-2">Roughly when were you born?</h2>
        <p className="text-primary/60 text-sm mb-6">We will calculate probabilistic states for your chart.</p>
        <div className="grid grid-cols-1 gap-3 overflow-y-auto no-scrollbar pb-4">
          {[
            'Between 4 am – 8 am (early morning)', 
            'Between 8 am – 12 pm (late morning)', 
            'Between 12 pm – 4 pm (afternoon)', 
            'Between 4 pm – 8 pm (evening)', 
            'Between 8 pm – midnight (late evening)', 
            'Between midnight – 4 am (late night)'
          ].map(t => (
            <button key={t} onClick={() => setScreen(Screen.PersonalDetails)} className="p-4 rounded-xl border border-primary/10 text-left hover:bg-white transition-colors text-sm font-medium text-primary">
              {t}
            </button>
          ))}
          <button 
            onClick={() => {
               setBirthPrecision('DateOnly');
               updateUserProfile({ birthPrecision: 'DateOnly' });
               setScreen(Screen.LifeEventsQA);
            }} 
            className="p-4 rounded-xl border border-dashed border-primary/30 text-left hover:bg-white transition-colors text-sm font-medium text-primary/70"
          >
             I am not sure which band fits
          </button>
        </div>
     </div>
  </Layout>
);

// New Screen: Age Input for No Date flow
export const NoDateAgeScreen: React.FC<NavProps> = ({ setScreen, userProfile, updateUserProfile }) => (
  <Layout title="Age" showBack onBack={() => setScreen(Screen.BirthDateQuestion)}>
    <div className="flex flex-col h-full">
       <div className="w-full h-1 bg-primary/5 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-primary w-1/6 rounded-full"></div>
      </div>
      <h2 className="font-serif text-2xl mb-4">If you're comfortable, tell us your current age.</h2>
      <p className="text-primary/60 text-sm mb-8">This is only used to adjust language to your life stage.</p>
      
      <Input 
        label="Age" 
        type="number" 
        placeholder="e.g. 28" 
        value={userProfile.age}
        onChange={(e) => updateUserProfile({ age: e.target.value })}
      />
      
      <div className="mt-auto pt-8">
        <Button onClick={() => setScreen(Screen.PatternQuestionnaire)}>Continue</Button>
      </div>
    </div>
  </Layout>
);

// Step 3f: No Time (Life Events QA - B2)
export const LifeEventsQAScreen: React.FC<NavProps> = ({ setScreen, updateUserProfile }) => {
  const intro = (
    <div className="text-center">
      <HelpCircle size={48} strokeWidth={1} className="text-primary/40 mx-auto mb-4" />
      <h2 className="font-serif text-2xl mb-4">We'll read from your Moon</h2>
      <p className="text-primary/70 text-sm leading-relaxed mb-6">
        Ascendant (Lagna) depends on exact birth time. Since we don’t have it, we’ll focus on the more reliable parts of your chart: Moon sign, emotional patterns, and long‑term cycles.
      </p>
      <p className="text-primary/70 text-sm leading-relaxed mb-6">
        We’ll also ask a few questions about your life so far to tune the reading.
      </p>
    </div>
  );

  const questions = [
    { question: "How would you describe your childhood (up to age 14)?", options: ["Mostly quiet, introverted, absorbed in my own world", "Active and restless, always on the move", "Very social, in groups or with friends a lot", "Mixed or can’t say"] },
    { question: "Which age range felt like your biggest turning point so far?", options: ["Around 14–17", "Around 18–21", "Around 22–25", "Around 26–30", "After 30", "I can’t say / haven’t felt a big shift yet"] },
    { question: "In studies or work, which pattern feels most like you?", options: ["I start things quickly but get bored or change tracks often", "I move slowly but stay with one path for a long time", "I swing between intense focus and complete detachment", "None of these fit well"] },
    { question: "How do you usually handle conflicts?", options: ["I react quickly, speak out, and then cool down", "I stay calm outside, but carry it inside for a long time", "I avoid confrontation as much as possible", "It depends a lot on the situation"] },
    { question: "Which of these is closer to your current work/study situation?", options: ["I’m building something stable, step by step", "I’m in a period of change or confusion", "I feel stuck, like my efforts aren’t moving things", "I’m exploring or experimenting, not fixed on one path", "None of these fit"] },
    { question: "In close relationships, you…", options: ["Attach quickly and deeply", "Are cautious and open slowly", "Go in cycles – intense for a while, then distant", "Keep strong emotional boundaries most of the time"] },
    { question: "Right now, which life area feels most ‘loud’ for you?", options: ["Work / studies", "Money / security", "Love / relationships", "Health / energy", "Family / home", "Inner life / spirituality"] },
    { question: "How does your energy usually move in a week?", options: ["High bursts, then complete crashes", "Fairly steady, with small ups and downs", "Low most of the time, with rare spikes", "Very unpredictable / depends on external events"] }
  ];

  return (
    <QuizView 
      title="Pattern Tuning"
      intro={intro}
      questions={questions}
      onComplete={(answers) => {
        updateUserProfile({ questionnaireAnswers: { type: 'LifeEvents', data: answers }});
        setScreen(Screen.PersonalDetails);
      }}
      onBack={() => setScreen(Screen.BirthTimeQuestion)}
    />
  );
};

// Step 3g: No Date (Pattern Questionnaire - C1)
export const PatternQuestionnaireScreen: React.FC<NavProps> = ({ setScreen, updateUserProfile }) => {
  const intro = (
    <div className="text-center">
      <Sparkles size={48} strokeWidth={1} className="text-secondary/60 mx-auto mb-4" />
      <h2 className="font-serif text-2xl mb-4">Understanding You</h2>
      <p className="text-primary/70 text-sm leading-relaxed mb-6">
        Without your exact birth date/time, we won’t show technical chart details. Instead, we’ll focus on how you experience life – your patterns in work, money, relationships and health.
      </p>
    </div>
  );

  const questions = [
    { question: "Which description feels most like your general emotional style?", options: ["I feel things very intensely and quickly", "I feel deeply but rarely show it", "I stay mostly even and steady", "I shift a lot – some days high, some days low"] },
    { question: "When you're under stress, what happens first?", options: ["I become impatient or reactive", "I withdraw and go quiet", "I overthink and get anxious", "I try to over-help or please others"] },
    { question: "Which statement fits your career / work journey best so far?", options: ["I’ve changed paths often / experimented a lot", "I’ve stayed in one field or job for a long time", "I’m still searching for what I want to do", "I’ve mostly followed what came to me (destiny driven)"] },
    { question: "Which feels closest to your money pattern?", options: ["High bursts of income, then low periods", "Steady, but I always worry about not having enough", "I manage okay, but can’t seem to save much", "I feel blocked, like money avoids me"] },
    { question: "What is your current relationship situation?", options: ["Single and happy / Open to whatever comes", "In a committed relationship / Married", "Single, but feeling lonely or seeking", "It’s complicated / I’m going through a break‑up"] },
  ];

  return (
    <QuizView 
      title="Life Patterns"
      intro={intro}
      questions={questions}
      onComplete={(answers) => {
        updateUserProfile({ questionnaireAnswers: { type: 'Patterns', data: answers }});
        setScreen(Screen.PersonalDetails);
      }}
      onBack={() => setScreen(Screen.NoDateAge)}
    />
  );
};

// --- END BRANCHING ---

// Screen 4: Personal Details (Standard)
export const PersonalDetailsScreen: React.FC<NavProps> = ({ setScreen, userProfile, updateUserProfile }) => (
  <Layout title="Personal Details" showBack onBack={() => setScreen(Screen.Login)}>
    <div className="flex flex-col h-full">
      <div className="w-full h-1 bg-primary/5 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-primary w-2/3 rounded-full"></div>
      </div>
      <h2 className="font-serif text-2xl mb-8">Tell us about yourself</h2>
      <Input 
        label="Full Name" 
        placeholder="Your Name" 
        value={userProfile.name}
        onChange={(e) => updateUserProfile({ name: e.target.value })}
      />
      <div className="mb-6">
        <label className="block text-primary/60 text-xs uppercase tracking-widest font-medium mb-3 pl-1">Gender</label>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => (
            <button 
              key={g} 
              onClick={() => updateUserProfile({ gender: g })}
              className={`py-3 border rounded-xl text-sm transition-colors ${
                userProfile.gender === g 
                ? 'bg-primary text-white border-primary' 
                : 'border-primary/20 text-primary/70 hover:bg-primary/5'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <Input 
            label="Custom (optional)" 
            placeholder="Type here..." 
            value={['Male', 'Female', 'Non-binary', 'Prefer not to say'].includes(userProfile.gender || '') ? '' : userProfile.gender}
            onChange={(e) => updateUserProfile({ gender: e.target.value })}
        />
      </div>
      <div className="mt-auto pt-8">
        <Button onClick={() => setScreen(Screen.InterestSelection)}>Next Step</Button>
      </div>
    </div>
  </Layout>
);

// Screen 5: Interest Selection
export const InterestSelectionScreen: React.FC<NavProps> = ({ setScreen, userProfile, updateUserProfile }) => {
  const interests = ['Self', 'Wealth', 'Health', 'Love', 'Family', 'Job', 'Business', 'Spirituality'];
  const toggle = (i: string) => {
    const current = userProfile.interests || [];
    if (current.includes(i)) updateUserProfile({ interests: current.filter(x => x !== i) });
    else updateUserProfile({ interests: [...current, i] });
  }
  return (
    <Layout title="Interests" showBack onBack={() => setScreen(Screen.PersonalDetails)}>
      <div className="flex flex-col h-full">
         <div className="w-full h-1 bg-primary/5 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-primary w-full rounded-full"></div>
        </div>
        <h2 className="font-serif text-2xl mb-2">Customize your astrological experience</h2>
        <p className="text-primary/60 text-sm mb-8">Select 4 or more areas you want clarity on.</p>
        <div className="flex flex-wrap gap-3">
          {interests.map(item => (
            <button 
              key={item}
              onClick={() => toggle(item)}
              className={`px-5 py-3 rounded-full border text-sm transition-all duration-300 ${
                userProfile.interests?.includes(item) 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-transparent text-primary border-primary/20 hover:border-primary/50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-auto pt-8">
          <Button onClick={() => setScreen(Screen.Processing)} className={(userProfile.interests?.length || 0) < 1 ? 'opacity-50 cursor-not-allowed' : ''}>
            Analyze Pattern
          </Button>
        </div>
      </div>
    </Layout>
  );
};

// Screen 6: Processing (Adaptive + AI Pipeline)
export const ProcessingScreen: React.FC<NavProps> = ({ setScreen, birthPrecision, userProfile, updateUserProfile }) => {
  const [text, setText] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const runPipeline = async () => {
      try {
        let astroData = null;

        // 1. Fetch Astro Data (if precision allows)
        if (birthPrecision === 'Exact') {
            setText("Reading Lagna...");
            // fetchAstrologyData now handles geo-lookup and DST syncing internally
            astroData = await fetchAstrologyData(userProfile.birthDate, userProfile.birthTime, userProfile.birthPlace);
            if (astroData.timezone) {
               setText(`Syncing Timezone (${astroData.timezone})...`);
               await new Promise(r => setTimeout(r, 800)); // Small pause to let user see we found it
            }
            updateUserProfile({ astroData });
        } else if (birthPrecision === 'Approximate' || birthPrecision === 'DateOnly') {
             // Fetch partial data based on 12:00 PM for Moon Sign
            setText("Mapping Nakshatra...");
            astroData = await fetchAstrologyData(userProfile.birthDate, "12:00", userProfile.birthPlace);
            updateUserProfile({ astroData });
        }

        // 2. Generate AI Insights
        setText("Understanding your life phase...");
        // Pass the updated astroData directly or use the one in scope
        const insights = await generateProfileInsights({ ...userProfile, astroData: astroData || userProfile.astroData });
        updateUserProfile({ aiInsights: insights });
        
        setText("Finalizing Blueprint...");
        await new Promise(r => setTimeout(r, 1000));
        setScreen(Screen.Home);

      } catch (e) {
                console.error(e);
                const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
                setError(`Initialization failed: ${errorMessage}`);
                // Stop here or allow retry - do not auto-advance to broken Home
                setTimeout(() => setScreen(Screen.Login), 5000); // Go back to start after 5s
              }
    };

    runPipeline();
  }, []); 

  return (
    <div className="h-screen w-full bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden">
       <div className="grain-overlay"></div>
       <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-12">
             <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
             <Loader2 size={48} className="text-primary animate-spin" strokeWidth={1} />
          </div>
          <h2 className="font-serif text-2xl text-primary animate-pulse transition-all duration-500 min-h-[32px] text-center">
            {text}
          </h2>
          <p className="text-primary/40 text-sm mt-4">
             {error ? error : (birthPrecision === 'Exact' ? 'Calculated using Lahiri Ayanamsha' : 'Logic Engine Active')}
          </p>
       </div>
    </div>
  );
}