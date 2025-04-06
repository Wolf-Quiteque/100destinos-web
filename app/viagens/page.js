'use client';

import React from 'react';

export default function ViagensPage() {
  return (
    // Added pb-20 md:pb-8 for app bar spacing on mobile
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 pb-20 md:pb-8"> 
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-orange-400">
        Minhas Viagens
      </h1>
      <div className="text-center text-gray-400">
        {/* Content for displaying user's trips will go here */}
        <p>Ainda não tem viagens registadas.</p>
      </div>
    </div>
  );
}
