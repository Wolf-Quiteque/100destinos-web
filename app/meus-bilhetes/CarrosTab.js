'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format, isPast, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CarrosTab() {
    const [rentedCars, setRentedCars] = useState([]);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const loadRentedCars = () => {
            try {
                const storedCars = JSON.parse(localStorage.getItem('rentedCars') || '[]');
                const now = new Date();

                // Filter out expired cars
                const activeCars = storedCars.filter(car => {
                    const endDate = parseISO(car.rentalEndDate);
                    return !isPast(endDate);
                });

                setRentedCars(activeCars);
                localStorage.setItem('rentedCars', JSON.stringify(activeCars)); // Update localStorage with active cars
            } catch (error) {
                console.error("Failed to load rented cars from localStorage:", error);
                setRentedCars([]);
                toast({
                    variant: "destructive",
                    title: "Erro ao Carregar Aluguéis",
                    description: "Não foi possível carregar seus carros alugados.",
                });
            }
        };

        loadRentedCars();

        // Optional: Set up an interval to periodically check for expired cars
        // const intervalId = setInterval(loadRentedCars, 60 * 60 * 1000); // Check every hour
        // return () => clearInterval(intervalId);

    }, [toast]);

    const handleReturnCar = (id) => {
        try {
            const updatedCars = rentedCars.filter(car => car.id !== id);
            setRentedCars(updatedCars);
            localStorage.setItem('rentedCars', JSON.stringify(updatedCars));
            toast({
                title: "Carro Devolvido",
                description: "O carro foi removido da sua lista de aluguéis.",
            });
        } catch (error) {
            console.error("Failed to remove car from localStorage:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Devolver Carro",
                description: "Não foi possível devolver o carro. Tente novamente.",
            });
        }
    };

    return (
        <div className="space-y-6">
            {rentedCars.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center text-gray-400 border border-gray-200">
                    <p className="text-lg">Você não tem carros alugados no momento.</p>
                    <Button
                        onClick={() => router.push('/rent-a-car')}
                        className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        Alugar um Carro
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {rentedCars.map((car) => (
                        <div key={car.id} className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                            <Image
                                src={car.img}
                                alt={car.model}
                                width={150}
                                height={90}
                                className="rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-grow text-gray-800 text-center md:text-left">
                                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start">
                                     {car.model}
                                </h2>
                                <p className="text-gray-500 flex items-center justify-center md:justify-start mb-1">
                                    <CalendarIcon className="mr-2 text-orange-500" />
                                    {format(parseISO(car.rentalStartDate), 'dd/MM/yyyy')} - {format(parseISO(car.rentalEndDate), 'dd/MM/yyyy')}
                                </p>
                                <p className="text-gray-500 flex items-center justify-center md:justify-start mb-3">
                                    <DollarSign className="mr-2 text-orange-500" />
                                    Total: <span className="text-orange-500 font-bold ml-1">
                                        {car.totalRentalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                    </span>
                                </p>
                                <Button
                                    onClick={() => handleReturnCar(car.id)}
                                    variant="outline"
                                    className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-400"
                                >
                                    Devolver Carro
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
