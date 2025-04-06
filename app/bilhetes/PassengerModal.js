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
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Import Loader2
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
import BusSeatLayout from './BusSeatLayout';

const PassengerModal = ({
  isOpen,
  onClose,
  ticket
}) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();
  const [profileLoading, setProfileLoading] = useState(false); // Loading state for profile fetch

  // Default passenger structure
  const defaultPassenger = {
    name: '',
    age: '',
    sex: '',
    idNumber: '',
    seat: null
   };

   const [passengers, setPassengers] = useState([defaultPassenger]);
   const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' }); // Added name
   const [availableSeats, setAvailableSeats] = useState([]);
   const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isSeatSelectionOpen, setIsSeatSelectionOpen] = useState(false);
  const [currentPassengerIndexForSeat, setCurrentPassengerIndexForSeat] = useState(0); // Track which passenger is selecting seat

  // Fetch user profile and pre-fill form when modal opens
  useEffect(() => {
    const fetchUserProfileAndPrefill = async () => {
      setProfileLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
         if (user) {
           const { data: profileData, error } = await supabase
             .from('profiles')
             .select('nome, sexo, numero_bi, telefone, data_nascimento') // Added data_nascimento
             .eq('id', user.id)
             .single();

          if (error) {
            console.error('Error fetching user profile for modal:', error);
             // Don't block, just proceed without pre-fill
           } else if (profileData) {
             // Calculate age
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
                 calculatedAge = age >= 0 ? age.toString() : ''; // Ensure age is not negative
               } catch (e) {
                 console.error("Error calculating age:", e);
                 // Keep calculatedAge as '' if parsing fails
               }
             }

             // Pre-fill first passenger and contact info
             setPassengers([{
               ...defaultPassenger, // Start with default structure
               name: profileData.nome || '',
               sex: profileData.sexo || '',
               idNumber: profileData.numero_bi || '',
               age: calculatedAge, // Use calculated age
               // seat remains default/empty
             }]);
             setContactInfo({
              name: profileData.nome || '',
              email: user.email || '', // Still needed for backend
              phone: profileData.telefone || ''
            });
            setSelectedSeats([]); // Reset seats if pre-filling
          }
        } else {
           // No user logged in, ensure default state
           setPassengers([defaultPassenger]);
           setContactInfo({ name: '', email: '', phone: '' }); // Reset contact info including name
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
      setContactInfo({ name: '', email: '', phone: '' }); // Reset contact info including name
      setSelectedSeats([]);
      setIsSeatSelectionOpen(false);
      setProfileLoading(false); // Ensure loading is reset
    }
  }, [isOpen, supabase]); // Depend on isOpen and supabase client

  // Fetch seat availability separately when ticket info is available
  useEffect(() => {
    const fetchSeatAvailability = async () => {
      if (!ticket) return; // Don't run if ticket is not yet defined
      try {
        // Fetch available seats (existing logic)
        const { data, error } = await supabase
          .from('route_seat_availability')
          .select('*')
          .eq('route_id', ticket.id)
          .single();

        if (error) throw error;

        const totalSeats = ticket.total_seats;
        const booked = data?.booked_seat_numbers || []; // Use optional chaining
        const available = Array.from({ length: totalSeats }, (_, i) => `${i + 1}`)
          .filter(seat => !booked.includes(seat));

        setAvailableSeats(available);
        setBookedSeats(booked);
      } catch (error) {
        console.error('Error fetching seat availability:', error);
        setAvailableSeats([]); // Reset on error
        setBookedSeats([]);
      }
    };

    if (isOpen) {
      fetchSeatAvailability();
    }
  }, [isOpen, ticket, supabase]); // Depend on isOpen, ticket, and supabase

  const addPassenger = () => {
    if (passengers.length < (ticket?.available_seats || 1)) { // Limit by available seats if possible, fallback to 1? Or a higher default? Let's use 20 as before for now.
    // if (passengers.length < 20) { // Revert to fixed limit for simplicity
       setPassengers([...passengers, defaultPassenger]);
    } else {
      toast({
        variant: "destructive",
        // title: "Erro",
        // description: "Número máximo de passageiros atingido",
        title: "Limite Atingido",
        description: `Não pode adicionar mais passageiros do que os assentos disponíveis (${ticket?.available_seats || 'N/A'}).`,
      })
    }
  };

  const removePassenger = (indexToRemove) => {
    // Prevent removing the last passenger
    if (passengers.length <= 1) {
       toast({ title: "Ação Inválida", description: "Deve haver pelo menos um passageiro.", variant: "destructive" });
       return;
    }
    const passengerToRemove = passengers[indexToRemove];
    const newPassengers = passengers.filter((_, index) => index !== indexToRemove);
    // Also remove their selected seat from the global list
    const newSelectedSeats = selectedSeats.filter(seat => seat !== passengerToRemove?.seat); // Check if seat exists

    setPassengers(newPassengers);
    setSelectedSeats(newSelectedSeats);
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value }; // Ensure object update is immutable
    setPassengers(newPassengers);
  };

  // Modified to handle seat selection for a specific passenger index
  const openSeatSelection = (index) => {
    setCurrentPassengerIndexForSeat(index);
    setIsSeatSelectionOpen(true);
  };

  const selectSeat = (seatNumber) => {
    const passengerIndex = currentPassengerIndexForSeat; // Use the stored index

    // Check if the seat is already selected by *another* passenger
    const seatAlreadyTaken = passengers.some((p, idx) => p.seat === seatNumber && idx !== passengerIndex);
    if (seatAlreadyTaken) {
      toast({
        variant: "destructive",
        title: "Assento Ocupado",
        description: `O assento ${seatNumber} já foi selecionado por outro passageiro.`,
      });
      return;
    }

    // Update the specific passenger's seat
    const newPassengers = [...passengers];
    const currentSeat = newPassengers[passengerIndex].seat;

    // If selecting the same seat again, deselect it
    if (currentSeat === seatNumber) {
        newPassengers[passengerIndex].seat = null;
        setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
    } else {
        // Assign the new seat, removing the old one from selectedSeats if it existed
        newPassengers[passengerIndex].seat = seatNumber;
        const updatedSelectedSeats = selectedSeats.filter(seat => seat !== currentSeat); // Remove old seat
        setSelectedSeats([...updatedSelectedSeats, seatNumber]); // Add new seat
    }

    setPassengers(newPassengers);
    setIsSeatSelectionOpen(false); // Close modal after selection/deselection
  };


  const handleConfirm = async () => {
    // Validation: Check contact info and all passengers
    if (!contactInfo.name || !contactInfo.phone) {
       toast({ variant: "destructive", title: "Atenção", description: "Por favor, preencha o nome e telefone de contato." });
       return;
    }
    // Validate only the first passenger's ID number
    const firstInvalidPassenger = passengers.findIndex((p, index) =>
      !p.name || !p.age || !p.sex || (index === 0 && !p.idNumber) || !p.seat
    );

    if (firstInvalidPassenger !== -1) {
      toast({
        variant: "destructive",
        title: "Atenção",
        description: `Por favor, preencha todos os campos obrigatórios (*) e selecione um assento para o Passageiro ${firstInvalidPassenger + 1}.`,
      });
      return;
    }

    // Ensure number of passengers matches selected seats
    if (passengers.length !== selectedSeats.length) {
       toast({ variant: "destructive", title: "Erro", description: "O número de passageiros não corresponde ao número de assentos selecionados." });
       return;
    }

    // Save necessary info for Obrigado page to localStorage
    if (ticket) {
      localStorage.setItem('lastBookingDetails', JSON.stringify({
        origin: ticket.origin,
        destination: ticket.destination,
        passengerCount: passengers.length,
        totalPrice: totalPrice // Save total price as well
      }));
    }

    try {
      // Call the Supabase RPC function
      const { data: bookingId, error } = await supabase.rpc('book_seats', {
        route_id_param: ticket.id,
        booking_date_param: new Date().toISOString().split('T')[0], // Consider timezone if needed
        passengers_param: passengers.map(p => ({ // Ensure structure matches expected type
            name: p.name,
            age: parseInt(p.age, 10), // Ensure age is integer
            sex: p.sex,
            id_number: p.idNumber || null, // Pass null if ID number is empty (for non-first passengers)
            seat_number: p.seat
        })),
        total_passengers_param: passengers.length,
        selected_seats_param: selectedSeats,
        contact_email_param: contactInfo.email,
        contact_phone_param: contactInfo.phone
      });

      if (error) throw error; // Throw error to be caught below

      // Redirect to details page on success
      router.push(`/pagamento?bookingId=${bookingId}`); // Redirect to payment page
      onClose(); // Close the modal after successful booking initiation

    } catch (error) {
      console.error('Booking error:', error);
      toast({
        variant: "destructive",
        title: "Erro na Reserva",
        description: error.message || "Ocorreu um erro ao tentar fazer a reserva. Por favor, tente novamente.",
      });
    }
  };

  // Calculate total price
  const totalPrice = (ticket?.base_price || 0) * passengers.length;

  return (
    <>
      {/* Main Passenger Details Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* Apply full-screen/responsive styling here */}
        <DialogContent className="bg-gray-900 border-orange-500/30 w-screen h-screen sm:w-full sm:h-auto sm:max-w-3xl md:max-w-4xl lg:max-w-5xl sm:max-h-[95vh] flex flex-col overflow-hidden p-0 sm:rounded-lg">
          {/* Header */}
          <DialogHeader className="text-white p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-orange-500 flex items-center">
              <Users className="mr-2" /> Detalhes da Reserva
            </DialogTitle>
            {ticket && (
              <DialogDescription className="text-gray-400 text-xs sm:text-sm">
                {ticket.origin} <ArrowRight className="inline h-3 w-3 mx-1" /> {ticket.destination} ({ticket.company_name})
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Scrollable Content Area */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-6">
            {profileLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Contact Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-orange-400 mb-3">Informações de Contato</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="tel"
                      placeholder="Número de Telefone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Passenger Details - Removed max-h */}
                <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-orange-400 mb-1">Passageiros</h3>
                  {passengers.map((passenger, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 rounded-xl p-4 relative border border-gray-700 hover:border-orange-500/50 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-3">
                         <span className="font-semibold text-white">Passageiro {index + 1}</span>
                         {passengers.length > 1 && (
                           <button
                             onClick={() => removePassenger(index)}
                             className="text-red-500 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/10"
                             aria-label={`Remover Passageiro ${index + 1}`}
                           >
                             <Trash2 size={18} />
                           </button>
                         )}
                      </div>


                      <div className="grid md:grid-cols-2 gap-x-4 gap-y-3">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                          <input
                            type="text"
                            value={passenger.name}
                            onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                            placeholder="Digite o nome completo"
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Age */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Idade</label>
                          <input
                            type="number"
                            value={passenger.age}
                            onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                            placeholder="Idade"
                            min="0"
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          />
                        </div>

                        {/* Sex */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Sexo</label>
                          <select
                            value={passenger.sex}
                            onChange={(e) => updatePassenger(index, 'sex', e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none" // Added appearance-none
                          >
                            <option value="" disabled>Selecione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                          </select>
                        </div>

                         {/* ID Number (Required only for first passenger) */}
                         <div>
                           <label className="block text-sm font-medium text-gray-300 mb-1">
                             Nº Identificação {index === 0 && <span className="text-red-500">*</span>}
                           </label>
                           <input
                             type="text"
                             value={passenger.idNumber}
                             onChange={(e) => updatePassenger(index, 'idNumber', e.target.value)}
                             placeholder={index === 0 ? "Número do BI ou Passaporte (Obrigatório)" : "Número do BI ou Passaporte (Opcional)"}
                             className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                             required={index === 0} // Add required attribute for the first passenger
                           />
                         </div>

                        {/* Seat Selection Button */}
                        <div className="md:col-span-2 mt-2">
                          <Button
                            onClick={() => openSeatSelection(index)} // Pass index
                            variant="outline"
                            className="w-full border-orange-600 text-orange-500 hover:bg-orange-600/10 hover:text-orange-400"
                          >
                            {passenger.seat
                              ? `Assento Selecionado: ${passenger.seat}`
                              : "Selecionar Assento"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Passenger Button */}
                <div className="mt-4">
                  <Button
                    onClick={addPassenger}
                    variant="outline"
                    className="w-full border-dashed border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-white flex items-center justify-center"
                    // Disable if max passengers reached based on available seats
                    disabled={passengers.length >= (ticket?.available_seats || 20)}
                  >
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
            <Button
              onClick={handleConfirm}
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
              // Disable button if validation fails? Maybe too complex, rely on toast for now.
            >
              Ir para Pagamento <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seat Selection Dialog (Remains largely the same, but ensure it uses the correct passenger index) */}
      <Dialog open={isSeatSelectionOpen} onOpenChange={setIsSeatSelectionOpen}>
        <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl bg-gray-900 border-orange-500/30 p-0">
          <DialogHeader className="p-4 border-b border-gray-700">
            <DialogTitle className="text-xl font-bold text-orange-500">
              Seleção de Assento (Passageiro {currentPassengerIndexForSeat + 1})
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Clique em um assento disponível para selecionar ou desmarcar.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
             <BusSeatLayout
               ticket={ticket}
               // Pass only seats selected by *other* passengers as 'selected' visually
               selectedSeats={selectedSeats.filter(seat => seat !== passengers[currentPassengerIndexForSeat]?.seat)}
               currentPassengerSeat={passengers[currentPassengerIndexForSeat]?.seat} // Pass the current passenger's seat specifically
               bookedSeats={bookedSeats}
               onSeatSelect={selectSeat} // selectSeat now handles assignment to the correct passenger
             />
          </div>

          <DialogFooter className="p-4 border-t border-gray-700">
            <Button
              onClick={() => setIsSeatSelectionOpen(false)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PassengerModal;

// Need to update BusSeatLayout to accept and highlight currentPassengerSeat
