"use client"

import React from 'react';
import { Users, Globe, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleImageClick = () => {
    router.push('/pesquisar');
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* White Section */}
      <div 
        className="absolute top-0 left-0 w-full h-1/2 bg-white"
        style={{ 
          clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)' 
        }}
      ></div>

      {/* Orange Section */}
      <div 
        className="absolute bottom-0 left-0 w-full h-1/2 bg-orange-500"
        style={{ 
          clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0 100%)' 
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-center px-4">
        {/* Logo Placeholder */}
        <img 
          src='/img/logoff.png' 
          alt="Logo" 
          className="h-16 mb-4 object-contain w-auto max-w-full"
        />

        {/* Clickable Image */}
        <div 
      
          className="mb-8 cursor-pointer hover:scale-105 transition-transform w-full max-w-md"
        >
          <img 
            src="/bus.png" 
            style={{ height: 100 }}
            alt="Clickable Image"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button 
            onClick={handleImageClick}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Interprovicional
          </button>
          <button 
            className="bg-white text-orange-500 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Intra Ubarno
          </button>
        </div>

        {/* Statistics */}
        <div className="flex flex-wrap justify-center space-x-4 bg-orange-500/20 p-4 rounded-lg max-w-full backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Users className="text-white" />
            <span className="text-sm sm:text-base text-white">1,254 Inscritos</span>
          </div>
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Globe className="text-white" />
            <span className="text-sm sm:text-base text-white">5,678 Visitantes</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="text-white" />
            <span className="text-sm sm:text-base text-white">42 Viagens</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-white bg-black/60">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center px-4">
          <span className="text-xs sm:text-sm mb-2 sm:mb-0">© 2024 100 Destinos. All Rights Reserved.</span>
          <span className="text-xs sm:text-sm">by ZRD3</span>
        </div>
      </footer>
    </div>
  );
}