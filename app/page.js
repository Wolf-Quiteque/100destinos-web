"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users, Globe, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselImages = [
    '/bg/bg1.webp',
    '/bg/bg2.webp',
    '/bg/bg3.webp',
    '/bg/bg4.webp',
    '/bg/bg5.webp',
    '/bg/bg6.webp',
    '/bg/bg7.webp',
    '/bg/bg8.webp',
    '/bg/bg9.webp',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImageClick = () => {
    router.push('/pesquisar');
  };

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: 'linear-gradient(to bottom, #FFA500, #FFFFFF)' }}>
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        {carouselImages.map((img, index) => (
          <div 
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image 
              src={img} 
              alt={`Carousel image ${index + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-white text-center px-4">
        {/* Logo Placeholder */}
        <img 
          src='/logo/logoff.webp' 
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
            className=" w-full h-auto object-contain"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mb-8">
  <button 
    onClick={()=>{
      localStorage.setItem("userSelect", "Urbano");
      handleImageClick()
    }}
    className="bg-[#003b62] text-white px-6 py-2 rounded-lg hover:bg-white hover:text-black transition-colors"
  >
    Urbano
  </button>
  <button 
  
  onClick={()=>{
    localStorage.setItem("userSelect", "Interprovincional");
    handleImageClick()
  }}
    className="bg-[#ffba00] text-black px-6 py-2 rounded-lg hover:bg-white hover:text-black transition-colors"
  >
    Interprovincional
  </button>
</div>

        {/* Statistics */}
        <div className=" mt-5 flex flex-wrap justify-center space-x-4  max-w-full">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Users className="text-white" />
            <span className="text-sm sm:text-base">1,254 Inscritos</span>
          </div>
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Globe className="text-white" />
            <span className="text-sm sm:text-base">5,678 Visitantes</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="text-white" />
            <span className="text-sm sm:text-base">42 Viagens</span>
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