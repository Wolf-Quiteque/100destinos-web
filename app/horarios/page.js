'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mockTabelaHorarios = {
  GAMEK: [
    { id: '1', hora: '08:00', destino: 'Luanda', preco: '2500 Kz' },
    { id: '2', hora: '10:30', destino: 'Benguela', preco: '4000 Kz' },
    { id: '3', hora: '13:00', destino: 'Huambo', preco: '5000 Kz' },
  ],
  CACUACO: [
    { id: '1', hora: '09:00', destino: 'Luanda', preco: '2000 Kz' },
    { id: '2', hora: '11:30', destino: 'Benguela', preco: '3500 Kz' },
    { id: '3', hora: '14:00', destino: 'Lubango', preco: '6000 Kz' },
  ],
  VIANA: [
    { id: '1', hora: '07:30', destino: 'Luanda', preco: '1800 Kz' },
    { id: '2', hora: '12:00', destino: 'Huambo', preco: '4500 Kz' },
    { id: '3', hora: '15:30', destino: 'Benguela', preco: '3800 Kz' },
  ],
};

const provinces = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul', 
  'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 
  'Namibe', 'Uíge', 'Zaire'
];

const pontosPartida = ['GAMEK', 'CACUACO', 'VIANA'];

export default function TimetableScreen() {
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [pontoPartidaSelecionado, setPontoPartidaSelecionado] = useState('GAMEK');

  useEffect(() => {
    setIsClient(true);
    // Simulating location detection
    setSelectedProvince('Luanda');
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = provinces.filter(province => 
        province.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces([]);
    }
  }, [searchTerm]);

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    setSearchTerm(province);
    setFilteredProvinces([]);
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 p-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Search Container */}
        <div className="relative p-4 border-b border-orange-100">
          <div className="flex items-center bg-orange-50 rounded-full px-4 py-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-orange-500 mr-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Procurar província"
              className="w-full bg-transparent outline-none text-black placeholder-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {filteredProvinces.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 top-full z-10 mt-2 bg-white shadow-lg rounded-xl overflow-hidden"
              >
                {filteredProvinces.map((province) => (
                  <div 
                    key={province}
                    onClick={() => handleProvinceSelect(province)}
                    className="px-4 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
                  >
                    {province}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Departure Points */}
        <div className="p-4">
          <h2 className="text-2xl font-bold text-center text-black mb-4">
            Ponto de Partida
          </h2>
          <div className="flex justify-around space-x-2 mb-6">
            {pontosPartida.map((ponto) => (
              <button
                key={ponto}
                onClick={() => setPontoPartidaSelecionado(ponto)}
                className={`
                  px-4 py-2 rounded-full transition-all duration-300
                  ${pontoPartidaSelecionado === ponto 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}
                `}
              >
                {ponto}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable */}
        <div className="bg-orange-100 p-4">
          <h2 className="text-2xl font-bold text-center text-black mb-4">
            Horários - {pontoPartidaSelecionado}
          </h2>
          <div className="grid grid-cols-3 bg-orange-100 p-2 rounded-t-xl font-bold text-black">
            <div>Hora</div>
            <div className="text-center">Destino</div>
            <div className="text-right">Preço</div>
          </div>
          {mockTabelaHorarios[pontoPartidaSelecionado].map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-3 py-3 px-2 border-b border-orange-200 hover:bg-orange-200/100 transition-colors cursor-pointer"
            >
              <div className="text-black font-semibold">{item.hora}</div>
              <div className="text-center text-black font-bold">{item.destino}</div>
              <div className="text-right text-black font-semibold">{item.preco}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}