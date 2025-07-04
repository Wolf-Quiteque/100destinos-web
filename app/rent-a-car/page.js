'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Calendar as CalendarIcon, Loader2, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '../../context/AuthContext';
import { format, isBefore, startOfToday } from 'date-fns'; // Changed addDays to isBefore, startOfToday
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import RentPaymentModal from '@/components/RentPaymentModal'; // Import the new modal component
import './style.css';

export default function RentACar() {
    const router = useRouter();
    const { session, user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const supabase = createClientComponentClient();
    const { toast } = useToast();

    const [selectedCar, setSelectedCar] = useState(null);
    const [rentalStartDate, setRentalStartDate] = useState(null);
    const [rentalEndDate, setRentalEndDate] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [rentalDuration, setRentalDuration] = useState(0);
    const [totalRentalPrice, setTotalRentalPrice] = useState(0);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [filteredCarData, setFilteredCarData] = useState([]); // State for filtered cars
    const [showSearchResults, setShowSearchResults] = useState(false); // New state to control view

    const carData = [
        {"model": "HYUNDAI I10", "price": "50.000 kz", "info": "Preço por Dia", img:"/rent-a-car/hyundai-10.png"},
        {"model": "KIA MORNING", "price": "50.000 kz", "info": "Preço por Dia", img:"/rent-a-car/KIA_MORNING.webp"},
        {"model": "HYUNDAI I20", "price": "55.000 kz", "info": "Preço por Dia", img:"/rent-a-car/HYUNDAI-I20.png"},
        {"model": "ELANTRA", "price": "70.000 kz", "info": "Preço por Dia", img:"/rent-a-car/ELANTRA.webp"},
        {"model": "KIA SPORTAGE", "price": "90.000 kz", "info": "Preço por Dia", img:"/rent-a-car/KIA-SPORTAGE.webp"},
        {"model": "HYUNDAI IX35 / TUCSON / SANTA FÉ", "price": "100.000 kz", "info": "Preço por Dia", img:"/rent-a-car/HYUNDAI-IX35.webp"},
        {"model": "JETOUR", "price": "150.000 kz", "info": "Preço por Dia", img:"/rent-a-car/JETOUR.webp"},
        {"model": "HYUNDAI H-1", "price": "250.000 kz", "info": "Preço por Dia", img:"/rent-a-car/HYUNDAI H-1.webp"},
        {"model": "KIA K5 / KIA K7", "price": "200.000 kz", "info": "Preço por Dia", img:"/rent-a-car/KIA-K5.webp"},
        {"model": "HIACE", "price": "250.000 kz", "info": "Preço por Dia", img:"/rent-a-car/HIACE.webp"},
        {"model": "FORTUNER", "price": "250.000 kz", "info": "Preço por Dia", img:"/rent-a-car/FORTUNER.webp"},
        {"model": "HILUX", "price": "250.000 kz", "info": "Preço por Dia", img:"/rent-a-car/hyundai-10.png"}
    ].map(car => ({
        ...car,
        numericPrice: parseFloat(car.price.replace('.', '').replace(',', '.')) // Convert "50.000 kz" to 50000
    }));

    useEffect(() => {
        // Initialize filteredCarData with all cars when component mounts
        setFilteredCarData(carData);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (authUser) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('nome')
                    .eq('id', authUser.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile for avatar:', error);
                } else {
                    setProfile(data);
                }
            } else {
                setProfile(null);
            }
        };

        fetchProfile();
    }, [authUser, supabase]);

    useEffect(() => {
        if (rentalStartDate && rentalEndDate && selectedCar) {
            const diffTime = Math.abs(rentalEndDate.getTime() - rentalStartDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setRentalDuration(diffDays);
            setTotalRentalPrice(diffDays * selectedCar.numericPrice);
        } else {
            setRentalDuration(0);
            setTotalRentalPrice(0);
        }
    }, [rentalStartDate, rentalEndDate, selectedCar]);

    const handleRentNowClick = (car) => {
        if (!rentalStartDate || !rentalEndDate) {
            toast({
                variant: "destructive",
                title: "Datas de Aluguel Necessárias",
                description: "Por favor, selecione as datas de retirada e devolução antes de alugar.",
            });
            return;
        }
        setSelectedCar(car);
        setShowPaymentModal(true);
    };

    const handleSearchCars = (e) => {
        e.preventDefault(); // Prevent form submission
        // Simulate a search: for now, just display all cars and show a toast
        setFilteredCarData(carData);
        setShowSearchResults(true); // Show only search results
      
    };

    const handleBackToSearch = () => {
        setShowSearchResults(false); // Go back to initial view
        setFilteredCarData(carData); // Reset filtered data if needed
    };

    const handlePaymentSuccess = (rentedCarObject) => {
        const existingRentedCars = JSON.parse(localStorage.getItem('rentedCars') || '[]');
        const updatedRentedCars = [...existingRentedCars, rentedCarObject];
        localStorage.setItem('rentedCars', JSON.stringify(updatedRentedCars));

        toast({
            title: "Carro Alugado com Sucesso!",
            description: `Você alugou um ${rentedCarObject.model} por ${rentedCarObject.rentalDuration} dias.`,
        });

        setShowPaymentModal(false);
        setSelectedCar(null);
        setRentalStartDate(null);
        setRentalEndDate(null);
        setRentalDuration(0);
        setTotalRentalPrice(0);
    };

    return (
        <div className="main-container">
            {!showSearchResults ? (
                <div className="hero-section rent-a-car-hero">
                    <div className="content-wrapper">
                        <header className="header">
                            <div className="header-top">
                            <Image
                                src="/logo/logoff.webp"
                                alt="Logo"
                                width={150}
                                height={90}
                                className="logo"
                            />
                                <div className="flex items-center space-x-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push('/meus-alugueis')}
                                        className="text-white hover:text-orange-500"
                                    >
                                        Meus Aluguéis
                                    </Button>
                                    <div
                                    className="avatar"
                                    onClick={() => !session && router.push('/login')}
                                    style={{ cursor: session ? 'default' : 'pointer' }}
                                >
                                    {session && profile?.nome ? (
                                        (() => {
                                            const nameParts = profile.nome.split(' ').filter(part => part.length > 0);
                                            if (nameParts.length >= 2) {
                                                return `${nameParts[0].charAt(0).toUpperCase()}${nameParts[nameParts.length - 1].charAt(0).toUpperCase()}`;
                                            } else if (nameParts.length === 1) {
                                                return nameParts[0].charAt(0).toUpperCase();
                                            }
                                            return 'JS';
                                        })()
                                    ) : (
                                        <User size={24} />
                                    )}
                                </div>
                                </div>
                            </div>

                            <div>
                                <h1 className="page-title">Aluguel de Carros</h1>
                                <p className="page-subtitle">Encontre o veículo perfeito para sua viagem entre mais de 1,000 opções disponíveis em todo o Brasil</p>
                            </div>
                        </header>

                        <div className="search-card">
                            <div className="search-tabs">
                                <div className="tab active">Retirada</div>
                                <div className="tab">Devolução</div>
                            </div>

                            <form className="search-form" onSubmit={handleSearchCars}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <input type="text" className="form-control" placeholder="Local de retirada" defaultValue="Aeroporto de Guarulhos (GRU)" />
                                    </div>

                                    <div className="form-group">
                                        <i className="fas fa-calendar-alt"></i>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !rentalStartDate && "text-muted-foreground",
                                                        rentalStartDate && "text-black" // Ensure text is black when date is selected
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {rentalStartDate ? format(rentalStartDate, "PPP") : <span>Data de retirada</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={rentalStartDate}
                                                    onSelect={setRentalStartDate}
                                                    initialFocus
                                                    disabled={(date) => isBefore(date, startOfToday())} // Disable dates before today
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <input type="text" className="form-control" placeholder="Local de devolução" defaultValue="Mesmo local" />
                                    </div>

                                    <div className="form-group">
                                        <i className="fas fa-calendar-alt"></i>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !rentalEndDate && "text-muted-foreground",
                                                        rentalEndDate && "text-black" // Ensure text is black when date is selected
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {rentalEndDate ? format(rentalEndDate, "PPP") : <span>Data de devolução</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                selected={rentalEndDate}
                                                onSelect={setRentalEndDate}
                                                initialFocus
                                                disabled={(date) => !rentalStartDate || isBefore(date, rentalStartDate)} // Disable dates before start date
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                                <button type="submit" className="search-btn">
                                    <i className="fas fa-search"></i> Buscar Carros
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="content-wrapper page-content">
                    <button
                        onClick={handleBackToSearch}
                        className="absolute top-4 left-4 md:left-8 z-10
                        text-white bg-gray-800/50 hover:bg-gray-800/70
                        rounded-full p-3 transition-all duration-300
                        hover:text-orange-500 hover:scale-110"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="ad-container">
                        <h2>Anúncio</h2>
                        <p>Espaço para publicidade</p>
                    </div>

                    <div className="section-title">
                        Categorias
                        <a href="#" className="see-all">Ver todas</a>
                    </div>

                    <div className="categories">
                        <div className="category-card active">
                            <div className="category-icon">
                                <i className="fas fa-car"></i>
                            </div>
                            <div className="category-title">Todos</div>
                        </div>

                        <div className="category-card">
                            <div className="category-icon">
                                <i className="fas fa-car-side"></i>
                            </div>
                            <div className="category-title">Econômico</div>
                        </div>

                        <div className="category-card">
                            <div className="category-icon">
                                <i className="fas fa-car-alt"></i>
                            </div>
                            <div className="category-title">Intermediário</div>
                        </div>

                        <div className="category-card">
                            <div className="category-icon">
                                <i className="fas fa-caravan"></i>
                            </div>
                            <div className="category-title">SUV</div>
                        </div>

                        <div className="category-card">
                            <div className="category-icon">
                                <i className="fas fa-truck-pickup"></i>
                            </div>
                            <div className="category-title">Pickup</div>
                        </div>

                        <div className="category-card">
                            <div className="category-icon">
                                <i className="fas fa-car"></i>
                            </div>
                            <div className="category-title">Luxo</div>
                        </div>

                        <div className="category-card">
                            <div className="category-icon">
                                <i className="fas fa-shuttle-van"></i>
                            </div>
                            <div className="category-title">Van</div>
                        </div>

                        <div className="category-card">
                            <div className="category-icon">
                                <i className="fas fa-bolt"></i>
                            </div>
                            <div className="category-title">Elétrico</div>
                        </div>
                    </div>

                    <div className="section-title">
                        Veículos Disponíveis
                        <a href="#" className="see-all">Ver todos</a>
                    </div>

                    <div className="car-list">
                        {filteredCarData.map((car, index) => (
                            <div className="car-card" key={index}>
                                <div
                                    className="car-image"
                                    style={{
                                        backgroundImage: `url('${car.img}')`,
                                    }}
                                >
                                    {/* You can add a badge here if needed, e.g., based on car data */}
                                    {/* <div className="car-badge">Popular</div> */}
                                </div>
                                <div className="car-info">
                                    <div className="car-header">
                                        <div className="car-name">{car.model}</div>
                                        <div className="car-price">
                                            {car.price}
                                            <span>/{car.info.toLowerCase().replace('preço por ', '')}</span>
                                        </div>
                                    </div>
                                    <div className="car-details">
                                        <div className="car-detail">
                                            <span>{car.info}</span>
                                        </div>
                                    </div>
                                    <button className="rent-btn" onClick={() => handleRentNowClick(car)}>Alugar Agora</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <RentPaymentModal
                    selectedCar={selectedCar}
                    rentalStartDate={rentalStartDate}
                    rentalEndDate={rentalEndDate}
                    rentalDuration={rentalDuration}
                    totalRentalPrice={totalRentalPrice}
                    onPaymentSuccess={handlePaymentSuccess}
                    onClose={() => setShowPaymentModal(false)}
                />
            </Dialog>
        </div>
    );
}
