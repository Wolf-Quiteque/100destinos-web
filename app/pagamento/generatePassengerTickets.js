import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Helper to load image from public folder
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const generatePassengerTickets = async (bookingId) => {
  const supabase = createClientComponentClient();

  try {
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError) throw bookingError;
    if (!bookingData) return;

    let route = null;
    let companyName = 'Unknown Company';

    if (bookingData.route_id) {
      const { data: routeData, error: routeError } = await supabase
        .from('available_routes')
        .select('origin, destination, departure_time, company_name')
        .eq('id', bookingData.route_id)
        .single();

      if (routeError) throw routeError;
      if (routeData) {
        route = routeData;
        companyName = routeData.company_name || 'Unknown Company';
      }
    } else {
      return;
    }

    let passengers = bookingData.passengers;
    if (!passengers || passengers.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 250],
    });

    const pageWidth = doc.internal.pageSize.width;
    const dateId = Date.now();

    const updatedPassengers = passengers.map((passenger) => {
      const ticketId = `100-ZRD3${bookingId.slice(-6)}${Math.random()
        .toString(36)
        .substr(2, 3)
        .toUpperCase()}`;
      return { ...passenger, ticketId };
    });

    const displaySelectedSeats = (selectedSeats) => {
      try {
        return selectedSeats && selectedSeats.length > 0
          ? `Assentos Selecionados: ${selectedSeats.join(', ')}`
          : 'Nenhum assento selecionado';
      } catch {
        return 'Erro ao carregar assentos';
      }
    };

    const logoImg = await loadImage('/logogo.png');

    for (let index = 0; index < updatedPassengers.length; index++) {
      const passenger = updatedPassengers[index];
      if (index > 0) doc.addPage();

      // Add logo at top center
      const logoWidth = 30;
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
      doc.addImage(
        logoImg,
        'WEBP',
        pageWidth / 2 - logoWidth / 2,
        5,
        logoWidth,
        logoHeight
      );

      let y = 5 + logoHeight + 5; // Start content below logo

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      doc.text('NIF: 5002448939', pageWidth / 2, y, { align: 'center' }); y += 5;
      // doc.text(`${companyName}`, pageWidth / 2, y, { align: 'center' }); y += 5;
      // doc.text('NIF: 50045564564', pageWidth / 2, y, { align: 'center' }); y += 10;

      doc.text(`Prefixo: Linha ${route.origin} - ${route.destination}`, pageWidth / 2, y, { align: 'center' }); y += 5;
      doc.text(`Origem: ${route.origin}`, pageWidth / 2, y, { align: 'center' }); y += 5;

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
        y,
        { align: 'center' }
      ); y += 5;

      doc.text(`Bilhete: ${passenger.ticketId}`, pageWidth / 2, y, { align: 'center' }); y += 5;
      doc.text('Tipo: Convencional / Normal', pageWidth / 2, y, { align: 'center' }); y += 5;
      doc.text(
        `Valor: ${bookingData.total_price.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} kz`,
        pageWidth / 2,
        y,
        { align: 'center' }
      ); y += 5;

      doc.text(displaySelectedSeats(bookingData.selected_seats), pageWidth / 2, y, { align: 'center' }); y += 5;
      doc.text(`Nome cliente: ${passenger.name}`, pageWidth / 2, y, { align: 'center' }); y += 5;
      doc.text(`Idade: ${passenger.age}`, pageWidth / 2, y, { align: 'center' }); y += 5;
      doc.text(`Sexo: ${passenger.sex === 'M' ? 'Masculino' : 'Feminina'}`, pageWidth / 2, y, { align: 'center' }); y += 5;
      doc.text(`Telefone: ${bookingData.contact_phone || 'N/A'}`, pageWidth / 2, y, { align: 'center' }); y += 10;

      // QR Code
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

      doc.addImage(qrCodeUrl, 'PNG', pageWidth / 2 - 20, y, 40, 40, '', 'FAST');
      y += 45;

      // Additional Info (less space before footer)
      const additionalInfo = [
        'Isentos nos termos da linha do numer 1 do artigo 12. do civa qtvl-processado por programa valido N31.1/AGT/2022',
        'O passageiro tem direito a uma mala.',
        'Hóraria de atendimento para subsituição do bilhete de passagem esta disponivel das 09h- 21h.',
        'Guarda seu bilhete de passagens.',
        'WhatsApp 952995798.',
        'Faça seu checkin 1h antes da partida.',
        'Não assumimos estravios do bilhete e não emitimos segunda.',
      ];

      doc.setFontSize(6);
      additionalInfo.forEach((line) => {
        doc.text(line, pageWidth / 2, y, { align: 'center', maxWidth: pageWidth - 10 });
        y += 4; // Reduced line spacing
      });

      // Footer immediately after additionalInfo
      doc.setFontSize(8);
      doc.text('Muito obrigado, Volte sempre', pageWidth / 2, y + 5, { align: 'center' });
      doc.text('-----100 Destinos-----', pageWidth / 2, y + 10, { align: 'center' });

      if (index === updatedPassengers.length - 1) {
        doc.save(`Bilhete_${bookingId}_${dateId}.pdf`);
      }
    }

    await supabase
      .from('bookings')
      .update({ passengers: updatedPassengers })
      .eq('id', bookingId);
  } catch (error) {
    console.error('Error generating passenger ticket:', error);
    throw error;
  }
};

export default generatePassengerTickets;
