import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, Check, Coffee, Brain, Armchair } from 'lucide-react';
import ExpressiveLoader from './components/ExpressiveLoader';
import FocusTimer, { TimerMode, TimerConfig } from './components/FocusTimer';
import Stats, { StatsHistory } from './components/Stats';
import Settings, { THEME_COLORS, ICONS } from './components/Settings';
import FloatingNav from './components/FloatingNav';

const getTodayKey = () => {
    return new Date().toLocaleDateString('en-CA'); 
};

// --- WAKE LOCK HOOK ---
const useWakeLock = (isActive: boolean) => {
    const wakeLock = useRef<any>(null);

    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator && isActive && document.visibilityState === 'visible') {
                try {
                    wakeLock.current = await (navigator as any).wakeLock.request('screen');
                } catch (err: any) {
                    if (err.name !== 'AbortError') {
                         console.warn(`Wake Lock request failed: ${err.message}`);
                    }
                }
            }
        };

        const releaseWakeLock = async () => {
            if (wakeLock.current) {
                try {
                    await wakeLock.current.release();
                    wakeLock.current = null;
                } catch (e) {}
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isActive) {
                requestWakeLock();
            } else if (wakeLock.current) {
                releaseWakeLock();
            }
        };

        if (isActive) {
            requestWakeLock();
            document.addEventListener('visibilitychange', handleVisibilityChange);
        } else {
            releaseWakeLock();
        }

        return () => { 
            releaseWakeLock(); 
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isActive]);
};

export type SoundType = 'pulse' | 'digital' | 'custom';

const SoundService = {
  ctx: null as AudioContext | null,
  customAudio: null as HTMLAudioElement | null,
  
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  play(type: SoundType = 'pulse', customData?: string | null, volume: number = 1.0) {
    this.init();
    
    // Handle Custom Sound
    if (type === 'custom' && customData) {
        if (!this.customAudio || this.customAudio.src !== customData) {
            this.customAudio = new Audio(customData);
        }
        this.customAudio.volume = volume;
        this.customAudio.currentTime = 0;
        this.customAudio.play().catch(e => console.error("Custom sound play failed", e));
        return;
    }

    // Handle Synthetic Sounds
    if (!this.ctx) return;
    this.resume();

    try {
      const osc = this.ctx.createOscillator();
      const envelopeGain = this.ctx.createGain(); // For envelope shape
      const masterGain = this.ctx.createGain();   // For volume control

      osc.connect(envelopeGain);
      envelopeGain.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      // Set Volume
      masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);

      const now = this.ctx.currentTime;

      if (type === 'digital') {
        // Digital Alarm Style (Square/Sawtooth mix)
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now); 
        osc.frequency.setValueAtTime(1760, now + 0.1); 
        osc.frequency.setValueAtTime(880, now + 0.2); 
        
        envelopeGain.gain.setValueAtTime(0.1, now);
        envelopeGain.gain.linearRampToValueAtTime(0.1, now + 0.3);
        envelopeGain.gain.linearRampToValueAtTime(0, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Default Pulse (Sine)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); 
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1); 

        envelopeGain.gain.setValueAtTime(0.5, now);
        envelopeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc.start(now);
        osc.stop(now + 1.5);
      }

    } catch (e) {
      console.error("Audio play failed", e);
    }
  }
};

const AlarmOverlay: React.FC<{ mode: TimerMode, onStop: () => void, accentColor: string }> = ({ mode, onStop, accentColor }) => {
    // Determine gradient color based on accent color class or default
    const getGlowColor = () => {
        if (accentColor.includes('bg-[#1E5443]')) return 'rgb(30, 84, 67)';
        if (accentColor.includes('bg-[#004A77]')) return 'rgb(0, 74, 119)';
        if (accentColor.includes('bg-[#4F378B]')) return 'rgb(79, 55, 139)';
        return 'rgb(103, 80, 164)'; // default purple
    };

    const glowColor = getGlowColor();

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95"
        >
            <motion.div 
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
                style={{
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
                }}
                className="absolute w-[300px] h-[300px] rounded-full pointer-events-none blur-[40px] transform translate-z-0"
            />

            <motion.div 
                initial={{ scale: 0.9, y: 30, opacity: 0 }} 
                animate={{ scale: 1, y: 0, opacity: 1 }} 
                exit={{ scale: 0.9, y: 30, opacity: 0 }} 
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center text-center overflow-hidden transform translate-z-0"
            >
                <div className="relative mb-8">
                     <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-white rounded-full"
                     />
                    <motion.div 
                        animate={{ 
                            rotate: [-5, 5, -5, 5, 0],
                        }}
                        transition={{ 
                            duration: 0.5, repeat: Infinity, repeatDelay: 1
                        }}
                        className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center shadow-inner border border-slate-700 relative z-10"
                    >
                        <BellRing size={48} className="text-white" />
                    </motion.div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    {mode === 'focus' ? "Session Complete" : "Break Over"}
                </h2>
                <p className="text-slate-400 text-lg mb-10 font-medium leading-relaxed">
                    Great work! Take a breath before continuing.
                </p>

                <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onStop} 
                    className="w-full py-5 bg-white text-slate-900 font-bold rounded-[2rem] text-xl shadow-lg shadow-white/10 transition-colors hover:bg-slate-100 will-change-transform"
                >
                    Dismiss Alarm
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

const DEFAULT_TIMER_SETTINGS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
  autoStart: false
};

const DEFAULT_THEMES = {
  focus: { color: THEME_COLORS[0], iconId: 'brain' },
  shortBreak: { color: THEME_COLORS[1], iconId: 'coffee' },
  longBreak: { color: THEME_COLORS[2], iconId: 'armchair' }
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'timer' | 'stats' | 'settings'>('timer');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [font, setFont] = useState<string>('Nunito, sans-serif');
  
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [duration, setDuration] = useState(25 * 60); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [sessionCount, setSessionCount] = useState(0); 
  
  const [pendingTimerSwitch, setPendingTimerSwitch] = useState<{ mode: TimerMode, duration: number } | null>(null);

  // Sound Settings
  const [soundType, setSoundType] = useState<SoundType>('pulse');
  const [customSoundData, setCustomSoundData] = useState<string | null>(null);
  const [alarmVolume, setAlarmVolume] = useState(0.5);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  useWakeLock(isTimerActive);

  const [timerSettings, setTimerSettings] = useState(DEFAULT_TIMER_SETTINGS);
  const [customThemes, setCustomThemes] = useState<Record<TimerMode, any>>(DEFAULT_THEMES);

  const getModesConfig = useCallback(() => {
    return {
      focus: {
        minutes: timerSettings.focus,
        label: 'Focus',
        color: customThemes.focus.color.primary,
        bgColor: customThemes.focus.color.bg,
        textColor: customThemes.focus.color.text,
        darkText: customThemes.focus.color.darkText,
        darkPrimary: customThemes.focus.color.darkPrimary,
        ringColor: customThemes.focus.color.ring,
        icon: React.createElement(ICONS.find(i => i.id === customThemes.focus.iconId)?.component || Brain, { size: 20 }),
      },
      shortBreak: {
        minutes: timerSettings.shortBreak,
        label: 'Short Break',
        color: customThemes.shortBreak.color.primary,
        bgColor: customThemes.shortBreak.color.bg,
        textColor: customThemes.shortBreak.color.text,
        darkText: customThemes.shortBreak.color.darkText,
        darkPrimary: customThemes.shortBreak.color.darkPrimary,
        ringColor: customThemes.shortBreak.color.ring,
        icon: React.createElement(ICONS.find(i => i.id === customThemes.shortBreak.iconId)?.component || Coffee, { size: 20 }),
      },
      longBreak: {
        minutes: timerSettings.longBreak,
        label: 'Long Break',
        color: customThemes.longBreak.color.primary,
        bgColor: customThemes.longBreak.color.bg,
        textColor: customThemes.longBreak.color.text,
        darkText: customThemes.longBreak.color.darkText,
        darkPrimary: customThemes.longBreak.color.darkPrimary,
        ringColor: customThemes.longBreak.color.ring,
        icon: React.createElement(ICONS.find(i => i.id === customThemes.longBreak.iconId)?.component || Armchair, { size: 20 }),
      }
    } as Record<TimerMode, TimerConfig>;
  }, [timerSettings, customThemes]);

  const [statsHistory, setStatsHistory] = useState<StatsHistory>({});
  const [notifications, setNotifications] = useState(false);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [hapticIntensity, setHapticIntensity] = useState(1.0);

  const triggerHaptic = useCallback((pattern: number | number[] = 10) => {
    if (haptics && 'vibrate' in navigator) {
      if (Array.isArray(pattern)) {
        const scaled = pattern.map(p => p * hapticIntensity);
        navigator.vibrate(scaled);
      } else {
        navigator.vibrate(pattern * hapticIntensity);
      }
    }
  }, [haptics, hapticIntensity]);

  // Fullscreen Logic
  useEffect(() => {
      const handleFullscreenChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
      try {
          if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen();
          } else {
              if (document.exitFullscreen) {
                  await document.exitFullscreen();
              }
          }
      } catch (err) {
          console.error("Error toggling fullscreen:", err);
      }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('flowdo-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    const savedFont = localStorage.getItem('flowdo-font');
    if (savedFont) {
        setFont(savedFont);
    }
  }, []);

  const toggleTheme = () => {
    triggerHaptic(15);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('flowdo-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFontChange = (newFont: string) => {
      setFont(newFont);
      localStorage.setItem('flowdo-font', newFont);
  };

  const resetToDefaults = () => {
      if(window.confirm('Are you sure you want to reset all settings to default?')) {
          setTimerSettings(DEFAULT_TIMER_SETTINGS);
          setCustomThemes(DEFAULT_THEMES);
          setNotifications(false);
          setSound(true);
          setHaptics(true);
          setHapticIntensity(1.0);
          setSoundType('pulse');
          setCustomSoundData(null);
          setAlarmVolume(0.5);
          setTheme('light');
          document.documentElement.classList.remove('dark');
          localStorage.setItem('flowdo-theme', 'light');
          setFont('Nunito, sans-serif');
          localStorage.setItem('flowdo-font', 'Nunito, sans-serif');
          
          if(document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
          }
          
          triggerHaptic(50);
      }
  };

  useEffect(() => {
    const initApp = async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const savedTimerSettings = localStorage.getItem('flowdo-timer-config');
        let currentTimerSettings = timerSettings;
        if (savedTimerSettings) {
            try { 
                currentTimerSettings = { ...timerSettings, ...JSON.parse(savedTimerSettings) };
                setTimerSettings(currentTimerSettings); 
            } catch(e) {}
        }
        const savedCustomThemes = localStorage.getItem('flowdo-custom-themes');
        if (savedCustomThemes) try { setCustomThemes(JSON.parse(savedCustomThemes)); } catch(e) {}

        const savedTimer = localStorage.getItem('flowdo-timer');
        if (savedTimer) {
          try {
              const parsed = JSON.parse(savedTimer);
              setTimerMode(parsed.mode || 'focus');
              setDuration(parsed.duration || 25 * 60);
              setTimeLeft(parsed.timeLeft);
              setSessionCount(parsed.sessionCount || 0);
          } catch(e) {}
        }

        // Auto-Start on Load Logic
        if (currentTimerSettings.autoStart && savedTimer) {
             setIsTimerActive(true);
        }

        const savedStats = localStorage.getItem('flowdo-stats');
        if (savedStats) try { setStatsHistory(JSON.parse(savedStats)); } catch(e) {}

        const savedSettings = localStorage.getItem('flowdo-settings');
        if (savedSettings) {
          try {
              const parsed = JSON.parse(savedSettings);
              setNotifications(parsed.notifications ?? false);
              setSound(parsed.sound ?? true);
              setHaptics(parsed.haptics ?? true);
              setHapticIntensity(parsed.hapticIntensity ?? 1.0);
              
              if (parsed.soundType) setSoundType(parsed.soundType);
              if (parsed.customSoundData) setCustomSoundData(parsed.customSoundData);
              if (typeof parsed.alarmVolume === 'number') setAlarmVolume(parsed.alarmVolume);

          } catch (e) {}
        }
        setLoading(false);
    };
    initApp();
  }, []);

  useEffect(() => {
    if (!loading) {
        localStorage.setItem('flowdo-stats', JSON.stringify(statsHistory));
        localStorage.setItem('flowdo-settings', JSON.stringify(({ 
            notifications, 
            sound, 
            haptics, 
            hapticIntensity,
            soundType,
            customSoundData,
            alarmVolume
        })));
        localStorage.setItem('flowdo-timer-config', JSON.stringify(timerSettings));
        localStorage.setItem('flowdo-custom-themes', JSON.stringify(customThemes));
        localStorage.setItem('flowdo-timer', JSON.stringify({ mode: timerMode, timeLeft, duration, sessionCount }));
    }
  }, [statsHistory, notifications, sound, haptics, hapticIntensity, loading, timerSettings, customThemes, timerMode, timeLeft, duration, sessionCount, soundType, customSoundData, alarmVolume]);

  useEffect(() => {
    let interval: number;
    if (isTimerActive) {
      interval = window.setInterval(() => {
        const today = getTodayKey();
        setStatsHistory(prev => {
           const current = prev[today] || { focus: 0, break: 0 };
           const isFocusMode = timerMode === 'focus';
           return { ...prev, [today]: { focus: isFocusMode ? current.focus + 1 : current.focus, break: !isFocusMode ? current.break + 1 : current.break } };
        });
        setTimeLeft(prev => prev <= 1 ? 0 : prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerMode]);

  useEffect(() => {
      if (isTimerActive && timeLeft === 0) {
          setIsTimerActive(false);
          triggerHaptic([100, 50, 100]); 
          if (sound) {
            setIsAlarmRinging(true);
            SoundService.play(soundType, customSoundData, alarmVolume);
          }
          let nextMode: TimerMode = 'focus';
          let nextDuration = timerSettings.focus * 60;
          if (timerMode === 'focus') {
              const newSessionCount = sessionCount + 1;
              setSessionCount(newSessionCount);
              if (newSessionCount >= timerSettings.sessionsBeforeLongBreak) {
                  nextMode = 'longBreak';
                  nextDuration = timerSettings.longBreak * 60;
              } else {
                  nextMode = 'shortBreak';
                  nextDuration = timerSettings.shortBreak * 60;
              }
              setPendingTimerSwitch({ mode: nextMode, duration: nextDuration });
          } else {
              setPendingTimerSwitch({ mode: 'focus', duration: timerSettings.focus * 60 });
          }
      }
  }, [timeLeft, isTimerActive, timerMode, sessionCount, timerSettings, sound, triggerHaptic, getModesConfig, soundType, customSoundData, alarmVolume]);

  const handleAlarmStop = () => {
      triggerHaptic(20);
      setIsAlarmRinging(false);
      completeTransition();
  };

  const completeTransition = () => {
    if (pendingTimerSwitch) {
        setTimerMode(pendingTimerSwitch.mode);
        setDuration(pendingTimerSwitch.duration);
        setTimeLeft(pendingTimerSwitch.duration);
        if (timerSettings.autoStart) setIsTimerActive(true);
        setPendingTimerSwitch(null);
    }
  };

  useEffect(() => {
    let interval: number;
    if (isAlarmRinging && sound) {
      // Loop interval based on sound type approximately
      const loopDuration = soundType === 'digital' ? 500 : 2000;
      interval = window.setInterval(() => { 
          SoundService.play(soundType, customSoundData, alarmVolume); 
      }, loopDuration);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isAlarmRinging, sound, soundType, customSoundData, alarmVolume]);

  const renderCurrentView = () => {
    const modes = getModesConfig();
    switch (view) {
      case 'timer':
        return (
          <>
            <FocusTimer 
                key="timer"
                mode={timerMode}
                timeLeft={timeLeft}
                duration={duration}
                isActive={isTimerActive}
                onToggle={() => { SoundService.resume(); triggerHaptic(25); setIsTimerActive(!isTimerActive); }}
                onReset={() => { 
                  triggerHaptic(30); 
                  const d = getModesConfig()[timerMode].minutes * 60;
                  setTimeLeft(d); 
                  setDuration(d); 
                  setIsTimerActive(false); 
                }}
                onSkip={() => { triggerHaptic(40); handleTimerSkip(); }}
                onUpdate={(newTime) => {
                  setTimeLeft(newTime);
                  setDuration(newTime); 
                }}
                sessionCount={sessionCount}
                sessionsBeforeLongBreak={timerSettings.sessionsBeforeLongBreak}
                timerSettings={timerSettings}
                modes={modes}
            />
          </>
        );
      case 'stats': return <Stats key="stats" history={statsHistory} />;
      case 'settings':
        return (
          <Settings 
            key="settings"
            notifications={notifications}
            sound={sound}
            haptics={haptics}
            hapticIntensity={hapticIntensity}
            toggleNotifications={() => handleNotificationToggle()}
            toggleSound={() => setSound(!sound)}
            toggleHaptics={() => setHaptics(!haptics)}
            setHapticIntensity={setHapticIntensity}
            onBack={() => setView('timer')}
            timerSettings={timerSettings}
            updateTimerSettings={(s) => setTimerSettings({...timerSettings, ...s})}
            customThemes={customThemes}
            updateModeTheme={(m, t) => setCustomThemes({...customThemes, [m]: t})}
            theme={theme}
            toggleTheme={toggleTheme}
            font={font}
            setFont={handleFontChange}
            soundType={soundType}
            setSoundType={(t) => { setSoundType(t); SoundService.play(t, customSoundData, alarmVolume); }}
            customSoundData={customSoundData}
            setCustomSoundData={setCustomSoundData}
            alarmVolume={alarmVolume}
            setAlarmVolume={(v) => { setAlarmVolume(v); if(sound) SoundService.play(soundType, customSoundData, v); }}
            onReset={resetToDefaults}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />
        );
    }
  };

  const handleTimerSkip = () => {
    if (timerMode === 'focus') {
      const isLongBreak = (sessionCount + 1) >= timerSettings.sessionsBeforeLongBreak;
      setTimerMode(isLongBreak ? 'longBreak' : 'shortBreak');
      const d = isLongBreak ? timerSettings.longBreak : timerSettings.shortBreak;
      setDuration(d * 60);
      setTimeLeft(d * 60);
      if (!isLongBreak) setSessionCount(prev => prev + 1); else setSessionCount(0);
    } else {
      setTimerMode('focus');
      setDuration(timerSettings.focus * 60);
      setTimeLeft(timerSettings.focus * 60);
    }
    setIsTimerActive(false);
  };

  const handleNotificationToggle = () => {
    if (!notifications && 'Notification' in window) {
      Notification.requestPermission().then(p => { if (p === 'granted') setNotifications(true); });
    } else setNotifications(false);
  };

  const activeModeConfig = getModesConfig()[timerMode];

  return (
    <div 
        className="relative w-full min-h-screen text-slate-800 dark:text-slate-100 bg-surface-light dark:bg-surface-dark transition-colors duration-300"
        style={{ fontFamily: font }}
    >
      
      {/* Alarm Background Pulse - Optimized: Uses Transform Only */}
      <AnimatePresence>
        {isAlarmRinging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`fixed inset-0 z-[115] pointer-events-none ${activeModeConfig.bgColor} transform translate-z-0`}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAlarmRinging && (
          <AlarmOverlay 
            mode={timerMode} 
            onStop={handleAlarmStop} 
            accentColor={activeModeConfig.bgColor}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" className="absolute inset-0 flex items-center justify-center bg-surface-light dark:bg-surface-dark z-50 h-screen" exit={{ opacity: 0 }}>
            <ExpressiveLoader />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center pt-10 px-6 pb-20 w-full h-full max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div 
                key={view} 
                className="w-full will-change-transform" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.4 }}
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
      {!loading && <FloatingNav view={view} setView={setView} visible={!isTimerActive} />}
    </div>
  );
};

export default App;