'use client'; // Make it a Client Component

import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/toaster";
import InstallPwaButton from '@/app/components/InstallPwaButton';
import MobileAppBar from '@/components/MobileAppBar';
import DesktopDrawerNav from '@/components/DesktopDrawerNav'; // Import the new component
import { AuthProvider } from '@/context/AuthContext'; // Import the AuthProvider
import WhatsappButton from '@/components/WhatsappButton'; // Import the new WhatsappButton

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  // Paths where BOTH nav bars should be hidden
  const hiddenNavPaths = ['/obrigado', '/login', '/signup'];

  // Check if the current path is one where navigation should be hidden entirely
  const shouldHideNav = hiddenNavPaths.includes(pathname);

  return (
    <AuthProvider> {/* Wrap content with AuthProvider */}
      {children}
      {/* Render client-side components here */}
      <InstallPwaButton />

      {/* Conditionally render navigation based on path */}
      {!shouldHideNav && (
        <>
          {/* DesktopDrawerNav already includes 'hidden md:flex' */}
          <DesktopDrawerNav />
          {/* MobileAppBar already includes 'md:hidden' */}
          <MobileAppBar />
        </>
      )}

      <WhatsappButton /> {/* Add the WhatsappButton here */}
      <Toaster />
    </AuthProvider>
  );
}
