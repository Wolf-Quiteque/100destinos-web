import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const generatePassengerTickets = async (bookingId) => {
  const supabase = createClientComponentClient();

  try {
    // 1. Fetch booking data first
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError) {
      console.error('Error fetching booking:', bookingError);
      throw bookingError;
    }

    if (!bookingData) {
      console.error('No booking found with ID:', bookingId);
      return;
    }

    // 2. Fetch related route and company data from the available_routes view
    let route = null;
    let companyName = 'Unknown Company';

    if (bookingData.route_id) {
      const { data: routeData, error: routeError } = await supabase
        .from('available_routes') // Use the view here
        .select('origin, destination, departure_time, company_name') // Select company_name from the view
        .eq('id', bookingData.route_id)
        .single();

      if (routeError) {
        console.error('Error fetching route from view:', routeError);
        throw routeError;
      }

      if (routeData) {
        route = routeData;
        companyName = routeData.company_name || 'Unknown Company'; // Use the correct field
      }
    } else {
      console.warn('Booking does not have a route_id');
      return;
    }

    let passengers = bookingData.passengers;

    if (!passengers || passengers.length === 0) {
      console.error('No passengers found for this booking');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 250],
    });

    const pageWidth = doc.internal.pageSize.width;
    const dateId = Date.now();

    // Add ticketId to passengers
    const updatedPassengers = passengers.map((passenger) => {
      const ticketId = `100-ZRD3${bookingId.slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      return { ...passenger, ticketId };
    });

    const displaySelectedSeats = (selectedSeats) => {
      try {
        const seats = selectedSeats;
        return seats && seats.length > 0 ? `Assentos Selecionados: ${seats.join(', ')}` : 'Nenhum assento selecionado';
      } catch (error) {
        console.error('Error parsing selected seats:', error);
        return 'Erro ao carregar assentos';
      }
    };

    for (let index = 0; index < updatedPassengers.length; index++) {
      const passenger = updatedPassengers[index];
      if (index > 0) doc.addPage();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      // Header & company info
      doc.text('100-DESTINOS-ZRD3 CONSULTING E PRESTAÇÃO', pageWidth / 2, 10, { align: 'center' });
      doc.text('NIF: 50012355877', pageWidth / 2, 15, { align: 'center' });
      doc.text(`${companyName}`, pageWidth / 2, 20, { align: 'center' });
      doc.text('NIF: 50045564564', pageWidth / 2, 25, { align: 'center' });

      // Route & booking details
      doc.text(`Prefixo: Linha ${route.origin} - ${route.destination}`, pageWidth / 2, 35, { align: 'center' });
      doc.text(`Origem: ${route.origin}`, pageWidth / 2, 40, { align: 'center' });

      const bookingDate = new Date(bookingData.booking_date);
      doc.text(
        bookingDate.toLocaleString('pt-PT', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        pageWidth / 2,
        45,
        { align: 'center' }
      );

      doc.text(`Bilhete: ${passenger.ticketId}`, pageWidth / 2, 50, { align: 'center' });
      doc.text('Tipo: Convencional / Normal', pageWidth / 2, 55, { align: 'center' });
      doc.text(`Valor: ${bookingData.total_price.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} kz`, pageWidth / 2, 60, { align: 'center' });

      const selectedSeatsDisplay = displaySelectedSeats(bookingData.selected_seats);
      doc.text(selectedSeatsDisplay, pageWidth / 2, 65, { align: 'center' });

      doc.text(`Nome cliente: ${passenger.name}`, pageWidth / 2, 70, { align: 'center' });
      doc.text(`Idade: ${passenger.age}`, pageWidth / 2, 75, { align: 'center' });
      doc.text(`Sexo: ${passenger.sex === 'M' ? 'Masculino' : 'Feminina'}`, pageWidth / 2, 80, { align: 'center' });
      doc.text(`Telefone: ${bookingData.contact_phone || 'N/A'}`, pageWidth / 2, 85, { align: 'center' });

      // QR code data
      const qrCodeData = JSON.stringify({
        bookingId,
        ticketId: passenger.ticketId,
        passengerName: passenger.name,
        route: `${route.origin} - ${route.destination}`,
        bookingDate: bookingDate.toISOString(),
      });

      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 40,
        margin: 1,
      });

      doc.addImage(qrCodeUrl, 'PNG', pageWidth / 2 - 20, 95, 40, 40, '', 'FAST');

      // Additional info
      const additionalInfo = [
        'Isentos nos termos da linha do numer 1 do artigo 12. do civa qtvl-processado por programa valido N31.1/AGT/2022',
        'O passageiro tem direito a uma mala.',
        'Hóraria de atendimento para subsituição do bilhete de passagem esta disponivel das 09h- 21h.',
        'Guarda seu bilhete de passagens.',
        'WhatsApp 934937545.',
        'Faça seu checkin 1h antes da partida.',
        'Não assumimos estravios do bilhete e não emitimos segunda.',
      ];

      doc.setFontSize(6);
      additionalInfo.forEach((line, lineIndex) => {
        doc.text(line, pageWidth / 2, 140 + lineIndex * 5, { align: 'center', maxWidth: pageWidth - 10 });
      });

      // Footer
      doc.setFontSize(8);
      doc.text('Muito obrigado, Volte sempre', pageWidth / 2, 220, { align: 'center' });
      doc.text('-----100 Destinos-----', pageWidth / 2, 225, { align: 'center' });

      if (index === updatedPassengers.length - 1) {
        doc.save(`Bilhete_${bookingId}_${dateId}.pdf`);
      }
    }

    // Update booking passengers with ticketIds
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ passengers: updatedPassengers }) // Store as a proper JSON object
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
