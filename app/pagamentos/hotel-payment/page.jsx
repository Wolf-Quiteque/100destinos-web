'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import hotelsData from '../../../lib/hotelData';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

export default function HotelPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = parseInt(searchParams.get('guests'));
    const totalPrice = parseFloat(searchParams.get('totalPrice'));

    const [hotel, setHotel] = useState(null);
    const [room, setRoom] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failed', null

    useEffect(() => {
        const foundHotel = hotelsData.find(h => h.id === hotelId);
        if (foundHotel) {
            setHotel(foundHotel);
            const foundRoom = foundHotel.rooms.find(r => r.id === roomId);
            if (foundRoom) {
                setRoom(foundRoom);
            }
        }
    }, [hotelId, roomId]);

    const handlePayment = () => {
        // Simulate payment processing
        setTimeout(() => {
            const success = Math.random() > 0.2; // 80% chance of success
            if (success) {
                setPaymentStatus('success');
            } else {
                setPaymentStatus('failed');
            }
        }, 2000); // Simulate 2-second payment processing
    };

    if (!hotel || !room) {
        return <div className="main-container">Loading payment details...</div>;
    }

    const numberOfNights = differenceInDays(new Date(checkOut), new Date(checkIn));

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
                        </div>
                        <div>
                            <h1 className="page-title">Confirmação de Reserva</h1>
                            <p className="page-subtitle">Revise os detalhes e prossiga com o pagamento.</p>
                        </div>
                    </header>
                </div>
            </div>

            <div className="content-wrapper" style={{ marginTop: '300px' }}>
                <div className="section-title">
                    Detalhes da Reserva
                </div>
                <div className="booking-summary-card">
                    <h3>{hotel.name} - {room.name}</h3>
                    <p><strong>Localização:</strong> {hotel.location}</p>
                    <p><strong>Check-in:</strong> {format(new Date(checkIn), 'dd/MM/yyyy')}</p>
                    <p><strong>Check-out:</strong> {format(new Date(checkOut), 'dd/MM/yyyy')}</p>
                    <p><strong>Noites:</strong> {numberOfNights}</p>
                    <p><strong>Hóspedes:</strong> {guests}</p>
                    <p><strong>Preço por noite:</strong> {(room.guestCapacity.price || room.guestCapacity.price2 || room.guestCapacity.price2_breakfast_only).toLocaleString('pt-AO')} AOA</p>
                    <p className="total-price"><strong>Total a Pagar:</strong> {totalPrice.toLocaleString('pt-AO')} AOA</p>
                </div>

                <div className="section-title">
                    Método de Pagamento
                </div>
                <div className="payment-method-card">
                    <p>Simulação de Pagamento</p>
                    <button className="search-btn" onClick={handlePayment} disabled={paymentStatus !== null}>
                        {paymentStatus === null ? 'Confirmar Pagamento' : (paymentStatus === 'success' ? 'Pagamento Concluído' : 'Pagamento Falhou')}
                    </button>
                </div>

                {paymentStatus === 'success' && (
                    <div className="payment-result success">
                        <CheckCircle size={48} color="green" />
                        <h2>Pagamento Concluído com Sucesso!</h2>
                        <p>Sua reserva no {hotel.name} para a {room.name} foi confirmada.</p>
                        <button className="search-btn" onClick={() => router.push('/meus-bilhetes')}>Ver Minhas Reservas</button>
                    </div>
                )}

                {paymentStatus === 'failed' && (
                    <div className="payment-result failed">
                        <XCircle size={48} color="red" />
                        <h2>Pagamento Falhou</h2>
                        <p>Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.</p>
                        <button className="search-btn" onClick={() => setPaymentStatus(null)}>Tentar Novamente</button>
                    </div>
                )}
            </div>
        </div>
    );
}
