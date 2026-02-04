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
      <h1 className="font-serif text-3xl mb-4 tracking-wide">VedAgya</h1>
      <h2 className="font-serif text-xl mb-6 text-white/90 font-light">Astrology. But finally explained.</h2>
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
export const BirthDateInputScreen: React.FC<NavProps> = ({ setScreen, userProfile, updateUserProfile }) => (
  <Layout title="Birth Date" showBack onBack={() => setScreen(Screen.BirthDateQuestion)}>
     <div className="flex flex-col h-full">
      <div className="w-full h-1 bg-primary/5 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-primary w-1/4 rounded-full"></div>
      </div>
      <h2 className="font-serif text-2xl mb-2">When and where?</h2>
      <p className="text-primary/60 text-sm mb-8">This sets the foundation of your chart.</p>
      
      <Input 
        label="Date of Birth" 
        type="date" 
        placeholder="DD / MM / YYYY" 
        value={userProfile.birthDate}
        onChange={(e) => updateUserProfile({ birthDate: e.target.value })}
      />
      <Input 
        label="Place of Birth" 
        type="text" 
        placeholder="City, Country" 
        value={userProfile.birthPlace}
        onChange={(e) => updateUserProfile({ birthPlace: e.target.value })}
      />
      <p className="text-xs text-primary/40 mt-2">Please choose your birth city, not where you live now.</p>
      
      <div className="mt-auto pt-8">
        <Button onClick={() => setScreen(Screen.BirthTimeQuestion)}>Next Step</Button>
      </div>
    </div>
  </Layout>
);

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
export const BirthTimeInputScreen: React.FC<NavProps> = ({ setScreen, setBirthPrecision, updateUserProfile, userProfile }) => (
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
        onChange={(e) => updateUserProfile({ birthTime: e.target.value })}
      />
      <p className="text-xs text-primary/40 mt-1 mb-8">If your birth certificate shows a different format, just enter the closest time you see there.</p>
      <div className="mt-auto pt-8">
        <Button onClick={() => {
           setBirthPrecision('Exact');
           updateUserProfile({ birthPrecision: 'Exact' });
           setScreen(Screen.PersonalDetails);
        }}>Continue</Button>
      </div>
    </div>
  </Layout>
);

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
      <h2 className="font-serif text-2xl mb-4">We'll tune your reading</h2>
      <p className="text-primary/70 text-sm leading-relaxed mb-6">
        Ascendant (Lagna) depends on exact birth time. Since we don’t have it, we’ll focus on stable parts of your chart like the Moon and long‑term cycles. A few questions about your life story will help us tune your reading.
      </p>
    </div>
  );

  const questions = [
    { question: "How would you describe your childhood (up to age 14)?", options: ["mostly quiet, introverted", "Active and restless", "Very social", "Mixed"] },
    { question: "Which age range felt like your biggest turning point so far?", options: ["14–17", "18–21", "22–25", "26–30", "After 30"] },
    { question: "In studies or work, which pattern feels most like you?", options: ["Start quickly/get bored", "Slow and steady", "Intense/Detached", "None"] },
    { question: "How do you usually handle conflicts?", options: ["React quickly", "Stay calm outside/carry inside", "Avoid confrontation", "Depends"] },
    { question: "Right now, which life area feels most 'loud' for you?", options: ["Work", "Money", "Love", "Health", "Family", "Spirituality"] },
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
    { question: "Which description feels most like your general emotional style?", options: ["Intense and quick", "Deep but hidden", "Even and steady", "Shifting"] },
    { question: "When you're under stress, what happens first?", options: ["Impatient/Reactive", "Withdraw/Quiet", "Overthink", "Over-help others"] },
    { question: "Which statement fits your career / work journey best so far?", options: ["Changed often", "Stayed in one field", "Still searching", "Followed what came"] },
    { question: "Which feels closest to your money pattern?", options: ["Bursts (High/Low)", "Steady but worried", "Manage OK", "Blocked"] },
    { question: "What is your current relationship situation?", options: ["Single/Open", "Relationship/Married", "Single by choice", "Complicated"] },
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
  <Layout title="About You" showBack onBack={() => setScreen(Screen.Login)}>
    <div className="flex flex-col h-full">
      <div className="w-full h-1 bg-primary/5 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-primary w-2/3 rounded-full"></div>
      </div>
      <h2 className="font-serif text-2xl mb-8">How should we address you?</h2>
      <Input 
        label="Full Name" 
        placeholder="Your Name" 
        value={userProfile.name}
        onChange={(e) => updateUserProfile({ name: e.target.value })}
      />
      <div className="mb-6">
        <label className="block text-primary/60 text-xs uppercase tracking-widest font-medium mb-3 pl-1">Gender</label>
        <div className="flex gap-4">
          {['Female', 'Male', 'Other'].map(g => (
            <button 
              key={g} 
              onClick={() => updateUserProfile({ gender: g })}
              className={`flex-1 py-3 border rounded-xl text-sm transition-colors ${
                userProfile.gender === g 
                ? 'bg-primary text-white border-primary' 
                : 'border-primary/20 text-primary/70 hover:bg-primary/5'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <button className="text-xs text-primary/50 mt-2 underline">I prefer not to say / Custom</button>
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
    <Layout title="Focus Areas" showBack onBack={() => setScreen(Screen.PersonalDetails)}>
      <div className="flex flex-col h-full">
         <div className="w-full h-1 bg-primary/5 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-primary w-full rounded-full"></div>
        </div>
        <h2 className="font-serif text-2xl mb-2">Customize your experience</h2>
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
            setText("Connecting to Vedic Engine...");
            astroData = await fetchAstrologyData(userProfile.birthDate, userProfile.birthTime, userProfile.birthPlace);
            updateUserProfile({ astroData });
        } else if (birthPrecision === 'Approximate' || birthPrecision === 'DateOnly') {
             // Fetch partial data based on 12:00 PM for Moon Sign
            setText("Mapping Lunar Cycles...");
            astroData = await fetchAstrologyData(userProfile.birthDate, "12:00", userProfile.birthPlace);
            updateUserProfile({ astroData });
        }

        // 2. Generate AI Insights
        setText("Analyzing Logic Patterns...");
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