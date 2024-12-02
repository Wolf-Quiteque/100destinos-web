"use client"
import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  Copy, 
  Upload, 
  CheckCircle, 
  FileText, 
  ArrowLeft 
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PaymentScreen = ({ onBack }) => {



  const ticket = {
    id: 1,
    company: 'Huambo Expresse',
    origin: 'Luanda',
    destination: 'Huambo',
    departureTime: '08:00',
    arrivalTime: '16:30',
    price: 4500,
    duration: '8h 30m',
    availableSeats: 12
  };
  
  // Dummy Passengers Data
  const passengers = [
    {
      name: 'João Silva Santos',
      age: 35,
      sex: 'M',
      idNumber: '001234567LA048'
    },
    {
      name: 'Maria Conceição Pereira',
      age: 28,
      sex: 'F',
      idNumber: '009876543LB052'
    }
  ];

  const [uploadedFile, setUploadedFile] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const fileInputRef = useRef(null);

  const IBAN = 'AO06 0044 0000 5533 2295 1014 4';
  const totalPrice = ticket.price * passengers.length;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, carregue apenas arquivos PDF');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo não pode ser maior que 2MB');
        return;
      }

      setUploadedFile(file);
    }
  };

  const copyIBAN = () => {
    navigator.clipboard.writeText(IBAN);
    alert('IBAN copiado com sucesso!');
  };

  const generateReceipt = () => {
    const doc = new jsPDF();
    
    // Title and Company Details
    doc.setFontSize(18);
    doc.text('Comprovativo de Pagamento', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Huambo Expresse', 105, 30, { align: 'center' });
    
    // Ticket Details
    doc.setFontSize(10);
    doc.text(`Origem: ${ticket.origin}`, 20, 50);
    doc.text(`Destino: ${ticket.destination}`, 20, 60);
    doc.text(`Data de Partida: ${new Date().toLocaleDateString('pt-AO')}`, 20, 70);
    
    // Passenger Details
    doc.autoTable({
      startY: 90,
      head: [['Nome', 'Número de ID', 'Idade']],
      body: passengers.map(passenger => [
        passenger.name, 
        passenger.idNumber, 
        passenger.age.toString()
      ]),
      theme: 'striped'
    });

    // Pricing Details
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Preço por Bilhete: ${ticket.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`, 20, finalY);
    doc.text(`Número de Passageiros: ${passengers.length}`, 20, finalY + 10);
    doc.text(`Preço Total: ${totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`, 20, finalY + 20);

    doc.save('Comprovativo_Pagamento.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-800 p-4 md:p-8 relative">
      {/* Back Navigation Button */}
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 md:left-8 z-10 
        text-white bg-gray-800/50 hover:bg-gray-800/70 
        rounded-full p-3 transition-all duration-300 
        hover:text-orange-500 hover:scale-110"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-4xl mx-auto space-y-6">
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
                <p className="text-sm text-gray-400 mt-2">
                  Máximo 2MB. Apenas arquivos PDF.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="text-center">
          <button 
            onClick={() => {
              if (uploadedFile) {
                setPaymentConfirmed(true);
                generateReceipt();
              } else {
                alert('Por favor, carregue o comprovativo de pagamento');
              }
            }}
            className="w-full max-w-md mx-auto px-8 py-4 bg-orange-600 text-white text-xl font-bold rounded-full hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <CreditCard className="mr-3" /> Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;