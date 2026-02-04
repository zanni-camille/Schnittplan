
'use client';

import { useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SiteSidebar } from '@/components/layout/site-sidebar';
import { SiteHeader } from '@/components/layout/site-header';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [firebase, setFirebase] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
  } | null>(null);

  useEffect(() => {
    // Initialisierung erfolgt im Hintergrund
    initializeFirebase().then(setFirebase);
  }, []);

  // Wir rendern die Shell (Navigation) immer sofort.
  // Die FirebaseProvider erhält die Instanzen, sobald sie verfügbar sind.
  return (
    <FirebaseProvider
      app={firebase?.app as FirebaseApp}
      auth={firebase?.auth as Auth}
      firestore={firebase?.firestore as Firestore}
    >
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full">
          <SiteSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <SiteHeader />
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
              {/* Wir zeigen die children (die Seite) sofort an. 
                  Die Komponenten darin kümmern sich selbst um ihre Ladezustände. */}
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </FirebaseProvider>
  );
}
