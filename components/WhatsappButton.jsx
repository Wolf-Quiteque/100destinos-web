"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react"; // Using MessageCircle from lucide-react

const WhatsappButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-[60px] right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 bg-gradient-to-r from-orange-600 to-black text-white"
            aria-label="Contact via WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border border-orange-700 shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-400">Apoio Técnico</DialogTitle>
            <DialogDescription className="text-gray-300">
              Inicia conversa com apoio técnico  de 100 - destinos
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <a
              href="https://wa.me/244952995798"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full flex items-center space-x-2 transition-all duration-300 hover:scale-105">
                <MessageCircle className="h-5 w-5" />
                <span>Iniciar Conversa</span>
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsappButton;
