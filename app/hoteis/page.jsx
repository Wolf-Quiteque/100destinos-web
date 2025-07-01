'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, BedDouble, Calendar, Search, Star, Heart, Gift } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '../../context/AuthContext';
import './style.css';

export default function Hoteis() {
    const router = useRouter();
    const { session, user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const supabase = createClientComponentClient();

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
        '/img/img1.jpg',
        '/img/img2.jpg',
        '/img/img3.jpg',
    ];

    useEffect(() => {
        const adInterval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % adImages.length);
        }, 4000);
        return () => clearInterval(adInterval);
    }, [adImages.length]);

    return (
        <html lang="pt-BR">
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Reserva de Hotéis | Voyager</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </head>
        <body>
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
                            <form className="search-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <BedDouble className="form-icon" />
                                        <input type="text" className="form-control" placeholder="Cidade, hotel ou destino" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <Calendar className="form-icon" />
                                        <input type="text" className="form-control" placeholder="Check-in" onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'}/>
                                    </div>
                                    <div className="form-group">
                                        <Calendar className="form-icon" />
                                        <input type="text" className="form-control" placeholder="Check-out" onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'}/>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <User className="form-icon" />
                                        <input type="number" className="form-control" placeholder="Hóspedes" />
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
                        Tipos de Quarto
                    </div>
                    <div className="room-types">
                        <div className="room-type-card">
                            <div className="room-type-image" style={{backgroundImage: "url('https://picsum.photos/id/10/800/600')"}}></div>
                            <h4>Quarto Standard</h4>
                        </div>
                        <div className="room-type-card">
                            <div className="room-type-image" style={{backgroundImage: "url('https://picsum.photos/id/20/800/600')"}}></div>
                            <h4>Quarto Deluxe</h4>
                        </div>
                        <div className="room-type-card">
                            <div className="room-type-image" style={{backgroundImage: "url('https://picsum.photos/id/30/800/600')"}}></div>
                            <h4>Suite Júnior</h4>
                        </div>
                        <div className="room-type-card">
                            <div className="room-type-image" style={{backgroundImage: "url('https://picsum.photos/id/40/800/600')"}}></div>
                            <h4>Suite Presidencial</h4>
                        </div>
                    </div>

                    <div className="section-title">
                        Hotéis Populares em Angola
                        <a href="#" className="see-all">Ver todos</a>
                    </div>

                    <div className="hotel-list">
                        <div className="hotel-card">
                            <div className="hotel-image" style={{backgroundImage: "url('https://picsum.photos/id/1015/800/600')"}}>
                                <div className="hotel-badge">Mais Popular</div>
                            </div>
                            <div className="hotel-info">
                                <div className="hotel-header">
                                    <div className="hotel-name">Hotel Diamante</div>
                                    <div className="hotel-rating">
                                        <Star size={16} /> 4.8
                                    </div>
                                </div>
                                <div className="hotel-location">Luanda, Angola</div>
                                <div className="hotel-price">
                                    <div className="price">75,000 AOA</div>
                                    <div className="per-night">/noite</div>
                                </div>
                            </div>
                        </div>

                        <div className="hotel-card">
                            <div className="hotel-image" style={{backgroundImage: "url('https://picsum.photos/id/1016/800/600')"}}>
                                <div className="hotel-badge">Luxo</div>
                            </div>
                            <div className="hotel-info">
                                <div className="hotel-header">
                                    <div className="hotel-name">Resort Tropicana</div>
                                    <div className="hotel-rating">
                                        <Star size={16} /> 4.9
                                    </div>
                                </div>
                                <div className="hotel-location">Benguela, Angola</div>
                                <div className="hotel-price">
                                    <div className="price">120,000 AOA</div>
                                    <div className="per-night">/noite</div>
                                </div>
                            </div>
                        </div>

                        <div className="hotel-card">
                            <div className="hotel-image" style={{backgroundImage: "url('https://picsum.photos/id/1018/800/600')"}}>
                                <div className="hotel-badge">Melhor Custo-Benefício</div>
                            </div>
                            <div className="hotel-info">
                                <div className="hotel-header">
                                    <div className="hotel-name">Hotel Kwanza</div>
                                    <div className="hotel-rating">
                                        <Star size={16} /> 4.5
                                    </div>
                                </div>
                                <div className="hotel-location">Huambo, Angola</div>
                                <div className="hotel-price">
                                    <div className="price">45,000 AOA</div>
                                    <div className="per-night">/noite</div>
                                </div>
                            </div>
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
                </div>
            </div>
        </body>
        </html>
    );
}
