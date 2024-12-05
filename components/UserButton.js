'use client'
import React, { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';

const UserButton = () => {
  const [isDropped, setIsDropped] = useState(false);

  return (
    <div className="fixed top-4 left-4 z-50">
      <div 
        className={`relative w-48 bg-white rounded-b-2xl 
        shadow-lg transition-all duration-300 
        ${isDropped ? 'h-48' : 'h-12'} 
        overflow-hidden`}
      >
        <button 
          onClick={() => setIsDropped(!isDropped)}
          className="absolute top-0 left-0 w-full h-12 
          flex items-center justify-center 
          bg-white hover:bg-gray-100 transition-colors"
        >
          <User className="text-orange-500" size={24} />
          <ChevronDown 
            className={`ml-2 text-gray-600 
            transition-transform duration-300 
            ${isDropped ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Content */}
        <div className="absolute top-12 left-0 w-full px-4 py-2">
          <div className="space-y-2 w-full">
            <button className="w-full py-2 text-gray-700 hover:bg-gray-100 rounded text-left pl-3">
              Entrar
            </button>
            <button className="w-full py-2 text-gray-700 hover:bg-gray-100 rounded text-left pl-3">
              Registrar
            </button>
            <button className="w-full py-2 text-red-500 hover:bg-red-50 rounded text-left pl-3">
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserButton;