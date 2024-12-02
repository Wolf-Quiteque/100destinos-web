"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Bus,
  CheckCircle2,
  SortAsc,
  Zap
} from 'lucide-react';
import Image from 'next/image';

// Ticket Card Component
const TicketCard = ({ ticket, onSelect, isSelected }) => (
  <motion.div
    variants={{
      initial: { 
        opacity: 0, 
        y: -50,
        rotate: Math.random() * 10 - 5
      },
      animate: { 
        opacity: 1, 
        y: 0,
        rotate: 0,
        transition: { 
          type: 'spring', 
          stiffness: 120, 
          damping: 10 
        }
      }
    }}
    initial="initial"
    animate="animate"
    className={`
      relative bg-white/40 backdrop-blur-xl rounded-2xl p-4 shadow-lg 
      border-2 transition-all duration-300 ease-in-out
      ${isSelected ? 'border-orange-500 scale-105' : 'border-transparent hover:border-orange-300'}
    `}
    onClick={onSelect}
  >
    {isSelected && (
      <CheckCircle2 
        className="absolute top-2 right-2 text-orange-500" 
        size={24} 
      />
    )}
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-black flex items-center">
          <Bus className="mr-2 text-orange-500" size={24} />
          {ticket.company}
        </h3>
        <p className="text-black/70">Partida: {ticket.time}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-orange-500">
          {ticket.price.toLocaleString()} Kz
        </p>
        <p className="text-black/70">{ticket.seats} assentos disponíveis</p>
      </div>
    </div>
  </motion.div>
);