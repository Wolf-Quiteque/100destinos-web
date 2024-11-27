'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Background images (you'll replace these with your actual image paths)
const backgroundImages = [
  '/bg/sera.jpg',
  '/bg/tundavala.jpg',
  '/bg/palancanegra.jpg',
];

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const imageChangeInterval = setInterval(() => {
      setIsTransitioning(true);

      // Wait for fade out, then change image
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
        setIsTransitioning(false);
      }, 1000); // Match this with transition duration
    }, 5000); // Image changes every 5 seconds

    return () => clearInterval(imageChangeInterval);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Image Carousel */}
      {backgroundImages.map((img, index) => (
        <div
          key={img}
          className={`
            absolute inset-0 z-0 transition-opacity duration-1000 
            ${currentImageIndex === index ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <Image
            src={img}
            alt={`Background ${index + 1}`}
            layout="fill"
            objectFit="cover"
            quality={90}
            priority
          />
        </div>
      ))}

      {/* White Overlay */}
      <div className="absolute inset-0 bg-white/30 z-10"></div>

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-white">
        {/* Logo/Title */}
        <div className="text-4xl font-bold mb-8 text-center">
          <Image
            src={'/100destinosslogo.png'}
            alt="100 Destinos Logo"
            width={300}
            height={100}
            className="mb-8"
          />
        </div>

        {/* Search Container */}
        <div className="w-full max-w-md px-4">
          <div className="flex items-center bg-white rounded-full overflow-hidden shadow-xl">
            <input
              type="text"
              placeholder="Procure seu destino..."
              className="flex-grow p-4 text-black outline-none"
            />
            <button
              className="
                bg-orange-500 text-white 
                px-6 py-4 
                hover:bg-orange-600 
                transition-colors 
                duration-300
              "
            >
              Procurar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
