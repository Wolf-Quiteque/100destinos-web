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
import BustTicketLoaderOld from '../components/BustTicketLoaderOld';

export default function BusTicketSearch() {
  const router = useRouter()
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [searchAnimationStage, setSearchAnimationStage] = useState(0);
  const [userType, setUserType] = useState('Interprovincional');
  const [returnDate, setReturnDate] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const userSelect = localStorage.getItem('userSelect');
    setUserType(userSelect === 'Urbano' ? 'Urbano' : 'Interprovincional');
  }, []);

  const angolianProvinces = [
    'Luanda', 'Benguela', 'Huambo', 'Huíla', 'Cabinda', 
    'Cunene', 'Cuando Cubango', 'Zaire', 'Uíge', 'Malanje'
  ];

  const urbanStops = [
    'SOPRITE',
    'GAMEK',
    'ESTALAGEM (MOAGEM)',
    'ALIMENTO ANGOLA',
    'PONTE PARTIDA',
    'BOMBA DOS MOTILADOS',
    'PONTE AMARELA',
    'CONGOLESES',
    '2º PARAGEM DO JUMBO',
    'COMITE DO MPLA',
    'PARAGEM DA RÁDIO',
    'LARGO DAS ESCOLAS'
  ];

  useEffect(() => {
    if(searchAnimationStage == 6 ){
      router.push('/bilhetes')
    }
  }, [searchAnimationStage]);

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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-6"
        >
          {searchAnimationStage < 6 ? (
           <form onSubmit={handleSearch} className="space-y-4">
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
                 <option value="">
                   {userType === 'Urbano' ? 'Seleciona Paragem' : 'Seleciona Provincia'}
                 </option>
                 {(userType === 'Urbano' ? urbanStops : angolianProvinces).map((item) => (
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
                 <option value="">
                   {userType === 'Urbano' ? 'Seleciona Paragem' : 'Seleciona Provincia'}
                 </option>
                 {(userType === 'Urbano' ? urbanStops : angolianProvinces).map((item) => (
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
               <div className="mb-4 text-center justify-center justify-items-center">
                 <label className="block text-black mb-2">Tipo de Viagem</label>
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
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-black mb-2 flex items-center">
                     <Calendar className="mr-2 text-orange-500" size={20} />
                     Data de Partida
                   </label>
                   <input 
                     type="date"
                     value={date}
                     onChange={(e) => setDate(e.target.value)}
                     min={new Date().toISOString().split('T')[0]}
                     className="w-full p-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                     required
                   />
                 </div>

                 {isRoundTrip && (
                   <div>
                     <label className="block text-black mb-2 flex items-center">
                       <Calendar className="mr-2 text-orange-500" size={20} />
                       Data de Retorno
                     </label>
                     <input 
                       type="date"
                       value={returnDate || ''}
                       onChange={(e) => setReturnDate(e.target.value)}
                       min={date || new Date().toISOString().split('T')[0]}
                       className="w-full p-3 bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                       required={isRoundTrip}
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
               className="w-full bg-orange-600 text-white p-4 rounded-xl font-bold uppercase tracking-wide 
               hover:bg-orange-700 transition-colors duration-300 flex items-center justify-center space-x-2"
             >
               <span>Pesquisa Bilhete</span>
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