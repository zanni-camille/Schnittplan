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
import { AlertCircle, Loader2, Database } from 'lucide-react';
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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex min-h-screen w-full bg-background">
        {/* Die Sidebar wird JETZT IMMER gerendert */}
        <SiteSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SiteHeader />
          <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {error ? (
              <div className="max-w-2xl mx-auto mt-12 space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Firebase Verbindungsfehler</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="font-semibold">{error.message}</p>
                    <p className="mt-2 text-sm opacity-90">
                      Dieser Fehler tritt meistens auf, wenn die Firebase-Konfiguration noch nicht bereitgestellt wurde oder die Firestore-Datenbank in der Console noch nicht aktiviert ist.
                    </p>
                  </AlertDescription>
                </Alert>
                <div className="bg-muted p-6 rounded-lg border border-dashed flex flex-col items-center text-center">
                  <Database className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">Was kannst du tun?</h3>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 text-left list-disc list-inside">
                    <li>Prüfe, ob Firestore in der Firebase Console erstellt wurde.</li>
                    <li>Stelle sicher, dass du im "Testmodus" oder mit korrekten Regeln startest.</li>
                    <li>Nutze den "Verbindungstest" in der Sidebar für Details.</li>
                  </ul>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-headline text-lg italic">
                  Verbindung zur Datenbank wird aufgebaut...
                </p>
              </div>
            ) : (
              <FirebaseProvider
                app={firebase!.app}
                auth={firebase!.auth}
                firestore={firebase!.firestore}
              >
                {children}
                <FirebaseErrorListener />
              </FirebaseProvider>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
