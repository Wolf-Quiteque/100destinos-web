import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const BusSeatLayout = ({ 
  ticket, // Pass the entire ticket object 
  availableSeats, 
  selectedSeats, 
  onSeatSelect 
}) => {
  const supabase = createClientComponentClient();
  const [bookedSeats, setBookedSeats] = useState([]);

  // Fetch occupied seats when component mounts or ticket changes
  useEffect(() => {
    const fetchOccupiedSeats = async () => {
      if (ticket) {
        try {
          const { data, error } = await supabase
            .from('route_seat_availability')
            .select('booked_seat_numbers')
            .eq('route_id', ticket.id)
            .single();

          if (error) throw error;

          // Convert booked seats to string array to ensure consistent comparison
          const occupiedSeats = (data.booked_seat_numbers || []).map(seat => seat.toString());
          console.log(occupiedSeats)
          setBookedSeats(occupiedSeats);
        } catch (error) {
          console.error('Error fetching booked seats:', error);
        }
      }
    };

    fetchOccupiedSeats();
  }, [ticket]);

  // Total seats configuration for a typical bus (47 seats)
  const totalSeats = 47;

  // Create seat layout with a walkway in the middle
  const renderSeats = () => {
    const seatRows = [];
    
    for (let i = 1; i <= totalSeats; i++) {
      // Convert to string for consistent comparison
      const seatNumber = i.toString();
      
      // Determine seat status
      const isBooked = bookedSeats.includes(seatNumber);
      const isSelected = selectedSeats.includes(seatNumber);
      
      // Seat styling based on status
      let seatClassName = "w-10 h-10 m-1 rounded-md transition-all duration-300 ";
      let seatVariant = "ghost";
      
      if (isBooked) {
        seatClassName += "bg-red-600/70 text-white cursor-not-allowed";
        seatVariant = "destructive";
      } else if (isSelected) {
        seatClassName += "bg-green-500/70 hover:bg-green-500/80";
      } else {
        seatClassName += "bg-gray-500/30 hover:bg-orange-500/50";
      }

      // Add walkway after every 2 seats on each side
      if (i % 4 === 3) {
        // Add a spacer to create walkway
        seatRows.push(
          <div 
            key={`walkway-${i}`} 
            className="w-8 bg-gray-700/30 mx-2"
          />
        );
      }

      seatRows.push(
        <Button
          key={i}
          variant={seatVariant}
          disabled={isBooked}
          onClick={() => !isBooked && onSeatSelect(seatNumber)}
          className={seatClassName}
        >
          {i}
        </Button>
      );

      // Add line breaks to create rows
      if (i % 4 === 0) {
        seatRows.push(<div key={`break-${i}`} className="w-full"></div>);
      }
    }

    return seatRows;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white text-xl mb-4 text-center">Selecione seus Assentos</h3>
      <div className="flex flex-wrap justify-center items-center">
        {renderSeats()}
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-500/30 mr-2"></div>
          <span className="text-white text-sm">Disponível</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500/70 mr-2"></div>
          <span className="text-white text-sm">Selecionado</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-600/70 mr-2"></div>
          <span className="text-white text-sm">Ocupado</span>
        </div>
      </div>
    </div>
  );
};

export default BusSeatLayout;