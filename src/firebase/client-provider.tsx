
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

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
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeFirebase()
      .then((fb) => {
        setFirebase(fb);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to initialize Firebase", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-headline text-xl italic">
          Verbindung zur Datenbank wird hergestellt...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verbindungsfehler</AlertTitle>
            <AlertDescription>
              <p className="mt-2 text-sm">
                Die Firebase-Konfiguration konnte nicht geladen werden oder Firestore ist nicht aktiviert.
              </p>
              <div className="mt-4 p-2 bg-destructive/10 rounded text-[10px] overflow-auto">
                <p className="font-bold mb-1 underline">Mögliche Ursachen:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Firestore wurde in der Firebase Console noch nicht erstellt.</li>
                  <li>Das Projekt wurde noch nicht vollständig mit Firebase verknüpft.</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      app={firebase!.app}
      auth={firebase!.auth}
      firestore={firebase!.firestore}
    >
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full">
          <SiteSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <SiteHeader />
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
        <FirebaseErrorListener />
      </SidebarProvider>
    </FirebaseProvider>
  );
}
