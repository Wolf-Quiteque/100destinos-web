'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, BedDouble, Calendar, Search, Star, Heart, Gift } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '../../context/AuthContext';
import './style.css';
import hotelsData from '../../lib/hotelData'; // Import the dummy data

export default function Hoteis() {
    const router = useRouter();
    const { session, user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const supabase = createClientComponentClient();
    const [hotels, setHotels] = useState(hotelsData); // Initialize hotels with dummy data
    const [searchTerm, setSearchTerm] = useState('');
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guests, setGuests] = useState(1);

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

    const adImages = [
        '/ads/1.jpeg',
        '/ads/2.jpg',
        '/ads/3.jpeg',
        '/ads/5.jpeg',
        '/ads/6.webp',
    ];

    useEffect(() => {
        const adInterval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % adImages.length);
        }, 4000);
        return () => clearInterval(adInterval);
    }, [adImages.length]);

    const handleSearch = (e) => {
        e.preventDefault();
        const filteredHotels = hotelsData.filter(hotel =>
            hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setHotels(filteredHotels);
    };

    return (
        <>

                <div className="main-container">
                    <div className="hero-section hotel-hero">
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

                                <div>
                                    <h1 className="page-title">Encontre o Hotel Perfeito</h1>
                                    <p className="page-subtitle">Descubra e reserve hotéis incríveis em Angola para a sua próxima viagem.</p>
                                </div>
                            </header>

                            <div className="search-card">
                                <form className="search-form" onSubmit={handleSearch}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <BedDouble className="form-icon" />
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Cidade, hotel ou destino"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <Calendar className="form-icon" />
                                            <input
                                                type="date"
                                                className="form-control"
                                                placeholder="Check-in"
                                                value={checkInDate}
                                                onChange={(e) => setCheckInDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <Calendar className="form-icon" />
                                            <input
                                                type="date"
                                                className="form-control"
                                                placeholder="Check-out"
                                                value={checkOutDate}
                                                onChange={(e) => setCheckOutDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <User className="form-icon" />
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Hóspedes"
                                                value={guests}
                                                onChange={(e) => setGuests(e.target.value)}
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="search-btn">
                                        <Search /> Pesquisar Hotéis
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="content-wrapper" style={{marginTop: '300px'}}>
                        <div className="section-title">
                            Ofertas Especiais
                        </div>
                        <div className="special-offers">
                            <div className="offer-card">
                                <Gift size={48} color="yellow" />
                                <h3>Suite Presidencial com 50% OFF</h3>
                                <p>Válido para reservas em Julho</p>
                                <button>Ver Oferta</button>
                            </div>
                            <div className="offer-card">
                                <Heart size={48} color="red" fill="red" />
                                <h3>Fim de Semana Romântico</h3>
                                <p>Inclui jantar e espumante</p>
                                <button>Ver Oferta</button>
                            </div>
                        </div>

                        <div className="section-title">
                            Anúncios
                        </div>
                        <div className="ads-carousel">
                            {adImages.map((img, index) => (
                                <div
                                    key={img}
                                    className={`ad-slide ${index === currentAdIndex ? 'active' : ''}`}
                                    style={{ backgroundImage: `url(${img})` }}
                                ></div>
                            ))}
                        </div>

                        <div className="section-title">
                            Tipos de Quarto
                        </div>
                        <div className="room-types">
                            {hotelsData.flatMap(hotel => hotel.rooms).slice(0, 4).map((room, index) => (
                                <div key={index} className="room-type-card">
                                    <div className="room-type-image" style={{backgroundImage: `url(${room.images[0]})`}}></div>
                                    <h4>{room.name}</h4>
                                </div>
                            ))}
                        </div>

                        <div className="section-title">
                            Hotéis Populares em Angola
                            <a href="#" className="see-all">Ver todos</a>
                        </div>

                        <div className="hotel-list">
                            {hotels.map((hotel) => (
                                <Link href={`/hoteis/${hotel.id}`} key={hotel.id} className="hotel-card">
                                    <div className="hotel-image" style={{backgroundImage: `url(${hotel.images[0]})`}}>
                                        {hotel.rating >= 4.8 && <div className="hotel-badge">Mais Popular</div>}
                                        {hotel.rating >= 4.9 && <div className="hotel-badge">Luxo</div>}
                                        {hotel.rating >= 4.5 && hotel.rating < 4.8 && <div className="hotel-badge">Melhor Custo-Benefício</div>}
                                    </div>
                                    <div className="hotel-info">
                                        <div className="hotel-header">
                                            <div className="hotel-name">{hotel.name}</div>
                                            <div className="hotel-rating">
                                                <Star size={16} /> {hotel.rating}
                                            </div>
                                        </div>
                                        <div className="hotel-location">{hotel.location}</div>
                                        <div className="hotel-price">
                                            <div className="price">{(hotel.rooms[0].guestCapacity.price || hotel.rooms[0].guestCapacity.price2 || hotel.rooms[0].guestCapacity.price2_breakfast_only).toLocaleString('pt-AO')} AOA</div>
                                            <div className="per-night">/noite</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="section-title">
                            Anúncios
                        </div>
                        <div className="ads-carousel">
                            {adImages.map((img, index) => (
                                <div
                                    key={img}
                                    className={`ad-slide ${index === currentAdIndex ? 'active' : ''}`}
                                    style={{ backgroundImage: `url(${img})` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
     
        </>
    );
}
