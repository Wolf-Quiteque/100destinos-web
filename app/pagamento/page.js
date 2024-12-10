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
  AlertCircle
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
  
      router.push("/obrigado");
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
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        router.push('/bilhetes');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error) throw error;
        setBookingDetails(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        router.push('/bilhetes');
      }
    };

    fetchBookingDetails();
  }, [bookingId, router, supabase]);

  const handleFileUpload = async (e) => {

    
 
   
    const file = e.target.files[0];

    if (!file) return;

    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Ficheiro Grande",
        description: "O documento selecionado é muito grande. Por favor, selecione um arquivo menor que 1 MB.",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://verifica-jet.vercel.app/upload', {
        method: 'POST',
        body: formData,
      });

      const jsonResponse = await response.json();
      const comprovativoText = jsonResponse.text.replace(/\n/g, ' ').replace(/\s+/g, '');

      if (jsonResponse.original) {
        const Total = '1';
        const hasTotal = jsonResponse.text.includes(1 + ',00');
        const hasReference = [
          "AO06.0055.0000.1009.6480.1012.9",
          "AO06 0055 0000 1009 6480 1012 9",
          "AO06005500001009648010129",
          "0055.0000.1009.6480.1012.9",
          "0055 0000 1009 6480 1012 9",
          "005500001009648010129"
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
            const data = await verificationResponse.json();
            
            if (!data.length > 0) {
              await fetch(
                'https://glab-api.vercel.app/api/aef/add',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ data: comprovativoText })
                }
              );
    setLoading(false);

              await confirmBooking()
              router.push(`/obrigado?bookingId=${bookingId}`);
            
              return;
            }
          }
        }
      }

      setComprovativoErro(true);
    } catch (error) {
      console.error('Erro:', error);
      toast({
        variant: "destructive",
        title: "Ficheiro",
        description: "Erro ao processar o documento. Por favor, tente novamente.",
      });
    } finally {
      setLoading(false);
    }
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

  if (!bookingDetails) {
    return null;
  }

  const totalPrice = bookingDetails.total_price;
  const passengers = JSON.parse(bookingDetails.passengers);


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

                {/* Passenger Details Section */}
<div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
  <h3 className="text-2xl font-bold text-white flex items-center mb-4">
    <UserCheck className="mr-2 text-orange-500" /> Detalhes dos Passageiros
  </h3>

  <div className="space-y-4">
    {passengers.map((passenger, index) => (
      <div 
        key={index} 
        className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-orange-500 transition-all"
      >
        <div className="grid md:grid-cols-2 gap-4 text-white">
          <div>
            <p className="text-sm text-gray-400 flex items-center">
              <UserCheck className="mr-2 text-orange-500" /> Nome Completo
            </p>
            <strong>{passenger.name}</strong>
          </div>
          <div>
            <p className="text-sm text-gray-400 flex items-center">
              <CreditCard className="mr-2 text-orange-500" /> Número de Identificação
            </p>
            <strong>{passenger.idNumber}</strong>
          </div>
        </div>
      </div>
    ))}
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
                >
                  Carregar PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center">
            <Loader2 className="mx-auto w-8 h-8 animate-spin text-green-600 flex items-center justify-center" />
          </div>
        )}
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