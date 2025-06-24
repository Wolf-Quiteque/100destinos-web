"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Bus } from 'lucide-react';
import TransportationLoader from './TransportationLoader';

const BusTicketLoader = ({ type }) => {
  
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center justify-center space-y-6 p-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center justify-center"
        >
          {type && <TransportationLoader type={type} />}
        
        </motion.div>
        
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            repeatType: "mirror",
            ease: "easeInOut"
          }}
          className="h-1 bg-orange-500/50 rounded-full overflow-hidden"
        >
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            className="h-full w-1/2 bg-orange-500 rounded-full"
          />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { delay: 0.3 }
          }}
          className="text-white text-lg font-medium"
        >
          A carregar bilhetes...
        </motion.p>
      </motion.div>
      
    </div>
  );
};

export default BusTicketLoader;
