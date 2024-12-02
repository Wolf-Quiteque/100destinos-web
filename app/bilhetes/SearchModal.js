'use client'
import React, { useState } from 'react';
import { Search, MapPin, Calendar, ArrowRightLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SearchModal = ({ onSearch }) => {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [dataIda, setDataIda] = useState('');
  const [tipoViagem, setTipoViagem] = useState('ida');

  const handleSearch = () => {
    onSearch({
      origem,
      destino,
      dataIda,
      tipoViagem
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
      <Button 
  className="text-black bg-white hover:bg-orange-400/100 rounded-full p-3 shadow-md hover:text-white">
  <Search className="m-0" size={16}/>
</Button>

      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-[600px] lg:max-w-[600px] bg-gray-900 border-orange-600/50">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <Search className="mr-3 text-orange-500" />
            Pesquisar Viagem
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Origem Input */}
          <div className="flex items-center space-x-2">
            <MapPin className="text-orange-500" />
            <Input 
              placeholder="Origem" 
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white focus:ring-orange-500"
            />
          </div>

          {/* Destino Input */}
          <div className="flex items-center space-x-2">
            <MapPin className="text-orange-500" />
            <Input 
              placeholder="Destino" 
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white focus:ring-orange-500"
            />
          </div>

          {/* Data de Ida Input */}
          <div className="flex items-center space-x-2">
            <Calendar className="text-orange-500" />
            <Input 
              type="date"
              value={dataIda}
              onChange={(e) => setDataIda(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white focus:ring-orange-500"
            />
          </div>

          {/* Tipo de Viagem */}
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="text-orange-500" />
            <Select value={tipoViagem} onValueChange={setTipoViagem}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione o tipo de viagem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ida">
                  Só Ida
                </SelectItem>
                <SelectItem value="ida-volta">
                  Ida e Volta
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch} 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            Pesquisar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;