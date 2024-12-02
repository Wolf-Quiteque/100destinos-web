'use client'
import React, { useState } from 'react';
import { 
  Check, 
  Edit, 
  Ticket, 
  MapPin, 
  Clock, 
  Bus, 
  ArrowLeft,
  UserCheck, 
  CreditCard 
} from 'lucide-react';

const TicketDetailScreen = ({  onConfirm }) => {

    // Dummy Ticket Data
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedPassengers, setEditedPassengers] = useState([...passengers]);

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...editedPassengers];
    newPassengers[index][field] = value;
    setEditedPassengers(newPassengers);
  };

  const handleConfirmDetails = () => {
    // Validation logic
    const isValid = editedPassengers.every(p => 
      p.name && p.age && p.sex && p.idNumber
    );

    if (isValid) {
      onConfirm(editedPassengers);
      setIsEditing(false);
    } else {
      alert('Por favor, preencha todos os campos corretamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 p-4 md:p-8 relative">
      {/* Back Navigation Button */}
      <button 
        // onClick={onBack}
        className="absolute top-4 left-4 md:left-8 z-10 
        text-white bg-gray-800/50 hover:bg-gray-800/70 
        rounded-full p-3 transition-all duration-300 
        hover:text-orange-500 hover:scale-110"
      >
        <ArrowLeft size={24} />
      </button><div className="max-w-4xl mx-auto space-y-6">
        {/* Ticket Details Section */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-orange-500 rounded-2xl opacity-50 group-hover:opacity-75 transition duration-300 blur-sm"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Bus className="text-orange-500" />
                <h2 className="text-2xl font-bold text-white">{ticket.company}</h2>
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
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-400">Partida</p>
                  <strong className="text-white text-lg">{ticket.departureTime}</strong>
                </div>
                <div className="h-8 w-px bg-gray-600"></div>
                <div>
                  <p className="text-sm text-gray-400">Chegada</p>
                  <strong className="text-white text-lg">{ticket.arrivalTime}</strong>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-bold text-orange-500">
                  {ticket.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <UserCheck className="mr-2 text-orange-500" /> Detalhes dos Passageiros
            </h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center text-orange-500 hover:text-orange-400 transition-colors"
            >
              {isEditing ? (
                <>
                  <Check className="mr-2" /> Concluir
                </>
              ) : (
                <>
                  <Edit className="mr-2" /> Editar
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {isEditing ? (
              editedPassengers.map((passenger, index) => (
                <div 
                  key={index} 
                  className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-orange-500 transition-all"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white mb-2 flex items-center">
                        <UserCheck className="mr-2 text-orange-500" /> Nome Completo
                      </label>
                      <input 
                        type="text"
                        value={passenger.name}
                        onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                        className="w-full bg-gray-800 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-white mb-2 flex items-center">
                        <CreditCard className="mr-2 text-orange-500" /> Número de Identificação
                      </label>
                      <input 
                        type="text"
                        value={passenger.idNumber}
                        onChange={(e) => updatePassenger(index, 'idNumber', e.target.value)}
                        className="w-full bg-gray-800 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              editedPassengers.map((passenger, index) => (
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
              ))
            )}
          </div>

          {isEditing && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleConfirmDetails}
                className="px-6 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors flex items-center"
              >
                <Check className="mr-2" /> Confirmar Alterações
              </button>
            </div>
          )}
        </div>

        {/* Confirmation Button */}
        <div className="text-center">
          <button 
            onClick={() => {/* Navigate to next step or payment */}}
            className="w-full max-w-md mx-auto px-8 py-4 bg-orange-600 text-white text-xl font-bold rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <Ticket className="mr-3" /> Confirmar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailScreen;