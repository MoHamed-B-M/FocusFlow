import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronDown, Moon, Sun, Timer, Shield, Github, Heart, Smartphone, 
  Palette, Brain, Coffee, Armchair, Rocket, Book, Terminal, Users,
  Volume2, Bell, Info, Type, Music, Upload, Play, Check, AlertTriangle, Maximize, Zap
} from 'lucide-react';
import { SoundType } from '../App';

interface TimerSettingsData {
    focus: number;
    shortBreak: number;
    longBreak: number;
    sessionsBeforeLongBreak: number;
    autoStart: boolean;
}

export const THEME_COLORS = [
  { name: 'Emerald', primary: 'bg-[#1E5443]', darkPrimary: 'dark:bg-[#80D0B0]', text: 'text-[#1E5443]', darkText: 'dark:text-[#80D0B0]', bg: 'bg-[#B8F3D5]', ring: '#1E5443' },
  { name: 'Ocean', primary: 'bg-[#004A77]', darkPrimary: 'dark:bg-[#C3EFFF]', text: 'text-[#004A77]', darkText: 'dark:text-[#C3EFFF]', bg: 'bg-[#C3EFFF]', ring: '#004A77' },
  { name: 'Amethyst', primary: 'bg-[#4F378B]', darkPrimary: 'dark:bg-[#D0BCFF]', text: 'text-[#4F378B]', darkText: 'dark:text-[#D0BCFF]', bg: 'bg-[#EADDFF]', ring: '#4F378B' },
  { name: 'Rose', primary: 'bg-[#89113D]', darkPrimary: 'dark:bg-[#FFD8E4]', text: 'text-[#89113D]', darkText: 'dark:text-[#FFD8E4]', bg: 'bg-[#FFD8E4]', ring: '#89113D' },
  { name: 'Amber', primary: 'bg-[#725C00]', darkPrimary: 'dark:bg-[#FFE08D]', text: 'text-[#725C00]', darkText: 'dark:text-[#FFE08D]', bg: 'bg-[#FFE08D]', ring: '#725C00' },
  { name: 'Slate', primary: 'bg-[#334155]', darkPrimary: 'dark:bg-[#cbd5e1]', text: 'text-[#334155]', darkText: 'dark:text-[#cbd5e1]', bg: 'bg-[#f1f5f9]', ring: '#334155' }
];

export const ICONS = [
  { id: 'brain', component: Brain },
  { id: 'coffee', component: Coffee },
  { id: 'armchair', component: Armchair },
  { id: 'rocket', component: Rocket },
  { id: 'book', component: Book },
  { id: 'terminal', component: Terminal },
  { id: 'palette', component: Palette },
  { id: 'users', component: Users }
];

const FONTS = [
    { name: 'Modern', value: 'Nunito, sans-serif' },
    { name: 'Clean', value: '"Inter", sans-serif' },
    { name: 'System', value: 'system-ui, -apple-system, sans-serif' },
    { name: 'Digital', value: '"Share Tech Mono", monospace' },
    { name: 'Serif', value: '"Playfair Display", serif' },
];

interface SettingsProps {
  notifications: boolean;
  sound: boolean;
  haptics: boolean;
  hapticIntensity: number;
  toggleNotifications: () => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  setHapticIntensity: (val: number) => void;
  onBack: () => void;
  timerSettings: TimerSettingsData;
  updateTimerSettings: (newSettings: Partial<TimerSettingsData>) => void;
  customThemes: any;
  updateModeTheme: (mode: string, theme: any) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  font: string;
  setFont: (font: string) => void;
  soundType: SoundType;
  setSoundType: (type: SoundType) => void;
  customSoundData: string | null;
  setCustomSoundData: (data: string | null) => void;
  alarmVolume: number;
  setAlarmVolume: (vol: number) => void;
  onReset: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const tapSpring = { scale: 0.95 };

const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = false 
}: { 
  title: string; 
  icon: any; 
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-4">
      <motion.button
        whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
             <Icon size={20} className="text-primary-600 dark:text-primary-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <ChevronDown size={20} className="text-slate-400" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <div className="px-6 pb-8 pt-0 border-t border-slate-50 dark:border-slate-700/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ExpressiveSlider = ({ 
    value, 
    min, 
    max, 
    step = 1,
    onChange 
}: { 
    value: number; 
    min: number; 
    max: number; 
    step?: number;
    onChange: (val: number) => void 
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="flex flex-col items-center w-full py-2">
             <div className="relative w-full h-12 flex items-center select-none touch-none">
                <div className="absolute w-full h-12 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden"></div>
                <motion.div 
                    className="absolute h-12 bg-primary-100 dark:bg-primary-800/30 rounded-full left-0 top-0 pointer-events-none" 
                    initial={false}
                    animate={{ width: `${percentage}%` }}
                />
                <motion.div
                    className="absolute h-10 min-w-[40px] px-2 rounded-full bg-primary-600 text-white shadow-sm z-10 flex items-center justify-center pointer-events-none"
                    initial={false}
                    animate={{ 
                        left: `${percentage}%`,
                        scale: isDragging ? 1.1 : 1,
                        x: "-50%" 
                    }}
                >
                     <span className="text-xs font-bold select-none">{value.toFixed(1)}</span>
                </motion.div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
             </div>
        </div>
    );
};

// Mini Ring for Haptic Intensity Visualizer (Updated with padding)
const HapticRing = ({ value }: { value: number }) => {
    // Value is between 0.5 and 3.0
    const normalized = (value - 0.5) / 2.5; // 0 to 1
    const size = 24; 
    const stroke = 2.5;
    // Padding adjustment: subtract 2px from radius calculation
    const radius = (size - stroke) / 2 - 2; 
    const circ = 2 * Math.PI * radius;
    const offset = circ - (normalized * circ);
    
    return (
        <div className="relative w-6 h-6 flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
                <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-slate-200 dark:text-slate-700" />
                <motion.circle 
                    cx={size/2} cy={size/2} r={radius} 
                    stroke="currentColor" strokeWidth={stroke} fill="none" 
                    className="text-pink-500"
                    initial={false}
                    animate={{ strokeDashoffset: offset }}
                    style={{ strokeDasharray: circ, strokeLinecap: 'round' }}
                />
            </svg>
        </div>
    )
}

const Settings: React.FC<SettingsProps> = ({
  notifications,
  sound,
  haptics,
  hapticIntensity,
  toggleNotifications,
  toggleSound,
  toggleHaptics,
  setHapticIntensity,
  onBack,
  timerSettings,
  updateTimerSettings,
  customThemes,
  updateModeTheme,
  theme,
  toggleTheme,
  font,
  setFont,
  soundType,
  setSoundType,
  customSoundData,
  setCustomSoundData,
  alarmVolume,
  setAlarmVolume,
  onReset,
  isFullscreen,
  toggleFullscreen
}) => {
  const [activeThemeTab, setActiveThemeTab] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Limit file size to 1.5MB to prevent localStorage quotas issues
          if (file.size > 1500000) {
              alert("File is too large! Please choose a file under 1.5MB.");
              return;
          }

          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  const result = ev.target.result as string;
                  setCustomSoundData(result);
                  setSoundType('custom');
              }
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <motion.div
      className="w-full h-full flex flex-col px-4 pt-4 pb-24 overflow-y-auto no-scrollbar"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <header className="mb-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <motion.button 
              whileTap={tapSpring}
              onClick={onBack}
              className="p-3 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Settings</h1>
         </div>
      </header>

      <div className="space-y-4">
        <CollapsibleSection title="Appearance" icon={Palette} defaultOpen={true}>
            <div className="pt-4">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6">
                    {(['focus', 'shortBreak', 'longBreak'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveThemeTab(tab)}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                                activeThemeTab === tab 
                                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-200 shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('Break', ' Break')}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-3 ml-1">Color Palette</span>
                        <div className="flex flex-wrap gap-3 px-1">
                            {THEME_COLORS.map((c) => (
                                <motion.button
                                    key={c.name}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateModeTheme(activeThemeTab, { ...customThemes[activeThemeTab], color: c })}
                                    className={`w-10 h-10 rounded-full border-4 transition-all ${c.primary} ${
                                        customThemes[activeThemeTab].color.name === c.name ? 'border-primary-600 dark:border-white shadow-lg' : 'border-transparent'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block mb-3 ml-1">Mode Icon</span>
                        <div className="flex flex-wrap gap-2 px-1">
                            {ICONS.map((I) => (
                                <motion.button
                                    key={I.id}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateModeTheme(activeThemeTab, { ...customThemes[activeThemeTab], iconId: I.id })}
                                    className={`p-3 rounded-2xl transition-all ${
                                        customThemes[activeThemeTab].iconId === I.id 
                                        ? 'bg-primary-600 text-white shadow-lg' 
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    <I.component size={20} />
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50 space-y-4">
                        {/* Dark Mode Toggle */}
                        <button 
                            onClick={toggleTheme}
                            className={`w-full p-4 rounded-3xl transition-all flex items-center justify-between ${
                                theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-slate-50 border border-transparent'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                    {theme === 'dark' ? <Moon size={18} className="text-primary-300" /> : <Sun size={18} className="text-orange-500" />}
                                </div>
                                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Dark Mode</h3>
                            </div>
                            <div className={`w-11 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-300'}`}>
                                <motion.div animate={{ x: theme === 'dark' ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </button>

                         {/* Fullscreen Mode Toggle */}
                         <button 
                            onClick={toggleFullscreen}
                            className={`w-full p-4 rounded-3xl transition-all flex items-center justify-between ${
                                isFullscreen ? 'bg-slate-900 dark:bg-slate-700 border border-slate-700 dark:border-slate-500' : 'bg-slate-50 dark:bg-slate-900/50 border border-transparent'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${isFullscreen ? 'text-primary-600 dark:text-primary-300' : 'text-slate-400'}`}>
                                    <Maximize size={18} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Fullscreen Mode</h3>
                                    <p className="text-[10px] text-slate-500">Distraction-free view</p>
                                </div>
                            </div>
                            <div className={`w-11 h-6 rounded-full p-1 transition-colors ${isFullscreen ? 'bg-primary-600' : 'bg-slate-300'}`}>
                                <motion.div animate={{ x: isFullscreen ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection title="Typography" icon={Type}>
            <div className="space-y-4 pt-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-[24px]">
                    {FONTS.map((f) => (
                        <button
                            key={f.name}
                            onClick={() => setFont(f.value)}
                            className={`w-full text-left p-4 rounded-[20px] transition-all flex items-center justify-between mb-1 ${
                                font === f.value 
                                ? 'bg-white dark:bg-slate-800 shadow-sm' 
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800/50'
                            }`}
                        >
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200" style={{ fontFamily: f.value }}>
                                {f.name} (Aa)
                            </span>
                            {font === f.value && <div className="w-3 h-3 bg-primary-600 rounded-full" />}
                        </button>
                    ))}
                </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection title="Timer Settings" icon={Timer}>
            <div className="space-y-6 pt-4">
                
                {/* Auto Start Toggle */}
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 ${timerSettings.autoStart ? 'text-amber-500' : 'text-slate-400'}`}>
                            <Zap size={18} />
                        </div>
                        <div className="text-left">
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">Auto-Start Timer</span>
                            <span className="text-[10px] text-slate-500">Start focus/break automatically</span>
                        </div>
                    </div>
                    <button
                        onClick={() => updateTimerSettings({ autoStart: !timerSettings.autoStart })}
                        className={`w-11 h-6 rounded-full p-1 transition-colors ${timerSettings.autoStart ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                        <motion.div animate={{ x: timerSettings.autoStart ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                    </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px]">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Focus Duration</span>
                        <span className="text-primary-600 dark:text-primary-300 font-serif text-2xl font-bold">{timerSettings.focus}m</span>
                     </div>
                     <input 
                        type="range" min="1" max="120" 
                        value={timerSettings.focus} 
                        onChange={(e) => updateTimerSettings({ focus: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary-600"
                     />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[28px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">Short Break</span>
                            <span className="text-primary-600 dark:text-primary-300 font-bold">{timerSettings.shortBreak}m</span>
                        </div>
                        <input 
                            type="range" min="1" max="30" 
                            value={timerSettings.shortBreak} 
                            onChange={(e) => updateTimerSettings({ shortBreak: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary-600"
                        />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[28px]">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">Long Break</span>
                            <span className="text-primary-600 dark:text-primary-300 font-bold">{timerSettings.longBreak}m</span>
                        </div>
                        <input 
                            type="range" min="1" max="60" 
                            value={timerSettings.longBreak} 
                            onChange={(e) => updateTimerSettings({ longBreak: Number(e.target.value) })}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary-600"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[28px] flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Long Break Interval</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Sessions until long break</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => updateTimerSettings({ sessionsBeforeLongBreak: Math.max(1, timerSettings.sessionsBeforeLongBreak - 1) })} className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300">-</button>
                        <span className="font-bold text-primary-600 dark:text-primary-300">{timerSettings.sessionsBeforeLongBreak}</span>
                        <button onClick={() => updateTimerSettings({ sessionsBeforeLongBreak: timerSettings.sessionsBeforeLongBreak + 1 })} className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300">+</button>
                    </div>
                </div>
            </div>
        </CollapsibleSection>

        <CollapsibleSection title="Feedback" icon={Shield}>
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 ${sound ? 'text-primary-600' : 'text-slate-400'}`}>
                            <Volume2 size={18} />
                        </div>
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Alert Sounds</span>
                    </div>
                    <button
                        onClick={toggleSound}
                        className={`w-11 h-6 rounded-full p-1 transition-colors ${sound ? 'bg-primary-600' : 'bg-slate-300'}`}
                    >
                        <motion.div animate={{ x: sound ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                    </button>
                </div>

                {sound && (
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl space-y-3">
                        {/* Volume Slider */}
                        <div className="mb-6 border-b border-slate-200 dark:border-slate-700/50 pb-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Alarm Volume</span>
                            <ExpressiveSlider min={0} max={1} step={0.05} value={alarmVolume} onChange={setAlarmVolume} />
                        </div>

                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tone Selection</span>
                        
                        {(['pulse', 'digital', 'custom'] as const).map((type) => (
                            <div 
                                key={type} 
                                className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-colors ${
                                    soundType === type 
                                    ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                }`}
                                onClick={() => setSoundType(type)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        soundType === type ? 'border-primary-600' : 'border-slate-300'
                                    }`}>
                                        {soundType === type && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
                                        {type === 'custom' ? 'Custom Sound' : type + ' Tone'}
                                    </span>
                                </div>
                                {type === 'custom' && !customSoundData && (
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">None Set</span>
                                )}
                            </div>
                        ))}

                        {soundType === 'custom' && (
                            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    accept="audio/*" 
                                    className="hidden" 
                                    onChange={handleFileUpload}
                                />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <Upload size={14} />
                                        {customSoundData ? 'Change File' : 'Upload Audio'}
                                    </button>
                                    {customSoundData && (
                                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold px-2">
                                            <Check size={14} />
                                            <span>Ready</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 text-center">Max size: 1.5MB. Stored locally.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[32px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 ${haptics ? 'text-pink-500' : 'text-slate-400'}`}>
                                <Smartphone size={18} />
                            </div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Haptic Feedback</span>
                        </div>
                        <button
                            onClick={toggleHaptics}
                            className={`w-11 h-6 rounded-full p-1 transition-colors ${haptics ? 'bg-pink-500' : 'bg-slate-300'}`}
                        >
                            <motion.div animate={{ x: haptics ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                        </button>
                    </div>
                    {haptics && (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700/30">
                             <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Feedback Intensity</span>
                                {/* Circular Visualizer */}
                                <HapticRing value={hapticIntensity} />
                            </div>
                            <ExpressiveSlider 
                                min={0.5} max={3.0} step={0.1}
                                value={hapticIntensity}
                                onChange={setHapticIntensity}
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 ${notifications ? 'text-amber-500' : 'text-slate-400'}`}>
                            <Bell size={18} />
                        </div>
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Notifications</span>
                    </div>
                    <button
                        onClick={toggleNotifications}
                        className={`w-11 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                        <motion.div animate={{ x: notifications ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                    </button>
                </div>
            </div>
        </CollapsibleSection>

        {/* Danger Zone */}
        <div className="mt-4 mb-8">
            <button 
                onClick={onReset}
                className="w-full py-4 rounded-[24px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors hover:bg-red-100 dark:hover:bg-red-900/40"
            >
                <AlertTriangle size={18} />
                Reset to Defaults
            </button>
        </div>

        <CollapsibleSection title="About" icon={Info}>
            <div className="pt-4 text-center">
                <h4 className="text-3xl font-serif font-bold text-slate-800 dark:text-slate-100 mb-1">Focus<span className="font-mono text-primary-600 italic">Flow</span></h4>
                <p className="text-[10px] font-bold text-slate-400 mb-8 uppercase tracking-widest">Version 2.0.0 • Reimagined</p>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] text-left space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                        "FocusFlow blends high-performance utility with expressive micro-interactions. Every frame is designed to foster deep focus and intentional work habits."
                    </p>
                </div>
            </div>
        </CollapsibleSection>
      </div>
    </motion.div>
  );
};

export default React.memo(Settings);