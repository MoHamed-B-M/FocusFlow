import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Armchair } from 'lucide-react';
import TimerRing from './TimerRing'; 

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerConfig {
  minutes: number;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  ringColor: string;
  icon: any; 
  darkText: string;
  darkPrimary: string;
}

interface FocusTimerProps {
  mode: TimerMode;
  timeLeft: number;
  duration: number;
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  onUpdate: (newTime: number) => void;
  sessionCount: number;
  sessionsBeforeLongBreak: number;
  timerSettings: {
      focus: number;
      shortBreak: number;
      longBreak: number;
  };
  modes: Record<TimerMode, TimerConfig>;
}

const FocusTimer: React.FC<FocusTimerProps> = ({
  mode,
  timeLeft,
  duration,
  isActive,
  onToggle,
  onReset,
  onSkip,
  onUpdate,
  sessionCount,
  sessionsBeforeLongBreak,
  modes
}) => {
  const currentMode = modes[mode];
  const progress = duration === 0 ? 100 : Math.min(100, Math.max(0, (timeLeft / duration) * 100));
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Use local state to manage input value while typing to avoid jumping
  const [localMinutes, setLocalMinutes] = React.useState<string>(minutes.toString().padStart(2, '0'));
  const [localSeconds, setLocalSeconds] = React.useState<string>(seconds.toString().padStart(2, '0'));

  React.useEffect(() => {
    if (isActive) {
       setLocalMinutes(minutes.toString().padStart(2, '0'));
       setLocalSeconds(seconds.toString().padStart(2, '0'));
    }
  }, [minutes, seconds, isActive]);

  // Sync local state when timeLeft updates externally (e.g. preset change) AND not editing
  React.useEffect(() => {
      if(!isActive) {
        setLocalMinutes(minutes.toString().padStart(2, '0'));
        setLocalSeconds(seconds.toString().padStart(2, '0'));
      }
  }, [timeLeft]);

  const handleInputChange = (type: 'min' | 'sec', value: string) => {
    // Allow digits only
    const cleaned = value.replace(/[^0-9]/g, '');
    
    if (type === 'min') {
        // Limit length to avoid massive numbers
        setLocalMinutes(cleaned.slice(0, 3));
    } else {
        setLocalSeconds(cleaned.slice(0, 2));
    }
  };

  const handleBlur = (type: 'min' | 'sec') => {
      if (type === 'min') {
          let num = parseInt(localMinutes, 10);
          if (isNaN(num)) num = 0;
          num = Math.max(0, Math.min(999, num));
          const newFormatted = num.toString().padStart(2, '0');
          setLocalMinutes(newFormatted);
          onUpdate(num * 60 + parseInt(localSeconds, 10));
      } else {
          let num = parseInt(localSeconds, 10);
          if (isNaN(num)) num = 0;
          num = Math.max(0, Math.min(59, num));
          const newFormatted = num.toString().padStart(2, '0');
          setLocalSeconds(newFormatted);
          const currentMin = parseInt(localMinutes, 10);
          onUpdate(currentMin * 60 + num);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          e.currentTarget.blur();
      }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full max-w-md mx-auto pt-4 pb-20 overflow-y-auto no-scrollbar relative">
      <motion.div
        animate={{ opacity: isActive ? 0 : 1, y: isActive ? -20 : 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col items-center mt-12"
      >
          <motion.h2 
            key={mode}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-4xl font-extrabold ${currentMode.textColor} ${currentMode.darkText} tracking-tight`}
          >
            {currentMode.label}
          </motion.h2>
      </motion.div>

      <div className="relative mb-12 flex items-center justify-center">
        <TimerRing 
          progress={progress} 
          color={currentMode.textColor} 
          trackColor={currentMode.textColor}
          size={320}
          strokeWidth={14}
        />
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex items-center justify-center pointer-events-auto select-none mt-1">
            <input
              type="text"
              inputMode="numeric"
              value={localMinutes}
              onChange={(e) => handleInputChange('min', e.target.value)}
              onBlur={() => handleBlur('min')}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              disabled={isActive}
              className={`text-[5.5rem] font-extrabold ${currentMode.textColor} ${currentMode.darkText} tracking-tight text-center bg-transparent outline-none w-[130px] p-0 leading-none
                ${isActive ? 'cursor-default' : 'cursor-text hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors'}`}
            />
            <span className={`text-[5rem] font-extrabold ${currentMode.textColor} ${currentMode.darkText} leading-none pb-4 opacity-50`}>:</span>
            <input
              type="text"
              inputMode="numeric"
              value={localSeconds}
              onChange={(e) => handleInputChange('sec', e.target.value)}
              onBlur={() => handleBlur('sec')}
              onFocus={(e) => e.target.select()}
              onKeyDown={handleKeyDown}
              disabled={isActive}
              className={`text-[5.5rem] font-extrabold ${currentMode.textColor} ${currentMode.darkText} tracking-tight text-center bg-transparent outline-none w-[130px] p-0 leading-none
                ${isActive ? 'cursor-default' : 'cursor-text hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors'}`}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center h-24 w-full px-6 max-w-[420px] relative">
        <motion.button
          initial={{ x: 0, opacity: 1 }}
          animate={{ x: isActive ? -40 : 0, opacity: isActive ? 0.3 : 1 }}
          whileHover={{ opacity: 1 }}
          style={{ position: 'absolute', left: '20%', top: '50%', y: '-50%' }}
          onClick={onReset}
          className={`${currentMode.bgColor} dark:bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center shadow-sm z-10 will-change-transform`}
        >
            <RotateCcw size={20} className={`${currentMode.textColor} ${currentMode.darkText}`} />
        </motion.button>
        <motion.button
          initial={{ width: 96, height: 96, borderRadius: 48 }}
          animate={{
            width: isActive ? 120 : 96,    
            height: 96,
            borderRadius: isActive ? 32 : 48,
            boxShadow: isActive ? "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" : "0 4px 6px -1px rgb(0 0 0 / 0.1)"
          }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={`flex items-center justify-center z-20 ${currentMode.color} ${currentMode.darkPrimary} text-white dark:text-slate-900 overflow-hidden relative will-change-transform`}
        >
             {isActive ? <Pause size={42} fill="currentColor" /> : <Play size={42} fill="currentColor" className="ml-1" />}
        </motion.button>
        <motion.button
          initial={{ x: 0, opacity: 1 }}
          animate={{ x: isActive ? 40 : 0, opacity: isActive ? 0 : 1, pointerEvents: isActive ? 'none' : 'auto' }}
          style={{ position: 'absolute', right: '20%', top: '50%', y: '-50%' }}
          onClick={onSkip}
          className={`${currentMode.bgColor} dark:bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center shadow-sm z-10 will-change-transform`}
        >
             <SkipForward size={20} className={`${currentMode.textColor} ${currentMode.darkText}`} />
        </motion.button>
      </div>

      <motion.div 
        className="mt-6 flex flex-col items-center" 
        animate={{ opacity: isActive ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-1 uppercase tracking-widest">Up next</p>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase">
           {mode === 'focus' ? 'Short Break' : 'Focus Session'}
        </div>
      </motion.div>
      
      {mode === 'focus' && (
          <motion.div 
            className="mt-8 flex flex-col items-center gap-4"
            animate={{ opacity: isActive ? 0.35 : 1 }}
          >
              <div className="flex gap-2">
                  {[...Array(sessionsBeforeLongBreak)].map((_, i) => (
                      <motion.div 
                          key={i} 
                          initial={{ scale: 0.8 }}
                          animate={{ 
                            scale: i === sessionCount ? [0.8, 1.3, 1] : 1,
                            backgroundColor: i < sessionCount ? '#6750A4' : '#e2e8f0'
                          }}
                          className={`w-3 h-3 rounded-full transition-colors duration-300`} 
                      />
                  ))}
              </div>
              <AnimatePresence mode="wait">
                  <motion.span 
                    key={sessionCount}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]"
                  >
                      Session {sessionCount + 1} of {sessionsBeforeLongBreak}
                  </motion.span>
              </AnimatePresence>
          </motion.div>
      )}
    </div>
  );
};

export default FocusTimer;