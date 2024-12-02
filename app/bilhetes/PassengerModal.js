'use client'
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Trash2, 
  User, 
  IdCard, 
  Calendar, 
  Users 
} from 'lucide-react';

const PassengerModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  const [passengers, setPassengers] = useState([
    { 
      name: '', 
      age: '', 
      sex: '', 
      idNumber: '' 
    }
  ]);

  const addPassenger = () => {
    setPassengers([
      ...passengers, 
      { name: '', age: '', sex: '', idNumber: '' }
    ]);
  };

  const removePassenger = (indexToRemove) => {
    setPassengers(passengers.filter((_, index) => index !== indexToRemove));
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleConfirm = () => {
    // Basic validation
    const isValid = passengers.every(p => 
      p.name && p.age && p.sex && p.idNumber
    );

    if (isValid) {
    
      onClose();
    } else {
      alert('Por favor, preencha todos os campos dos passageiros.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-[600px] lg:max-w-[600px] bg-gray-900 border-orange-500/30">
        <DialogHeader className="text-white">
          <DialogTitle className="text-2xl font-bold text-orange-500 flex items-center">
            <User className="mr-2" /> Informações dos Passageiros
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Adicione os detalhes de todos os passageiros para a sua viagem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
          {passengers.map((passenger, index) => (
            <div 
              key={index} 
              className="bg-gray-800 rounded-xl p-4 relative border border-gray-700 hover:border-orange-500 transition-all duration-300"
            >
              {passengers.length > 1 && (
                <button
                  onClick={() => removePassenger(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 />
                </button>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-white mb-2">
                    <User className="mr-2 text-orange-500" /> Nome Completo
                  </label>
                  <input 
                    type="text" 
                    value={passenger.name}
                    onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                    placeholder="Digite o nome completo"
                    className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center text-white mb-2">
                    <Calendar className="mr-2 text-orange-500" /> Idade
                  </label>
                  <input 
                    type="number" 
                    value={passenger.age}
                    onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                    placeholder="Idade"
                    className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center text-white mb-2">
                    <Users className="mr-2 text-orange-500" /> Sexo
                  </label>
                  <select
                    value={passenger.sex}
                    onChange={(e) => updatePassenger(index, 'sex', e.target.value)}
                    className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                  >
                    <option value="">Selecione o Sexo</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-white mb-2">
                    <IdCard className="mr-2 text-orange-500" /> Número de Identificação
                  </label>
                  <input 
                    type="text" 
                    value={passenger.idNumber}
                    onChange={(e) => updatePassenger(index, 'idNumber', e.target.value)}
                    placeholder="Número do Bilhete de Identidade"
                    className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button 
            onClick={addPassenger}
            variant="outline" 
            className="border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-white flex items-center"
          >
            <UserPlus className="mr-2" /> Adicionar Passageiro
          </Button>

          <Button 
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center"
          >
            Confirmar Passageiros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PassengerModal;