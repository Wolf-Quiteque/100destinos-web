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
  User as UserIcon // Renamed User icon import
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import BusTicketLoader from '../components/BusTicketLoader';

function PaymentScreenContent() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
   const { toast } = useToast();

   const [bookingDetails, setBookingDetails] = useState(null);
   const [userProfile, setUserProfile] = useState(null); // State for user profile
   const [loading, setLoading] = useState(true);
   const [uploadedFile, setUploadedFile] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [comprovativoErro, setComprovativoErro] = useState(false);
  const fileInputRef = useRef(null);

  const IBAN = '0055.0000.1009.6480.1012.9';


  const confirmBooking = async () => {
    if (!bookingId) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Pagamento Confirmado",
        description: "O seu bilhete foi confirmado com sucesso.",
      });

      // Pass bookingId to the "Obrigado" page
      router.push(`/obrigado?bookingId=${bookingId}`);
    } catch (error) {
      console.error('Error confirming booking:', error);
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
          .select('*')
          .eq('id', bookingId)
          .single();

        if (bookingError) throw bookingError;
        setBookingDetails(bookingData);

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
            // Handle profile fetch error (e.g., show default or toast)
            toast({ title: "Erro", description: "Não foi possível carregar dados do perfil.", variant: "destructive" });
          } else {
            setUserProfile(profileData);
          }
        } else {
           // Handle case where user is not logged in (should ideally be caught by middleware)
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


    await confirmBooking() // Directly confirm and redirect for now
    // router.push(`/obrigado?bookingId=${bookingId}`); // Redirect happens inside confirmBooking

    return; // Stop execution here for now

    // --- Start of commented out verification logic ---
    /*
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Ficheiro Grande",
        description: "O documento selecionado é muito grande. Por favor, selecione um arquivo menor que 1 MB.",
      });
      return;
    }

    setProcessingPayment(true); // Use processingPayment state
    setComprovativoErro(false); // Reset error state
    setUploadedFile(file); // Show uploaded file name

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
        // Simplified check - adjust value '1' if needed based on actual total price
        const expectedTotalPriceString = bookingDetails?.total_price?.toFixed(2).replace('.', ','); // Format expected price
        const hasTotal = jsonResponse.text.includes(expectedTotalPriceString); // Check against dynamic total price
        const hasReference = [
          "AO06.0055.0000.1009.6480.1012.9",
          "AO06 0055 0000 1009 6480 1012 9",
          "AO06005500001009648010129",
          "0055.0000.1009.6480.1012.9",
          "0055 0000 1009 6480 1012 9",
          "005500001009648010129"
        ].some(ref => jsonResponse.text.includes(ref));

        if (hasTotal && hasReference) {
          // Check for duplicates (assuming glab-api checks for duplicates)
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
              // Not a duplicate, add it
              await fetch(
                'https://glab-api.vercel.app/api/aef/add',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ data: comprovativoText })
                }
              );

              await confirmBooking(); // Confirm booking in Supabase
              // Redirect happens inside confirmBooking
              return; // Exit after successful confirmation
            } else {
               // It's a duplicate
               setComprovativoErro(true);
               toast({ variant: "destructive", title: "Comprovativo Duplicado", description: "Este comprovativo já foi utilizado." });
            }
          } else {
             // Error checking for duplicates
             throw new Error("Erro ao verificar duplicados.");
          }
        } else {
           // Total or Reference mismatch
           setComprovativoErro(true);
           toast({ variant: "destructive", title: "Comprovativo Inválido", description: "Referência ou valor total não corresponde." });
        }
      } else {
         // Could not read text from PDF
         setComprovativoErro(true);
         toast({ variant: "destructive", title: "Erro de Leitura", description: "Não foi possível ler o conteúdo do PDF." });
      }

    } catch (error) {
      console.error('Erro no upload/verificação:', error);
      setComprovativoErro(true); // Show general error message
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao processar o documento. Tente novamente.",
      });
    } finally {
      setProcessingPayment(false); // Stop processing indicator
      // Reset file input if there was an error to allow re-upload
      if (comprovativoErro && fileInputRef.current) {
         fileInputRef.current.value = "";
         setUploadedFile(null);
      }
    }
    */
   // --- End of commented out verification logic ---
  };

  const copyIBAN = () => {
    navigator.clipboard.writeText(IBAN);
    toast({
      title: "IBAN Copiado",
      description: "O IBAN foi copiado para a área de transferência.",
    });
  };
  if (loading) {
    return <BusTicketLoader />;
  }

  // Ensure both bookingDetails and userProfile are loaded before rendering main content
  if (!bookingDetails || !userProfile) {
    // Can show a more specific loading/error state if needed
    return <BusTicketLoader />; // Or return null or a specific message
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

        {/* User Details Section - Updated to show fetched profile */}
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
                <strong className="text-lg text-white">ZRD3 CONSULTING</strong>
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
              </div>
            </div>
          </div>
        </div>


        {comprovativoErro && (
          <Alert
            variant="destructive"
            className="bg-red-600 text-white"
          >
            <AlertCircle className="h-4 w-4" color='#fff' />
            <AlertTitle className="text-white">
              <strong>COMPROVATIVO REJEITADO</strong>
            </AlertTitle>
            <AlertDescription className="text-white">
              <div className="font-medium">
                Comprovativo falso/duplicado ou <i className="underline">valor não coincide com o montante a pagar.</i>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <h3 className="text-2xl font-bold text-white flex items-center mb-4">
            <Upload className="mr-2 text-orange-500" /> Comprovativo de Pagamento
          </h3>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300
            ${uploadedFile ? 'border-green-500 bg-green-500/10' : 'border-gray-600 hover:border-orange-500'}`}
          >
            {uploadedFile ? (
              <div className="flex items-center justify-center text-green-500">
                <FileText className="mr-2" />
                <span>{uploadedFile.name}</span>
                <CheckCircle className="ml-2" />
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="text-white bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-full transition-colors"
                  disabled={processingPayment} // Disable button while processing
                >
                  {processingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {processingPayment ? 'A Processar...' : 'Carregar PDF'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading Indicator - Now uses processingPayment state */}
        {/* Removed the general loading indicator here as it's handled by the BusTicketLoader */}

      </div>
    </div>
  );
}

export default function PaymentScreen() {
  return (
    <Suspense fallback={<BusTicketLoader />}>
      <PaymentScreenContent />
    </Suspense>
  );
}
