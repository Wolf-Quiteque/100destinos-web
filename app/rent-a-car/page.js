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
                    <div className="car-card">
                        <div className="car-image" style={{backgroundImage: "url('https://picsum.photos/id/111/800/600')"}}>
                            <div className="car-badge">Popular</div>
                        </div>
                        <div className="car-info">
                            <div className="car-header">
                                <div className="car-name">Volkswagen Polo</div>
                                <div className="car-price">18,900 AOA<span>/dia</span></div>
                            </div>
                            <div className="car-details">
                                <div className="car-detail">
                                    <i className="fas fa-gas-pump"></i>
                                    <span>Flex</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-user-friends"></i>
                                    <span>5 pessoas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-suitcase"></i>
                                    <span>2 malas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-tachometer-alt"></i>
                                    <span>Automático</span>
                                </div>
                            </div>
                            <button className="rent-btn">Alugar Agora</button>
                        </div>
                    </div>
                    
                    <div className="car-card">
                        <div className="car-image" style={{backgroundImage: "url('https://picsum.photos/id/133/800/600')"}}>
                            <div className="car-badge">Economize 15%</div>
                        </div>
                        <div className="car-info">
                            <div className="car-header">
                                <div className="car-name">Fiat Argo</div>
                                <div className="car-price">15,900 AOA<span>/dia</span></div>
                            </div>
                            <div className="car-details">
                                <div className="car-detail">
                                    <i className="fas fa-gas-pump"></i>
                                    <span>Flex</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-user-friends"></i>
                                    <span>5 pessoas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-suitcase"></i>
                                    <span>2 malas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-tachometer-alt"></i>
                                    <span>Manual</span>
                                </div>
                            </div>
                            <button className="rent-btn">Alugar Agora</button>
                        </div>
                    </div>
                    
                    <div className="car-card">
                        <div className="car-image" style={{backgroundImage: "url('https://picsum.photos/id/146/800/600')"}}>
                            <div className="car-badge">Mais alugado</div>
                        </div>
                        <div className="car-info">
                            <div className="car-header">
                                <div className="car-name">Jeep Renegade</div>
                                <div className="car-price">28,900 AOA<span>/dia</span></div>
                            </div>
                            <div className="car-details">
                                <div className="car-detail">
                                    <i className="fas fa-gas-pump"></i>
                                    <span>Flex</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-user-friends"></i>
                                    <span>5 pessoas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-suitcase"></i>
                                    <span>4 malas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-tachometer-alt"></i>
                                    <span>Automático</span>
                                </div>
                            </div>
                            <button className="rent-btn">Alugar Agora</button>
                        </div>
                    </div>
                    
                    <div className="car-card">
                        <div className="car-image" style={{backgroundImage: "url('https://picsum.photos/id/162/800/600')"}}>
                            <div className="car-badge">Novo</div>
                        </div>
                        <div className="car-info">
                            <div className="car-header">
                                <div className="car-name">BMW 320i</div>
                                <div className="car-price">49,900 AOA<span>/dia</span></div>
                            </div>
                            <div className="car-details">
                                <div className="car-detail">
                                    <i className="fas fa-gas-pump"></i>
                                    <span>Gasolina</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-user-friends"></i>
                                    <span>4 pessoas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-suitcase"></i>
                                    <span>3 malas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-tachometer-alt"></i>
                                    <span>Automático</span>
                                </div>
                            </div>
                            <button className="rent-btn">Alugar Agora</button>
                        </div>
                    </div>
                    
                    <div className="car-card">
                        <div className="car-image" style={{backgroundImage: "url('https://picsum.photos/id/183/800/600')"}}>
                            <div className="car-badge">Promoção</div>
                        </div>
                        <div className="car-info">
                            <div className="car-header">
                                <div className="car-name">Chevrolet Onix</div>
                                <div className="car-price">17,900 AOA<span>/dia</span></div>
                            </div>
                            <div className="car-details">
                                <div className="car-detail">
                                    <i className="fas fa-gas-pump"></i>
                                    <span>Flex</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-user-friends"></i>
                                    <span>5 pessoas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-suitcase"></i>
                                    <span>2 malas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-tachometer-alt"></i>
                                    <span>Automático</span>
                                </div>
                            </div>
                            <button className="rent-btn">Alugar Agora</button>
                        </div>
                    </div>
                    
                    <div className="car-card">
                        <div className="car-image" style={{backgroundImage: "url('https://picsum.photos/id/193/800/600')"}}>
                            <div className="car-badge">Econômico</div>
                        </div>
                        <div className="car-info">
                            <div className="car-header">
                                <div className="car-name">Hyundai HB20</div>
                                <div className="car-price">16,900 AOA<span>/dia</span></div>
                            </div>
                            <div className="car-details">
                                <div className="car-detail">
                                    <i className="fas fa-gas-pump"></i>
                                    <span>Flex</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-user-friends"></i>
                                    <span>5 pessoas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-suitcase"></i>
                                    <span>2 malas</span>
                                </div>
                                <div className="car-detail">
                                    <i className="fas fa-tachometer-alt"></i>
                                    <span>Manual</span>
                                </div>
                            </div>
                            <button className="rent-btn">Alugar Agora</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
