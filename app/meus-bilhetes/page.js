'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming shadcn/ui Tabs are installed and path is correct

export default function MeusBilhetesPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-orange-400">
        Meus Bilhetes
      </h1>

      <Tabs defaultValue="activo" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 bg-gray-200 dark:bg-gray-800 rounded-lg">
          <TabsTrigger value="activo" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
            <div className="flex items-center justify-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span>Activo</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="pendente" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
            Pendente
          </TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activo" className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-700 dark:text-gray-300">Aqui serão exibidos os seus bilhetes activos.</p>
          {/* Placeholder for active tickets */}
        </TabsContent>
        <TabsContent value="pendente" className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-700 dark:text-gray-300">Aqui serão exibidos os seus bilhetes pendentes.</p>
          {/* Placeholder for pending tickets */}
        </TabsContent>
        <TabsContent value="historico" className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-700 dark:text-gray-300">Aqui será exibido o histórico dos seus bilhetes.</p>
          {/* Placeholder for historical tickets */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
