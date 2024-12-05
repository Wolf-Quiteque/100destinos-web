'use client'
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bus, Clock, MapPin, Ticket, Route, HandCoins, Zap } from 'lucide-react';

import PassengerModal from './PassengerModal'
import SearchModal from './SearchModal';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';


const BusTicketResults = () => {
  const supabase = createClientComponentClient();

  const [activeTab, setActiveTab] = useState('todos');
  const [dialog, setDialog] = useState(false);
  const [busTickets, setBusTickets] = useState([]);
  const [selectedTicket, setselectedTicket] = useState();

  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusRoutes();
  }, []);

  const fetchBusRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('available_routes')
        .select('*');

      if (error) throw error;

      setBusTickets(data);
      setFilteredTickets(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bus routes:', error);
      setLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    const filtered = busTickets.filter(ticket => 
      (!searchParams.origem || ticket.origin.toLowerCase().includes(searchParams.origem.toLowerCase())) &&
      (!searchParams.destino || ticket.destination.toLowerCase().includes(searchParams.destino.toLowerCase()))
    );
    setFilteredTickets(filtered);
  };

  const sortedTicketsByPrice = [...busTickets].sort((a, b) => a.base_price - b.base_price);

  const sortedTicketsBySpeed = [...busTickets].sort((a, b) => {
    const parseDuration = (duration) => {
      const [hours, minutes] = duration.replace(/\s*(hours|hour|h|minutes|minute|m)\s*/g, '').split(' ');
      return parseInt(hours) * 60 + parseInt(minutes);
    };

    return parseDuration(a.duration) - parseDuration(b.duration);
  });

  const handleModalClose = () => setDialog(false);
  const handleModalOpen = (ticket) => { setselectedTicket(ticket); setDialog(true);}

  if (loading) {
    return <div className="text-white text-center py-8">Carregando rotas...</div>;
  }

  return (
    <>
    <PassengerModal isOpen={dialog} ticket={selectedTicket} onClose={handleModalClose}/>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 p-4 md:p-8">
    <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mr-4">
            Resultados de Viagem
          </h1>
          <SearchModal onSearch={handleSearch} />
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
                <TicketCard key={ticket.id} ticket={ticket} selectTicket={handleModalOpen} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="maisBaratos">
            <div className="space-y-4 mt-4">
              {sortedTicketsByPrice.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} selectTicket={()=>{handleModalOpen(ticket)}} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="maisRapidos">
            <div className="space-y-4 mt-4">
              {sortedTicketsBySpeed.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} selectTicket={handleModalOpen} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
};

const TicketCard = ({ ticket, selectTicket }) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-orange-500 rounded-2xl opacity-50 group-hover:opacity-75 transition duration-300 blur-sm animate-pulse"></div>
      <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <img src={ticket.company_logo} alt="Company Logo" className="h-8 w-auto mr-4" />
          <div className="flex items-center space-x-2">
            <Bus className="text-orange-500" />
            <h2 className="text-xl font-bold text-white">{ticket.company_name}</h2>
          </div>
          <div className="bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full text-sm">
            {ticket.available_seats} lugares disponíveis
          </div>
        </div>

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

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Ticket className="text-orange-500" />
            <div>
              <p className="text-sm text-gray-400">Partida</p>
              <strong className="text-white">{ticket.departure_time}</strong>
            </div>
            <div className="mx-4 h-8 w-px bg-gray-600"></div>
            <div>
              <p className="text-sm text-gray-400">Chegada</p>
              <strong className="text-white">{ticket.arrival_time}</strong>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-orange-500">
              {ticket.base_price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </span>
            <button onClick={() => selectTicket(ticket)  } className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors">
              Selecionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusTicketResults;