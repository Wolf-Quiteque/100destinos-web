'use client'
import React, { useEffect, useState, useRef, Suspense } from 'react';
import {
  Check,
  MapPin,
  Ticket,
  Bus,
  Download,
  Users // Added Users icon
} from 'lucide-react';
import generatePassengerTickets from '../pagamento/generatePassengerTickets';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BusTicketLoader from '../components/BusTicketLoader';
import { Button } from '@/components/ui/button'; // Import Button component

function ThankYouScreenContent() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [animationStage, setAnimationStage] = useState(0);
  const [bookingDetails, setBookingDetails] = useState(null); // State for booking details
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        router.push('/bilhetes');
        return;
      }

      setLoading(true);

      try {
        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (bookingError) throw bookingError;

        // Fetch route details from available_routes view
        const { data: routeData, error: routeError } = await supabase
          .from('available_routes')
          .select('*')
          .eq('id', bookingData.route_id)
          .single();

        if (routeError) throw routeError;

        // Combine booking and route details
        setBookingDetails({ ...bookingData, route_details: routeData });

      } catch (error) {
        console.error('Error fetching booking details:', error);
        // Handle error appropriately (e.g., show a toast)
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();

    // Animation stages
    const stages = [
      () => setAnimationStage(1),
      () => setAnimationStage(2),
      () => setAnimationStage(3)
    ];

    stages.forEach((stage, index) => {
      setTimeout(stage, (index + 1) * 500);
    });
  }, [bookingId, supabase, router]); // Run when bookingId changes

  const Downloadpdf = async () =>{
    if (!bookingDetails) {
      console.error("No booking details found for PDF generation.");
      // Optionally show a toast message to the user
      return;
    }
    console.log("Generating PDF for booking ID:", bookingId);
    try {
      await generatePassengerTickets(bookingDetails); // Pass bookingDetails
      // Consider adding a success toast here
      router.push("/pesquisar"); // Redirect after initiating download
    } catch (error) {
       console.error("Error generating PDF:", error);
       // Optionally show an error toast
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 flex items-center justify-center">
        <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!bookingDetails || !bookingDetails.route_details) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 flex items-center justify-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>Não foi possível carregar os detalhes da reserva.</AlertDescription>
        </Alert>
      </div>
    );
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

        {/* Trip Details - Updated to use bookingInfo state */}
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
              <strong>{bookingDetails.route_details.origin}</strong>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="text-orange-500 mb-2" />
              <span className="text-sm">Destino</span>
              <strong>{bookingDetails.route_details.destination}</strong>
            </div>
            <div className="flex flex-col items-center">
              <Users className="text-orange-500 mb-2" /> {/* Changed icon */}
              <span className="text-sm">Passageiros</span>
              <strong>{bookingDetails.total_passengers}</strong>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={Downloadpdf}
          disabled={!bookingId} // Disable if no bookingId
          className={`
            mt-6 mx-auto flex items-center justify-center
            px-8 py-4 bg-orange-600 text-white text-xl
            font-bold rounded-full hover:bg-orange-700
            transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed
            ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
          `}
        >
          Baixar Comprovativo <Download className="ml-2" />
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
}

export default function ThankYouScreen() {
  return (
    <Suspense fallback={<BusTicketLoader />}>
      <ThankYouScreenContent />
    </Suspense>
  );
}
