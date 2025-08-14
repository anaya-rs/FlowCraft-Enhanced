import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface RouteLoadingProps {
  message?: string;
}

const RouteLoading: React.FC<RouteLoadingProps> = ({ 
  message = "Initializing..." 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 flex items-center justify-center"
    >
      <div className="text-center">
        {/* Subtle Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-orange-500/40 border-t-orange-500 rounded-full mx-auto mb-4"
        />
        
        {/* Loading Text */}
        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-medium text-gray-500"
        >
          {message}
        </motion.h2>
      </div>
    </motion.div>
  );
};

export default RouteLoading;
