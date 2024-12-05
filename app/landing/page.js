import React from 'react';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-orange-500 text-white py-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <Truck size={36} />
            <h1 className="text-2xl font-bold">100 Destinos</h1>
          </div>
          <nav className="space-x-4">
            <a href="#" className="hover:text-gray-200">Início</a>
            <a href="#" className="hover:text-gray-200">Sobre</a>
            <a href="#" className="hover:text-gray-200">Contacto</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 grid md:grid-cols-2 items-center gap-8 py-16">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">
            Viaje por Angola com <span className="text-orange-500">100 Destinos</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Compre bilhetes de autocarro facilmente, conecte-se com as principais províncias de Angola e explore o país com um simples clique.
          </p>
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-full text-lg"
          >
            Procurar Viagens
          </Button>
        </div>
        <div>
          <img 
            src="https://picsum.photos/600/400" 
            alt="Autocarro de viagem" 
            className="rounded-lg shadow-2xl"
          />
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 100 Destinos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;