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

  // Wir zeigen das Sidebar-Layout immer an, sobald die Seite lädt.
  // Falls Firebase noch lädt, zeigen wir einen Spinner im Inhaltsbereich.
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex min-h-screen w-full bg-background">
        <SiteSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SiteHeader />
          <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {error ? (
              <div className="max-w-md mx-auto mt-12">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verbindungsfehler</AlertTitle>
                  <AlertDescription>
                    Die Verbindung zur Datenbank konnte nicht hergestellt werden. Bitte prüfe, ob Firestore in der Console aktiviert ist.
                  </AlertDescription>
                </Alert>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-headline text-lg italic">
                  Datenbank wird geladen...
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
