'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Bus, Search, Ticket, User } from 'lucide-react'; // Changed Plane to Bus
import { cn } from '@/lib/utils'; // Assuming you have this utility function from shadcn/ui setup

const navItems = [
  { href: '/', label: 'Explora', icon: Compass }, // Changed href to /
  { href: '/viagens', label: 'Viagens', icon: Bus },     // Changed href and label, icon already changed above
  { href: '/pesquisar', label: 'Pesquisar', icon: Search },
  { href: '/meus-bilhetes', label: 'Bilhetes', icon: Ticket }, // Changed href
  { href: '/perfil', label: 'Perfil', icon: User },       // Changed href
];

// Paths where the MobileAppBar should be hidden
const hiddenPaths = ['/bilhetes', '/pagamento', '/login', '/signup']; // Added login and signup

export default function MobileAppBar() {
  const pathname = usePathname();

  // Check if the current path starts with any of the hidden paths
  const isHidden = hiddenPaths.some(path => pathname.startsWith(path));

  if (isHidden) {
    return null; // Don't render the component if the path matches
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-orange-500 shadow-lg z-50 rounded-t-2xl">
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center text-white transition-colors duration-200 ease-in-out p-2 rounded-lg',
                isActive ? 'bg-orange-600 scale-110' : 'hover:bg-orange-400'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                className="h-6 w-6 mb-1"
                strokeWidth={2} // Thicker icons
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
