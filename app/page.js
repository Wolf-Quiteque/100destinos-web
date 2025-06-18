'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users, Globe, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTransportationIndex, setCurrentTransportationIndex] = useState(0);
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

  const transportations = [
    {
      type: 'bus',
      image: '/transportations/bus.png',
      buttons: [
        { label: 'Urbano', value: 'Urbano' },
        { label: 'Interprovincial', value: 'Interprovincional' },
      ],
    },
    {
      type: 'plane',
      image: '/transportations/plane.webp',
      buttons: [
        { label: 'Nacional', value: 'Nacional' },
        { label: 'Internacional', value: 'Internacional' },
      ],
    },
    {
      type: 'train',
      image: '/transportations/train.png',
      buttons: [
        { label: 'Urbano', value: 'Urbano' },
        { label: 'Interprovincial', value: 'Interprovincial' },
      ],
    },
    {
      type: 'boat',
      image: '/transportations/boat.png',
      buttons: [
        { label: 'Urbano', value: 'Urbano' },
        { label: 'Interprovincial', value: 'Interprovincial' },
      ],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImageClick = (buttonValue) => {
    localStorage.setItem('userSelect', buttonValue);
    router.push('/pesquisar');
  };

  const goToPreviousTransportation = () => {
    setCurrentTransportationIndex((prev) =>
      prev === 0 ? transportations.length - 1 : prev - 1
    );
  };

  const goToNextTransportation = () => {
    setCurrentTransportationIndex((prev) => (prev + 1) % transportations.length);
  };

  const currentTransportation = transportations[currentTransportationIndex];

  return (
    <div
      className="relative min-h-screen flex flex-col pb-32 md:pb-0"
      style={{ background: 'linear-gradient(to bottom, #FFA500, #FFFFFF)' }}
    >
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
      <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-white text-center px-4 pt-28 md:pt-36">
        {/* Logo Section */}
        <div className="absolute top-4 w-full px-20 flex flex-col md:flex-row items-center md:justify-between z-20">
          {/* Main Logo (left on desktop, top on mobile) */}
          <img
            src="/logo/logoff.webp"
            alt="Logo"
            className="h-16 object-contain w-auto max-w-full"
          />

          {/* Angola 50 Anos Logo (centered on desktop, below logo on mobile) */}
          <div className="mt-2 md:mt-10 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <Image
              src="/logo/ANGOLA-50-ANOS.png"
              alt="Angola 50 Anos Logo"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>
        </div>
        

    {/* Transportation Carousel */}
<div className="relative flex items-center justify-center w-full max-w-4xl mx-auto mt-20 mb-12">
  <div className="flex items-center justify-center gap-6 overflow-hidden px-4">
    {/* Previous Image */}
    <div
      onClick={goToPreviousTransportation}
      className="cursor-pointer transition-all duration-500 grayscale opacity-60 hover:opacity-80 hover:grayscale-0"
    >
      <img
        src={transportations[(currentTransportationIndex - 1 + transportations.length) % transportations.length].image}
        alt="Previous Transportation"
        className="h-28 w-auto object-contain scale-90"
      />
    </div>

    {/* Current Image (main) */}
    <div className="transition-transform duration-500 transform scale-110 drop-shadow-lg">
      <img
        src={currentTransportation.image}
        alt={currentTransportation.type}
        className="h-44 w-auto object-contain"
      />
    </div>

    {/* Next Image */}
    <div
      onClick={goToNextTransportation}
      className="cursor-pointer transition-all duration-500 grayscale opacity-60 hover:opacity-80 hover:grayscale-0"
    >
      <img
        src={transportations[(currentTransportationIndex + 1) % transportations.length].image}
        alt="Next Transportation"
        className="h-28 w-auto object-contain scale-90"
      />
    </div>
  </div>
</div>

{/* Selection Buttons */}
<div className="flex flex-wrap justify-center gap-4 mb-10 px-4">
  {currentTransportation.buttons.map((button) => (
    <button
      key={button.value}
      onClick={() => handleImageClick(button.value)}
      className="bg-[#003b62] text-white px-6 py-2 rounded-lg hover:bg-white hover:text-[#003b62] transition-colors shadow-md"
    >
      {button.label}
    </button>
  ))}
</div>


{/* Publicidade Card */}
<div className="rounded-xl bg-white/20 backdrop-blur-md shadow-2xl p-4 w-[300px] h-[180px] relative overflow-hidden">
  <span className="text-lg font-bold text-white absolute top-2 left-4 z-10">
    Publicidade
  </span>
  <Image
    src="/img/img1.jpg"
    alt="Publicidade"
    fill
    className="rounded-xl object-cover"
  />
  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/50 rounded-xl"></div>
</div>

      </div>

      {/* Statistics Section 
      <div className="absolute bottom-16 md:bottom-4 left-0 w-full flex flex-wrap justify-center space-x-4 p-4 bg-black/50 z-30">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0 text-white">
          <Users className="text-white" />
          <span className="text-sm sm:text-base">1,254 Inscritos</span>
        </div>
        <div className="flex items-center space-x-2 mb-2 sm:mb-0 text-white">
          <Globe className="text-white" />
          <span className="text-sm sm:text-base">5,678 Visitantes</span>
        </div>
        <div className="flex items-center space-x-2 text-white">
          <MapPin className="text-white" />
          <span className="text-sm sm:text-base">42 Viagens</span>
        </div>
      </div>*/}
    </div>
  );
}
