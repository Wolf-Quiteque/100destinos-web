import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from "@/hooks/use-toast";

const BusSeatLayout = ({
  ticket,
  selectedSeats, // Seats selected by OTHER passengers in the group
  currentPassengerSeat, // Seat selected by the passenger currently choosing
  bookedSeats: initialBookedSeats, // Renamed prop to avoid conflict with state
  onSeatSelect,
  // maxSeats = 1 // maxSeats logic seems removed/commented out, removing prop for now
}) => {
  const supabase = createClientComponentClient(); // Supabase might not be needed if booked seats are passed directly
  const { toast } = useToast();
  // Use the passed-in booked seats directly
  const bookedSeats = initialBookedSeats || [];
  // Removed loading state related to fetching booked seats here, assuming parent handles it.
  // const [loading, setLoading] = useState(true);
  // Removed refresh logic as parent modal controls data fetching now
  // const [lastRefresh, setLastRefresh] = useState(Date.now());

  // useEffect(() => {
  //   // Fetching logic removed, relying on props
  // }, [ticket?.id]); // Dependency removed

  const handleSeatSelect = (seatNumber) => { // Removed async as no await needed now
    const seatStr = seatNumber.toString();

    // Check if the seat is permanently booked (from initial fetch)
    if (bookedSeats.includes(seatStr)) {
      toast({
        variant: "warning", // Changed to warning as it's not an error, just unavailable
        title: "Assento Indisponível",
        description: "Este assento já foi reservado.",
      });
      return; // Don't proceed
    }

    // Check if selected by another passenger in the current group
    if (selectedSeats.includes(seatStr)) {
       toast({
         variant: "info", // Informational
         title: "Assento Selecionado",
         description: "Este assento já foi selecionado por outro passageiro no seu grupo.",
       });
       return; // Don't proceed if selected by others
    }

    // If it's not booked and not selected by others, call the handler
    // The handler in PassengerModal will manage selecting/deselecting for the current passenger
    onSeatSelect(seatStr);
    // Removed refresh logic
    // setLastRefresh(Date.now());
  };

  const getSeatStatus = (seatNumber) => {
    const seatStr = seatNumber.toString();
    if (bookedSeats.includes(seatStr)) return 'booked'; // Permanently booked
    if (seatStr === currentPassengerSeat) return 'selected-current'; // Selected by the current passenger
    if (selectedSeats.includes(seatStr)) return 'selected-other'; // Selected by another passenger in the group
    return 'available'; // Available to be selected
  };

  const renderSeat = (seatNumber) => {
    const status = getSeatStatus(seatNumber);
    let statusStyle = "";

    switch (status) {
      case 'booked':
        statusStyle = "bg-red-600/70 text-gray-300 cursor-not-allowed hover:bg-red-600/70 opacity-70";
        break;
      case 'selected-current':
        // Highlight style for the seat selected by the current passenger
        statusStyle = "bg-green-500 hover:bg-green-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-green-400";
        break;
      case 'selected-other':
        // Style for seats selected by other passengers in the group (less prominent than current)
        statusStyle = "bg-yellow-600/70 text-gray-300 cursor-not-allowed hover:bg-yellow-600/70 opacity-80";
        break;
      case 'available':
      default:
        statusStyle = "bg-gray-600 hover:bg-orange-500/80 text-white";
        break;
    }

    return (
      <Button
        key={seatNumber}
        variant="ghost"
        // Disable clicking if booked or selected by others
        disabled={status === 'booked' || status === 'selected-other'}
        onClick={() => handleSeatSelect(seatNumber)}
        className={`w-10 h-10 m-1 rounded-md transition-all duration-200 font-semibold ${statusStyle}`}
        aria-label={`Assento ${seatNumber} - ${status}`} // Improved accessibility
      >
        {seatNumber}
      </Button>
    );
  };

  // --- Layout Rendering Functions (renderSeatRows, renderSeatColumns) ---
  // These functions remain largely the same, just calling the updated renderSeat

  const renderSeatRows = () => { // For mobile (vertical scroll)
     const rows = [];
     const totalSeats = ticket?.total_seats || 47; // Default or fallback
     const seatsPerRow = 4;

     for (let row = 0; row < Math.ceil(totalSeats / seatsPerRow); row++) {
       const seatRow = [];
       for (let col = 0; col < seatsPerRow; col++) {
         const seatNumber = row * seatsPerRow + col + 1;
         if (seatNumber <= totalSeats) {
           if (col === 2) { // Walkway position
             seatRow.push(<div key={`walkway-h-${row}`} className="w-6 sm:w-8" />); // Horizontal walkway
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

   const renderSeatColumns = () => { // For desktop (horizontal scroll potentially, or fixed grid)
     const columns = [];
     const totalSeats = ticket?.total_seats || 47;
     const seatsPerColumn = 4; // This logic might need adjustment based on actual bus layout needs
     const numRows = Math.ceil(totalSeats / seatsPerColumn); // Number of effective rows

     // We'll build row by row for a more standard grid layout on desktop
     for (let r = 0; r < numRows; r++) {
        const rowSeats = [];
        for (let c = 0; c < seatsPerColumn; c++) {
            const seatNumber = r * seatsPerColumn + c + 1;
            if (seatNumber <= totalSeats) {
                if (c === 2) { // Walkway position
                    rowSeats.push(<div key={`walkway-v-${r}`} className="w-8" />); // Vertical walkway spacer
                }
                rowSeats.push(renderSeat(seatNumber));
            } else {
                 // Add empty space if seat number exceeds total seats in the last row
                 if (c === 2) { rowSeats.push(<div key={`walkway-v-empty-${r}`} className="w-8" />); }
                 rowSeats.push(<div key={`empty-${seatNumber}`} className="w-10 h-10 m-1" />); // Empty placeholder
            }
        }
         columns.push(
             <div key={`d-row-${r}`} className="flex justify-center my-1">
                 {rowSeats}
             </div>
         );
     }


     // This column-based logic might be less intuitive for standard bus layouts.
     // Let's stick to the row-based generation above for desktop too,
     // ensuring it wraps correctly or scrolls if needed.
     // The code below is the old column logic, commented out.
     /*
     for (let col = 0; col < Math.ceil(totalSeats / seatsPerColumn); col++) {
       const seatColumn = [];
       for (let row = 0; row < seatsPerColumn; row++) {
         const seatNumber = col * seatsPerColumn + row + 1;
         if (seatNumber <= totalSeats) {
           if (row === 2) { // Walkway position
             seatColumn.push(<div key={`walkway-v-${col}`} className="h-6 sm:h-8" />); // Vertical walkway
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
     */
     return columns; // Return the row-based structure generated above
   };


  // --- Main Return ---
  return (
    <div className="bg-gray-800/50 p-3 sm:p-4 rounded-lg border border-gray-700">
      {/* Removed explicit loading check here, assuming parent handles it */}
      {/* {loading ? ( ... ) : ( ... )} */}

      {/* Layout for Desktop (using row generation) */}
      <div className="hidden md:flex flex-col items-center">
        {renderSeatColumns()} {/* This now renders rows suitable for desktop */}
      </div>

      {/* Layout for Mobile (using row generation) */}
      <div className="flex md:hidden flex-col items-center">
        {renderSeatRows()}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-700 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:text-sm">
        <LegendItem colorClass="bg-gray-600" text="Disponível" />
        <LegendItem colorClass="bg-green-500 ring-2 ring-green-400" text="Seu Assento" />
        <LegendItem colorClass="bg-yellow-600/70 opacity-80" text="Selecionado (Grupo)" />
        <LegendItem colorClass="bg-red-600/70 opacity-70" text="Ocupado" />
      </div>
    </div>
  );
};

// Helper component for legend items
const LegendItem = ({ colorClass, text }) => (
  <div className="flex items-center">
    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm mr-2 ${colorClass}`}></div>
    <span className="text-gray-300">{text}</span>
  </div>
);

export default BusSeatLayout;
