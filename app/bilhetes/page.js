'use client'
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useSearchParams and useRouter
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, Plane, Clock, MapPin, Ticket, Route, HandCoins, Zap, Loader2, ArrowLeft, Train,Ship } from 'lucide-react'; // Added Plane icon
import PassengerModal from './PassengerModal';
import SearchModal from './SearchModal';
import { Button } from '@/components/ui/button'; // Assuming Button component exists
import { Suspense } from 'react'; // Import Suspense (React is already imported)
import BusTicketLoader from '../components/BusTicketLoader';

// Rename the main component and keep its logic
const BilhetesClientComponent = () => {
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams(); // Hook to get URL params
  const router = useRouter(); // Hook for navigation
  const [activeTab, setActiveTab] = useState('todos');
  const [dialog, setDialog] = useState(false);
  const [busTickets, setBusTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState();
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUrban, setIsUrban] = useState(false);
  const [searchDeparture, setSearchDeparture] = useState(''); // State for URL departure
  const [searchDestination, setSearchDestination] = useState(''); // State for URL destination
  const [searchDate, setSearchDate] = useState(''); // State for URL date
  const [searchType, setSearchType] = useState(''); // State for URL date

  const [searchIsRoundTrip, setSearchIsRoundTrip] = useState(false); // State for URL isRoundTrip
  const [searchReturnDate, setSearchReturnDate] = useState(''); // State for URL returnDate

  useEffect(() => {
    // Get search params from URL
    const departureParam = searchParams.get('departure');
    const destinationParam = searchParams.get('destination');
    const dateParam = searchParams.get('date');
    const isRoundTripParam = searchParams.get('isRoundTrip') === 'true';
    const returnDateParam = searchParams.get('returnDate');
    const typeParam = searchParams.get('type')
    console.log(typeParam)

    setSearchDeparture(departureParam || '');
    setSearchDestination(destinationParam || '');
    setSearchDate(dateParam || '');
    setSearchIsRoundTrip(isRoundTripParam);
    setSearchReturnDate(returnDateParam || '');

    // Determine urban/interprovincial from localStorage (only relevant for bus)
    const userSelect = localStorage.getItem('userSelect');
    const urbanStatus = userSelect === 'Urbano';
    setIsUrban(urbanStatus);

    // Fetch routes based on type and other params
    fetchRoutes(typeParam, departureParam, destinationParam, dateParam);
    setSearchType(typeParam);

  }, [searchParams]); // Re-run if searchParams change

  const fetchRoutes = async (type, departureParam, destinationParam, dateParam) => {
    setLoading(true);
    setBusTickets([]); // Clear previous tickets (will now hold all types)
    setFilteredTickets([]); // Clear previous filtered tickets
    try {
      let query = supabase
        .from('available_routes') // Using the view
        .select('*')
        .eq('type', type); // Filter by the new type column


      // No 'urbano' filter for 'plane' type as per schema

      const { data, error } = await query;

      if (error) throw error;

      const fetchedData = data || [];
      console.log('Fetched data from Supabase (before date filter):', fetchedData);

      // Temporarily remove date filtering as per user's priority
      const filteredByDate = fetchedData; // No date filtering for now
      // const filteredByDate = dateParam
      //   ? fetchedData.filter(ticket => {
      //       // Assuming ticket.departure_date is in 'YYYY-MM-DD' format
      //       return ticket.departure_date === dateParam;
      //     })
      //   : fetchedData;

      console.log('Data after date filtering (or no filtering):', filteredByDate);
      setBusTickets(filteredByDate); // Store raw fetched data after date filtering

      // Prioritize exact matches based on URL params for the "Todos" tab initial view
      const prioritizedData = [...filteredByDate].sort((a, b) => {
        const aIsExactMatch = a.origin === departureParam && a.destination === destinationParam;
        const bIsExactMatch = b.origin === departureParam && b.destination === destinationParam;

        if (aIsExactMatch && !bIsExactMatch) return -1; // a comes first
        if (!aIsExactMatch && bIsExactMatch) return 1;  // b comes first
        // Optional: Add secondary sort (e.g., by price or time) if needed for non-exact matches
        // return a.base_price - b.base_price;
        return 0; // Keep original relative order otherwise
      });

      setFilteredTickets(prioritizedData); // Set filtered tickets with prioritized results for the "Todos" tab

    } catch (error) {
      console.error('Error fetching routes:', error); // Changed error message
      // Consider adding user feedback here (e.g., toast notification)
    } finally {
      setLoading(false);
    }
  };

  // Memoize sorted lists based on the currently displayed filteredTickets
  const sortedTicketsByPrice = useMemo(() => {
    // Sorts the tickets currently shown in the "Todos" tab by price
    return [...filteredTickets].sort((a, b) => a.base_price - b.base_price);
  }, [filteredTickets]);

  const sortedTicketsBySpeed = useMemo(() => {
    // Sorts the tickets currently shown in the "Todos" tab by speed
    return [...filteredTickets].sort((a, b) => {
      // Improved duration parsing (handles various formats like HH:MM:SS or interval strings)
      const parseDuration = (durationStr) => {
        if (!durationStr) return Infinity; // Handle null/undefined durations
        // Try parsing HH:MM:SS
        const timeParts = durationStr.match(/^(\d{2}):(\d{2}):(\d{2})$/);
        if (timeParts) {
          return parseInt(timeParts[1]) * 3600 + parseInt(timeParts[2]) * 60 + parseInt(timeParts[3]);
        }
        // Try parsing interval string (e.g., "2 hours 30 minutes") - basic version
        let totalSeconds = 0;
        const hourMatch = durationStr.match(/(\d+)\s*hour/);
        const minMatch = durationStr.match(/(\d+)\s*min/);
        if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600;
        if (minMatch) totalSeconds += parseInt(minMatch[1]) * 60;
        // Add more robust parsing if needed (e.g., using a library)
        return totalSeconds > 0 ? totalSeconds : Infinity; // Return Infinity if parsing fails or duration is 0
      };
      return parseDuration(a.duration) - parseDuration(b.duration);
    });
  }, [filteredTickets]);

  // Handle search from the modal
  const handleSearch = (modalSearchParams) => {
    // Filter from the original full list of tickets for the current urban status
    const filtered = busTickets.filter(ticket =>
      (!modalSearchParams.origem || ticket.origin.toLowerCase().includes(modalSearchParams.origem.toLowerCase())) &&
      (!modalSearchParams.destino || ticket.destination.toLowerCase().includes(modalSearchParams.destino.toLowerCase()))
    );
     // Re-apply prioritization based on initial URL search params after modal filtering
     const prioritizedFiltered = [...filtered].sort((a, b) => {
        const aIsExactMatch = a.origin === searchDeparture && a.destination === searchDestination;
        const bIsExactMatch = b.origin === searchDeparture && b.destination === searchDestination;
        if (aIsExactMatch && !bIsExactMatch) return -1;
        if (!aIsExactMatch && bIsExactMatch) return 1;
        // Optional secondary sort for the modal's results
        return 0;
      });
    setFilteredTickets(prioritizedFiltered); // Update the list shown in the "Todos" tab
    setActiveTab('todos'); // Switch back to 'todos' tab after modal search
  };


  const handleModalClose = () => setDialog(false);
  const handleModalOpen = (ticket) => { setSelectedTicket(ticket); setDialog(true); }

  if (loading) {
    return (
    <BusTicketLoader type={searchType} />
    );
  } // Corrected: Removed extra brace, semicolon, and duplicated lines/blocks

  // handleModalClose and handleModalOpen are already defined above

  // The main return statement starts here
  return (
    <>
      <PassengerModal isOpen={dialog} ticket={selectedTicket} onClose={handleModalClose}/>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto relative"> {/* Added relative positioning */}
          <div className="flex items-center justify-center mb-6 pt-12 md:pt-0"> {/* Increased padding top for mobile */}
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center"> {/* Centered title */}
              {searchType === 'bus' ? (isUrban ? 'Rotas Urbanas' : 'Rotas Interprovinciais') : 'Voos Disponíveis'}
            </h1>
            {/* <SearchModal onSearch={handleSearch} /> */} {/* Removed Search Modal */}
          </div>

        <Tabs 
          defaultValue="todos" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-700/50 backdrop-blur-sm">
            <TabsTrigger 
              value="todos" 
              className={`text-white ${activeTab === 'todos' ? 'bg-orange-600/70' : ''} flex items-center justify-center`}
            >
              <span className="hidden md:inline">Todos os Resultados</span>
              <span className="md:hidden">Todos</span>
              <span style={{marginLeft:'5px'}}> <Route /> </span>
            </TabsTrigger>
            <TabsTrigger 
              value="maisBaratos" 
              className={`text-white ${activeTab === 'maisBaratos' ? 'bg-orange-600/70' : ''} flex items-center justify-center`}
            >
              <span className="hidden md:inline">Mais Baratos</span>
              <span className="md:hidden">Baratos</span>
              <span style={{marginLeft:"5px"}}><HandCoins /></span> 
            </TabsTrigger>
            <TabsTrigger 
              value="maisRapidos" 
              className={`text-white ${activeTab === 'maisRapidos' ? 'bg-orange-600/70' : ''} flex items-center justify-center`}
            >
              <span className="hidden md:inline">Mais Rápidos</span>
              <span className="md:hidden">Rápidos</span>
              <span style={{marginLeft:"5px"}}><Zap /></span> 
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            <div className="space-y-4 mt-4">
              {filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} selectTicket={handleModalOpen} searchType={searchType} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="maisBaratos">
            <div className="space-y-4 mt-4">
              {sortedTicketsByPrice.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} selectTicket={()=>{handleModalOpen(ticket)}} searchType={searchType} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="maisRapidos">
            <div className="space-y-4 mt-4">
              {sortedTicketsBySpeed.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} selectTicket={handleModalOpen} searchType={searchType} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
};

const TicketCard = ({ ticket, selectTicket, searchType }) => {
  return (
    <div className="relative group">
      {/* Background glow */}
      <div className="absolute -inset-0.5 bg-orange-500 rounded-2xl opacity-50 group-hover:opacity-75 transition duration-300 blur-sm animate-pulse"></div>

      <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center mb-4">
          <img src={ticket.company_logo} style={{maxWidth:'80px'}} alt="Company Logo" className="h-8 w-28 mr-4" />
          
          <div className="flex items-center space-x-2">
            {searchType === 'bus' && <Bus className="text-orange-500" />}
            {searchType === 'plane' && <Plane className="text-orange-500" />}
            {searchType === 'train' && <Train className="text-orange-500" />}
            {searchType === 'boat' && <Ship className="text-orange-500" />}
            <h2 className="text-lg font-bold text-white">
              {ticket.company_name.length > 21 ? `${ticket.company_name.slice(0, 21)}...` : ticket.company_name}

              
            </h2>
          </div>

       
        </div>

        {/* Travel Info */}
        <div className="grid grid-cols-3 gap-4 text-white mb-4">
          <div className="flex flex-col items-center">
            <MapPin className="text-orange-500 mb-2" />
            <span className="text-sm">Origem</span>
            <strong>{ticket.origin}</strong>
          </div>
          <div className="flex flex-col items-center">
            <MapPin className="text-orange-500 mb-2" />
            <span className="text-sm">Destino</span>
            <strong>{ticket.destination}</strong>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="text-orange-500 mb-2" />
            <span className="text-sm">Duração</span>
            <strong>{ticket.duration}</strong>
          </div>
        </div>

        {/* Optional Flight/Train/Boat Info */}
        {searchType === 'plane' && ticket.flight_number && (
          <div className="flex items-center space-x-2 text-white mb-4">
            <Ticket className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-400">Voo</p>
              <strong className="text-white">{ticket.flight_number} ({ticket.airline_code})</strong>
            </div>
          </div>
        )}
        {searchType === 'train' && ticket.train_number && (
          <div className="flex items-center space-x-2 text-white mb-4">
            <Ticket className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-400">Comboio</p>
              <strong className="text-white">{ticket.train_number}</strong>
            </div>
          </div>
        )}
        {searchType === 'boat' && ticket.boat_name && (
          <div className="flex items-center space-x-2 text-white mb-4">
            <Ticket className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-400">Barco</p>
              <strong className="text-white">{ticket.boat_name}</strong>
            </div>
          </div>
        )}

        {/* Price on its own row */}
        <div className="text-center mb-4 sm:mb-2">
          <span className="text-2xl font-bold text-orange-500 block">
            {ticket.base_price.toLocaleString('pt-AO', {
              style: 'currency',
              currency: 'AOA'
            })}
          </span>
        </div>

        {/* Departure / Arrival / Button */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Ticket className="text-orange-500" />
              <div>
                <p className="text-sm text-gray-400">Partida</p>
                <strong className="text-white">{ticket.departure_time}</strong>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-600"></div>

            <div className="flex items-center space-x-2">
              <div>
                <p className="text-sm text-gray-400">Chegada</p>
                <strong className="text-white">{ticket.arrival_time}</strong>
              </div>
            </div>
             <div className="flex items-center space-x-2">
                <div className="bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full text-sm">
            {ticket.available_seats} lugares
          </div>
            </div>
          </div>

          <div className="sm:ml-auto">
            <button
              onClick={() => selectTicket(ticket)}
              className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors"
            >
              Selecionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




export default function BilhetesPage() {
  return (
    <Suspense fallback={<BusTicketLoader />}>
      <BilhetesClientComponent />
    </Suspense>
  );
}
