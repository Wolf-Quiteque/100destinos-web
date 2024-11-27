'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowDownTrayIcon, 
  HomeIcon, 
  DocumentArrowUpIcon, 
  ClipboardIcon 
} from '@heroicons/react/24/outline';

const banks = [
  { id: '1', name: 'MCX', img: '/bancos/mcx.png' },
  { id: '2', name: 'BAI', img: '/bancos/bai.jpeg' },
  { id: '3', name: 'BFA', img: '/bancos/bfa.png' },
  { id: '4', name: 'BIC', img: '/bancos/bic.jpeg' },
  { id: '5', name: 'BPC', img: '/bancos/bpc.jpg' },
  { id: '6', name: 'KEVE', img: '/bancos/keve.png' },
  { id: '7', name: 'SOL', img: '/bancos/sol.jpeg' },
  { id: '8', name: 'STANDARD', img: '/bancos/standardbank.jpeg' },
  { id: '9', name: 'YETU', img: '/bancos/yetu.png' },
];

export default function PaymentScreen() {
  const [selectedBank, setSelectedBank] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyIban = () => {
    navigator.clipboard.writeText('005500001009648010129');
  };

  const handleUploadPDF = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setLoading(true);
      // Simulate upload process
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const generateTicket = () => {
    setShowTicket(true);
  };

  if (showTicket) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="flex justify-center mb-6">
            <Image 
              src="/100destinosslogo.png" 
              alt="100 Destinos Logo" 
              width={200} 
              height={100} 
              className="object-contain"
            />
          </div>

          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            Obrigado pela sua compra!
          </h2>

          <div className="bg-orange-100 rounded-xl p-6 mb-6">
            <div className="space-y-2">
              <p className="text-orange-700">
                <span className="font-semibold">Destino:</span> São Tomé
              </p>
              <p className="text-orange-700">
                <span className="font-semibold">Data:</span> {new Date().toLocaleDateString()}
              </p>
              <p className="text-orange-700">
                <span className="font-semibold">Passageiros:</span> 2
              </p>
              <p className="text-orange-700">
                <span className="font-semibold">Preço Total:</span> 10,000 AOA
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <QRCodeSVG 
              value="TICKET123456" 
              size={150} 
              className="mb-4"
            />
            <button 
              onClick={() => window.print()}
              className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition flex items-center justify-center"
            >
              <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
              Baixar Bilhete
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full border-2 border-orange-500 text-orange-500 py-3 rounded-lg hover:bg-orange-50 transition flex items-center justify-center"
            >
              <HomeIcon className="h-6 w-6 mr-2" />
              Voltar para Início
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-orange-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full"
      >
        <div className="flex justify-center mb-6">
          <Image 
            src="/100destinosslogo.png" 
            alt="100 Destinos Logo" 
            width={250} 
            height={150} 
            className="object-contain"
          />
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-orange-600">IBAN: 0055 0000 10096480101 29</p>
          <p className="text-sm text-gray-600">Zrd3 Comercio e Prestação de Serviço</p>
        </div>

        <button 
          onClick={handleCopyIban}
          className="w-full bg-orange-100 text-orange-600 py-3 rounded-lg mb-6 flex items-center justify-center hover:bg-orange-200 transition"
        >
          <ClipboardIcon className="h-6 w-6 mr-2" />
          Copiar IBAN
        </button>

        <h3 className="text-xl font-bold text-center mb-4 text-orange-600">
          Selecione o seu banco:
        </h3>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {banks.map((bank) => (
            <motion.button
              key={bank.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBank(bank)}
              className={`flex flex-col items-center p-2 rounded-lg transition ${
                selectedBank?.id === bank.id 
                  ? 'border-2 border-orange-500 bg-orange-50' 
                  : 'hover:bg-orange-100'
              }`}
            >
              <Image 
                src={bank.img} 
                alt={bank.name} 
                width={60} 
                height={60} 
                className="rounded-full mb-2"
              />
              <p className="text-xs text-gray-700">{bank.name}</p>
            </motion.button>
          ))}
        </div>

        <div className="mb-6">
          <label 
            htmlFor="pdf-upload"
            className="w-full bg-orange-500 text-white py-3 rounded-lg flex items-center justify-center cursor-pointer hover:bg-orange-600 transition"
          >
            <DocumentArrowUpIcon className="h-6 w-6 mr-2" />
            {loading ? 'Carregando...' : 'Carregar Comprovativo (PDF)'}
            <input 
              type="file" 
              id="pdf-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleUploadPDF}
            />
          </label>
          {pdfFile && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {pdfFile.name}
            </p>
          )}
        </div>

        <button 
          onClick={generateTicket}
          disabled={!selectedBank || !pdfFile}
          className={`w-full py-3 rounded-lg transition ${
            selectedBank && pdfFile
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirmar Pagamento
        </button>
      </motion.div>
    </motion.div>
  );
}