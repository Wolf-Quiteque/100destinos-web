'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const companies = [
  { id: '1', name: 'Macon', img: '/transportes/macon.jpg' },
  { id: '2', name: 'Huambo Express', img: '/transportes/Huambo-Expresso.jpg' },
  { id: '3', name: 'REAL Express', img: '/transportes/maxresdefault.jpg' },
  { id: '4', name: 'Gira transportes', img: '/transportes/giratransportess.jpeg' },
  { id: '5', name: 'Rosalina Xpress', img: '/transportes/rosalinaxpress.jpg' },
  { id: '6', name: 'Motoristas Individuais', img: '/transportes/motorista.jpeg' },
];

export default function CompanyListScreen() {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-orange-600 mb-8">
          Escolha sua Transportadora
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.2 
              }}
              className="group"
            >
              <div 
                className="
                  relative 
                  h-64 
                  rounded-2xl 
                  overflow-hidden 
                  shadow-lg 
                  cursor-pointer
                  transform 
                  transition-all 
                  duration-300 
                  hover:scale-105
                "
                onMouseEnter={() => setHoveredCard(company.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Background Image */}
                <Image
                  src={company.img}
                  alt={company.name}
                  fill
                  className="absolute inset-0 object-cover"
                  quality={90}
                />

                {/* Overlay */}
                <div className="
                  absolute 
                  inset-0 
                  bg-black/50 
                  group-hover:bg-orange-500/60 
                  transition-colors 
                  duration-300
                "></div>

                {/* Company Name */}
                <div className="
                  absolute 
                  bottom-0 
                  left-0 
                  right-0 
                  p-4 
                  bg-gradient-to-t 
                  from-black/70 
                  to-transparent
                ">
                  <h2 className="
                    text-white 
                    text-xl 
                    font-bold 
                    text-center 
                    group-hover:text-white 
                    transition-colors 
                    duration-300
                  ">
                    {company.name}
                  </h2>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}