'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Loader2, Ticket, MapPin, Clock, Calendar as CalendarIcon, AlertCircle, Bus } from 'lucide-react';
import { format, isToday, isFuture, parseISO, parse, setHours, setMinutes, setSeconds, isAfter } from 'date-fns'; // Added setHours, setMinutes, setSeconds, isAfter

// Helper function to combine date and time
// Returns a Date object or null
const getCombinedDateTime = (bookingDateStr, timeStr) => {
  if (!bookingDateStr || !timeStr) return null;
  const timeParts = timeStr.split(':');
  if (timeParts.length < 2) return null;

  try {
    const datePart = parseISO(bookingDateStr); // Assumes YYYY-MM-DD
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const second = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    let dateTime = setHours(datePart, hour);
    dateTime = setMinutes(dateTime, minute);
    dateTime = setSeconds(dateTime, second);
    return dateTime;
  } catch (e) {
    console.error("Error parsing date/time:", e, { bookingDateStr, timeStr });
    return null;
  }
};


// Reusing BookingCard component structure from meus-bilhetes
const BookingCard = ({ booking }) => {
  const route = booking.bus_routes;
  const company = route?.bus_companies;

  if (!route) {
    return (
      <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Erro: </strong>
        <span className="block sm:inline">Detalhes da rota indisponíveis para esta reserva (ID: {booking.id}).</span>
      </div>
    );
  }

  const bookingDate = booking.booking_date ? format(parseISO(booking.booking_date), 'dd/MM/yyyy') : 'N/A';
  const departureTime = route.departure_time ? route.departure_time.substring(0, 5) : 'N/A'; // Format HH:MM
  const arrivalTime = route.arrival_time ? route.arrival_time.substring(0, 5) : 'N/A'; // Format HH:MM

  // No status badge needed here as we only show confirmed upcoming
  // const getStatusBadge = ...

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            {company?.logo_url ? (
              <img src={company.logo_url} alt={company.name || 'Logo'} className="h-6 w-auto" />
            ) : (
              <Bus className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            )}
            <span className="text-lg font-semibold text-gray-800 dark:text-white">{company?.name || 'Empresa Desconhecida'}</span>
          </div>
          {/* Status badge removed */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <MapPin size={16} className="text-orange-500" />
            <div>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Origem</span>
              <span className="font-medium">{route.origin}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <MapPin size={16} className="text-orange-500" />
            <div>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Destino</span>
              <span className="font-medium">{route.destination}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <CalendarIcon size={16} className="text-orange-500" />
            <div>
              <span className="block text-xs text-gray-400 dark:text-gray-500">Data</span>
              <span className="font-medium">{bookingDate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
           <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
             <Clock size={16} className="text-orange-500" />
             <div>
               <span className="block text-xs text-gray-400 dark:text-gray-500">Partida</span>
               <span className="font-medium">{departureTime}</span>
             </div>
           </div>
           <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
             <Clock size={16} className="text-orange-500" />
             <div>
               <span className="block text-xs text-gray-400 dark:text-gray-500">Chegada</span>
               <span className="font-medium">{arrivalTime}</span>
             </div>
           </div>
           <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
             <Ticket size={16} className="text-orange-500" />
             <div>
               <span className="block text-xs text-gray-400 dark:text-gray-500">Assentos</span>
               <span className="font-medium">{booking.selected_seats?.join(', ') || 'N/A'}</span>
             </div>
           </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex justify-end items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">Total:</span>
        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
          {booking.total_price ? booking.total_price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) : 'N/A'}
        </span>
      </div>
    </div>
  );
};


export default function ViagensPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState([]); // Store all fetched confirmed bookings
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Error fetching session or no session:', sessionError);
        // Consider using toast here if available globally or passed as prop
        // toast({ title: "Autenticação Necessária", description: "Faça login para ver suas viagens.", variant: "destructive" });
        router.push('/login');
        return;
      }

      setUser(session.user);

      try {
        const todayDate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_date,
            booking_status,
            total_price,
            total_passengers,
            selected_seats,
            created_at,
            route_id,
            bus_routes (
              origin,
              destination,
              departure_time,
              arrival_time,
              duration,
              bus_companies (
                name,
                logo_url
              )
            )
          `)
          .eq('profile_id', session.user.id)
          .eq('booking_status', 'confirmed') // Only confirmed bookings
          .gte('booking_date', todayDate) // Only today or future dates
          .order('booking_date', { ascending: true }) // Order by travel date (ascending)
          .order('departure_time', { referencedTable: 'bus_routes', ascending: true }); // Then by departure time

        if (bookingError) throw bookingError;

        setAllBookings(bookingData || []);

      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Falha ao carregar as viagens. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, router]);

  // No further filtering needed here, as the Supabase query already gets confirmed tickets for today/future.
  // This list now matches the 'Activo' tab from meus-bilhetes.
  const activeBookings = useMemo(() => {
    return allBookings; // Simply return all fetched bookings
  }, [allBookings]);


  const renderBookingList = (list) => {
    if (list.length === 0) {
      // Updated message to reflect it shows active tickets (today/future)
      return <p className="text-center text-gray-400 dark:text-gray-500 italic mt-6">Nenhum bilhete activo encontrado.</p>;
    }
    return (
      <div className="space-y-4">
        {list.map(booking => <BookingCard key={booking.id} booking={booking} />)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 pb-20 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-orange-400">
        Minhas Próximas Viagens
      </h1>

      <div className="w-full max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : (
          renderBookingList(activeBookings) // Render the unfiltered list
        )}
      </div>
    </div>
  );
}
