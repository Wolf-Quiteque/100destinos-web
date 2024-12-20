'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Ticket, 
  MapPin, 
  Clock, 
  Bus, 
  ArrowLeft,
  UserCheck,
  X, 
  CreditCard 
} from 'lucide-react';
import BusTicketLoader from '../components/BusTicketLoader';

function BookingDetailsContent() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [passangers, setPassangers] = useState(null);

  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        router.push('/bilhetes');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            route_details:bus_routes (
              company_name:bus_companies(name),
              company_logo:bus_companies(logo_url),
              origin,
              destination,
              departure_time,
              arrival_time,
              duration,
              base_price
            )
          `)
          .eq('id', bookingId)
          .single();

        if (error) throw error;
        setPassangers(data.passengers)
        setBookingDetails({
          ...data,
          route_details: {
            company_name: data.route_details.company_name.name,
            company_logo: data.route_details.company_logo.logo_url,
            origin: data.route_details.origin,
            destination: data.route_details.destination,
            departure_time: data.route_details.departure_time,
            arrival_time: data.route_details.arrival_time,
            duration: data.route_details.duration,
            base_price: data.route_details.base_price
          }
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        router.push('/bilhetes');
      }
    };

    fetchBookingDetails();
  }, [bookingId, router, supabase]);

  if (loading) {
    return <BusTicketLoader />;
  }

  if (!bookingDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 p-4 md:p-8 relative">
      <button 
        onClick={() => router.back()}
        className="absolute top-4 left-4 md:left-8 z-10 
        text-white bg-gray-800/50 hover:bg-gray-800/70 
        rounded-full p-3 transition-all duration-300 
        hover:text-orange-500 hover:scale-110"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Ticket Details Section */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-orange-500 rounded-2xl opacity-50 group-hover:opacity-75 transition duration-300 blur-sm"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <img 
                src={bookingDetails.route_details.company_logo} 
                alt="Company Logo" 
                className="h-8 w-auto mr-4" 
              />

              <div className="flex items-center space-x-2">
                <Bus className="text-orange-500" />
                <h2 className="text-2xl font-bold text-white">
                  {bookingDetails.route_details.company_name}
                </h2>
              </div>
              <div className="bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full text-sm">
                Reserva: {bookingDetails.id.slice(0,8)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-white mb-4">
              <div className="flex flex-col items-center">
                <MapPin className="text-orange-500 mb-2" />
                <span className="text-sm">Origem</span>
                <strong>{bookingDetails.route_details.origin}</strong>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="text-orange-500 mb-2" />
                <span className="text-sm">Destino</span>
                <strong>{bookingDetails.route_details.destination}</strong>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="text-orange-500 mb-2" />
                <span className="text-sm">Duração</span>
                <strong>{bookingDetails.route_details.duration}</strong>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-400">Partida</p>
                  <strong className="text-white text-lg">
                    {bookingDetails.route_details.departure_time}
                  </strong>
                </div>
                <div className="h-8 w-px bg-gray-600"></div>
                <div>
                  <p className="text-sm text-gray-400">Chegada</p>
                  <strong className="text-white text-lg">
                    {bookingDetails.route_details.arrival_time}
                  </strong>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold text-orange-500">
                  {bookingDetails.total_price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-2xl font-bold text-white flex items-center mb-4">
            <UserCheck className="mr-2 text-orange-500" /> Detalhes dos Passageiros
          </h3>

          <div className="space-y-4">
            {passangers && passangers.map((passenger, index) => (
              <div 
                key={index} 
                className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-orange-500 transition-all"
              >
                <div className="grid md:grid-cols-2 gap-4 text-white">
                  <div>
                    <p className="text-sm text-gray-400 flex items-center">
                      <UserCheck className="mr-2 text-orange-500" /> Nome Completo
                    </p>
                    <strong>{passenger.name}</strong>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 flex items-center">
                      <CreditCard className="mr-2 text-orange-500" /> Número de Identificação
                    </p>
                    <strong>{passenger.idNumber}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() =>router.push(`/pagamento?bookingId=${bookingId}`)}
            className="w-full max-w-md mx-auto px-8 py-4 bg-orange-600 text-white text-xl font-bold rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <Ticket className="mr-3" /> Confirmar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailsPage() {
  return (
    <Suspense fallback={<BusTicketLoader />}>
      <BookingDetailsContent />
    </Suspense>
  );
}