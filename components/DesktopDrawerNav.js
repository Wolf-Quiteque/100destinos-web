'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Compass, Bus, Search, Ticket, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// Re-use navItems from MobileAppBar logic
const navItems = [
  { href: '/', label: 'Explora', icon: Compass },
  { href: '/viagens', label: 'Viagens', icon: Bus },
  { href: '/pesquisar', label: 'Pesquisar', icon: Search },
  { href: '/meus-bilhetes', label: 'Bilhetes', icon: Ticket },
  { href: '/perfil', label: 'Perfil', icon: User },
];

export default function DesktopDrawerNav() {
  const supabase = createClientComponentClient(); // Keep for profile fetch & logout
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { user, session, isLoading: isAuthLoading } = useAuth(); // Use context

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false); // Separate loading state for profile
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Effect to fetch profile when user context changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) { // Only fetch if user exists from context
        setLoadingProfile(true);
        setProfile(null); // Clear old profile while fetching
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('nome') // Fetch name
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile for nav:', error);
            setProfile(null);
          } else {
            setProfile(profileData);
          }
        } catch (err) {
           console.error('Unexpected error fetching profile:', err);
           setProfile(null);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setProfile(null); // Clear profile if no user
        setLoadingProfile(false); // Ensure loading is false
      }
    };

    // Don't fetch profile if auth is still loading
    if (!isAuthLoading) {
        fetchProfile();
    }
  }, [user, isAuthLoading, supabase]); // Depend on user from context

  const handleLogout = async () => {
    setIsPopoverOpen(false); // Close popover first
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      toast({ title: "Erro ao Sair", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sessão terminada." });
      // Context listener will handle setting user/profile to null
      router.push('/login'); // Redirect to login after logout
      router.refresh(); // Ensure layout state updates
    }
  };

  const isLoading = isAuthLoading || loadingProfile; // Combined loading state

  return (
    // Use hidden and md:flex to show only on medium screens and up
    <div className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-20 bg-transparent items-center justify-between px-6 lg:px-10">
      {/* Left: Drawer Trigger */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="left">
        <DrawerTrigger asChild>
          <Button variant="outline" size="icon" className="bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-100 focus-visible:ring-orange-500 w-12 h-12">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir Menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 text-white border-none outline-none h-full max-h-screen w-72 rounded-r-2xl shadow-2xl">
          {/* Added DrawerHeader with visually hidden title for accessibility */}
          <DrawerHeader className="sr-only">
            <DrawerTitle>Menu Principal</DrawerTitle>
            <DrawerDescription>Navegação principal do aplicativo</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 border-b border-orange-400/30">
             <img src='/logo/logoff.webp' alt="Logo" className="h-10 mb-2"/>
             <p className="text-orange-100 text-sm">Navegue pelo aplicativo</p>
          </div>
          <nav className="flex-grow px-4 py-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              // Conditionally hide Perfil/Bilhetes if not logged in
              if (['/perfil', '/meus-bilhetes'].includes(item.href) && !user && !isAuthLoading) {
                return null;
              }
              const isActive = pathname === item.href;
              return (
                <DrawerClose key={item.label} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ease-in-out transform hover:translate-x-1',
                      isActive
                        ? 'bg-white/20 text-white shadow-inner'
                        : 'text-orange-50 hover:bg-white/10 hover:text-white'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsDrawerOpen(false)} // Close drawer on link click
                  >
                    <item.icon className="h-5 w-5 mr-4 flex-shrink-0" strokeWidth={2} />
                    {item.label}
                  </Link>
                </DrawerClose>
              );
            })}
          </nav>
          <DrawerFooter className="p-4 border-t border-orange-400/30 mt-auto">
            <DrawerClose asChild>
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 w-full">Fechar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Right: Profile/Login */}
      <div className="relative">
        {isLoading ? ( // Use combined loading state
          <div className="h-12 w-12 rounded-full bg-gray-300/50 animate-pulse"></div>
        ) : user ? ( // Use user from context
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              {/* Style: Orange background with opacity, white icon */}
              <Button className="relative h-12 w-12 rounded-full bg-orange-500/80 hover:bg-orange-500 text-white shadow-lg p-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-400 focus-visible:ring-offset-gray-900">
                <User className="h-6 w-6" />
                <span className="sr-only">Abrir menu do usuário</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 mr-4 md:mr-8 bg-white border-gray-300 shadow-xl rounded-lg p-2 mt-2">
              <div className="space-y-1">
                <div className="px-3 py-2 border-b border-gray-200 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile?.nome || user.email} {/* Display profile name or email */}
                  </p>
                </div>
                <Link
                  href="/perfil"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsPopoverOpen(false)}
                >
                  <User className="mr-2 h-4 w-4 text-gray-500" />
                  Ver Perfil
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Terminar Sessão
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="bg-white/90 text-orange-600 hover:bg-white rounded-full px-5 py-2 text-sm font-semibold shadow-md transition-all hover:shadow-lg" onClick={() => router.push('/login')}>
              Entrar
            </Button>
            <Button className="bg-orange-500 text-white hover:bg-orange-600 rounded-full px-5 py-2 text-sm font-semibold shadow-md transition-all hover:shadow-lg" onClick={() => router.push('/signup')}>
              Registar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
