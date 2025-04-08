'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; // Added Button
import { Loader2, Ticket, MapPin, Clock, Calendar as CalendarIcon, AlertCircle, Bus, Trash2 } from 'lucide-react'; // Added icons & Trash2
import { format, isToday, isFuture, isPast, parseISO, parse } from 'date-fns'; // date-fns for date comparisons

// Helper function to combine date and time and check against today/future/past
const getCombinedDateTime = (bookingDateStr, timeStr) => {
  if (!bookingDateStr || !timeStr) return null;
  // Assuming timeStr is HH:MM:SS or HH:MM
  const timeParts = timeStr.split(':');
  if (timeParts.length < 2) return null; // Invalid time format

  try {
    // Combine date string with time string
    const dateTimeString = `${bookingDateStr}T${timeStr}`;
    // Parse the combined string. If it doesn't include timezone, parseISO might assume UTC or local.
    // Be explicit if needed, or ensure bookingDateStr and timeStr result in a standard format.
    // Let's assume the date is already in a format parseISO understands (like YYYY-MM-DD)
    // and time is HH:MM:SS.
    const dateTime = parseISO(dateTimeString); // This might need adjustment based on actual formats
    return dateTime;
  } catch (e) {
    console.error("Error parsing date/time:", e, { bookingDateStr, timeStr });
    return null;
  }
};

 // Removed onDelete prop
 const BookingCard = ({ booking }) => {
   const router = useRouter(); // Get router instance
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

  // Handlers for buttons
  const handlePayClick = () => {
     router.push(`/pagamento?bookingId=${booking.id}`);
   };

   // Removed handleDeleteClick function

   const getStatusBadge = (status) => {
     switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Confirmado</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pendente</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Cancelado</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</span>;
    }
  };

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
          {getStatusBadge(booking.booking_status)}
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
      {/* Conditional Buttons for Pending Status */}
      {booking.booking_status === 'pending' && (
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-end items-center space-x-2 border-t border-gray-200 dark:border-gray-600">
           <Button
             variant="outline"
             size="sm"
             className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 h-8" // Adjusted size
             onClick={handlePayClick}
           >
              Pagar
            </Button>
            {/* Eliminar button removed */}
          </div>
       )}
     </div>
  );
};


export default function MeusBilhetesPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Error fetching session or no session:', sessionError);
        // Assuming toast is available globally or handle error differently
        // toast({ title: "Autenticação Necessária", description: "Faça login para ver seus bilhetes.", variant: "destructive" });
        router.push('/login');
        return;
      }

      setUser(session.user); // Store user object

      try {
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
          .eq('profile_id', session.user.id) // Filter by logged-in user's ID
          .order('booking_date', { ascending: false }); // Order by travel date

        if (bookingError) throw bookingError;

        // console.log("Fetched Bookings:", bookingData); // Debugging log
        setBookings(bookingData || []);

      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Falha ao carregar os bilhetes. Tente novamente.');
        // Consider adding a toast message here as well
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, router]); // Add toast if used for errors

  const filteredBookings = useMemo(() => {
    // No need for 'now' here as we compare dates directly

    const activo = bookings.filter(b => {
      if (b.booking_status !== 'confirmed') return false;
      try {
        const bookingDateOnly = parseISO(b.booking_date); // Parse YYYY-MM-DD date
        // Keep if confirmed and the date is today or in the future
        return isToday(bookingDateOnly) || isFuture(bookingDateOnly);
      } catch (e) {
        console.error("Error parsing booking_date for activo filter:", e, b.booking_date);
        return false; // Exclude if date parsing fails
      }
    });

    const pendente = bookings.filter(b => b.booking_status === 'pending');

    // Updated historico filter: includes all past bookings (confirmed, pending, cancelled)
    const historico = bookings.filter(b => {
      try {
        const bookingDateOnly = parseISO(b.booking_date); // Parse YYYY-MM-DD date
        // Keep if the date is in the past, regardless of status
        return isPast(bookingDateOnly);
      } catch (e) {
        console.error("Error parsing booking_date for historico filter:", e, b.booking_date);
        return false; // Exclude if date parsing fails
      }
    });

     return { activo, pendente, historico };
   }, [bookings]);

   // Removed handleDeleteBooking function

   const renderBookingList = (list) => {
     if (list.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 italic mt-4">Nenhum bilhete encontrado nesta categoria.</p>;
    }
     return (
       <div className="space-y-4">
         {/* Removed onDelete prop from BookingCard */}
         {list.map(booking => <BookingCard key={booking.id} booking={booking} />)}
       </div>
     );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 pb-20 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-orange-400">
        Meus Bilhetes
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
        </div>
      ) : error ? (
         <div className="max-w-2xl mx-auto p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2">
           <AlertCircle size={20} />
           <span>{error}</span>
         </div>
      ) : (
        <Tabs defaultValue="activo" className="w-full max-w-3xl mx-auto"> {/* Increased max-width */}
          <TabsList className="grid w-full grid-cols-3 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4">
            <TabsTrigger value="activo" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
              <div className="flex items-center justify-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span>Activo ({filteredBookings.activo.length})</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="pendente" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
              Pendente ({filteredBookings.pendente.length})
            </TabsTrigger>
            <TabsTrigger value="historico" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
              Histórico ({filteredBookings.historico.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activo">
            {renderBookingList(filteredBookings.activo)}
          </TabsContent>
          <TabsContent value="pendente">
            {renderBookingList(filteredBookings.pendente)}
          </TabsContent>
          <TabsContent value="historico">
            {renderBookingList(filteredBookings.historico)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
