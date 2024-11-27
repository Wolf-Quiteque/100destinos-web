"use client"

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { 
  CalendarIcon, 
  PlusIcon, 
  TrashIcon, 
  UserPlusIcon, 
  CheckIcon, 
  ChevronRightIcon 
} from "lucide-react"
import { cn } from "@/lib/utils"

// Provinces of Angola
const provinces = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 
  'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 
  'Namibe', 'Uíge', 'Zaire'
];

// Zod Schema for Passenger Validation
const PassengerSchema = z.object({
  nomeCompleto: z.string().min(2, { message: "Nome completo é obrigatório" }),
  telefone: z.string().regex(/^[0-9]{9}$/, { message: "Número de telefone inválido" }),
  idade: z.string().regex(/^[0-9]{1,3}$/, { message: "Idade inválida" }),
  sexo: z.enum(["Masculino", "Feminino"], { 
    required_error: "Por favor, selecione o sexo" 
  }),
  provincia: z.string().min(1, { message: "Província é obrigatória" }),
  data: z.date({ required_error: "Data de partida é obrigatória" })
});

export default function BookingInfoPage() {
  const [passengers, setPassengers] = useState([
    {
      nomeCompleto: '',
      telefone: '',
      idade: '',
      sexo: '',
      provincia: '',
      data: new Date()
    }
  ]);

  const scrollRef = useRef(null);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPassenger = () => {
    setPassengers(prev => [...prev, {
      nomeCompleto: '',
      telefone: '',
      idade: '',
      sexo: '',
      provincia: '',
      data: new Date()
    }]);
    
    // Scroll to the last passenger after a short delay
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          left: scrollRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
      setActivePassengerIndex(passengers.length);
    }, 100);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter((_, i) => i !== index));
      
      // Adjust active index if necessary
      setActivePassengerIndex(Math.min(
        activePassengerIndex, 
        passengers.length - 2
      ));
    }
  };

  const form = useForm({
    resolver: zodResolver(PassengerSchema),
    defaultValues: {
      nomeCompleto: '',
      telefone: '',
      idade: '',
      sexo: undefined,
      provincia: '',
      data: new Date()
    }
  });

  const onFormChange = (field, value, index) => {
    setPassengers((prev) =>
      prev.map((passenger, i) =>
        i === index ? { ...passenger, [field]: value } : passenger
      )
    );
  };
  
  const onSubmit = () => {
    setIsSubmitting(true);
    console.log("All Passengers Data:", passengers);
  
    // Simulate submission process
    setTimeout(() => {
      setIsSubmitting(false);
      // Reset forms
      setPassengers([
        {
          nomeCompleto: '',
          telefone: '',
          idade: '',
          sexo: '',
          provincia: '',
          data: new Date(),
        },
      ]);
      setActivePassengerIndex(0);
    }, 2000);
  };

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Elegant Header */}
        <div className="bg-gradient-to-r from-orange-700 to-orange-800 text-white p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reserva de Passageiros</h1>
            <p className="text-orange-200 mt-2">Preencha os detalhes dos passageiros</p>
          </div>
          <UserPlusIcon className="h-12 w-12 text-white/80" />
        </div>

        {/* Passenger Navigation */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto space-x-4 p-4 bg-orange-50/50 passenger-scroll"
          style={{ 
            scrollSnapType: 'x mandatory', 
            WebkitOverflowScrolling: 'touch' 
          }}
        >
          <AnimatePresence>
            {passengers.map((passenger, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ opacity: 0, x: -50 }}
                className={cn(
                  "flex-shrink-0 w-full md:w-[500px] scroll-snap-align-start",
                  activePassengerIndex === index 
                    ? "ring-4 ring-orange-600/50 scale-[1.02]" 
                    : "opacity-70 hover:opacity-100"
                )}
                onClick={() => setActivePassengerIndex(index)}
              >
                <Card className="w-full border-orange-200 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span>Passageiro {index + 1}</span>
                      </div>
                      {passengers.length > 1 && (
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => removePassenger(index)}
                          className="bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="nomeCompleto"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-orange-800">Nome Completo</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Digite seu nome completo" 
                                  {...field} 
                                  value={passenger.nomeCompleto}
                                  onChange={(e) => onFormChange('nomeCompleto', e.target.value, index)}
                                  className="focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                />
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                        

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="telefone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-orange-800">Número de Telefone</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: 123456789" 
                                    {...field} 
                                    value={passenger.telefone}
                onChange={(e) => onFormChange('telefone', e.target.value, index)}
                                    type="tel"
                                    className="focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="idade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-orange-800">Idade</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Sua idade" 
                                    {...field} 
                                    type="number"
                                    value={passenger.idade}
                                    onChange={(e) => onFormChange('idade', e.target.value, index)}
                                    className="focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="sexo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-orange-800">Sexo</FormLabel>
                              <FormControl>
                                <RadioGroup
                                   onValueChange={(value) => onFormChange('sexo', value, index)}
                                  defaultValue={field.value}
                                  className="flex space-x-4"
                                >
                                  {["Masculino", "Feminino"].map((gender) => (
                                    <div key={gender} className="flex items-center space-x-2">
                                      <RadioGroupItem 
                                        value={gender} 
                                        id={gender.toLowerCase()} 
                                        className="text-orange-600 focus:ring-orange-600"
                                      />
                                      <Label 
                                        htmlFor={gender.toLowerCase()} 
                                        className="text-orange-900"
                                      >
                                        {gender}
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="provincia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-orange-800">Província</FormLabel>
                              <Select 
                                value={passenger.provincia}
                                onValueChange={(value) => onFormChange('provincia', value, index)}
                               
                              >
                                <FormControl>
                                  <SelectTrigger className="focus:ring-2 focus:ring-orange-600">
                                    <SelectValue placeholder="Selecione uma província" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {provinces.map((province) => (
                                    <SelectItem 
                                      key={province} 
                                      value={province}
                                      className="hover:bg-orange-100 focus:bg-orange-100"
                                    >
                                      {province}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="data"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-orange-800">Data de Partida</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "pl-3 text-left font-normal border-orange-300 hover:bg-orange-50 hover:border-orange-500",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Escolha uma data</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 text-orange-600 opacity-70" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                   selected={passenger.data}
                                   onChange={(date) => onFormChange('data', date, index)}
                                    mode="single"
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                    classNames={{
                                      caption: "bg-orange-100",
                                      day_selected: "bg-orange-700 hover:bg-orange-800",
                                      day_today: "bg-orange-100 text-orange-900"
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 p-6 bg-orange-50">
          <Button 
            onClick={addPassenger}
            variant="outline" 
            className="border-orange-700 text-orange-700 hover:bg-orange-100 flex items-center"
          >
            <PlusIcon className="mr-2 h-5 w-5" /> Adicionar Passageiro
          </Button>
          
          <Button 
            onClick={() => form.handleSubmit(onSubmit)()}disabled={isSubmitting}
            className="bg-orange-700 hover:bg-orange-800 flex items-center"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processando...
              </div>
            ) : (
              <>
                <CheckIcon className="mr-2 h-5 w-5" /> Confirmar Reserva
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}