import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

const SeatSelectionPopup = ({ 
  availableSeats, 
  selectedSeats, 
  onSeatSelect, 
  passengerCount 
}) => {
  const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats);

  // Reset local selection when availableSeats or selectedSeats change
  useEffect(() => {
    setLocalSelectedSeats(selectedSeats);
  }, [availableSeats, selectedSeats]);

  const handleSeatSelect = (seatNumber) => {
    // If seat is already selected, deselect it
    if (localSelectedSeats.includes(seatNumber)) {
      const newSeats = localSelectedSeats.filter(seat => seat !== seatNumber);
      setLocalSelectedSeats(newSeats);
      return;
    }

    // Check if we've reached the max number of seats for passengers
    if (localSelectedSeats.length >= passengerCount) {
      return;
    }

    // Add the new seat
    setLocalSelectedSeats([...localSelectedSeats, seatNumber]);
  };

  const confirmSelection = () => {
    onSeatSelect(localSelectedSeats);
  };

  // Bus layout configuration
  const seatLayout = [
    [1, 2, null, 3, 4],
    [5, 6, null, 7, 8],
    [9, 10, null, 11, 12],
    [13, 14, null, 15, 16],
    [17, 18, null, 19, 20]
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
        >
          <ArrowRight className="mr-2 text-orange-500" /> Selecionar Assentos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-gray-900 border-orange-500/30">
        <DialogHeader>
          <DialogTitle className="text-orange-500">Seleção de Assentos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="flex flex-col gap-2">
              {seatLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-2">
                  {row.map((seat, seatIndex) => (
                    seat === null ? (
                      <div key={`passage-${rowIndex}-${seatIndex}`} className="w-8"></div>
                    ) : (
                      <Button
                        key={seat}
                        size="sm"
                        variant={localSelectedSeats.includes(seat.toString()) 
                          ? 'secondary' 
                          : availableSeats.includes(seat.toString()) 
                            ? 'outline' 
                            : 'ghost'}
                        onClick={() => handleSeatSelect(seat.toString())}
                        disabled={!availableSeats.includes(seat.toString())}
                        className={`w-8 h-8 p-0 text-xs ${
                          !availableSeats.includes(seat.toString()) 
                            ? 'opacity-30 cursor-not-allowed' 
                            : 'hover:bg-orange-100'
                        }`}
                      >
                        {seat}
                      </Button>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-white">
              Selecionados: {localSelectedSeats.length} / {passengerCount}
            </span>
            <Button 
              onClick={confirmSelection}
              disabled={localSelectedSeats.length !== passengerCount}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeatSelectionPopup;