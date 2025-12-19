import React from 'react';
import { motion } from 'framer-motion';

interface TimerRingProps {
  progress: number; // 0 to 100
  color: string; // Tailwind text color class for progress
  trackColor: string; // Tailwind text color class for track
  size?: number;
  strokeWidth?: number;
}

const TimerRing: React.FC<TimerRingProps> = ({ 
  progress, 
  color, 
  trackColor,
  size = 320,
  strokeWidth = 14,
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Material 3 Expressive rings often have a small gap at the top (12 o'clock)
  const gapSize = 4; // degrees
  const totalLength = circumference * (1 - gapSize / 360);
  const rotationOffset = -90 + (gapSize / 2);
  
  // Calculate dash offset: 100% progress means offset is 0 (full ring)
  const offset = totalLength - (progress / 100) * totalLength;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg 
        className="w-full h-full transform" 
        style={{ transform: `rotate(${rotationOffset}deg)` }}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${totalLength} ${circumference}`}
          className={`${trackColor} opacity-10 dark:opacity-20 transition-colors duration-500`}
        />
        
        {/* Progress Indicator - Promoted to layer for performance */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${color} transition-colors duration-500`}
          style={{ willChange: "stroke-dashoffset" }} 
          animate={{ 
            strokeDasharray: `${totalLength} ${circumference}`,
            strokeDashoffset: offset 
          }}
          transition={{ 
            duration: 1,
            ease: "linear"
          }}
        />
      </svg>
    </div>
  );
};

export default React.memo(TimerRing);