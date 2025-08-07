'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BedDouble, Calendar, Search, Star, Heart, Gift, User, MapPin, Ruler, Utensils, Car, Clock, X, ArrowLeft, Users, Bed, Home, Wifi, Car as CarIcon, Coffee, Waves, Dumbbell, Phone } from 'lucide-react';
import hotelsData from '../../../lib/hotelData';
import { format } from 'date-fns';
import { use } from 'react'; // Correct import for use hook
import './styles.css';

export default function HotelDetailPage({ params }) {
    const router = useRouter();
    const { hotelId } = use(params);
    const [hotel, setHotel] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [nights, setNights] = useState(0);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [modalRoom, setModalRoom] = useState(null);
    const [currentHeroImage, setCurrentHeroImage] = useState(0);

    useEffect(() => {
        const foundHotel = hotelsData.find(h => h.id === hotelId);
        if (foundHotel) {
            setHotel(foundHotel);
        } else {
            // Handle hotel not found, e.g., redirect to 404 or hotels list
            router.push('/hoteis');
        }
    }, [hotelId, router]);

    // Hero image slideshow
    useEffect(() => {
        if (!hotel || !hotel.images || hotel.images.length === 0) {
            console.log('No hotel or images found:', hotel);
            return;
        }
        
        console.log('Starting slideshow with images:', hotel.images);
        setCurrentHeroImage(0); // Ensure first image is shown
        
        const interval = setInterval(() => {
            setCurrentHeroImage((prev) => {
                const nextIndex = (prev + 1) % hotel.images.length;
                console.log('Changing to image index:', nextIndex, 'Image:', hotel.images[nextIndex]);
                return nextIndex;
            });
        }, 1500); // 1.5 seconds interval
        
        return () => clearInterval(interval);
    }, [hotel]);

    useEffect(() => {
        if (selectedRoom && checkInDate && checkOutDate) {
            const startDate = new Date(checkInDate);
            const endDate = new Date(checkOutDate);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setNights(diffDays);

            let pricePerNight = 0;
            if (selectedRoom.guestCapacity.maxPeople2 && guests <= selectedRoom.guestCapacity.maxPeople2) {
                pricePerNight = selectedRoom.guestCapacity.price2;
            } else if (selectedRoom.guestCapacity.maxPeople1 && guests <= selectedRoom.guestCapacity.maxPeople1) {
                pricePerNight = selectedRoom.guestCapacity.price1;
            } else if (selectedRoom.guestCapacity.price) {
                pricePerNight = selectedRoom.guestCapacity.price;
            }

            setTotalPrice(pricePerNight * diffDays);
        } else {
            setTotalPrice(0);
            setNights(0);
        }
    }, [selectedRoom, checkInDate, checkOutDate, guests]);

    if (!hotel) {
        return <div>Loading hotel details...</div>;
    }

    const handleRoomSelect = (room) => {
        setSelectedRoom(room);
    };

    const handleRoomDetails = (room) => {
        setModalRoom(room);
        setShowRoomModal(true);
    };

    const handleBooking = () => {
        if (selectedRoom && checkInDate && checkOutDate && guests > 0 && totalPrice > 0) {
            router.push(`/pagamentos/hotel-payment?hotelId=${hotel.id}&roomId=${selectedRoom.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}&totalPrice=${totalPrice}`);
        } else {
            alert('Por favor, selecione um quarto, datas e número de hóspedes.');
        }
    };

    const getMinPrice = () => {
        if (!hotel || !hotel.rooms) return 0;
        const prices = hotel.rooms.map(room => {
            return room.guestCapacity.price || room.guestCapacity.price1 || room.guestCapacity.price2 || 0;
        });
        return Math.min(...prices);
    };

    return (
        <div className="hotel-detail-container">
            <div className="hotel-hero-detail">
                {hotel.images.map((image, index) => (
                    <div
                        key={index}
                        className={`hero-bg-slide ${index === currentHeroImage ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${image})` }}
                    ></div>
                ))}
                <div className="hero-content">
                    <div className="hotel-header">
                        <Image
                            src="/logo/logoff.webp"
                            alt="Logo"
                            width={120}
                            height={72}
                            className="logo"
                        />
                        <button className="back-button" onClick={() => router.push('/hoteis')}>
                            <ArrowLeft size={20} />
                            Voltar
                        </button>
                    </div>
                    
                    <div className="hotel-title-section">
                        <div className="hotel-info-left">
                            <h1 className="hotel-name">{hotel.name}</h1>
                            <div className="hotel-location">
                                <MapPin size={20} />
                                {hotel.location}
                            </div>
                            <div className="hotel-rating-display">
                                <div className="rating-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={16} 
                                            fill={i < Math.floor(hotel.rating) ? "#FFD700" : "none"}
                                            stroke="#FFD700"
                                        />
                                    ))}
                                </div>
                                <span className="rating-text">{hotel.rating}</span>
                            </div>
                        </div>
                        
                        <div className="hotel-price-display">
                            <div className="price-from">A partir de</div>
                            <div className="price-amount">
                                {getMinPrice().toLocaleString('pt-AO')} AOA
                            </div>
                            <div className="price-period">por noite</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="detail-content">
                <div className="content-wrapper">
                    <div className="detail-grid">
                        <div className="rooms-section">
                            <h2 className="section-title">Sobre o Hotel</h2>
                            <p className="hotel-description">{hotel.description}</p>
                            
                            <h2 className="section-title">Escolha seu Quarto</h2>
                            <div className="rooms-grid">
                                {hotel.rooms.map((room) => (
                                    <div key={room.id} className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}>
                                        <div className="room-card-content">
                                            <Image
                                                src={room.images[0]}
                                                alt={room.name}
                                                width={120}
                                                height={80}
                                                className="room-image"
                                                style={{ objectFit: 'cover' }}
                                            />
                                            
                                            <div className="room-details">
                                                <h4>{room.name}</h4>
                                                <div className="room-specs">
                                                    <div className="room-spec">
                                                        <Users size={16} />
                                                        {room.guestCapacity.maxPeople || room.guestCapacity.maxPeople2} pessoas
                                                    </div>
                                                    <div className="room-spec">
                                                        <Bed size={16} />
                                                        {room.bedding}
                                                    </div>
                                                    <div className="room-spec">
                                                        <Home size={16} />
                                                        {room.area}
                                                    </div>
                                                </div>
                                                <div className="room-amenities-preview">
                                                    {room.amenities.slice(0, 4).map((amenity, idx) => (
                                                        <div key={idx} className="amenity-tag">
                                                            <span>{amenity.icon}</span>
                                                        </div>
                                                    ))}
                                                    {room.amenities.length > 4 && (
                                                        <div className="amenity-tag">
                                                            +{room.amenities.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="room-price-section">
                                                <div className="room-price">
                                                    {(room.guestCapacity.price || room.guestCapacity.price2 || room.guestCapacity.price1).toLocaleString('pt-AO')} AOA
                                                </div>
                                                <div className="room-price-period">por noite</div>
                                                <button 
                                                    className="select-room-btn"
                                                    onClick={() => handleRoomSelect(room)}
                                                >
                                                    {selectedRoom?.id === room.id ? 'Selecionado' : 'Selecionar'}
                                                </button>
                                                <button 
                                                    className="select-room-btn"
                                                    onClick={() => handleRoomDetails(room)}
                                                    style={{ marginTop: '8px', background: 'transparent', border: '1px solid var(--primary)' }}
                                                >
                                                    Ver Detalhes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="booking-panel">
                            <div className="booking-card">
                                <h3 className="booking-title">Reserve sua Estadia</h3>
                                
                                {selectedRoom ? (
                                    <div className="booking-form">
                                        <div className="selected-room-info">
                                            <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>
                                                {selectedRoom.name}
                                            </h4>
                                            <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                                {selectedRoom.bedding} • {selectedRoom.area}
                                            </p>
                                        </div>
                                        
                                        <div className="dates-grid">
                                            <div className="form-group">
                                                <label className="form-label">Check-in</label>
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    value={checkInDate}
                                                    onChange={(e) => setCheckInDate(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Check-out</label>
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    value={checkOutDate}
                                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label className="form-label">Número de Hóspedes</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={guests}
                                                onChange={(e) => setGuests(parseInt(e.target.value))}
                                                min="1"
                                                max={selectedRoom.guestCapacity.maxPeople || selectedRoom.guestCapacity.maxPeople2}
                                            />
                                        </div>
                                        
                                        {totalPrice > 0 && (
                                            <div className="price-breakdown">
                                                <div className="price-row">
                                                    <span>Preço por noite</span>
                                                    <span>{((totalPrice / nights) || 0).toLocaleString('pt-AO')} AOA</span>
                                                </div>
                                                <div className="price-row">
                                                    <span>{nights} noite{nights !== 1 ? 's' : ''}</span>
                                                    <span>{totalPrice.toLocaleString('pt-AO')} AOA</span>
                                                </div>
                                                <div className="price-row">
                                                    <span>Total</span>
                                                    <span className="total-amount">{totalPrice.toLocaleString('pt-AO')} AOA</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <button 
                                            className="book-now-btn" 
                                            onClick={handleBooking}
                                            disabled={!checkInDate || !checkOutDate || totalPrice === 0}
                                        >
                                            <Calendar size={20} />
                                            Reservar Agora
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '40px 20px' }}>
                                        <Bed size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                        <p>Selecione um quarto para continuar com a reserva</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="hotel-features">
                        <h2 className="section-title">Facilidades do Hotel</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <Wifi size={24} />
                                </div>
                                <h4 className="feature-title">Wi-Fi Gratuito</h4>
                                <p className="feature-description">Internet de alta velocidade em todas as áreas</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <CarIcon size={24} />
                                </div>
                                <h4 className="feature-title">Estacionamento</h4>
                                <p className="feature-description">Estacionamento privado e seguro</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <Coffee size={24} />
                                </div>
                                <h4 className="feature-title">Restaurante</h4>
                                <p className="feature-description">Culinária internacional e local</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <Waves size={24} />
                                </div>
                                <h4 className="feature-title">Piscina</h4>
                                <p className="feature-description">Piscina com vista panorâmica</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <Dumbbell size={24} />
                                </div>
                                <h4 className="feature-title">Academia</h4>
                                <p className="feature-description">Equipamentos modernos 24h</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <Phone size={24} />
                                </div>
                                <h4 className="feature-title">Concierge</h4>
                                <p className="feature-description">Atendimento personalizado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Room Details Modal */}
            {showRoomModal && modalRoom && (
                <div className="room-details-modal" onClick={() => setShowRoomModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{modalRoom.name}</h3>
                            <button className="close-btn" onClick={() => setShowRoomModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="room-images-grid">
                                {modalRoom.images.map((img, index) => (
                                    <Image 
                                        key={index} 
                                        src={img} 
                                        alt={`${modalRoom.name} ${index + 1}`} 
                                        width={250}
                                        height={200}
                                        className="room-detail-image"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ))}
                            </div>
                            
                            <div className="amenities-grid">
                                <div className="amenities-section">
                                    <h3>
                                        <Home size={20} />
                                        Comodidades do Quarto
                                    </h3>
                                    <ul className="amenities-list">
                                        {modalRoom.amenities.map((amenity, index) => (
                                            <li key={index} className="amenity-item">
                                                <span>{amenity.icon}</span>
                                                <span>{amenity.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {modalRoom.inclusions && modalRoom.inclusions.length > 0 && (
                                    <div className="inclusions-section">
                                        <h3>
                                            <Gift size={20} />
                                            Inclusões
                                        </h3>
                                        <ul className="amenities-list">
                                            {modalRoom.inclusions.map((inclusion, index) => (
                                                <li key={index} className="amenity-item">
                                                    <span>{inclusion.icon}</span>
                                                    <span>{inclusion.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {modalRoom.paymentCancellation && modalRoom.paymentCancellation.length > 0 && (
                                    <div className="policies-section">
                                        <h3>
                                            <Clock size={20} />
                                            Políticas
                                        </h3>
                                        <ul className="amenities-list">
                                            {modalRoom.paymentCancellation.map((policy, index) => (
                                                <li key={index} className="amenity-item">
                                                    <span>{policy.icon}</span>
                                                    <span>{policy.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
