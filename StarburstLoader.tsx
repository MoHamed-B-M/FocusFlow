import React from 'react';
import { motion } from 'framer-motion';

const StarburstLoader: React.FC = () => {
  // Generate a scalloped path (flower/starburst shape)
  const createScallopPath = (points: number, innerRadius: number, outerRadius: number) => {
    let path = "";
    const angleStep = (Math.PI * 2) / points;
    
    for (let i = 0; i < points; i++) {
      const angle = i * angleStep;
      const nextAngle = (i + 1) * angleStep;
      const midAngle = angle + angleStep / 2;
      
      const p1x = 50 + Math.cos(angle) * innerRadius;
      const p1y = 50 + Math.sin(angle) * innerRadius;
      
      const p2x = 50 + Math.cos(nextAngle) * innerRadius;
      const p2y = 50 + Math.sin(nextAngle) * innerRadius;
      
      const c1x = 50 + Math.cos(midAngle) * outerRadius;
      const c1y = 50 + Math.sin(midAngle) * outerRadius;

      if (i === 0) path += `M ${p1x} ${p1y}`;
      path += ` Q ${c1x} ${c1y} ${p2x} ${p2y}`;
    }
    path += " Z";
    return path;
  };

  const pathData = createScallopPath(12, 35, 48); // 12 points

  return (
    <div className="flex flex-col items-center justify-center h-full w-full z-50 bg-surface-light">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer Halo */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary-200 opacity-50"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Inner Scalloped Shape */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-20 h-20 text-primary-600 drop-shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
           <path d={pathData} fill="currentColor" />
        </motion.svg>
      </div>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-xl font-bold text-primary-600 tracking-wide"
      >
        FlowDo
      </motion.p>
    </div>
  );
};

export default StarburstLoader;