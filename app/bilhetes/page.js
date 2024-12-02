'use client'
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Bus, Clock, MapPin, Ticket, Route, HandCoins, Zap } from 'lucide-react';

import PassengerModal from './PassengerModal'
import SearchModal from './SearchModal';
// Expanded bus tickets data with more options
const busTickets = [
  {
    id: 1,
    company: 'Huambo Expresse',
    origin: 'Luanda',
    destination: 'Huambo',
    departureTime: '08:00',
    arrivalTime: '16:30',
    price: 4500,
    duration: '8h 30m',
    availableSeats: 12
  },
  {
    id: 2,
    company: 'Real Expresse',
    origin: 'Luanda',
    destination: 'Huambo',
    departureTime: '10:15',
    arrivalTime: '18:45',
    price: 4200,
    duration: '8h 30m',
    availableSeats: 8
  },
  {
    id: 3,
    company: 'Rosalina Expresse',
    origin: 'Luanda',
    destination: 'Huambo',
    departureTime: '12:30',
    arrivalTime: '21:00',
    price: 4800,
    duration: '8h 30m',
    availableSeats: 15
  },
  {
    id: 4,
    company: 'Macon',
    origin: 'Luanda',
    destination: 'Huambo',
    departureTime: '14:45',
    arrivalTime: '23:15',
    price: 4300,
    duration: '8h 30m',
    availableSeats: 10
  },
  {
    id: 5,
    company: 'Express Luanda',
    origin: 'Luanda',
    destination: 'Huambo',
    departureTime: '07:15',
    arrivalTime: '15:45',
    price: 4600,
    duration: '8h 30m',
    availableSeats: 14
  },
  {
    id: 6,
    company: 'Veloz Transporte',
    origin: 'Luanda',
    destination: 'Huambo',
    departureTime: '06:30',
    arrivalTime: '15:00',
    price: 4750,
    duration: '8h 30m',
    availableSeats: 6
  }
];

const BusTicketResults = () => {
  const [activeTab, setActiveTab] = useState('todos');
  const [dialog, setDialog] = useState(false);

  const [filteredTickets, setFilteredTickets] = useState(busTickets);

  const handleSearch = (searchParams) => {
    // Basic filtering logic (you can enhance this)
    const filtered = busTickets.filter(ticket => 
      (!searchParams.origem || ticket.origin.toLowerCase().includes(searchParams.origem.toLowerCase())) &&
      (!searchParams.destino || ticket.destination.toLowerCase().includes(searchParams.destino.toLowerCase()))
    );
    setFilteredTickets(filtered);
  };

  // Sort tickets by price
  const sortedTicketsByPrice = [...busTickets].sort((a, b) => a.price - b.price);

  // Sort tickets by duration (fastest first)
  const sortedTicketsBySpeed = [...busTickets].sort((a, b) => {
    // Parse duration and convert to minutes
    const parseDuration = (duration) => {
      const [hours, minutes] = duration.split('h ');
      return parseInt(hours) * 60 + parseInt(minutes);
    };

    return parseDuration(a.duration) - parseDuration(b.duration);
  });

  const handleModalClose = async () => {
    setDialog(false)
  }

  const handleModalOpen = async () => {
    setDialog(true)
  }

  return (
    <>
    <PassengerModal isOpen={dialog} onClose={handleModalClose}/>
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
                <TicketCard key={ticket.id} ticket={ticket} selectTicket={handleModalOpen} />
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
          <div className="flex items-center space-x-2">
            <Bus className="text-orange-500" />
            <h2 className="text-xl font-bold text-white">{ticket.company}</h2>
          </div>
          <div className="bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full text-sm">
            {ticket.availableSeats} lugares disponíveis
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
              <strong className="text-white">{ticket.departureTime}</strong>
            </div>
            <div className="mx-4 h-8 w-px bg-gray-600"></div>
            <div>
              <p className="text-sm text-gray-400">Chegada</p>
              <strong className="text-white">{ticket.arrivalTime}</strong>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-orange-500">
              {ticket.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
            </span>
            <button onClick={() => { selectTicket(ticket) }} className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors">
              Selecionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusTicketResults;