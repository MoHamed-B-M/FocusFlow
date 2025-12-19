import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { Timer, BarChart2, Settings as SettingsIcon, Menu, X } from 'lucide-react';

interface FloatingNavProps {
  view: 'timer' | 'stats' | 'settings';
  setView: (view: 'timer' | 'stats' | 'settings') => void;
  visible?: boolean;
}

type NavItem = {
  id: 'timer' | 'stats' | 'settings';
  icon: React.ElementType;
  label: string;
};

const navItems: NavItem[] = [
  { id: 'timer', icon: Timer, label: 'Timer' },
  { id: 'stats', icon: BarChart2, label: 'Stats' },
  { id: 'settings', icon: SettingsIcon, label: 'Settings' },
];

const FloatingNav: React.FC<FloatingNavProps> = ({ view, setView, visible = true }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Responsive Check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMobileNavClick = (id: 'timer' | 'stats' | 'settings') => {
    setView(id);
    setIsMenuOpen(false);
  };

  // Expressive Menu Variants
  const menuContainerVariants = {
    closed: {
        opacity: 0,
        scale: 0.8,
        y: 20, 
        x: 20,
        transition: { 
            type: "spring" as const, 
            stiffness: 350, 
            damping: 30,
            when: "afterChildren"
        }
    },
    open: {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        transition: { 
            type: "spring" as const, 
            stiffness: 300, 
            damping: 24,
            staggerChildren: 0.05,
            delayChildren: 0.05
        }
    }
  };

  const menuItemVariants = {
    closed: { opacity: 0, x: 15 },
    open: { 
        opacity: 1, 
        x: 0,
        transition: { type: "spring" as const, stiffness: 300, damping: 25 }
    }
  };

  return (
    <motion.div
        animate={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
        transition={{ duration: 0.4 }}
    >
        {isMobile ? (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            
            {/* Backdrop for click outside */}
            <AnimatePresence>
                {isMenuOpen && visible && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/20 backdrop-blur-[2px] -z-10 pointer-events-auto"
                    onClick={() => setIsMenuOpen(false)}
                />
                )}
            </AnimatePresence>

            {/* Expressive Menu Card */}
            <AnimatePresence>
              {isMenuOpen && visible && (
                <motion.div
                    variants={menuContainerVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="absolute bottom-20 right-0 bg-white dark:bg-slate-800 rounded-[28px] shadow-2xl border border-slate-100 dark:border-slate-700 p-3 min-w-[200px] pointer-events-auto origin-bottom-right"
                >
                  <div className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const isActive = view === item.id;
                      return (
                        <motion.button
                          key={item.id}
                          variants={menuItemVariants}
                          onClick={() => handleMobileNavClick(item.id)}
                          className={`flex items-center gap-4 px-4 py-3 rounded-[20px] transition-colors w-full text-left ${
                            isActive 
                              ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-200 font-bold' 
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium'
                          }`}
                          whileTap={{ scale: 0.98 }}
                        >
                          <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                          <span className="text-sm tracking-wide">{item.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Trigger FAB */}
            <motion.button
              layout
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`pointer-events-auto w-16 h-16 rounded-[24px] shadow-xl flex items-center justify-center transition-all duration-300 z-50 ${
                isMenuOpen 
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rotate-180' 
                    : 'bg-primary-600 text-white'
              }`}
              whileTap={{ scale: 0.9 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={28} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 45, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -45, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={28} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            
          </div>
        ) : (
            // Desktop Layout - Optimized with LayoutGroup for 60fps FLIP animations
            <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 h-auto hidden md:block">
              <LayoutGroup>
                <motion.nav
                  layout
                  className="flex flex-col items-center gap-4 p-2 rounded-[32px] bg-[#E0F2F1]/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-xl shadow-teal-900/10 dark:shadow-black/40 will-change-transform"
                >
                  {navItems.map((item) => {
                    const isActive = view === item.id;
                    
                    return (
                      <motion.button
                        layout
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`relative flex flex-col items-center justify-center rounded-full text-sm font-medium transition-colors z-10 overflow-hidden ${
                          isActive ? 'text-[#004D40] dark:text-[#ccfbf1]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        // Use style for static dimensions, layout handles the rest
                        style={{ width: 48, height: isActive ? 80 : 48 }} 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-[#B2DFDB] dark:bg-[#0f766e] rounded-full -z-10"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                          />
                        )}
                        
                        <span className="relative z-10 flex flex-col items-center gap-1">
                          <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                          {isActive && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="text-[10px] font-bold"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.nav>
              </LayoutGroup>
            </div>
        )}
    </motion.div>
  );
};

export default FloatingNav;