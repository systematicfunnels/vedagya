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
    sessionStorage.setItem('vedagya_last_question', question);
    setScreen(Screen.AskVedAgyaResponse);
  };
  
  return (
    <Layout title="Ask VedAgya" showBack onBack={() => setScreen(Screen.Home)}>
      <div className="flex flex-col h-full pt-2">
        
        {/* Visual Steps Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
            {['Area', 'Intent', 'Evaluation'].map((label, idx) => (
                <div key={label} className={`flex flex-col items-center gap-1 ${idx <= step ? 'text-primary' : 'text-primary/20'}`}>
                    <div className={`w-2 h-2 rounded-full ${idx <= step ? 'bg-primary' : 'bg-primary/20'}`} />
                    <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
                </div>
            ))}
            {/* Connecting lines */}
            <div className="absolute left-0 right-0 top-[4.5rem] h-[1px] bg-primary/10 -z-10 mx-8" /> 
        </div>

        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-serif text-2xl">Choose life area</h2>
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
            <h2 className="font-serif text-2xl">Choose intent</h2>
            <div className="space-y-3">
               <button onClick={handleQuickIntent} className="w-full p-4 rounded-xl border border-primary/10 bg-white/50 text-left text-sm hover:bg-white">I need clarity on timing</button>
               <button onClick={handleQuickIntent} className="w-full p-4 rounded-xl border border-primary/10 bg-white/50 text-left text-sm hover:bg-white">I want to understand my pattern</button>
               <button onClick={handleQuickIntent} className="w-full p-4 rounded-xl border border-primary/10 bg-white/50 text-left text-sm hover:bg-white">I am feeling overwhelmed</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <h2 className="font-serif text-2xl mb-2">Evaluation</h2>
            <p className="text-sm text-primary/50 mb-6">Be specific. We analyze the logic, not the fortune.</p>
            
            <div className="relative flex-1">
              <textarea 
                className="w-full h-48 bg-white/60 rounded-2xl border border-primary/10 p-5 resize-none focus:outline-none focus:bg-white transition-colors text-lg font-serif placeholder:font-sans placeholder:text-base"
                placeholder="e.g., Why do I feel a sudden disconnect in my current role despite recent success?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              ></textarea>
            </div>

            <div className="mt-6 flex items-center gap-4">
               <button className="p-4 rounded-full bg-surface border border-primary/10 text-primary/60 hover:text-primary transition-colors">
                  <Mic size={24} />
               </button>
               <Button onClick={handleAnalyze} className="flex-1 flex items-center justify-center gap-2 py-4">
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
         <Card className="bg-gradient-to-br from-white to-surface-soft border-primary/10 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-primary/5 pb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Sparkles size={14} className="text-secondary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/60">Logic Analysis</span>
                </div>
                <span className="text-[10px] text-primary/30 uppercase tracking-wider">VedAgya Engine</span>
            </div>
            
            {!response ? (
                <div className="flex flex-col items-center py-12 animate-pulse">
                    <Loader2 className="animate-spin text-primary/30 mb-4" size={32} />
                    <p className="text-sm font-serif text-primary/50">Aligning planetary logic...</p>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="font-serif text-lg leading-relaxed text-primary/80 mb-8 whitespace-pre-line">
                    {response}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-primary/40 italic border-t border-primary/5 pt-4">
                        <span>*</span>
                        <p>This analysis is based on patterns, not predictions.</p>
                    </div>
                </div>
            )}
         </Card>
  
         {response && (
             <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <button className="py-4 text-sm font-medium text-primary/70 border border-primary/10 bg-white/50 rounded-xl hover:bg-white hover:text-primary transition-all">
                    Save to Journal
                </button>
                <button onClick={() => setScreen(Screen.AskVedAgyaEntry)} className="py-4 text-sm font-medium text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                    Ask Follow-up
                </button>
             </div>
         )}
      </div>
    </Layout>
  );
}