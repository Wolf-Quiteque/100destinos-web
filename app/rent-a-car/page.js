'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '../../context/AuthContext';
import './style.css';

export default function RentACar() {
    const router = useRouter();
    const { session, user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const supabase = createClientComponentClient();

    const carData = [
        {"model": "HYUNDAI I10", "price": "50.000 kz", "info": "Preço por Dia",img:"/rent-a-car/hyundai-10.png"},
        {"model": "KIA MORNING", "price": "50.000 kz", "info": "Preço por Dia",img:"/rent-a-car/KIA_MORNING.webp"},
        {"model": "HYUNDAI I20", "price": "55.000 kz", "info": "Preço por Dia",img:"/rent-a-car/HYUNDAI-I20.png"},
        {"model": "ELANTRA", "price": "70.000 kz", "info": "Preço por Dia",img:"/rent-a-car/ELANTRA.webp"},
        {"model": "KIA SPORTAGE", "price": "90.000 kz", "info": "Preço por Dia",img:"/rent-a-car/KIA-SPORTAGE.webp"},
        {"model": "HYUNDAI IX35 / TUCSON / SANTA FÉ", "price": "100.000 kz", "info": "Preço por Dia",img:"/rent-a-car/HYUNDAI-IX35.webp"},
        {"model": "JETOUR", "price": "150.000 kz", "info": "Preço por Dia",img:"/rent-a-car/JETOUR.webp"},
        {"model": "HYUNDAI H-1", "price": "250.000 kz", "info": "Preço por Dia",img:"/rent-a-car/HYUNDAI H-1.webp"},
        {"model": "KIA K5 / KIA K7", "price": "200.000 kz", "info": "Preço por Dia",img:"/rent-a-car/KIA-K5.webp"},
        {"model": "HIACE", "price": "250.000 kz", "info": "Preço por Dia",img:"/rent-a-car/HIACE.webp"},
        {"model": "FORTUNER", "price": "250.000 kz", "info": "Preço por Dia",img:"/rent-a-car/FORTUNER.webp"},
        {"model": "HILUX", "price": "250.000 kz", "info": "Preço por Dia",img:"/rent-a-car/hyundai-10.png"}
    ];

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

    return (
        <div className="main-container">
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
                            <h1 className="page-title">Aluguel de Carros</h1>
                            <p className="page-subtitle">Encontre o veículo perfeito para sua viagem entre mais de 1,000 opções disponíveis em todo o Brasil</p>
                        </div>
                    </header>

                    <div className="search-card">
                        <div className="search-tabs">
                            <div className="tab active">Retirada</div>
                            <div className="tab">Devolução</div>
                        </div>

                        <form className="search-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <input type="text" className="form-control" placeholder="Local de retirada" defaultValue="Aeroporto de Guarulhos (GRU)" />
                                </div>

                                <div className="form-group">
                                    <i className="fas fa-calendar-alt"></i>
                                    <input type="text" className="form-control" placeholder="Data de retirada" defaultValue="15 Jun 2023" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <input type="text" className="form-control" placeholder="Local de devolução" defaultValue="Mesmo local" />
                                </div>

                                <div className="form-group">
                                    <i className="fas fa-calendar-alt"></i>
                                    <input type="text" className="form-control" placeholder="Data de devolução" defaultValue="20 Jun 2023" />
                                </div>
                            </div>

                            <button type="submit" className="search-btn">
                                <i className="fas fa-search"></i> Buscar Carros
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="content-wrapper page-content">
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
                    {carData.map((car, index) => (
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
                                <button className="rent-btn">Alugar Agora</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
