
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
import { AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    initializeFirebase()
      .then(setFirebase)
      .catch((err) => {
        console.error("Failed to initialize Firebase", err);
        setError(err);
      });
  }, []);

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
              {error ? (
                <div className="max-w-2xl mx-auto mt-8">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Firebase-Verbindung fehlgeschlagen</AlertTitle>
                    <AlertDescription>
                      Die App konnte keine Verbindung zur Datenbank herstellen. Bitte laden Sie die Seite neu oder prüfen Sie Ihre Internetverbindung.
                      <pre className="mt-2 text-xs overflow-auto">{error.message}</pre>
                    </AlertDescription>
                  </Alert>
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
