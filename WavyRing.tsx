import React from 'react';
import { motion } from 'framer-motion';

interface WavyRingProps {
  progress: number; // 0 to 100
  color: string; // Text color class or hex for the progress bar
  trackColor: string; // Background track color class or hex
  size?: number;
  strokeWidth?: number;
}

const WavyRing: React.FC<WavyRingProps> = ({ 
  progress, 
  color, 
  trackColor,
  size = 320,
  strokeWidth = 16 
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Invert progress for strokeDashoffset (100% progress = 0 offset)
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full transform -rotate-90">
        {/* Track Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${trackColor} opacity-30`}
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={color}
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
};

export default WavyRing;