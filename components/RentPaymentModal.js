'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RentPaymentModal({ selectedCar, rentalStartDate, rentalEndDate, rentalDuration, totalRentalPrice, onPaymentSuccess, onClose }) {
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [comprovativoErro, setComprovativoErro] = useState(false);

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
                fileInputRef.current.value = "";
            }
            return;
        }

        setProcessingPayment(true);
        setComprovativoErro(false);
        setUploadedFile(file);

        // Simulate API verification
        setTimeout(() => {
            if (file.name.toLowerCase().includes("error")) {
                setComprovativoErro(true);
                toast({
                    variant: "destructive",
                    title: "Comprovativo Inválido",
                    description: "Simulação: Este comprovativo resultou em erro.",
                });
            } else {
                // Simulate successful verification
                const rentedCarObject = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    model: selectedCar.model,
                    price: selectedCar.price,
                    dailyPrice: selectedCar.numericPrice,
                    img: selectedCar.img,
                    rentalStartDate: rentalStartDate.toISOString(),
                    rentalEndDate: rentalEndDate.toISOString(),
                    rentalDuration: rentalDuration,
                    totalRentalPrice: totalRentalPrice,
                    rentedAt: new Date().toISOString()
                };
                onPaymentSuccess(rentedCarObject);
            }
            setProcessingPayment(false);
        }, 2000); // Simulate 2-second API call
    };

    const handleChangeFileClick = () => {
        setUploadedFile(null);
        setComprovativoErro(false);
        setProcessingPayment(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    return (
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
            <DialogHeader>
                <DialogTitle className="text-orange-500">Confirmar Aluguel e Pagamento</DialogTitle>
                <DialogDescription className="text-gray-400">
                    Revise os detalhes do seu aluguel e faça o upload do comprovativo de pagamento.
                </DialogDescription>
            </DialogHeader>
            {selectedCar && (
                <div className="grid gap-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Image
                            src={selectedCar.img}
                            alt={selectedCar.model}
                            width={100}
                            height={60}
                            className="rounded-md object-cover"
                        />
                        <div>
                            <h3 className="text-xl font-bold">{selectedCar.model}</h3>
                            <p className="text-gray-400">{selectedCar.price} / Dia</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-400">Retirada:</p>
                        <p className="font-medium">{rentalStartDate ? format(rentalStartDate, "PPP") : 'N/A'}</p>
                        <p className="text-gray-400">Devolução:</p>
                        <p className="font-medium">{rentalEndDate ? format(rentalEndDate, "PPP") : 'N/A'}</p>
                        <p className="text-gray-400">Duração:</p>
                        <p className="font-medium">{rentalDuration} dias</p>
                        <p className="text-gray-400 text-lg font-bold">Total:</p>
                        <p className="text-lg font-bold text-orange-500">
                            {totalRentalPrice.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {comprovativoErro && (
                        <Alert
                            variant="destructive"
                            className="bg-red-600 text-white border-red-800"
                        >
                            <AlertCircle className="h-4 w-4" color='#fff' />
                            <AlertTitle className="text-white">
                                <strong>COMPROVATIVO REJEITADO (Simulação)</strong>
                            </AlertTitle>
                            <AlertDescription className="text-white">
                                <div className="font-medium">
                                    Verifique o ficheiro ou tente outro.
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* File Upload Section */}
                    <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white flex items-center mb-4">
                            <Upload className="mr-2 text-orange-500" /> Comprovativo de Pagamento
                        </h3>

                        <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300
                            ${uploadedFile && !comprovativoErro ? 'border-green-500 bg-green-500/10' : ''}
                            ${comprovativoErro ? 'border-red-500 bg-red-500/10' : ''}
                            ${!uploadedFile && !comprovativoErro ? 'border-gray-600 hover:border-orange-500' : ''}`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".pdf"
                                className="hidden"
                                disabled={processingPayment}
                            />

                            {processingPayment && (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-orange-500" />
                                    <span>A verificar comprovativo... (Simulação)</span>
                                </div>
                            )}

                            {!processingPayment && (!uploadedFile || comprovativoErro) && (
                                <Button
                                    onClick={handleChangeFileClick}
                                    variant="default"
                                    className="text-white bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-full transition-colors"
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {comprovativoErro ? 'Tentar Novamente' : 'Carregar PDF'}
                                </Button>
                            )}

                            {!processingPayment && uploadedFile && !comprovativoErro && (
                                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                                    <div className="flex items-center text-green-400">
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
            )}
        </DialogContent>
    );
}
