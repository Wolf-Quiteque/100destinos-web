
import "./globals.css";

import UserButton from "@/components/UserButton";
import { Toaster } from "@/components/ui/toaster"
import FuturisticNavBar from "@/components/FuturisticNavBar";
export const metadata = {
  title: "100 Destinos",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {


  

  return (
    <html lang="en">
      <body
    
      >
        {children}
        {/* <FuturisticNavBar /> */}
        <Toaster />
      </body>
    </html>
  );
}
