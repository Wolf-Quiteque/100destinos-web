"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Bus 
} from 'lucide-react';
import Image from 'next/image';

import { useRouter } from 'next/navigation';

import BusTicketLoader from '../components/BusTicketLoader';


export default function BusTicketSearch() {
  const router = useRouter()
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [searchAnimationStage, setSearchAnimationStage] = useState(0);
  
  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Automatic image carousel effect

  useEffect(() => {
      if(searchAnimationStage == 6 ){
        router.push('/bilhetes')
      }
    
  }, [searchAnimationStage]);

  const angolianProvinces = [
    'Luanda', 'Benguela', 'Huambo', 'Huíla', 'Cabinda', 
    'Cunene', 'Cuando Cubango', 'Zaire', 'Uíge', 'Malanje'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Start the sequential animation
    startSequentialAnimation();
  };

  const startSequentialAnimation = () => {
    // Trigger sequential animation stages
    const animationStages = [
      () => setSearchAnimationStage(1),   // Title slides
      () => setSearchAnimationStage(2),   // Departure input slides
      () => setSearchAnimationStage(3),   // Destination input slides
      () => setSearchAnimationStage(4),   // Date and trip type slides
      () => setSearchAnimationStage(5),   // Search button slides
      () => setSearchAnimationStage(6)    // Final stage with ticket results
    ];

    // Execute stages with delays
    animationStages.forEach((stage, index) => {
      setTimeout(stage, index * 300); // 300ms between each stage
    });
  };

  // Sequential slide animation variants
  const createSequentialSlideVariants = (exitDirection = -1) => ({
    initial: { 
      opacity: 1, 
      x: 0 
    },
    animate: {
      opacity: 0,
      x: `${exitDirection * 100}%`,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  });

  // Fall variants for ticket cards (unchanged)
  const fallVariants = {
    initial: { 
      opacity: 0, 
      y: -100,
      rotate: Math.random() * 20 - 10
    },
    animate: { 
      opacity: 1, 
      y: 0,
      rotate: 0,
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 10,
        delay: 0.8
      }
    }
  };

  // Sample ticket data
  const foundTickets = [
    {
      id: 1,
      price: 5500,
      company: 'TransAngola',
      time: '08:00 AM',
      seats: 12
    },
    {
      id: 2,
      price: 6200,
      company: 'ExpressBus',
      time: '10:30 AM',
      seats: 8
    },
    {
      id: 3,
      price: 5800,
      company: 'RápidoViagem',
      time: '02:15 PM',
      seats: 15
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800">
      {/* Background Image Carousel */}
    

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-6"
        >
          {searchAnimationStage < 6 ? (
           <form onSubmit={handleSearch} className="space-y-4">
           {/* Title Section */}
           <motion.div 
             variants={createSequentialSlideVariants()}
             initial="initial"
             animate={searchAnimationStage > 0 ? "animate" : "initial"}
               className="text-center mb-6 flex items-center justify-center"
           >
            <img src="/img/logoff.png" style={{height:60}} />
           </motion.div>

           {/* Departure Selection */}
           <motion.div 
             variants={createSequentialSlideVariants()}
             initial="initial"
             animate={searchAnimationStage > 1 ? "animate" : "initial"}
             className="relative"
           >
             <label className="block text-black mb-2 flex items-center">
               <MapPin className="mr-2 text-orange-500" size={20} />
               Origem
             </label>
             <select 
               value={departure}
               onChange={(e) => setDeparture(e.target.value)}
               className="w-full p-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-black placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
               required
             >
               <option value="">Seleciona Provincia</option>
               {angolianProvinces.map((province) => (
                 <option key={province} value={province} className="bg-gray-800 text-white">{province}</option>
               ))}
             </select>
           </motion.div>

           {/* Destination Selection */}
           <motion.div 
             variants={createSequentialSlideVariants()}
             initial="initial"
             animate={searchAnimationStage > 2 ? "animate" : "initial"}
             className="relative"
           >
             <label className="block text-black mb-2 flex items-center">
               <MapPin className="mr-2 text-orange-500" size={20} />
               Destino
             </label>
             <select 
               value={destination}
               onChange={(e) => setDestination(e.target.value)}
               className="w-full p-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-black placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
               required
             >
               <option value="">Seleciona Provincia</option>
               {angolianProvinces.map((province) => (
                 <option key={province} value={province} className="bg-gray-800 text-white">{province}</option>
               ))}
             </select>
           </motion.div>

           {/* Date and Trip Type */}
           <motion.div 
             variants={createSequentialSlideVariants()}
             initial="initial"
             animate={searchAnimationStage > 3 ? "animate" : "initial"}
             className="grid grid-cols-2 gap-4"
           >
             <div>
               <label className="block text-black mb-2 flex items-center">
                 <Calendar className="mr-2 text-orange-500" size={20} />
                 Date
               </label>
               <input 
                 type="date"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
                 className="w-full p-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                 required
               />
             </div>
             <div>
               <label className="block text-black mb-2">viagem</label>
               <div className="flex items-center space-x-4">
                 <label className="flex items-center text-black">
                   <input 
                     type="radio"
                     checked={!isRoundTrip}
                     onChange={() => setIsRoundTrip(false)}
                     className="mr-2 text-orange-500 focus:ring-orange-500"
                   />
                   Ida
                 </label>
                 <label className="flex items-center text-black">
                   <input 
                     type="radio"
                     checked={isRoundTrip}
                     onChange={() => setIsRoundTrip(true)}
                     className="mr-2 text-orange-500 focus:ring-orange-500"
                   />
                   Ida & Volta
                 </label>
               </div>
             </div>
           </motion.div>

           {/* Search Button */}
           <motion.button
             variants={createSequentialSlideVariants()}
             initial="initial"
             animate={searchAnimationStage > 4 ? "animate" : "initial"}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             type="submit"
             className="w-full bg-orange-600 text-white p-4 rounded-xl font-bold uppercase tracking-wide 
             hover:bg-orange-700 transition-colors duration-300 flex items-center justify-center space-x-2"
           >
             <span>Pesquisa Bilhete</span>
             <ArrowRight size={20} />
           </motion.button>
         </form>
          ) : (
            // Falling Ticket Cards Section
            <BusTicketLoader />
          )}
        </motion.div>
      </div>
    </div>
  );
}