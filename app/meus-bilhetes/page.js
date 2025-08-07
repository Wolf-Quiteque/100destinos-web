'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Ticket, MapPin, Clock, Calendar as CalendarIcon, AlertCircle, Bus, Plane, Car, Hotel, Train, Ship } from 'lucide-react';
import { format, isToday, isFuture, isPast, parseISO } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import CarrosTab from './CarrosTab';
import QRCode from 'qrcode'; // Import QRCode library

// Helper function to combine date and time
const getCombinedDateTime = (bookingDateStr, timeStr) => {
  if (!bookingDateStr || !timeStr) return null;
  const timeParts = timeStr.split(':');
  if (timeParts.length < 2) return null;
  try {
    const dateTimeString = `${bookingDateStr}T${timeStr}`;
    const dateTime = parseISO(dateTimeString);
    return dateTime;
  } catch (e) {
    console.error("Error parsing date/time:", e, { bookingDateStr, timeStr });
    return null;
  }
};

// Helper function to get transportation type information
const getTransportationInfo = (type) => {
  switch (type) {
    case 'bus':
      return { label: 'Autocarro', icon: Bus, color: 'text-blue-500 dark:text-blue-400' };
    case 'plane':
      return { label: 'Avião', icon: Plane, color: 'text-sky-500 dark:text-sky-400' };
    case 'train':
      return { label: 'Comboio', icon: Train, color: 'text-green-500 dark:text-green-400' };
    case 'boat':
      return { label: 'Barco', icon: Ship, color: 'text-cyan-500 dark:text-cyan-400' };
    default:
      return { label: 'Transporte', icon: Bus, color: 'text-gray-500 dark:text-gray-400' };
  }
};

const BookingCard = ({ booking }) => {
  const router = useRouter();
  const route = booking.available_routes;

  if (!route) {
    return (
      <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Erro: </strong>
        <span className="block sm:inline">Detalhes da rota indisponíveis para esta reserva (ID: {booking.id}).</span>
      </div>
    );
  }

  const bookingDate = booking.booking_date ? format(parseISO(booking.booking_date), 'dd/MM/yyyy') : 'N/A';
  const departureTime = route.departure_time ? route.departure_time.substring(0, 5) : 'N/A';
  const arrivalTime = route.arrival_time ? route.arrival_time.substring(0, 5) : 'N/A';

  const handlePayClick = () => {
    router.push(`/pagamento?bookingId=${booking.id}`);
  };

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

  const [qrCodeImageUrl, setQrCodeImageUrl] = useState(null);

  useEffect(() => {
    const generateQrCode = async () => {
      if (!booking || !route) {
        setQrCodeImageUrl(null);
        return;
      }

      const ticketId = booking.selected_seats?.[0] || booking.id;
      const passengerName = booking.passenger_details?.[0]?.name || 'Passageiro';

      const qrCodeData = JSON.stringify({
        bookingId: booking.id,
        ticketId: ticketId,
        passengerName: passengerName,
        route: `${route.origin} - ${route.destination}`,
        bookingDate: booking.booking_date,
      });

      try {
        const url = await QRCode.toDataURL(qrCodeData, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 128, // Match the size previously used for qrcode.react
          margin: 1,
        });
        setQrCodeImageUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setQrCodeImageUrl(null);
      }
    };

    generateQrCode();
  }, [booking, route]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row">
      {/* QR Code Section */}
      {qrCodeImageUrl && (
        <div className="p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-700 sm:border-r sm:border-b-0 border-b border-gray-200 dark:border-gray-600">
          <img src={qrCodeImageUrl} alt="QR Code" className="w-24 h-24 sm:w-32 sm:h-32" /> {/* Responsive img tag */}
        </div>
      )}

      <div className="p-4 flex-grow">
        {/* Card content */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            {route.company_logo ? (
              <img src={route.company_logo} alt={route.company_name || 'Logo'} className="h-6 w-auto" />
            ) : (
              route.type === 'bus' ? (
                <Bus className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              ) : route.type === 'plane' ? (
                <Plane className="h-6 w-6 text-sky-500 dark:text-sky-400" />
              ) : route.type === 'train' ? (
                <Train className="h-6 w-6 text-green-500 dark:text-green-400" />
              ) : route.type === 'boat' ? (
                <Ship className="h-6 w-6 text-cyan-500 dark:text-cyan-400" />
              ) : (
                <Bus className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              )
            )}
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800 dark:text-white">{route.company_name || 'Empresa Desconhecida'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{getTransportationInfo(route.type).label}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Transportation type badge */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 ${getTransportationInfo(route.type).color}`}>
              {getTransportationInfo(route.type).label}
            </span>
            {getStatusBadge(booking.booking_status)}
          </div>
        </div>
        {/* Details grid remains the same */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
            {/* Origin */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <MapPin size={16} className="text-orange-500" />
                <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Origem</span>
                <span className="font-medium">{route.origin}</span>
                </div>
            </div>
            {/* Destination */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <MapPin size={16} className="text-orange-500" />
                <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Destino</span>
                <span className="font-medium">{route.destination}</span>
                </div>
            </div>
            {/* Date */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <CalendarIcon size={16} className="text-orange-500" />
                <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Data</span>
                <span className="font-medium">{bookingDate}</span>
                </div>
            </div>
        </div>
        {/* Times and Seats grid remains the same */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {/* Departure Time */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Clock size={16} className="text-orange-500" />
                <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Partida</span>
                <span className="font-medium">{departureTime}</span>
                </div>
            </div>
            {/* Arrival Time */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Clock size={16} className="text-orange-500" />
                <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Chegada</span>
                <span className="font-medium">{arrivalTime}</span>
                </div>
            </div>
            {/* Seats */}
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Ticket size={16} className="text-orange-500" />
                <div>
                <span className="block text-xs text-gray-400 dark:text-gray-500">Assentos</span>
                <span className="font-medium">{booking.selected_seats?.join(', ') || 'N/A'}</span>
                </div>
            </div>
        </div>
      </div>
      {/* Footer with total price remains the same */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 flex justify-end items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">Total:</span>
        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
          {booking.total_price ? booking.total_price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' }) : 'N/A'}
        </span>
      </div>
      {/* Conditional Button for Pending Status (Pay only) */}
      {booking.booking_status === 'pending' && (
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-end items-center space-x-2 border-t border-gray-200 dark:border-gray-600">
          <Button
            variant="outline"
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 h-8"
            onClick={handlePayClick}
          >
            Pagar
          </Button>
        </div>
      )}
    </div>
  );
};

export default function MeusServicosPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const { session, user, isLoading: isAuthLoading } = useAuth(); // Use AuthContext
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    const [isFetchingBookings, setIsFetchingBookings] = useState(false); // Separate loading state for bookings fetch

  useEffect(() => {
    // If auth state is still loading, wait
    if (isAuthLoading) {
      return;
    }

    // If no session after loading, redirect to login
    if (!session) {
      console.log('No session found, redirecting to login.');
      router.push('/login');
      return;
    }

    // Fetch bookings only if we have a session and user
    const fetchBookings = async () => {
      // Prevent fetching if already fetching
      if (isFetchingBookings) return;

      console.log('Session found, fetching bookings for user:', session.user.id);
      setIsFetchingBookings(true);
      setError(null);

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
            route_id
          `)
          .eq('profile_id', session.user.id) // Use user ID from session
          .order('created_at', { ascending: false }); // Order by creation date for general display

        if (bookingError) throw bookingError;

        const fetchedBookings = bookingData || [];
        
        // Collect all unique route_ids
        const routeIds = [...new Set(fetchedBookings.map(b => b.route_id).filter(Boolean))];

        let routesData = [];
        if (routeIds.length > 0) {
          const { data: fetchedRoutes, error: routesError } = await supabase
            .from('available_routes')
            .select('id, origin, destination, departure_time, arrival_time, duration, company_name, company_logo, type')
            .in('id', routeIds);

          if (routesError) {
            console.error('Error fetching available routes:', routesError);
            // Continue without route data if there's an error, or throw
          } else {
            routesData = fetchedRoutes || [];
          }
        }

        // Map route data back to bookings
        const bookingsWithRoutes = fetchedBookings.map(booking => {
          const route = routesData.find(r => r.id === booking.route_id);
          return {
            ...booking,
            available_routes: route // Attach the route details
          };
        });

        setBookings(bookingsWithRoutes);
        console.log("Fetched Bookings:", bookingsWithRoutes?.length);

      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Falha ao carregar os bilhetes. Tente novamente.');
      } finally {
        setIsFetchingBookings(false);
      }
    };

    fetchBookings();

    // ** FIX: Removed isFetchingBookings from dependency array **
  }, [session, isAuthLoading, router, supabase]);

  // Enhanced filteredBookings logic with transport type filtering
  const filteredBookings = useMemo(() => {
    const now = new Date(); // Get current date and time for comparison

    // Helper function to filter by transport type and status
    const filterByTypeAndStatus = (transportType) => {
      // First filter by transport type
      const typeFiltered = bookings.filter(b => {
        if (!b.available_routes) return false;
        return transportType === 'all' || b.available_routes.type === transportType;
      });

      const activo = typeFiltered.filter(b => {
          if (b.booking_status !== 'confirmed') return false;
          // Ensure route data is available before checking times
          if (!b.available_routes || !b.available_routes.departure_time) return false; 

          try {
              const combinedDateTime = getCombinedDateTime(b.booking_date, b.available_routes.departure_time);
              
              // Check if the combined date/time is in the future
              return combinedDateTime && isFuture(combinedDateTime);
          } catch (e) {
              console.error("Error parsing booking_date or departure_time for activo filter:", e, b.booking_date, b.available_routes.departure_time);
              return false;
          }
      }).sort((a, b) => {
          // Sort active bookings by departure time
          const dateTimeA = getCombinedDateTime(a.booking_date, a.available_routes?.departure_time);
          const dateTimeB = getCombinedDateTime(b.booking_date, b.available_routes?.departure_time);
          if (!dateTimeA && !dateTimeB) return 0;
          if (!dateTimeA) return 1;
          if (!dateTimeB) return -1;
          return dateTimeA - dateTimeB;
      });

      const pendente = typeFiltered.filter(b => b.booking_status === 'pending');

      const historico = typeFiltered.filter(b => {
          if (b.booking_status === 'pending') return false; // Pending bookings are not historical

          // If not confirmed, or if confirmed but route data is missing, consider it historical
          if (!b.available_routes || !b.available_routes.departure_time) return true;

          try {
              const combinedDateTime = getCombinedDateTime(b.booking_date, b.available_routes.departure_time);

              // If confirmed, check if it's in the past
              return combinedDateTime && isPast(combinedDateTime);
          } catch (e) {
              console.error("Error parsing booking_date or departure_time for historico filter:", e, b.available_routes.departure_time);
              return true; // Default to historical if parsing fails
          }
      }).sort((a, b) => {
          // Sort historical bookings by departure time (descending)
          const dateTimeA = getCombinedDateTime(a.booking_date, a.available_routes?.departure_time);
          const dateTimeB = getCombinedDateTime(b.booking_date, b.available_routes?.departure_time);
          if (!dateTimeA && !dateTimeB) return 0;
          if (!dateTimeA) return 1;
          if (!dateTimeB) return -1;
          return dateTimeB - dateTimeA;
      });

      return { activo, pendente, historico };
    };

    // Return filtered bookings for each transport type
    return {
      all: filterByTypeAndStatus('all'),
      bus: filterByTypeAndStatus('bus'),
      plane: filterByTypeAndStatus('plane'),
      train: filterByTypeAndStatus('train'),
      boat: filterByTypeAndStatus('boat')
    };
  }, [bookings]);

  // renderBookingList remains the same
  const renderBookingList = (list) => {
    if (list.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 italic mt-4">Nenhum bilhete encontrado nesta categoria.</p>;
    }
    return (
      <div className="space-y-4">
        {list.map(booking => <BookingCard key={booking.id} booking={booking} />)}
      </div>
    );
  };

  // Show loader if either auth state is loading OR bookings are being fetched
  const showLoading = isAuthLoading || isFetchingBookings;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 pb-20 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-orange-400">
        Meus Serviços
      </h1>

      {showLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
        </div>
      ) : error ? (
         <div className="max-w-2xl mx-auto p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg flex items-center space-x-2">
           <AlertCircle size={20} />
           <span>{error}</span>
         </div>
      ) : (
        <Tabs defaultValue="transporte" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4">
            <TabsTrigger value="transporte" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
              <div className="flex items-center justify-center space-x-2">
                <Plane className="h-4 w-4" />
                <span className="hidden sm:inline">Transporte</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="hospedagens" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
              <div className="flex items-center justify-center space-x-2">
                <Hotel className="h-4 w-4" />
                <span className="hidden sm:inline">Hospedagens</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="carros" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
              <div className="flex items-center justify-center space-x-2">
                <Car className="h-4 w-4" />
                <span className="hidden sm:inline">Carros</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transporte">
            {/* Transportation Type Selection */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-xs px-2">
                  <div className="flex items-center space-x-1">
                    <Ticket className="h-3 w-3" />
                    <span>Todos</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="bus" className="data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-xs px-2">
                  <div className="flex items-center space-x-1">
                    <Bus className="h-3 w-3 text-blue-500" />
                    <span className="hidden sm:inline">Autocarro</span>
                    <span className="sm:hidden">Bus</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="plane" className="data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-xs px-2">
                  <div className="flex items-center space-x-1">
                    <Plane className="h-3 w-3 text-sky-500" />
                    <span className="hidden sm:inline">Avião</span>
                    <span className="sm:hidden">Plane</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="train" className="data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-xs px-2">
                  <div className="flex items-center space-x-1">
                    <Train className="h-3 w-3 text-green-500" />
                    <span className="hidden sm:inline">Comboio</span>
                    <span className="sm:hidden">Train</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="boat" className="data-[state=active]:bg-white data-[state=active]:text-black dark:data-[state=active]:bg-white dark:data-[state=active]:text-black text-xs px-2">
                  <div className="flex items-center space-x-1">
                    <Ship className="h-3 w-3 text-cyan-500" />
                    <span className="hidden sm:inline">Barco</span>
                    <span className="sm:hidden">Boat</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              {/* Transport Type Content - Each with status tabs */}
              {['all', 'bus', 'plane', 'train', 'boat'].map((transportType) => (
                <TabsContent key={transportType} value={transportType}>
                  <Tabs defaultValue="activo" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
                      <TabsTrigger value="activo" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
                        Activo ({filteredBookings[transportType].activo.length})
                      </TabsTrigger>
                      <TabsTrigger value="pendente" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
                        Pendente ({filteredBookings[transportType].pendente.length})
                      </TabsTrigger>
                      <TabsTrigger value="historico" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
                        Histórico ({filteredBookings[transportType].historico.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="activo">
                      {renderBookingList(filteredBookings[transportType].activo)}
                    </TabsContent>
                    <TabsContent value="pendente">
                      {renderBookingList(filteredBookings[transportType].pendente)}
                    </TabsContent>
                    <TabsContent value="historico">
                      {renderBookingList(filteredBookings[transportType].historico)}
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>
          <TabsContent value="hospedagens">
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 border border-gray-200">
              <p className="text-lg">Hospedagens em breve...</p>
            </div>
          </TabsContent>
          <TabsContent value="carros">
            <CarrosTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
