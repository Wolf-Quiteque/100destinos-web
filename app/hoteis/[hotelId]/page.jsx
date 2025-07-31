'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BedDouble, Calendar, Search, Star, Heart, Gift, User, MapPin, Ruler, Utensils, Car, Clock, X } from 'lucide-react';
import hotelsData from '../../../lib/hotelData';
import { format } from 'date-fns';
import { use } from 'react';

export default function HotelDetailPage({ params }) {
    const router = useRouter();
    const { hotelId } = use(params);
    const [hotel, setHotel] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const foundHotel = hotelsData.find(h => h.id === hotelId);
        if (foundHotel) {
            setHotel(foundHotel);
        } else {
            // Handle hotel not found, e.g., redirect to 404 or hotels list
            router.push('/hoteis');
        }
    }, [hotelId, router]);

    useEffect(() => {
        if (selectedRoom && checkInDate && checkOutDate) {
            const startDate = new Date(checkInDate);
            const endDate = new Date(checkOutDate);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
        }
    }, [selectedRoom, checkInDate, checkOutDate, guests]);

    if (!hotel) {
        return <div>Loading hotel details...</div>;
    }

    const handleRoomSelect = (room) => {
        setSelectedRoom(room);
    };

    const handleBooking = () => {
        if (selectedRoom && checkInDate && checkOutDate && guests > 0 && totalPrice > 0) {
            // Simulate payment process, similar to rent-a-car
            router.push(`/pagamentos/hotel-payment?hotelId=${hotel.id}&roomId=${selectedRoom.id}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}&totalPrice=${totalPrice}`);
        } else {
            alert('Please select a room, dates, and number of guests.');
        }
    };

    return (
        <div className="main-container">
            <div className="hero-section hotel-hero" style={{ backgroundImage: `url(${hotel.images[0]})` }}>
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
                            {/* Avatar/Login placeholder - can be integrated later */}
                        </div>
                        <div>
                            <h1 className="page-title">{hotel.name}</h1>
                            <p className="page-subtitle">{hotel.location}</p>
                            <div className="hotel-rating">
                                <Star size={20} fill="gold" stroke="gold" /> {hotel.rating}
                            </div>
                        </div>
                    </header>
                </div>
            </div>

            <div className="content-wrapper" style={{ marginTop: '300px' }}>
                <div className="section-title">
                    Sobre o Hotel
                </div>
                <p>{hotel.description}</p>

                <div className="section-title">
                    Tipos de Quarto Disponíveis
                </div>
                <div className="room-types-list">
                    {hotel.rooms.map((room) => (
                        <div key={room.id} className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`} onClick={() => handleRoomSelect(room)}>
                            <div className="room-card-image" style={{ backgroundImage: `url(${room.images[0]})` }}></div>
                            <div className="room-card-info">
                                <h4>{room.name}</h4>
                                <p>👥 Max: {room.guestCapacity.maxPeople || room.guestCapacity.maxPeople2} pessoas</p>
                                <p>🛌 {room.bedding}</p>
                                <p>📏 {room.area}</p>
                                <div className="room-price">
                                    {(room.guestCapacity.price || room.guestCapacity.price2).toLocaleString('pt-AO')} AOA / noite
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedRoom && (
                    <div className="selected-room-details">
                        <div className="section-title">
                            Detalhes da {selectedRoom.name}
                            <X className="close-details" onClick={() => setSelectedRoom(null)} />
                        </div>
                        <div className="room-images-carousel">
                            {selectedRoom.images.map((img, index) => (
                                <Image key={index} src={img} alt={`${selectedRoom.name} image ${index + 1}`} width={400} height={300} className="room-detail-image" unoptimized={true} />
                            ))}
                        </div>
                        <div className="room-amenities">
                            <h3>Comodidades:</h3>
                            <ul>
                                {selectedRoom.amenities.map((amenity, index) => (
                                    <li key={index}>{amenity.icon} {amenity.text}</li>
                                ))}
                            </ul>
                        </div>
                        {selectedRoom.inclusions && selectedRoom.inclusions.length > 0 && (
                            <div className="room-inclusions">
                                <h3>Inclusões:</h3>
                                <ul>
                                    {selectedRoom.inclusions.map((inclusion, index) => (
                                        <li key={index}>{inclusion.icon} {inclusion.text}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {selectedRoom.paymentCancellation && selectedRoom.paymentCancellation.length > 0 && (
                            <div className="room-payment-cancellation">
                                <h3>Pagamento e Cancelamento:</h3>
                                <ul>
                                    {selectedRoom.paymentCancellation.map((item, index) => (
                                        <li key={index}>{item.icon} {item.text}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="section-title">
                            Selecione as Datas e Hóspedes
                        </div>
                        <div className="search-card">
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
                                        max={selectedRoom.guestCapacity.maxPeople || selectedRoom.guestCapacity.maxPeople2}
                                    />
                                </div>
                            </div>
                            {totalPrice > 0 && (
                                <div className="total-price-display">
                                    Total: {totalPrice.toLocaleString('pt-AO')} AOA
                                </div>
                            )}
                            <button className="search-btn" onClick={handleBooking}>
                                Reservar Agora
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
