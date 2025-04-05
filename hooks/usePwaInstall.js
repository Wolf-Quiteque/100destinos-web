"use client";

import { useState, useEffect } from 'react';

export function usePwaInstall() {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false); // Optional: track installation status

  useEffect(() => {
    const beforeInstallPromptHandler = (event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(event);
      console.log("beforeinstallprompt event captured");
    };

    const appInstalledHandler = () => {
      // Clear the deferred prompt variable
      setInstallPromptEvent(null);
      setIsAppInstalled(true);
      console.log('PWA was installed');
    };

    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
       setIsAppInstalled(true);
    } else {
       window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
       window.addEventListener('appinstalled', appInstalledHandler);
    }


    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const triggerInstallPrompt = async () => {
    if (!installPromptEvent) {
      console.log("Install prompt event not available.");
      return;
    }
    // Show the install prompt
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPromptEvent.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, clear it
    setInstallPromptEvent(null);
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
    }
  };

  // Return null for installPromptEvent if already installed
  const promptAvailable = !isAppInstalled && !!installPromptEvent;

  return { triggerInstallPrompt, promptAvailable, isAppInstalled };
}
