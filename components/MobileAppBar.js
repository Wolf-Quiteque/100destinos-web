'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
import { Compass, Bus, Search, Ticket, User, X } from 'lucide-react'; // Import X icon
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const baseNavItems = [
  { href: '/', label: 'Explora', icon: Compass },
  { href: '/viagens', label: 'Viagens', icon: Bus },
  { href: '/pesquisar', label: 'Pesquisar', icon: Search },
  { href: '/meus-bilhetes', label: 'Bilhetes', icon: Ticket, requiresAuth: true }, // Mark as requiring auth
  { href: '/perfil', label: 'Perfil', icon: User, requiresAuth: true }, // Mark as requiring auth
];

// Paths where the MobileAppBar should be hidden
const hiddenPaths = [ '/pagamento', '/login', '/signup']; // Added login and signup

export default function MobileAppBar() {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router
  const { user, isLoading: isAuthLoading } = useAuth(); // Use context

  const isbilhetespage = pathname === '/bilhetes';

  // Check if the current path starts with any of the hidden paths
  const isHidden = hiddenPaths.some(path => pathname.startsWith(path) && path !== '/pesquisar');

  if (isHidden) {
    return null; // Don't render the component if the path matches
  }

  // Filter nav items based on authentication status
  const navItems = baseNavItems.filter(item => {
    // If item requires auth, only show if user exists and auth is not loading
    if (item.requiresAuth) {
      return !isAuthLoading && !!user;
    }
    // Otherwise, always show
    return true;
  });

  // Specific layout for /pesquisar page - Just the button
  if (isbilhetespage) {
    return (
      <button
        onClick={() => router.push('/')} // Navigate to home page
        className={cn(
          "md:hidden fixed bottom-[3px] left-1/2 -translate-x-1/2 z-50", // Fixed position bottom center, 3px up
          "w-14 h-14 bg-orange-600 rounded-full", // Made button smaller
          "flex items-center justify-center text-white",
          "shadow-lg", // Add shadow
          "hover:bg-orange-700 transition-colors duration-200 ease-in-out" // Hover effect
        )}
        aria-label="Ir para Home"
      >
        <X className="h-7 w-7" strokeWidth={2.5} /> {/* Made icon smaller */}
      </button>
    );
  }

  // Default layout for other pages
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-orange-500 shadow-lg z-50 rounded-t-2xl"> {/* Reverted height and rounding */}
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-2">
        {/* Render filtered nav items */}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center text-white transition-colors duration-200 ease-in-out p-2 rounded-lg',
                isActive ? 'bg-orange-600 scale-110' : 'hover:bg-orange-400' // Keep original active/hover
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                className="h-6 w-6 mb-1"
                strokeWidth={2}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}