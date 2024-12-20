import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from "@/hooks/use-toast";

const BusSeatLayout = ({ 
  ticket,
  selectedSeats, 
  onSeatSelect,
  maxSeats = 1
}) => {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    const fetchSeatAvailability = async () => {
      if (!ticket?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('route_seat_availability')
          .select('*')
          .eq('route_id', ticket.id)
          .single();

        if (error) throw error;

        const occupiedSeats = (data.booked_seat_numbers || []).map(seat => seat.toString());
        setBookedSeats(occupiedSeats);
      } catch (error) {
        console.error('Error fetching seat availability:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a disponibilidade dos assentos",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeatAvailability();

    const refreshInterval = setInterval(() => {
      setLastRefresh(Date.now());
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [ticket?.id, lastRefresh]);

  const handleSeatSelect = async (seatNumber) => {
    const seatStr = seatNumber.toString();
    
    if (bookedSeats.includes(seatStr)) {
      toast({
        variant: "destructive",
        title: "Assento Ocupado",
        description: "Este assento já está ocupado. Por favor, escolha outro.",
      });
      return;
    }

    // if (!selectedSeats.includes(seatStr) && selectedSeats.length >= maxSeats) {
    //   toast({
    //     variant: "destructive",
    //     title: "Limite Atingido",
    //     description: `Você só pode selecionar ${maxSeats} assento(s).`,
    //   });
    //   return;
    // }

    onSeatSelect(seatStr);
    setLastRefresh(Date.now());
  };

  const getSeatStatus = (seatNumber) => {
    const seatStr = seatNumber.toString();
    if (bookedSeats.includes(seatStr)) return 'booked';
    if (selectedSeats.includes(seatStr)) return 'selected';
    return 'available';
  };

  const renderSeat = (seatNumber) => {
    const status = getSeatStatus(seatNumber);
    const seatStyles = {
      booked: "bg-red-600/70 text-white cursor-not-allowed hover:bg-red-600/70",
      selected: "bg-green-500/70 hover:bg-green-500/80 text-white",
      available: "bg-gray-500/30 hover:bg-orange-500/50 text-white"
    };

    return (
      <Button
        key={seatNumber}
        variant="ghost"
        disabled={status === 'booked'}
        onClick={() => handleSeatSelect(seatNumber)}
        className={`w-10 h-10 m-1 rounded-md transition-all duration-300 ${seatStyles[status]}`}
      >
        {seatNumber}
      </Button>
    );
  };

  const renderSeatRows = () => {
    const rows = [];
    const totalSeats = ticket?.total_seats || 47;
    const seatsPerRow = 4;
  
    for (let row = 0; row < Math.ceil(totalSeats / seatsPerRow); row++) {
      const seatRow = [];
  
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = row * seatsPerRow + col + 1;
  
        if (seatNumber <= totalSeats) {
          // Add walkway after the second seat
          if (col === 2) {
            seatRow.push(
              <div key={`walkway-${row}`} className="w-8 bg-gray-700/30 mx-2" />
            );
          }
          seatRow.push(renderSeat(seatNumber));
        }
      }
  
      rows.push(
        <div key={`row-${row}`} className="flex justify-center my-1">
          {seatRow}
        </div>
      );
    }
  
    return rows;
  };
  
  const renderSeatColumns = () => {
    const columns = [];
    const totalSeats = ticket?.total_seats || 47;
    const seatsPerColumn = 4;
  
    for (let col = 0; col < Math.ceil(totalSeats / seatsPerColumn); col++) {
      const seatColumn = [];
  
      for (let row = 0; row < seatsPerColumn; row++) {
        const seatNumber = col * seatsPerColumn + row + 1;
  
        if (seatNumber <= totalSeats) {
          // Add walkway after the second row
          if (row === 2) {
            seatColumn.push(
              <div key={`walkway-${col}`} className="h-8 bg-gray-700/30 my-2" />
            );
          }
          seatColumn.push(renderSeat(seatNumber));
        }
      }
  
      columns.push(
        <div key={`column-${col}`} className="flex flex-col items-center mx-1">
          {seatColumn}
        </div>
      );
    }
  
    return columns;
  };
  

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="text-white text-xl mb-4 text-center">Selecione seus Assentos</h3>
    {loading ? (
      <div className="text-center text-white p-4">Carregando assentos...</div>
    ) : (
      <>
        {/* Horizontal Layout for Desktop */}
        <div className="hidden md:flex justify-center items-center">
          {renderSeatColumns()}
        </div>
        
        {/* Vertical Layout for Phones */}
        <div className="flex md:hidden flex-col items-center overflow-auto max-h-[70vh]">
          {renderSeatRows()}
        </div>
  
        <div className="mt-6 flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-500/30 rounded mr-2"></div>
            <span className="text-white text-sm">Disponível</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500/70 rounded mr-2"></div>
            <span className="text-white text-sm">Selecionado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-600/70 rounded mr-2"></div>
            <span className="text-white text-sm">Ocupado</span>
          </div>
        </div>
      </>
    )}
  </div>
  
  );
  
  
  
};

export default BusSeatLayout;