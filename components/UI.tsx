import React from 'react';
import { ArrowLeft, Menu, Bell } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenu?: () => void;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBack, 
  onBack, 
  showMenu, 
  onMenu,
  className = "" 
}) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col max-w-md mx-auto bg-background text-primary selection:bg-secondary/20">
      {/* Background Motifs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full bg-primary/5 blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-secondary/5 blur-3xl opacity-40"></div>
        {/* Subtle Stars */}
        <div className="absolute top-20 left-10 text-primary/10 text-4xl">✦</div>
        <div className="absolute bottom-40 right-10 text-primary/10 text-2xl">✦</div>
        <div className="absolute top-1/2 left-1/4 text-primary/5 text-xl">•</div>
      </div>
      
      {/* Grain Overlay */}
      <div className="grain-overlay pointer-events-none"></div>

      {/* Header */}
      {(title || showBack || showMenu) && (
        <header className="relative z-20 flex items-center justify-between px-6 py-6 pb-2">
          <div className="flex items-center gap-4">
            {showBack && (
              <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-primary/5 transition-colors text-primary/80">
                <ArrowLeft size={22} strokeWidth={1.5} />
              </button>
            )}
            {title && <h1 className="font-serif text-xl font-medium tracking-wide text-primary">{title}</h1>}
          </div>
          {showMenu && (
             <div className="flex gap-2">
                <button onClick={onMenu} className="p-2 rounded-full hover:bg-primary/5 transition-colors text-primary/80">
                  <Bell size={22} strokeWidth={1.5} />
                </button>
                <button onClick={onMenu} className="p-2 -mr-2 rounded-full hover:bg-primary/5 transition-colors text-primary/80">
                  <Menu size={22} strokeWidth={1.5} />
                </button>
             </div>
          )}
        </header>
      )}

      {/* Content */}
      <main className={`relative z-10 flex-1 px-6 pb-8 overflow-y-auto no-scrollbar ${className}`}>
        {children}
      </main>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-surface-soft/80 backdrop-blur-sm border border-primary/10 rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(46,26,71,0.05)] ${onClick ? 'cursor-pointer active:scale-[0.99] transition-transform' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Button: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'outline'; className?: string }> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  className = ""
}) => {
  const baseStyles = "w-full py-4 rounded-xl font-sans text-sm tracking-wide font-medium transition-all duration-300";
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
    secondary: "bg-secondary text-white",
    outline: "border border-primary text-primary hover:bg-primary/5"
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = "", ...props }) => (
  <div className="w-full mb-5">
    {label && <label className="block text-primary/60 text-xs uppercase tracking-widest font-medium mb-2 pl-1">{label}</label>}
    <input 
      className={`w-full bg-white/50 border border-primary/10 rounded-xl px-4 py-3.5 text-primary placeholder-primary/30 focus:outline-none focus:border-primary/30 focus:bg-white transition-all font-sans ${className}`}
      {...props}
    />
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium border ${active ? 'bg-primary text-white border-primary' : 'bg-transparent text-primary/60 border-primary/20'}`}>
    {children}
  </span>
);