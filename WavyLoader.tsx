import React from 'react';
import { motion } from 'framer-motion';

const WavyLoader: React.FC = () => {
  const loadingContainerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const loadingCircleVariants = {
    start: {
      y: "0%",
    },
    end: {
      y: "100%",
    },
  };

  const circleTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full z-50">
      <motion.div
        className="flex space-x-3"
        variants={loadingContainerVariants}
        initial="start"
        animate="end"
      >
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            className="block w-4 h-4 rounded-full bg-primary-600"
            variants={loadingCircleVariants}
            transition={circleTransition}
          />
        ))}
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-xl font-medium text-primary-600 tracking-wide"
      >
        Loading FlowDo...
      </motion.p>
    </div>
  );
};

export default WavyLoader;