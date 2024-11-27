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

export default function BusTicketSearch() {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [searchAnimationComplete, setSearchAnimationComplete] = useState(false);
  
  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    '/bg/sera.jpg',
    '/bg/tundavala.jpg',
    '/bg/palancanegra.jpg',
  ];

  // Automatic image carousel effect
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const angolianProvinces = [
    'Luanda', 'Benguela', 'Huambo', 'Huíla', 'Cabinda', 
    'Cunene', 'Cuando Cubango', 'Zaire', 'Uíge', 'Malanje'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchAnimationComplete(true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image Carousel */}
      <AnimatePresence>
        {backgroundImages.map((image, index) => (
          currentImageIndex === index && (
            <motion.div
              key={image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0"
            >
              <Image 
                src={image} 
                alt={`Background ${index + 1}`}
                fill
                quality={90}
                className="object-cover filter blur-sm"
              />
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-6"
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              <Bus className="inline-block mr-2 text-orange-500" size={36} />
             100 Destinos
            </h1>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Departure Selection */}
            <div className="relative">
              <label className="block text-white mb-2 flex items-center">
                <MapPin className="mr-2 text-orange-500" size={20} />
                Origem
              </label>
              <select 
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full p-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Seleciona Provincia</option>
                {angolianProvinces.map((province) => (
                  <option key={province} value={province} className="bg-gray-800">{province}</option>
                ))}
              </select>
            </div>

            {/* Destination Selection */}
            <div className="relative">
              <label className="block text-white mb-2 flex items-center">
                <MapPin className="mr-2 text-orange-500" size={20} />
                Destino
              </label>
              <select 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Seleciona Provincia</option>
                {angolianProvinces.map((province) => (
                  <option key={province} value={province} className="bg-gray-800">{province}</option>
                ))}
              </select>
            </div>

            {/* Date and Trip Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2 flex items-center">
                  <Calendar className="mr-2 text-orange-500" size={20} />
                  Date
                </label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">viagem</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center text-white">
                    <input 
                      type="radio"
                      checked={!isRoundTrip}
                      onChange={() => setIsRoundTrip(false)}
                      className="mr-2 text-orange-500 focus:ring-orange-500"
                    />
                    Ida
                  </label>
                  <label className="flex items-center text-white">
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
            </div>

            {/* Search Button */}
            <motion.button
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

          {/* Jaw-dropping Search Result Animation */}
          {searchAnimationComplete && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="mt-6 p-4 bg-white/40 backdrop-blur-xl rounded-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10, stiffness: 300 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Tickets Found!
                </h2>
                <p className="text-white">
                  {departure} → {destination} on {date}
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}