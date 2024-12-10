import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const generatePassengerTickets = async (bookingId) => {
  const supabase = createClientComponentClient();

  try {
    // Fetch specific booking details by ID
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        bus_routes (
          origin, 
          destination, 
          departure_time, 
          bus_companies (name)
        )
      `)
      .eq('id', bookingId)
      .single();

    // Check for errors in fetching booking
    if (bookingError) {
      console.error('Error fetching booking:', bookingError);
      throw bookingError;
    }

    // Validate booking data
    if (!bookingData) {
      console.error('No booking found with ID:', bookingId);
      return;
    }

    const route = bookingData.bus_routes;
    let passengers = JSON.parse(bookingData.passengers);
    const companyName = route.bus_companies.name;

    // Validate passengers
    if (!passengers || passengers.length === 0) {
      console.error('No passengers found for this booking');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 250] // Increased height to accommodate additional text
    });

    const pageWidth = doc.internal.pageSize.width;
    const dateId = Date.now();

    // Updated passengers with ticketIds
    const updatedPassengers = passengers.map((passenger, index) => {
      
      const ticketId = `100-ZRD3${bookingId.slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      
      // Add ticketId to passenger object
      return {
        ...passenger,
        ticketId: ticketId
      };
    });

    const displaySelectedSeats = (selectedSeats) => {
      try {
        // Parse the JSON string of selected seats
        const seats = JSON.parse(selectedSeats);
        
        // Return the seats as a formatted string
        return seats.length > 0 
          ? `Assentos Selecionados: ${seats.join(', ')}` 
          : 'Nenhum assento selecionado';
      } catch (error) {
        console.error('Error parsing selected seats:', error);
        return 'Erro ao carregar assentos';
      }
    };
    // Generate ticket for each passenger in THIS specific booking
    for (let index = 0; index < updatedPassengers.length; index++) {
      const passenger = updatedPassengers[index];

      // Add new page for subsequent passengers
      if (index > 0) {
        doc.addPage();
      }

      // Set font styles
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      // Ticket Header - Centered
      doc.text('100-DESTINOS-ZRD3 CONSULTING E PRESTAÇÃO', pageWidth / 2, 10, { align: 'center' });
      doc.text('NIF: 50012355877', pageWidth / 2, 15, { align: 'center' });
      
      // Company Details - Centered
      doc.text(`${companyName}`, pageWidth / 2, 20, { align: 'center' });
      doc.text('NIF: 50045564564', pageWidth / 2, 25, { align: 'center' });

      // Route Details - Centered
      doc.text(`Prefixo: Linha ${route.origin} - ${route.destination}`, pageWidth / 2, 35, { align: 'center' });
      doc.text(`Origem: ${route.origin}`, pageWidth / 2, 40, { align: 'center' });

      // Timestamp - Centered
      const bookingDate = new Date(bookingData.booking_date);
      doc.text(bookingDate.toLocaleString('pt-PT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }), pageWidth / 2, 45, { align: 'center' });

      // Ticket Details - Centered (using pre-generated ticketId)
      doc.text(`Bilhete: ${passenger.ticketId}`, pageWidth / 2, 50, { align: 'center' });
      doc.text('Tipo: Convencional / Normal', pageWidth / 2, 55, { align: 'center' });
      doc.text(`Valor: ${bookingData.total_price.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} kz`, pageWidth / 2, 60, { align: 'center' });
      const selectedSeatsDisplay = displaySelectedSeats(bookingData.selected_seats);
      doc.text(selectedSeatsDisplay, pageWidth / 2, 65, { align: 'center' });
      // Passenger Details - Centered
      doc.text(`Nome cliente: ${passenger.name}`, pageWidth / 2, 70, { align: 'center' });
      doc.text(`Idade: ${passenger.age}`, pageWidth / 2, 75, { align: 'center' });
      doc.text(`Sexo: ${passenger.sex === 'M' ? 'Masculino' : 'Feminina'}`, pageWidth / 2, 80, { align: 'center' });
      doc.text(`Telefone: ${bookingData.contact_phone || 'N/A'}`, pageWidth / 2, 85, { align: 'center' });

      // Generate QR Code Data
      const qrCodeData = JSON.stringify({
        bookingId: bookingId,
        ticketId: passenger.ticketId,
        passengerName: passenger.name,
        route: `${route.origin} - ${route.destination}`,
        bookingDate: bookingDate.toISOString()
      });

      // Generate QR Code
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, { 
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 40,
        margin: 1
      });

      // Add QR Code to PDF
      doc.addImage(qrCodeUrl, 'PNG', pageWidth / 2 - 20, 95, 40, 40, '', 'FAST');

      // Additional Information - Centered and with word wrapping
      const additionalInfo = [
        'Isentos nos termos da linha do numer 1 do artigo 12. do civa qtvl-processado por programa valido N31.1/AGT/2022',
        'O passageiro tem direito a uma mala.',
        'Hóraria de atendimento para subsituição do bilhete de passagem esta disponivel das 09h- 21h.',
        'Guarda seu bilhete de passagens.',
        'WhatsApp 934937545.',
        'Faça seu checkin 1h antes da partida.',
        'Não assumimos estravios do bilhete e não emitimos segunda.'
      ];

      // Wrap and add additional info text
      doc.setFontSize(6); // Slightly smaller font for additional info
      additionalInfo.forEach((line, lineIndex) => {
        doc.text(line, pageWidth / 2, 140 + (lineIndex * 5), { align: 'center', maxWidth: pageWidth - 10 });
      });

      // Footer - Compressed and centered
      doc.setFontSize(8);
      doc.text('Muito obrigado, Volte sempre', pageWidth / 2, 220, { align: 'center' });
      doc.text('-----100 Destinos-----', pageWidth / 2, 225, { align: 'center' });

      // Save the PDF if it's the last passenger
      if (index === updatedPassengers.length - 1) {
        doc.save(`Bilhete_${bookingId}_${dateId}.pdf`);
      }
    }

    // Update the booking in the database with the updated passengers (including ticketIds)
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ passengers: JSON.stringify(updatedPassengers) })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking with ticketIds:', updateError);
      throw updateError;
    }

  } catch (error) {
    console.error('Error generating passenger ticket:', error);
    throw error;
  }
};

export default generatePassengerTickets;