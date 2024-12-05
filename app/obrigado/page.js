'use client'
import React, { useEffect, useState } from 'react';
import { 
  Check, 
  MapPin, 
  Ticket, 
  Bus, 
  Download 
} from 'lucide-react';
import  generatePassengerTickets from '../pagamento/generatePassengerTickets';
import { useRouter, useSearchParams } from 'next/navigation';

const ThankYouScreen = () => {
  const searchParams = useSearchParams();

  const [animationStage, setAnimationStage] = useState(0);
  const bookingId = searchParams.get('bookingId');

  const router = useRouter()
  const ticket = {
    id: 1,
    company: 'Huambo Expresse',
    origin: 'Luanda',
    destination: 'Huambo',
    departureTime: '08:00',
    arrivalTime: '16:30',
    price: 4500,
    duration: '8h 30m',
    availableSeats: 12
  };
  
  // Dummy Passengers Data
  const passengers = [
    {
      name: 'João Silva Santos',
      age: 35,
      sex: 'M',
      idNumber: '001234567LA048'
    },
    {
      name: 'Maria Conceição Pereira',
      age: 28,
      sex: 'F',
      idNumber: '009876543LB052'
    }
  ];

  useEffect(() => {
    const stages = [
      () => setAnimationStage(1),
      () => setAnimationStage(2),
      () => setAnimationStage(3)
    ];

    stages.forEach((stage, index) => {
      setTimeout(stage, (index + 1) * 500);
    });
  }, []);

  const Downloadpdf = async () =>{
    console.log(bookingId)
      await generatePassengerTickets(bookingId)
      router.push("/pesquisar")
  } 


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 overflow-hidden relative flex items-center justify-center p-4">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white opacity-50 rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 1}s`
            }}
          />
        ))}
      </div>

      {/* Holographic Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 165, 0, 0.04) 25%, rgba(255, 165, 0, 0.04) 26%, transparent 27%, transparent 74%, rgba(255, 165, 0, 0.04) 75%, rgba(255, 165, 0, 0.04) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 165, 0, 0.04) 25%, rgba(255, 165, 0, 0.04) 26%, transparent 27%, transparent 74%, rgba(255, 165, 0, 0.04) 75%, rgba(255, 165, 0, 0.04) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Animated Check Circle */}
        <div 
          className={`
            mx-auto w-32 h-32 rounded-full flex items-center justify-center 
            bg-orange-500 text-white mb-6 transform transition-all duration-1000
            ${animationStage >= 1 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
          `}
        >
          <Check size={64} strokeWidth={3} />
        </div>

        {/* Thank You Message */}
        <div 
          className={`
            text-white transition-all duration-1000 transform
            ${animationStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
        >
          <h1 className="text-4xl font-bold mb-4 text-orange-500">
            Obrigado pela sua Compra!
          </h1>
          <p className="text-xl mb-6">
            Sua viagem com 100 Destinos está confirmada.
          </p>
        </div>

        {/* Trip Details */}
        <div 
          className={`
            bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700
            space-y-4 transition-all duration-1000 transform
            ${animationStage >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
          `}
        >
          <div className="grid md:grid-cols-3 gap-4 text-white">
            <div className="flex flex-col items-center">
              <Bus className="text-orange-500 mb-2" />
              <span className="text-sm">Origem</span>
              <strong>{ticket.origin}</strong>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="text-orange-500 mb-2" />
              <span className="text-sm">Destino</span>
              <strong>{ticket.destination}</strong>
            </div>
            <div className="flex flex-col items-center">
              <Ticket className="text-orange-500 mb-2" />
              <span className="text-sm">Passageiros</span>
              <strong>{passengers.length}</strong>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button 
          onClick={Downloadpdf}
          className={`
            mt-6 mx-auto flex items-center justify-center 
            px-8 py-4 bg-orange-600 text-white text-xl 
            font-bold rounded-full hover:bg-orange-700 
            transition-all duration-300 transform
            ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
        >
          Baixar Comprativo <Download className="ml-2" />
        </button>
      </div>

      {/* Animated Particle Effects */}
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className={`
            absolute bg-orange-500 rounded-full opacity-50 animate-ping
            ${animationStage >= 2 ? 'block' : 'hidden'}
          `}
          style={{
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 3 + 2}s`
          }}
        />
      ))}
    </div>
  );
};

export default ThankYouScreen;