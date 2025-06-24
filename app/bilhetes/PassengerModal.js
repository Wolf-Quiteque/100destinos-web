'use client'
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter // Import DialogFooter
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Import Loader2
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Trash2,
  User,
  // IdCard, // Removed as ID field is removed
  Calendar,
  Users,
  ArrowRight
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import BusSeatLayout from './BusSeatLayout';

const PassengerModal = ({
  isOpen,
  onClose,
  ticket
}) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();
    const searchParams = useSearchParams(); // Hook to get URL params
  
  const [profileLoading, setProfileLoading] = useState(false); // Loading state for profile fetch

  // Default passenger structure (idNumber removed)
  const defaultPassenger = {
    name: '',
    age: '',
    sex: '',
    seat: null
   };

   const [passengers, setPassengers] = useState([defaultPassenger]);
   const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' });
   const [buyerIdNumber, setBuyerIdNumber] = useState(''); // Separate state for buyer's read-only ID
   const [availableSeats, setAvailableSeats] = useState([]);
   const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isSeatSelectionOpen, setIsSeatSelectionOpen] = useState(false);
  const [currentPassengerIndexForSeat, setCurrentPassengerIndexForSeat] = useState(0); // Track which passenger is selecting seat

  // Fetch user profile and pre-fill form when modal opens
  useEffect(() => {
    const fetchUserProfileAndPrefill = async () => {
      setProfileLoading(true);
      setBuyerIdNumber(''); // Reset buyer ID
      try {
        const { data: { user } } = await supabase.auth.getUser();
         if (user) {
           const { data: profileData, error } = await supabase
             .from('profiles')
             .select('nome, sexo, numero_bi, telefone, data_nascimento')
             .eq('id', user.id)
             .single();

          if (error) {
            console.error('Error fetching user profile for modal:', error);
           } else if (profileData) {
             let calculatedAge = '';
             if (profileData.data_nascimento) {
               try {
                 const birthDate = new Date(profileData.data_nascimento);
                 const today = new Date();
                 let age = today.getFullYear() - birthDate.getFullYear();
                 const m = today.getMonth() - birthDate.getMonth();
                 if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                   age--;
                 }
                 calculatedAge = age >= 0 ? age.toString() : '';
               } catch (e) { console.error("Error calculating age:", e); }
             }

             // Pre-fill first passenger (buyer details) and contact info
             // idNumber removed from prefill
             setPassengers([{
               ...defaultPassenger,
               name: profileData.nome || '',
               sex: profileData.sexo || '',
               age: calculatedAge,
             }]);
             setContactInfo({
              name: profileData.nome || '',
              email: user.email || '',
              phone: profileData.telefone || ''
            });
            setBuyerIdNumber(profileData.numero_bi || ''); // Set the buyer's ID for the read-only field
            setSelectedSeats([]);
          }
        } else {
           setPassengers([defaultPassenger]);
           setContactInfo({ name: '', email: '', phone: '' });
           setBuyerIdNumber('');
           setSelectedSeats([]);
        }
      } catch (e) {
        console.error("Error in profile fetch effect:", e);
      } finally {
        setProfileLoading(false);
      }
    };

    if (isOpen) {
      fetchUserProfileAndPrefill();
    } else {
      // Reset state when modal closes
      setPassengers([defaultPassenger]);
      setContactInfo({ name: '', email: '', phone: '' });
      setBuyerIdNumber('');
      setSelectedSeats([]);
      setIsSeatSelectionOpen(false);
      setProfileLoading(false);
    }
  }, [isOpen, supabase]); // Removed defaultPassenger from deps as it's stable

  // Fetch seat availability separately
  useEffect(() => {
    const fetchSeatAvailability = async () => {
      if (!ticket || !isOpen) return;
      try {
        // Get the booking date (e.g., current date for availability)
        const bookingDate = new Date().toISOString().split('T')[0]; 

        const { data, error } = await supabase.rpc('get_route_seat_availability', {
          p_route_id: ticket.id,
          p_booking_date: bookingDate
        }).single(); // Expecting a single row/object

        if (error) throw error;

        const totalSeats = ticket.total_seats;
        const booked = data?.booked_seat_numbers || [];
        const available = Array.from({ length: totalSeats }, (_, i) => `${i + 1}`)
          .filter(seat => !booked.includes(seat));
        setAvailableSeats(available);
        setBookedSeats(booked);
      } catch (error) {
        console.error('Error fetching seat availability:', error);
        setAvailableSeats([]);
        setBookedSeats([]);
      }
    };
    fetchSeatAvailability();
  }, [isOpen, ticket, supabase]);

  const addPassenger = () => {
    if (passengers.length < (ticket?.available_seats || 20)) { // Use available_seats or fallback
       setPassengers([...passengers, { ...defaultPassenger }]); // Add a new default passenger
    } else {
      toast({
        variant: "destructive",
        title: "Limite Atingido",
        description: `Não pode adicionar mais passageiros do que os assentos disponíveis (${ticket?.available_seats || 'N/A'}).`,
      })
    }
  };

  const removePassenger = (indexToRemove) => {
    if (passengers.length <= 1) {
       toast({ title: "Ação Inválida", description: "Deve haver pelo menos um passageiro.", variant: "destructive" });
       return;
    }
    // Allow removing any passenger including the first one now
    const passengerToRemove = passengers[indexToRemove];
    const newPassengers = passengers.filter((_, index) => index !== indexToRemove);
    const newSelectedSeats = selectedSeats.filter(seat => seat !== passengerToRemove?.seat);

    setPassengers(newPassengers);
    setSelectedSeats(newSelectedSeats);
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const openSeatSelection = (index) => {
    setCurrentPassengerIndexForSeat(index);
    setIsSeatSelectionOpen(true);
  };

  const selectSeat = (seatNumber) => {
    const passengerIndex = currentPassengerIndexForSeat;
    const seatAlreadyTaken = passengers.some((p, idx) => p.seat === seatNumber && idx !== passengerIndex);
    if (seatAlreadyTaken) {
      toast({ variant: "destructive", title: "Assento Ocupado", description: `O assento ${seatNumber} já foi selecionado.` });
      return;
    }
    const newPassengers = [...passengers];
    const currentSeat = newPassengers[passengerIndex].seat;
    if (currentSeat === seatNumber) {
        newPassengers[passengerIndex].seat = null;
        setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
    } else {
        newPassengers[passengerIndex].seat = seatNumber;
        const updatedSelectedSeats = selectedSeats.filter(seat => seat !== currentSeat);
        setSelectedSeats([...updatedSelectedSeats, seatNumber]);
    }
    setPassengers(newPassengers);
    setIsSeatSelectionOpen(false);
  };

  const handleConfirm = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Utilizador não autenticado." });
      router.push('/login');
      return;
    }
    const profileId = user.id;

    if (!contactInfo.phone) { // Only phone is mandatory in contact section now
       toast({ variant: "destructive", title: "Atenção", description: "Por favor, preencha o telefone de contato." });
       return;
    }

    // Validate all passengers in the list (excluding idNumber)
    const firstInvalidPassenger = passengers.findIndex(p => !p.name || !p.age || !p.sex || !p.seat);
    if (firstInvalidPassenger !== -1) {
      toast({ variant: "destructive", title: "Atenção", description: `Preencha Nome, Idade, Sexo e selecione um assento para o Passageiro ${firstInvalidPassenger + 1}.` });
      return;
    }

    if (passengers.length !== selectedSeats.length) {
       toast({ variant: "destructive", title: "Erro", description: "Número de passageiros não corresponde aos assentos selecionados." });
       return;
    }

    if (ticket) {
      localStorage.setItem('lastBookingDetails', JSON.stringify({
        origin: ticket.origin, destination: ticket.destination,
        passengerCount: passengers.length, totalPrice: totalPrice
      }));
    }

    try {
      // Removed id_number from passengers_param payload
      const { data: bookingId, error } = await supabase.rpc('book_seats', {
        route_id_param: ticket.id,
        booking_date_param: new Date().toISOString().split('T')[0],
        passengers_param: passengers.map(p => ({
            name: p.name, age: parseInt(p.age, 10), sex: p.sex,
            seat_number: p.seat
        })),
        total_passengers_param: passengers.length,
        selected_seats_param: selectedSeats,
        contact_email_param: contactInfo.email, // Buyer's email
        contact_phone_param: contactInfo.phone, // Buyer's phone
        profile_id_param: profileId, // Buyer's profile ID
        route_type_param: ticket.type // Pass the route type
      });
    const typeParam = searchParams.get('type')


      if (error) throw error;
      router.push(`/pagamento?bookingId=${bookingId}&type=${typeParam}`);
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast({ variant: "destructive", title: "Erro na Reserva", description: error.message || "Ocorreu um erro." });
    }
  };

  const totalPrice = (ticket?.base_price || 0) * passengers.length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-orange-500/30 w-screen h-screen sm:w-full sm:h-auto sm:max-w-3xl md:max-w-4xl lg:max-w-5xl sm:max-h-[95vh] flex flex-col overflow-hidden p-0 sm:rounded-lg">
          <DialogHeader className="text-white p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-orange-500 flex items-center">
              <Users className="mr-2" /> Detalhes da Reserva
            </DialogTitle>
            {ticket && (
              <DialogDescription className="text-gray-400 text-xs sm:text-sm">
                {ticket.origin} <ArrowRight className="inline h-3 w-3 mx-1" /> {ticket.destination} ({ticket.company_name}) {/* Assuming company_name exists on ticket */}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex-grow overflow-y-auto p-4 sm:p-6">
            {profileLoading ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>
            ) : (
              <>
                {/* Contact Information Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-orange-400 mb-3">Informações de Contato (Comprador)</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                      <input type="text" placeholder="Nome do Comprador" value={contactInfo.name}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 cursor-not-allowed" readOnly />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-300 mb-1">Nº Identificação (Comprador)</label>
                       <input type="text" placeholder="Nº BI/Passaporte do Comprador" value={buyerIdNumber}
                         className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 cursor-not-allowed" readOnly />
                    </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                       <input type="tel" placeholder="Número de Telefone" value={contactInfo.phone}
                         onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                         className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
                     </div>
                  </div>
                </div>

                {/* Passenger Details Section */}
                <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-orange-400 mb-1">Passageiros</h3>
                  {passengers.map((passenger, index) => (
                    <div key={index} className="bg-gray-800 rounded-xl p-4 relative border border-gray-700">
                      <div className="flex justify-between items-center mb-3">
                         <span className="font-semibold text-white">Passageiro {index + 1}</span>
                         {passengers.length > 1 && ( // Show remove button if more than one passenger
                           <button onClick={() => removePassenger(index)}
                             className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10"
                             aria-label={`Remover Passageiro ${index + 1}`}> <Trash2 size={18} /> </button>
                         )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-x-4 gap-y-3">
                        {/* Name (Editable for all passengers in this list) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                          <input type="text" value={passenger.name}
                            onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                            placeholder="Digite o nome completo"
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
                        </div>
                        {/* Age (Editable for all) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Idade</label>
                          <input type="number" value={passenger.age}
                            onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                            placeholder="Idade" min="0"
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" />
                        </div>
                        {/* Sex (Editable for all) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Sexo</label>
                          <select value={passenger.sex} onChange={(e) => updatePassenger(index, 'sex', e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 appearance-none">
                            <option value="" disabled>Selecione...</option> <option value="M">Masculino</option> <option value="F">Feminino</option>
                          </select>
                        </div>
                        {/* ID Number field removed */}
                        {/* Seat Selection Button (For all passengers) */}
                        <div className="md:col-span-2 mt-2">
                          <Button onClick={() => openSeatSelection(index)} variant="outline"
                            className="w-full border-orange-600 text-orange-500 hover:bg-orange-600/10 hover:text-orange-400">
                            {passenger.seat ? `Assento Selecionado: ${passenger.seat}` : "Selecionar Assento"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add Passenger Button */}
                <div className="mt-4">
                  <Button onClick={addPassenger} variant="outline"
                    className="w-full border-dashed border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-white flex items-center justify-center"
                    disabled={passengers.length >= (ticket?.available_seats || 20)}>
                    <UserPlus className="mr-2" size={18} /> Adicionar Passageiro
                  </Button>
                </div>
              </>
            )}
          </div>
          {/* Footer */}
          <DialogFooter className="p-4 sm:p-6 border-t border-gray-700 bg-gray-900 flex-shrink-0 flex flex-col sm:flex-row justify-between items-center">
             <div className="text-white mb-2 sm:mb-0">
                <span className="text-gray-400">Total: </span>
                <span className="text-xl font-bold text-orange-500">
                   {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                </span>
             </div>
            <Button onClick={handleConfirm} className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto">
              Ir para Pagamento <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seat Selection Dialog */}
      <Dialog open={isSeatSelectionOpen} onOpenChange={setIsSeatSelectionOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl bg-gray-900 border-orange-500/30 p-0">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle className="text-xl font-bold text-orange-500">Seleção de Assento (Passageiro {currentPassengerIndexForSeat + 1})</DialogTitle>
            <DialogDescription className="text-gray-400">Clique em um assento disponível.</DialogDescription>
          </DialogHeader>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
             <BusSeatLayout ticket={ticket}
               selectedSeats={selectedSeats.filter(seat => seat !== passengers[currentPassengerIndexForSeat]?.seat)}
               currentPassengerSeat={passengers[currentPassengerIndexForSeat]?.seat}
               bookedSeats={bookedSeats} onSeatSelect={selectSeat} />
          </div>
          <DialogFooter className="p-4 border-t border-gray-700">
            <Button onClick={() => setIsSeatSelectionOpen(false)} variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"> Fechar </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PassengerModal;
