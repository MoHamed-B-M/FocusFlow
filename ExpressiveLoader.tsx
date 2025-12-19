import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Material 3 Expressive Loading Indicator (Minimal Version)
 * Recreates the shape-morphing "breathing" effect using SVG and Polar Coordinates.
 */

const ExpressiveLoader = () => {
  // --- Animation Constants ---
  const SPEED = 1;         // Animation speed multiplier
  const POINT_COUNT = 6;  // Frequency (how many points the star has)
  const RADIUS = 50;
  const CENTER = 100;
  const MAX_AMPLITUDE = 8; // Max depth of the waves

  // --- Refs for DOM manipulation ---
  const requestRef = useRef<number>(0);
  const timeRef = useRef(0);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Generates the SVG path data for a wavy circle using polar coordinates.
   */
  const generateWavyPath = (amplitude: number, rotationOffset: number) => {
    const points = [];
    const segments = 120;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      
      // Polar Coordinate Formula: r = R + A * sin(k * theta)
      const r = RADIUS + amplitude * Math.sin(POINT_COUNT * (theta + rotationOffset));

      const x = CENTER + r * Math.cos(theta);
      const y = CENTER + r * Math.sin(theta);
      points.push(`${x},${y}`);
    }

    // SVG path command: Move to first point, Line to rest, Close path
    return `M ${points[0]} L ${points.slice(1, points.length - 1).join(' ')} Z`;
  };

  /**
   * The Animation Loop
   */
  const animate = (time: number) => {
    if (timeRef.current === 0) timeRef.current = time;
    
    // Continuous time variable
    const t = time / 1000 * SPEED; 

    // 1. Calculate "Breathing" (Amplitude)
    // Oscillate between 0 and MAX_AMPLITUDE for the morphing effect.
    // Use Math.sin mapped from -1..1 to 0..1 for a smooth transition.
    const curvedProgress = (Math.sin(t * 3) + 1) / 2;
    const currentAmplitude = curvedProgress * MAX_AMPLITUDE;

    // 2. Calculate Rotation
    const rotation = t * 60; // Continuous rotation in degrees

    // 3. Update the Path and Rotation
    if (pathRef.current) {
      pathRef.current.setAttribute('d', generateWavyPath(currentAmplitude, 0));
    }
    
    if (containerRef.current) {
        containerRef.current.style.transform = `rotate(${rotation}deg)`;
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  // Effect to start and cleanup the animation loop
  useEffect(() => {
    // 1. Initial Draw: Ensure a circle is drawn immediately
    if (pathRef.current) {
        pathRef.current.setAttribute('d', generateWavyPath(0, 0));
    }

    // 2. Start Animation
    timeRef.current = 0; 
    requestRef.current = requestAnimationFrame(animate);
    
    // Cleanup function
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    // Outer container adapted to use app theme background
    <div className="flex flex-col items-center justify-center w-full h-full bg-surface-light dark:bg-surface-dark z-50">
        
      {/* Rotation Container */}
      <div 
        ref={containerRef}
        className="w-32 h-32 flex items-center justify-center will-change-transform"
      >
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full drop-shadow-xl text-primary-600 dark:text-primary-200 fill-current"
        >
          {/* The Morphing Path */}
          <path 
            ref={pathRef} 
            d="" 
            stroke="none"
          />
        </svg>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-col items-center"
      >
         <h1 className="text-3xl font-serif font-medium text-slate-800 dark:text-slate-100 tracking-tight">
            Focus<span className="font-mono font-normal text-primary-600 dark:text-primary-400">Flow</span>
         </h1>
      </motion.div>
    </div>
  );
};

export default ExpressiveLoader;