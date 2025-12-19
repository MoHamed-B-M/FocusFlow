import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, Activity } from 'lucide-react';

interface DailyStats {
  focus: number; // seconds
  break: number; // seconds
}

export type StatsHistory = Record<string, DailyStats>;

interface StatsProps {
  history: StatsHistory;
}

const Stats: React.FC<StatsProps> = ({ history }) => {
  // Helpers
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const getTodayKey = () => new Date().toLocaleDateString('en-CA');
  
  const todayStats = history[getTodayKey()] || { focus: 0, break: 0 };

  // Generate Last Week Data (last 7 days)
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weekData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toLocaleDateString('en-CA');
    const dayStat = history[key] || { focus: 0, break: 0 };
    return {
      day: days[d.getDay()],
      focus: dayStat.focus,
      // Normalize height for chart (max 6 hours example, prevent division by zero)
      heightPercentage: Math.min(100, Math.max(10, (dayStat.focus / (6 * 3600)) * 100))
    };
  });

  const totalWeekFocus = weekData.reduce((acc, curr) => acc + curr.focus, 0);
  const avgWeekFocus = totalWeekFocus > 0 ? totalWeekFocus / 7 : 0;

  return (
    <motion.div 
      className="w-full h-full flex flex-col px-6 pt-4 pb-40 overflow-y-auto no-scrollbar will-change-transform"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <header className="mb-8 text-center flex-shrink-0">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Stats</h1>
      </header>

      {/* Today Section */}
      <section className="mb-8 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Today</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#B8F3D5] dark:bg-[#064e3b] p-5 rounded-[24px] flex flex-col justify-between h-32 shadow-sm transform transition-transform hover:scale-[1.02]">
            <span className="text-[#1E5443] dark:text-[#a7f3d0] font-medium text-sm">Focus</span>
            <span className="text-[#1E5443] dark:text-white text-3xl font-bold tracking-tight">
              {formatDuration(todayStats.focus)}
            </span>
          </div>
          <div className="bg-[#C3EFFF] dark:bg-[#0c4a6e] p-5 rounded-[24px] flex flex-col justify-between h-32 shadow-sm transform transition-transform hover:scale-[1.02]">
            <span className="text-[#2D5A68] dark:text-[#bae6fd] font-medium text-sm">Break</span>
            <span className="text-[#2D5A68] dark:text-white text-3xl font-bold tracking-tight">
              {formatDuration(todayStats.break)}
            </span>
          </div>
        </div>
      </section>

      {/* Last Week Section */}
      <section className="mb-8 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Last week</h2>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{formatDuration(avgWeekFocus)}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">daily average</span>
        </div>

        {/* Bar Chart - Optimized using scaleY for 60fps */}
        <div className="flex items-end justify-between h-48 mb-2 px-2 gap-2">
           {weekData.map((data, index) => (
             <div key={index} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group cursor-pointer">
               <div className="w-full max-w-[40px] h-full flex items-end relative bg-slate-100/50 dark:bg-slate-800/50 rounded-full overflow-hidden transform translate-z-0">
                 <motion.div 
                   className="w-full h-full rounded-t-full bg-[#1E5443] dark:bg-[#34d399] group-hover:bg-[#153D32] dark:group-hover:bg-[#10b981] origin-bottom will-change-transform"
                   initial={{ scaleY: 0 }}
                   animate={{ scaleY: data.heightPercentage / 100 }}
                   transition={{ duration: 0.8, delay: index * 0.05, type: "spring", stiffness: 100, damping: 20 }}
                 />
               </div>
               <span className="text-xs font-bold text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400">{data.day}</span>
             </div>
           ))}
        </div>
      </section>

      {/* Analysis Section - Dynamic Map */}
      <section className="relative overflow-hidden rounded-[24px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 flex-shrink-0 min-h-[220px] shadow-sm transform translate-z-0">
         <div className="flex justify-between items-start mb-4">
           <div>
             <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Activity size={18} className="text-primary-600 dark:text-primary-400" />
                Focus Analysis
             </h2>
             <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Weekly consistency trend</p>
           </div>
         </div>
         
         {/* Line/Area Chart Visualization of the Week - Optimized */}
         <div className="h-32 flex items-end gap-1 justify-between mt-8">
            {weekData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end relative group">
                    {/* Tooltip */}
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 dark:bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-10 pointer-events-none">
                        {formatDuration(data.focus)}
                    </div>
                    
                    <motion.div 
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: data.heightPercentage / 100, opacity: 1 }}
                        style={{ originY: 1 }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                        className="w-full mx-0.5 bg-primary-200/50 dark:bg-primary-900/30 rounded-t-md relative overflow-hidden will-change-transform h-full"
                    >
                        {/* Fill darker based on intensity */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-primary-600 dark:bg-primary-400 opacity-60 h-full" 
                        />
                    </motion.div>
                </div>
            ))}
         </div>
      </section>

    </motion.div>
  );
};

export default React.memo(Stats);