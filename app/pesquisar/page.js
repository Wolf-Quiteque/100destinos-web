"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Bus,
  Loader2 // Added for loading state
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Added Supabase client
import BustTicketLoaderOld from '../components/BustTicketLoaderOld';

export default function BusTicketSearch() {
  const router = useRouter();
  const supabase = createClientComponentClient(); // Initialized Supabase client
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [searchAnimationStage, setSearchAnimationStage] = useState(0);
  const [userType, setUserType] = useState('Interprovincional'); // Default, will be updated
  const [returnDate, setReturnDate] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allRoutes, setAllRoutes] = useState([]); // State for all routes from DB
  const [filteredOrigins, setFilteredOrigins] = useState([]); // State for filtered origins
  const [filteredDestinations, setFilteredDestinations] = useState([]); // State for filtered destinations
  const [loadingRoutes, setLoadingRoutes] = useState(true); // State for loading indicator
  const [returnRouteExists, setReturnRouteExists] = useState(false); // State to track if return route is possible

  useEffect(() => {
    // Set userType from localStorage first
    const userSelect = localStorage.getItem('userSelect');
    const initialUserType = userSelect === 'Urbano' ? 'Urbano' : 'Interprovincional';
    setUserType(initialUserType);

    // Fetch route data from Supabase
    const fetchRouteData = async () => {
      setLoadingRoutes(true);
      try {
        const { data, error } = await supabase
          .from('bus_routes')
          .select('origin, destination, urbano');

        if (error) {
          console.error('Error fetching routes:', error);
          // Handle error appropriately, maybe show a toast
        } else {
          setAllRoutes(data || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching routes:', err);
      } finally {
        setLoadingRoutes(false);
      }
    };

    fetchRouteData();
  }, [supabase]); // Dependency on supabase client

  // Effect to filter origins and destinations based on userType, allRoutes, and selected departure
  useEffect(() => {
    if (allRoutes.length > 0) {
      const isUrbano = userType === 'Urbano';
      // Filter routes based on userType first
      const relevantRoutes = allRoutes.filter(route => !!route.urbano === isUrbano);

      // Get all unique origins for the current userType
      const origins = [...new Set(relevantRoutes.map(route => route.origin))].sort();
      setFilteredOrigins(origins);

      // Reset departure if it's no longer valid for the current userType
      if (!origins.includes(departure)) {
        setDeparture('');
        setDestination(''); // Also reset destination if origin is reset
        setFilteredDestinations([]); // Clear destinations
      } else if (departure) {
        // If a valid origin is selected, filter destinations reachable from that origin
        const destinationsFromOrigin = relevantRoutes
          .filter(route => route.origin === departure)
          .map(route => route.destination);
        const uniqueDestinations = [...new Set(destinationsFromOrigin)].sort();
        setFilteredDestinations(uniqueDestinations);

        // Reset destination if the current selection is no longer valid for the selected origin
        if (!uniqueDestinations.includes(destination)) {
          setDestination('');
        }
      } else {
        // If no origin is selected, clear destinations
        setFilteredDestinations([]);
        setDestination('');
      }
    } else {
      // If no routes loaded, clear everything
      setFilteredOrigins([]);
      setFilteredDestinations([]);
      setDeparture('');
      setDestination('');
    }
  }, [allRoutes, userType, departure]); // Dependencies: allRoutes, userType, and departure

  // Effect to check if a return route exists
  useEffect(() => {
    if (departure && destination && allRoutes.length > 0) {
      const isUrbano = userType === 'Urbano';
      const exists = allRoutes.some(route =>
        route.origin === destination &&
        route.destination === departure &&
        !!route.urbano === isUrbano
      );
      setReturnRouteExists(exists);
      // If return doesn't exist, force one-way trip
      if (!exists) {
        setIsRoundTrip(false);
      }
    } else {
      setReturnRouteExists(false);
      setIsRoundTrip(false); // Also reset if origin/destination are cleared
    }
  }, [departure, destination, allRoutes, userType]); // Dependencies

  useEffect(() => {
    if (searchAnimationStage === 6) {
      // Construct query parameters
      const queryParams = new URLSearchParams({
        departure,
        destination,
        date,
        isRoundTrip: isRoundTrip.toString(),
      });
      if (isRoundTrip && returnDate) {
        queryParams.set('returnDate', returnDate);
      }
      router.push(`/bilhetes?${queryParams.toString()}`);
    }
  }, [searchAnimationStage, router, departure, destination, date, isRoundTrip, returnDate]); // Added dependencies for query params

  // Remove hardcoded arrays as they are no longer needed
  // const angolianProvinces = [ ... ];
  // const urbanStops = [ ... ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (isRoundTrip) {
      if (!returnDate) {
        alert('Por favor, selecione a data de retorno');
        return;
      }
      if (new Date(returnDate) <= new Date(date)) {
        alert('A data de retorno deve ser posterior à data de partida');
        return;
      }
    }
    startSequentialAnimation();
  };

  const startSequentialAnimation = () => {
    const animationStages = [
      () => setSearchAnimationStage(1),
      () => setSearchAnimationStage(2),
      () => setSearchAnimationStage(3),
      () => setSearchAnimationStage(4),
      () => setSearchAnimationStage(5),
      () => setSearchAnimationStage(6)
    ];
    animationStages.forEach((stage, index) => {
      setTimeout(stage, index * 300);
    });
  };

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

  // Removed foundTickets array as it's not used here

  return (
    // Added pb-20 md:pb-0 for app bar spacing on mobile
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 pb-20 md:pb-0"> 
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          // Removed card styling classes (bg, backdrop, border, rounded, shadow, p-6)
          className="w-full max-w-md" 
        >
          {searchAnimationStage < 6 ? (
           <form onSubmit={handleSearch} className="space-y-4">
             {/* Loading Indicator */}
             {loadingRoutes && (
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-2xl">
                 <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
               </div>
             )}
             <motion.div 
               variants={createSequentialSlideVariants()}
               initial="initial"
               animate={searchAnimationStage > 0 ? "animate" : "initial"}
               className="text-center mb-6"
             >
               <img src="/img/logoff.png" style={{height: 60}} className="mx-auto" />
               <h2 className="text-white mt-2 text-xl font-semibold">
                 {userType === 'Urbano' ? 'Viagem Urbana' : 'Viagem Interprovincial'}
               </h2>
             </motion.div>

             <motion.div 
               variants={createSequentialSlideVariants()}
               initial="initial"
               animate={searchAnimationStage > 1 ? "animate" : "initial"}
                className="relative"
             >
               {/* Changed label text color */}
               <label className="block text-white mb-2 flex items-center"> 
                 <MapPin className="mr-2 text-orange-500" size={20} />
                 Origem
               </label>
               <select 
                 value={departure}
                 onChange={(e) => setDeparture(e.target.value)}
                 // Updated select styling
                 className="w-full p-3 bg-gray-700/60 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={loadingRoutes} // Disable while loading
                >
                  <option value="">
                    {loadingRoutes ? 'Carregando...' : (userType === 'Urbano' ? 'Seleciona Paragem' : 'Seleciona Provincia')}
                  </option>
                  {filteredOrigins.map((item) => (
                    <option key={item} value={item} className="bg-gray-800 text-white">
                      {item}
                    </option>
                  ))}
                </select>
              </motion.div>

             <motion.div 
               variants={createSequentialSlideVariants()}
               initial="initial"
               animate={searchAnimationStage > 2 ? "animate" : "initial"}
                className="relative"
             >
                {/* Changed label text color */}
               <label className="block text-white mb-2 flex items-center">
                 <MapPin className="mr-2 text-orange-500" size={20} />
                 Destino
               </label>
               <select 
                 value={destination}
                 onChange={(e) => setDestination(e.target.value)}
                 // Updated select styling
                 className="w-full p-3 bg-gray-700/60 backdrop-blur-sm border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  disabled={loadingRoutes || !departure} // Disable if loading or no origin selected
                >
                  <option value="">
                    {loadingRoutes ? 'Carregando...' : (userType === 'Urbano' ? 'Seleciona Paragem' : 'Seleciona Provincia')}
                  </option>
                  {filteredDestinations.map((item) => (
                    <option key={item} value={item} className="bg-gray-800 text-white">
                      {item}
                    </option>
                  ))}
                </select>
              </motion.div>

             <motion.div 
               variants={createSequentialSlideVariants()}
               initial="initial"
               animate={searchAnimationStage > 3 ? "animate" : "initial"}
               className="space-y-4"
              >
                 <div className="mb-4">
                    {/* Changed label text color */}
                   <label className="block text-white mb-2">Tipo de Viagem</label>
                   <div className="flex items-center space-x-4 justify-center"> {/* Centered radio buttons */}
                      {/* Changed label text color */}
                     <label className="flex items-center text-white cursor-pointer">
                       <input 
                         type="radio"
                         name="tripType" // Added name for grouping
                        checked={!isRoundTrip}
                        onChange={() => setIsRoundTrip(false)}
                        className="mr-2 text-orange-500 focus:ring-orange-500"
                        disabled={loadingRoutes} // Disable while loading
                       />
                       Ida
                     </label>
                      {/* Changed label text color */}
                     <label className={`flex items-center text-white ${!returnRouteExists || loadingRoutes ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                       <input 
                         type="radio"
                         name="tripType" // Added name for grouping
                        checked={isRoundTrip}
                        onChange={() => setIsRoundTrip(true)}
                        className="mr-2 text-orange-500 focus:ring-orange-500"
                        disabled={!returnRouteExists || loadingRoutes} // Disable if no return route or loading
                      />
                      Ida e Volta
                    </label>
                  </div>
                  {!returnRouteExists && departure && destination && !loadingRoutes && (
                     <p className="text-xs text-red-400 mt-1 text-center">Viagem de volta não disponível para esta rota.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     {/* Changed label text color */}
                    <label className="block text-white mb-2 flex items-center">
                      <Calendar className="mr-2 text-orange-500" size={20} />
                      Data de Partida
                    </label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      // Updated input styling
                      className="w-full p-3 bg-gray-700/60 backdrop-blur-sm border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                       required
                       disabled={loadingRoutes} // Disable while loading
                     />
                  </div>

                  {isRoundTrip && (
                    <div>
                       {/* Changed label text color */}
                      <label className="block text-white mb-2 flex items-center">
                        <Calendar className="mr-2 text-orange-500" size={20} />
                        Data de Retorno
                      </label>
                      <input 
                        type="date"
                        value={returnDate || ''}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={date || new Date().toISOString().split('T')[0]}
                         // Updated input styling
                        className="w-full p-3 bg-gray-700/60 backdrop-blur-sm border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                         required={isRoundTrip}
                         disabled={loadingRoutes} // Disable while loading
                       />
                    </div>
                  )}
               </div>
             </motion.div>

             <motion.button
               variants={createSequentialSlideVariants()}
               initial="initial"
               animate={searchAnimationStage > 4 ? "animate" : "initial"}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
                type="submit"
                // Changed py-1.5 to py-1
                className={`w-full bg-orange-600 text-white py-1 px-4 rounded-xl font-bold uppercase tracking-wide 
                hover:bg-orange-700 transition-colors duration-300 flex items-center justify-center space-x-2
                ${loadingRoutes ? 'opacity-50 cursor-not-allowed' : ''}`} // Style when loading
                disabled={loadingRoutes} // Disable button while loading
              >
                {loadingRoutes ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                <span>{loadingRoutes ? 'Carregando...' : 'Pesquisar Bilhetes'}</span> {/* Updated text */}
               <ArrowRight size={20} />
             </motion.button>
           </form>
          ) : (
            <BustTicketLoaderOld />
          )}
        </motion.div>
      </div>
    </div>
  );
}
