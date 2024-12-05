"use client"
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bus, 
  Heart, 
  CreditCard, 
  User,
  Route,
  Telescope
} from 'lucide-react';

import { usePathname } from "next/navigation";


export default function FuturisticNavBar() {
  const [activeTab, setActiveTab] = useState('viagens');
  const [home, setHome] = useState(false);


  const navItems = [
    { 
      key: 'viagens', 
      label: 'Viagar', 
      icon: <Route className="text-orange-500" size={24} />
    },
    { 
      key: 'Explorar', 
      label: 'Explorar', 
      icon: <Telescope className="text-orange-500" size={24} />
    },
    { 
      key: 'pagamentos', 
      label: 'Facturas', 
      icon: <CreditCard className="text-orange-500" size={24} />
    },
    { 
      key: 'perfil', 
      label: 'Perfil', 
      icon: <User className="text-orange-500" size={24} />
    }
  ];

  const pathname = usePathname()

  useEffect(() => {
    console.log(pathname)
    if(pathname == "/"){
      setHome(false)
    }else{
      setHome(true)
    }
      

  }, [pathname]);


  return (
   <>
   {home && (<> <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 pb-6 pointer-events-none">
      <motion.nav 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20 
        }}
        className="w-[90%] max-w-md pointer-events-auto"
      >
        <div className="bg-white/30 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-2xl">
          <div className="flex justify-between items-center px-2">
            {navItems.map((item) => (
              <motion.button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex flex-col items-center justify-center 
                  py-2 px-3 rounded-2xl transition-all duration-300
                  ${activeTab === item.key 
                    ? 'bg-white' 
                    : 'hover:text-orange-600'
                  }
                `}
              >
                {item.icon}
                <span className={`
                  text-xs mt-1 font-medium 
                  ${activeTab === item.key 
                    ? 'text-orange-600' 
                    : 'text-white'
                  }
                `}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>
    </div> </>)}
   </>
  );
}