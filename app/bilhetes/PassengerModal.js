'use client'
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Trash2, 
  User, 
  IdCard, 
  Calendar, 
  Users,
  ArrowRight 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import BusSeatLayout from './SeatSelectionPopup';
import SeatSelectionPopup from './SeatSelectionPopup';

const PassengerModal = ({ 
  isOpen, 
  onClose, 
  ticket 
}) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast()

  const [passengers, setPassengers] = useState([
    { 
      name: '', 
      age: '', 
      sex: '', 
      idNumber: '',
    }
  ]);

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: ''
  });

  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Fetch available seats when modal opens
  useEffect(() => {
    const fetchAvailableSeats = async () => {
      if (isOpen && ticket) {
        try {
          const { data, error } = await supabase
            .from('route_seat_availability')
            .select('*')
            .eq('route_id', ticket.id)
            .single();

          if (error) throw error;
           console.log(data)
          // Generate list of available seats
          const totalSeats = ticket.total_seats;
          const bookedSeats = data.booked_seat_numbers || [];
          const available = Array.from({length: totalSeats}, (_, i) => `${i + 1}`)
            .filter(seat => !bookedSeats.includes(seat));

          setAvailableSeats(available);
        } catch (error) {
          console.error('Error fetching available seats:', error);
        }
      }
    };

    
  }, [isOpen, ticket]);

  const addPassenger = () => {
    if (passengers.length < 20) {
      setPassengers([
        ...passengers, 
        { name: '', age: '', sex: '', idNumber: ''}
      ]);
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Número máximo de passageiros atingido",
      })
    }
  };

  const removePassenger = (indexToRemove) => {
    const newPassengers = passengers.filter((_, index) => index !== indexToRemove);
    const newSelectedSeats = selectedSeats.filter((_, index) => index !== indexToRemove);
    
    setPassengers(newPassengers);
    setSelectedSeats(newSelectedSeats);
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const selectSeat = (seatNumber) => {
    // If seat already selected, deselect
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
      
      // Remove seat from corresponding passenger
      const newPassengers = passengers.map(p => 
        p.seat === seatNumber ? {...p, seat: null} : p
      );
      setPassengers(newPassengers);
      return;
    }
  
    // Find the next passenger without a seat
    const unassignedPassengerIndex = passengers.findIndex(p => p.seat === null);
    
    // If all seats assigned, show error
    if (unassignedPassengerIndex === -1) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Todos os assentos já foram selecionados",
      });
      return;
    }
  
    // Check if seat is available
    if (!availableSeats.includes(seatNumber)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Assento não disponível",
      });
      return;
    }
  
    const newPassengers = [...passengers];
    newPassengers[unassignedPassengerIndex].seat = seatNumber;
    
    setPassengers(newPassengers);
    setSelectedSeats([...selectedSeats, seatNumber]);
  };
  const handleConfirm = async () => {
    // Validation
    const isValid = passengers.every(p => 
      p.name && p.age && p.sex && p.idNumber
    );

    localStorage.setItem('lastBookingTicket', JSON.stringify(ticket));
    localStorage.setItem('lastBookingPassengers', JSON.stringify(passengers));
    localStorage.setItem('lastBookingContactInfo', JSON.stringify(contactInfo));

    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Atenção",
        description: "Por favor, preencha todos os campos e selecione assentos",
      })
      return;
    }

    try {
      const bookingResult = await supabase.rpc('book_seats', {
        route_id_param: ticket.id,
        booking_date_param: new Date().toISOString().split('T')[0],
        passengers_param: JSON.stringify(passengers),
        total_passengers_param: passengers.length,
        selected_seats_param: JSON.stringify(selectedSeats),
        contact_email_param: contactInfo.email,
        contact_phone_param: contactInfo.phone
      });

      // Navigate to booking details page
      router.push(`/detalhes?bookingId=${bookingResult.data}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        variant: "destructive",
        title: "Erro na Reserva",
        description: "Erro ao fazer reserva. Tente novamente.",
      })
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-orange-500/30">
        <DialogHeader className="text-white">
          <DialogTitle className="text-2xl font-bold text-orange-500 flex items-center">
            <User className="mr-2" /> Informações dos Passageiros
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Selecione assentos e adicione detalhes dos passageiros
          </DialogDescription>
        </DialogHeader>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input 
            type="email"
            placeholder="Email de Contato"
            value={contactInfo.email}
            onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
            className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
          />
          <input 
            type="tel"
            placeholder="Número de Telefone"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
            className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
          />
        </div>


        {/* Passenger Details */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {passengers.map((passenger, index) => (
            <div 
              key={index} 
              className="bg-gray-800 rounded-xl p-4 relative border border-gray-700 hover:border-orange-500 transition-all duration-300"
            >
              {passengers.length > 1 && (
                <button
                  onClick={() => removePassenger(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 />
                </button>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-white mb-2">
                    <User className="mr-2 text-orange-500" /> Nome Completo
                  </label>
                  <input 
                    type="text" 
                    value={passenger.name}
                    onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                    placeholder="Digite o nome completo"
                    className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center text-white mb-2">
                    <Calendar className="mr-2 text-orange-500" /> Idade
                  </label>
                  <input 
                    type="number" 
                    value={passenger.age}
                    onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                    placeholder="Idade"
                    className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center text-white mb-2">
                    <Users className="mr-2 text-orange-500" /> Sexo
                  </label>
                  <select
                    value={passenger.sex}
                    onChange={(e) => updatePassenger(index, 'sex', e.target.value)}
                    className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                  >
                    <option value="">Selecione o Sexo</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-white mb-2">
                    <IdCard className="mr-2 text-orange-500" /> Número de Identificação
                  </label>
                  <input 
                    type="text" 
                    value={passenger.idNumber}
                    onChange={(e) => updatePassenger(index, 'idNumber', e.target.value)}
                    placeholder="Número do Bilhete de Identidade"
                    className="w-full bg-gray-700 text-white border-none rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                {passenger.seat && (
                  <div className="col-span-2 text-white">
                    <span className="text-orange-500">Assento Selecionado:</span> {passenger.seat}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button 
            onClick={addPassenger}
            variant="outline" 
            className="border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-white flex items-center"
          >
            <UserPlus className="mr-2" /> Adicionar Passageiro
          </Button>

          <Button 
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center"
          >
            Confirmar Reserva
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PassengerModal;