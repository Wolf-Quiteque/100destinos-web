"use client";

import React, { useState, useEffect } from 'react';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Download, Share } from 'lucide-react'; // Icons

export default function InstallPwaButton() {
  const { triggerInstallPrompt, promptAvailable, isAppInstalled } = usePwaInstall();
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    // Basic iOS detection
    const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
    setIsIos(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream);
  }, []);

  const handleInstallClick = () => {
    if (isIos) {
      // Show instructions for iOS
      setShowIosInstructions(true);
      // Optionally hide after a delay
      setTimeout(() => setShowIosInstructions(false), 10000); // Hide after 10 seconds
    } else if (promptAvailable) {
      triggerInstallPrompt();
    }
  };

  // Don't render anything if the app is already installed or if it's not iOS and the prompt isn't available
  if (isAppInstalled || (!isIos && !promptAvailable)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showIosInstructions && (
        <div className="mb-2 p-3 bg-background border rounded-md shadow-lg text-sm">
          To install, tap the Share button <Share size={14} className="inline-block mx-1" /> then 'Add to Home Screen'.
        </div>
      )}
      <Button
        onClick={handleInstallClick}
        aria-label={isIos ? "How to install PWA" : "Install PWA"}
        className="rounded-full p-3 shadow-lg" // Example styling
      >
        {isIos ? <Share size={20} /> : <Download size={20} />}
      </Button>
    </div>
  );
}
