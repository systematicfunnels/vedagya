import React, { useState } from 'react';
import { Layout, Button, Card } from '../components/UI';
import { Screen, NavProps } from '../types';
import { Mic, Send, Sparkles, Loader2 } from 'lucide-react';
import { askVedAgyaChat } from '../services/ai';

export const AskVedAgyaEntryScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => {
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Handlers for quick select
  const handleQuickTopic = () => setStep(1);
  const handleQuickIntent = () => setStep(2);

  const handleAnalyze = async () => {
    if (!question.trim()) return;
    setIsAnalyzing(true);
    // In a real app, we'd pass the response to the next screen via props or context
    // For this pattern, we'll store it in a temp global or just fetch it on the next screen if structured that way.
    // Here, we will pass it via a hack or update state. 
    // Since we don't have a global "currentAnswer" state in App.tsx, we will create a custom prop flow 
    // BUT strictly following the requested pattern, I should probably update the response screen to handle the fetching
    // or pass it. 
    // Let's assume we pass the question to the Response screen and it fetches, 
    // OR we fetch here and pass data. 
    
    // Simplest: We fetch here, and assume the Response screen can read a "lastResponse" from profile or props.
    // For now, let's just use local state and render the response in the same component family or update profile.
    
    // Better: Update userProfile to hold "lastChatResponse".
    // But since I can't easily change App.tsx interfaces deeply without touching too many files,
    // I will do the fetch inside the Response Screen. 
    // I'll just save the question to a global/local storage or pass it if navigation allowed params.
    // Given the constraints, I will use sessionStorage for the question payload to pass to the next screen.
    sessionStorage.setItem('vedagya_last_question', question);
    
    setScreen(Screen.AskVedAgyaResponse);
  };
  
  return (
    <Layout title="Ask VedAgya" showBack onBack={() => setScreen(Screen.Home)}>
      <div className="flex flex-col h-full pt-4">
        
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl">What is on your mind?</h2>
            <div className="grid grid-cols-2 gap-3">
              {['Career Path', 'Relationship Dynamics', 'Inner Peace', 'Financial Logic'].map(topic => (
                <button key={topic} onClick={handleQuickTopic} className="p-4 rounded-xl border border-primary/10 bg-white/50 text-left hover:bg-white hover:border-primary/30 transition-all">
                  <span className="text-sm font-medium">{topic}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl">Refine your intent</h2>
            <div className="space-y-3">
               <button onClick={handleQuickIntent} className="w-full p-4 rounded-xl border border-primary/10 bg-white/50 text-left text-sm hover:bg-white">I need clarity on timing</button>
               <button onClick={handleQuickIntent} className="w-full p-4 rounded-xl border border-primary/10 bg-white/50 text-left text-sm hover:bg-white">I want to understand my pattern</button>
               <button onClick={handleQuickIntent} className="w-full p-4 rounded-xl border border-primary/10 bg-white/50 text-left text-sm hover:bg-white">I am feeling overwhelmed</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="font-serif text-2xl mb-2">Ask your question</h2>
            <p className="text-sm text-primary/50 mb-6">Be specific. We analyze the logic, not the fortune.</p>
            
            <div className="relative flex-1">
              <textarea 
                className="w-full h-40 bg-white/60 rounded-2xl border border-primary/10 p-5 resize-none focus:outline-none focus:bg-white transition-colors"
                placeholder="e.g., Why do I feel a sudden disconnect in my current role despite recent success?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              ></textarea>
            </div>

            <div className="mt-6 flex items-center gap-4">
               <button className="p-4 rounded-full bg-surface border border-primary/10 text-primary/60 hover:text-primary transition-colors">
                  <Mic size={24} />
               </button>
               <Button onClick={handleAnalyze} className="flex-1 flex items-center justify-center gap-2">
                  Analyze <Send size={16} />
               </Button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export const AskVedAgyaResponseScreen: React.FC<NavProps> = ({ setScreen, userProfile }) => {
  const [response, setResponse] = useState<string | null>(null);
  
  // On mount, fetch response
  React.useEffect(() => {
    const fetchResponse = async () => {
        const question = sessionStorage.getItem('vedagya_last_question') || "General clarity";
        try {
            const text = await askVedAgyaChat(question, userProfile);
            setResponse(text);
        } catch (e) {
            setResponse("I am currently recalibrating my logic engine. Please try again later.");
        }
    };
    fetchResponse();
  }, []);

  return (
    <Layout title="Insight" showBack onBack={() => setScreen(Screen.AskVedAgyaEntry)}>
      <div className="space-y-6 pt-4">
         <Card className="bg-gradient-to-br from-white to-surface-soft border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-secondary" />
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">Analysis</span>
            </div>
            
            {!response ? (
                <div className="flex flex-col items-center py-8">
                    <Loader2 className="animate-spin text-primary/40 mb-2" />
                    <p className="text-xs text-primary/40">Consulting patterns...</p>
                </div>
            ) : (
                <div className="font-serif text-lg leading-relaxed mb-6 whitespace-pre-line">
                   {response}
                </div>
            )}
         </Card>
  
         <div className="flex gap-4">
            <button className="flex-1 py-3 text-sm text-primary border border-primary/20 rounded-xl hover:bg-primary/5">Save to Journal</button>
            <button onClick={() => setScreen(Screen.AskVedAgyaEntry)} className="flex-1 py-3 text-sm text-primary border border-primary/20 rounded-xl hover:bg-primary/5">Ask Follow-up</button>
         </div>
      </div>
    </Layout>
  );
}