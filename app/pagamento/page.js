'use client'
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Copy,
  Upload,
  CheckCircle,
  UserCheck,
  FileText,
  Loader2,
  ArrowLeft,
  AlertCircle,
  User as UserIcon, // Renamed User icon import
  RefreshCw // Import icon for change button
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BusTicketLoader from '../components/BusTicketLoader';
import { Button } from '@/components/ui/button'; // Import Button component

function PaymentScreenContent({}) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const searchType = searchParams.get('type');
  const { toast } = useToast();

  // Redirect to hotel payment page if type is 'hotel'
  useEffect(() => {
    if (searchType === 'hotel') {
      router.replace(`/pagamentos/hotel-payment?${searchParams.toString()}`);
    }
  }, [searchType, router, searchParams]);

  const [bookingDetails, setBookingDetails] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // State for user profile
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [comprovativoErro, setComprovativoErro] = useState(false); // Keep error state
  const fileInputRef = useRef(null);

  const IBAN = '0055.0000.1009.6480.1012.9';
  const NT = '934937545';



  const confirmBooking = async () => {
    if (!bookingId) return;

    try {
      // The bookingData is already fetched in the useEffect and available in state.
      // We need to ensure it's available here.
      if (!bookingDetails || !userProfile || !bookingDetails.route_details) {
        console.error('Booking details, user profile, or route details not available for confirmation.');
        throw new Error('Missing booking details, user profile, or route details.');
      }

      // Update booking status in Supabase
      const { error: updateBookingError } = await supabase
        .from('bookings')
        .update({ booking_status: 'confirmed' })
        .eq('id', bookingId);

      if (updateBookingError) throw updateBookingError;

      // Check if the company is "md freitas" and if it's a bus route for Vendus integration
      const mdFreitasCompanyId = 'c154caa3-b54c-4ae3-b8bd-528a4d4e99dd';
      const routeCompanyId = bookingDetails.route_details.company_id;
      const isBusRoute = bookingDetails.route_details.type === 'bus';

      if (isBusRoute && routeCompanyId === mdFreitasCompanyId) { // Only for bus routes from md freitas
        try {
          const vendusApiKey = process.env.VENDUS_API_KEY;
          const vendusRegisterId = 250268937; // Fixed register_id as per user's clarification

          // Ensure passengers array exists and has items
          const items = bookingDetails.passengers && bookingDetails.passengers.length > 0
            ? bookingDetails.passengers.map(passenger => ({
                qty: 1,
                id: bookingDetails.route_details.external_product_id, // Use external_product_id from route_details
                gross_price: bookingDetails.route_details.base_price // Price per ticket
              }))
            : []; // Empty array if no passengers

          const { data: { user } } = await supabase.auth.getUser(); // Get user for email

          const vendusDocumentResponse = await fetch('/api/vendus/documents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              register_id: vendusRegisterId,
              type: "FT", // Factura (Invoice)
              items: items,
              client: {
                name: userProfile?.nome || 'Cliente Desconhecido',
                fiscal_id: userProfile?.numero_bi || '', // BI number as fiscal ID
                email: user?.email || '' // User email from Supabase auth
              },
              payments: [
                {
                  type: "NU", // Assuming "NU" for cash/bank transfer based on /paymentmethods example
                  amount: bookingDetails.total_price // Total amount of the booking
                }
              ],
              mode: "normal"
            })
          });

          if (!vendusDocumentResponse.ok) {
            const errorData = await vendusDocumentResponse.json();
            console.error('Error creating document in Vendus:', errorData);
            // Optionally, handle this error more gracefully
          } else {
            const vendusDocument = await vendusDocumentResponse.json();
            console.log('Document created in Vendus:', vendusDocument);
          }
        } catch (vendusError) {
          console.error('Network or unexpected error with Vendus API (documents):', vendusError);
        }
      }

      toast({
        title: "Pagamento Confirmado",
        description: "O seu bilhete foi confirmado com sucesso.",
      });

      router.push(`/obrigado?bookingId=${bookingId}&type=${searchType}`);
    } catch (error) {
      console.error('Error confirming booking or fetching data:', error);
      toast({
        variant: "destructive",
        title: "Erro de Confirmação",
        description: "Não foi possível confirmar o pagamento. Por favor, tente novamente.",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => { // Renamed function for clarity
      if (!bookingId) {
        router.push('/bilhetes');
        return;
      }
      setLoading(true); // Start loading

      try {
        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*') // Select all from bookings, we'll fetch route details separately
          .eq('id', bookingId)
          .single();

        if (bookingError) throw bookingError;
        
        // Fetch route details from available_routes view
        const { data: routeData, error: routeError } = await supabase
          .from('available_routes')
          .select('*') // Select all details from the view
          .eq('id', bookingData.route_id) // Use route_id from bookingData
          .single();

        if (routeError) throw routeError;

        // Combine booking and route details
        setBookingDetails({ ...bookingData, route_details: routeData });

        // Fetch user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('nome, numero_bi') // Select name and ID number
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            toast({ title: "Erro", description: "Não foi possível carregar dados do perfil.", variant: "destructive" });
          } else {
            setUserProfile(profileData);
          }
        } else {
           console.warn("User not logged in on payment page.");
           router.push('/login'); // Redirect if no user
           return;
        }

      } catch (error) {
        console.error('Error fetching data:', error); // Catch errors from either fetch
        toast({ title: "Erro", description: "Não foi possível carregar os detalhes da reserva.", variant: "destructive" });
        router.push('/bilhetes'); // Redirect on error
      } finally {
        setLoading(false); // Stop loading after all fetches attempt
      }
    };

    fetchData(); // Call the combined fetch function
  }, [bookingId, router, supabase, toast]); // Added toast to dependency array

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

   

    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Ficheiro Grande",
        description: "O documento selecionado é muito grande (Max: 1MB).",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input on size error
      }
      return;
    }

    setProcessingPayment(true);
    setComprovativoErro(false); // Reset error state on new upload attempt
    setUploadedFile(file); // Show uploaded file name immediately

    // --- Start of verification logic ---
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://verifica-jet.vercel.app/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
         throw new Error(`Upload failed with status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      const comprovativoText = jsonResponse.text.replace(/\n/g, ' ').replace(/\s+/g, '');

      if (jsonResponse.original) {
        const expectedTotalPriceString = bookingDetails?.total_price?.toFixed(2).replace('.', ',');
        // **Important**: Ensure this check uses the actual total price dynamically
        //   const hasTotal = jsonResponse.text.includes("1,00"); // More robust check,
      const hasTotal = jsonResponse.text.includes(bookingDetails?.total_price?.toString().replace('.', ',')); // Basic check, might need refinement

        const hasReference = [
  "AO06.0055.0000.1009.6480.1012.9",
          "AO06 0055 0000 1009 6480 1012 9",
          "AO06005500001009648010129",
          "0055.0000.1009.6480.1012.9",
          "0055 0000 1009 6480 1012 9",
          "005500001009648010129","934 937 545"
].some(ref => jsonResponse.text.includes(ref));

        if (hasTotal && hasReference) {
          const verificationResponse = await fetch(
            'https://glab-api.vercel.app/api/aef/comprovativos',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: comprovativoText })
            }
          );

          if (verificationResponse.ok) {
            const duplicateCheckData = await verificationResponse.json();
            if (!duplicateCheckData || duplicateCheckData.length === 0) {
              await fetch(
                'https://glab-api.vercel.app/api/aef/add',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: comprovativoText })
                }
              );
              await confirmBooking(); // Confirm booking in Supabase
              // No need to set processing false here, page will redirect
              return; // Exit after successful confirmation
            } else {
               setComprovativoErro(true);
               toast({ variant: "destructive", title: "Comprovativo Duplicado", description: "Este comprovativo já foi utilizado." });
            }
          } else {
             throw new Error("Erro ao verificar duplicados.");
          }
        } else {
           setComprovativoErro(true);
           toast({ variant: "destructive", title: "Comprovativo Inválido", description: `Referência (${hasReference ? 'OK' : 'Não encontrada'}) ou valor total (${hasTotal ? 'OK' : 'Não corresponde'}) inválido.` });
        }
      } else {
         setComprovativoErro(true);
         toast({ variant: "destructive", title: "Erro de Leitura", description: "Não foi possível ler o conteúdo do PDF." });
      }

    } catch (error) {
      console.error('Erro no upload/verificação:', error);
      setComprovativoErro(true); // Show general error message
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Erro ao processar o documento: ${error.message || 'Tente novamente.'}`,
      });
    } finally {
      setProcessingPayment(false); // Stop processing indicator
      // Reset file input ONLY if there was an error to allow re-upload
      if (comprovativoErro && fileInputRef.current) {
         fileInputRef.current.value = "";
         // Keep uploadedFile state to show the name of the failed file, but allow changing
         // setUploadedFile(null); // Don't reset here, let the change button handle it
      }
    }
    // --- End of verification logic ---
  };

  // Function to handle changing the file
  const handleChangeFileClick = () => {
    setUploadedFile(null);
    setComprovativoErro(false); // Reset error state
    setProcessingPayment(false); // Ensure processing is stopped
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the actual input value
      fileInputRef.current.click(); // Open file dialog
    }
  };

  const copyIBAN = () => {
    navigator.clipboard.writeText(IBAN);
    toast({
      title: "IBAN Copiado",
      description: "O IBAN foi copiado para a área de transferência.",
    });
  };

      const copyN = () => {
    navigator.clipboard.writeText(NT);
    toast({
      title: "Nº Telefone Copiado",
      description: "O Nº Telefone foi copiado para a área de transferência.",
    });
  };

  if (loading) {
    return <BusTicketLoader type={searchType} />;
  }

  if (!bookingDetails || !userProfile) {
    return <BusTicketLoader type={searchType} />; // Or return null or a specific message
  }

  const totalPrice = bookingDetails.total_price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 p-4 md:p-8 relative">
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 md:left-8 z-10
        text-white bg-gray-800/50 hover:bg-gray-800/70
        rounded-full p-3 transition-all duration-300
        hover:text-orange-500 hover:scale-110"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-4xl mx-auto space-y-6">

        {/* User Details Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-2xl font-bold text-white flex items-center mb-4">
            <UserIcon className="mr-2 text-orange-500" /> Detalhes do Comprador
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-white">
            <div>
              <p className="text-sm text-gray-400 flex items-center">
                <UserIcon className="mr-2 text-orange-500" /> Nome
              </p>
              <strong>{userProfile?.nome || 'N/A'}</strong>
            </div>
            <div>
              <p className="text-sm text-gray-400 flex items-center">
                <CreditCard className="mr-2 text-orange-500" /> Nº BI
              </p>
              <strong>{userProfile?.numero_bi || 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Payment Details Section */}
      <div className="relative group"> 
  {/* ... (IBAN details remain the same) ... */}
  <div className="absolute -inset-0.5 bg-orange-500 rounded-2xl opacity-50 group-hover:opacity-75 transition duration-300 blur-sm"></div>
  <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-orange-500 transition-all duration-300">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        <CreditCard className="text-orange-500" />
        <h2 className="text-2xl font-bold text-white">Detalhes de Pagamento</h2>
      </div>
    </div>
    
    <div className="grid md:grid-cols-2 gap-4 text-white">
      <div>
        <p className="text-sm text-gray-400">Total a Pagar</p>
        <strong className="text-3xl text-orange-500">
          {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
        </strong>
      </div>
      <div>
        <p className="text-sm text-gray-400">Empresa</p>
        <strong className="text-lg text-white">CEM DESTINOS COMERCIO E PRESTAÇÃO</strong>

        <p className="text-sm text-gray-400">IBAN</p>
        <div className="flex items-center space-x-2">
          <strong>{IBAN}</strong>
          <button
            onClick={copyIBAN}
            className="text-orange-500 hover:text-orange-400"
          >
            <Copy size={18} />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400">Nº Telefone</p>
          <div className="flex items-center space-x-2">
            <strong>{NT}</strong>
            <button
              onClick={copyN}
              className="text-orange-500 hover:text-orange-400"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* PAYMENT METHODS NOTE */}
    <div className="mt-6 text-sm text-center text-gray-300 italic">
      Pagamento com App, Internet Banking, MultiCaixa Express ou Transferência Expressa
    </div>
  </div>
</div>


        {/* Error Alert */}
        {comprovativoErro && (
          <Alert
            variant="destructive"
            className="bg-red-600 text-white border-red-800" // Adjusted border
          >
            <AlertCircle className="h-4 w-4" color='#fff' />
            <AlertTitle className="text-white">
              <strong>COMPROVATIVO REJEITADO</strong>
            </AlertTitle>
            <AlertDescription className="text-white">
              <div className="font-medium">
                Verifique o ficheiro ou tente outro. <i className="underline">Valor pode não coincidir ou comprovativo já foi usado.</i>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload Section - Modified */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-2xl font-bold text-white flex items-center mb-4">
            <Upload className="mr-2 text-orange-500" /> Comprovativo de Pagamento
          </h3>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300
            ${uploadedFile && !comprovativoErro ? 'border-green-500 bg-green-500/10' : ''}
            ${comprovativoErro ? 'border-red-500 bg-red-500/10' : ''}
            ${!uploadedFile && !comprovativoErro ? 'border-gray-600 hover:border-orange-500' : ''}`}
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf"
              className="hidden"
              disabled={processingPayment} // Disable input while processing
            />

            {/* Loading State */}
            {processingPayment && (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-orange-500" />
                <span>A verificar comprovativo...</span>
              </div>
            )}

            {/* Initial/Error State */}
            {!processingPayment && (!uploadedFile || comprovativoErro) && (
              <Button
                onClick={handleChangeFileClick} // Use change handler for initial upload too
                variant="default"
                className="text-white bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-full transition-colors"
              >
                <Upload className="mr-2 h-4 w-4" />
                {comprovativoErro ? 'Tentar Novamente' : 'Carregar PDF'}
              </Button>
            )}

            {/* Success State */}
            {!processingPayment && uploadedFile && !comprovativoErro && (
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center text-green-400"> {/* Adjusted color */}
                  <FileText className="mr-2 flex-shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{uploadedFile.name}</span>
                  <CheckCircle className="ml-2 flex-shrink-0" />
                </div>
                <Button
                  onClick={handleChangeFileClick}
                  variant="outline"
                  size="sm"
                  className="text-orange-500 border-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Alterar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={<BusTicketLoader />}>
      <PaymentScreenContent />
    </Suspense>
  );
}
