'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Mail, Phone, MapPin, Loader2, LogOut, CalendarDays, UserCheck } from 'lucide-react'; // Added icons
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"; // Import Button
import { useToast } from "@/hooks/use-toast"; // Import useToast

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('pt-PT'); // Format for Portugal/Angola
  } catch (e) {
    return 'Data inválida';
  }
};

export default function PerfilPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(); // Fetch single profile linked to the user ID

        if (error) {
          console.error('Error fetching profile:', error);
          toast({ title: "Erro", description: "Não foi possível carregar o perfil.", variant: "destructive" });
        } else {
          setProfile(data);
        }
      } else {
        // This case should ideally be handled by middleware, but as a fallback:
        router.push('/login');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [supabase, router, toast]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setIsLoggingOut(false);
    if (error) {
      console.error('Logout error:', error);
      toast({ title: "Erro ao Sair", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sessão terminada." });
      router.push('/login'); // Redirect to login after logout
      router.refresh(); // Ensure layout state updates
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-gray-900 to-black">
        <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
     // This might show briefly if fetch fails before redirect
     return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-gray-900 to-black text-white">
            <p>Perfil não encontrado ou erro ao carregar.</p>
        </div>
     );
  }

  // Construct placeholder image URL using a part of the user ID for consistency
  const profilePicSeed = profile.id.substring(0, 8); // Use first 8 chars of UUID as seed
  const profilePicUrl = `https://picsum.photos/seed/${profilePicSeed}/200/200`;

  return (
    // Added bottom padding pb-20 md:pb-8
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-gray-900 to-black text-white p-4 md:p-8 flex flex-col items-center pt-12 md:pt-16 pb-20 md:pb-8">
      {/* Removed card styling (bg, backdrop, rounded, shadow, p-*, border) from this div */}
      <div className="w-full max-w-md"> 
        {/* Profile Picture */}
        <div className="flex justify-center mb-6">
          {/* Kept profile picture styling */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg">
            <Image
              src={profilePicUrl} // Use dynamic seed
              alt="Foto de Perfil"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-4"> {/* Reduced spacing slightly */}
          <InfoItem icon={User} label="Nome" value={profile.nome || 'N/A'} />
          <InfoItem icon={UserCheck} label="Sexo" value={profile.sexo || 'N/A'} />
          <InfoItem icon={CalendarDays} label="Data Nasc." value={formatDate(profile.data_nascimento)} />
          {/* Consider masking BI number partially if needed */}
          <InfoItem icon={User} label="Nº BI" value={profile.numero_bi || 'N/A'} />
          <InfoItem icon={Phone} label="Telefone" value={profile.telefone || 'N/A'} />
          {/* Email is derived, not stored in profiles table */}
       </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleLogout}
            variant="destructive" // Use destructive variant for logout
            className="w-full max-w-xs bg-red-600 hover:bg-red-700"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Terminar Sessão
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper component for info items
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-700/60 rounded-lg text-sm md:text-base">
    <Icon className="text-orange-400 h-5 w-5 flex-shrink-0" />
    <span className="text-gray-300 font-medium w-24 md:w-28 flex-shrink-0">{label}:</span>
    <span className="font-normal text-white break-words">{value}</span>
  </div>
);
