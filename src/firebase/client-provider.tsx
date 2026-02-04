
'use client';

import { useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';
import { Loader2 } from 'lucide-react';
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
    initializeFirebase().then(setFirebase);
  }, []);

  // Wir rendern die Shell (Navigation) immer, damit der Nutzer nicht vor einem leeren Bildschirm steht.
  // Nur der Inhalt der 'main'-Sektion wartet auf Firebase.
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
              {!firebase ? (
                <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground animate-pulse font-headline">
                    Datenbank wird verbunden...
                  </p>
                </div>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </FirebaseProvider>
  );
}
