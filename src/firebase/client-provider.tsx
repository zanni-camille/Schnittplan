
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-headline text-xl">SchnittPlan wird geladen...</p>
      </div>
    );
  }

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
                    <AlertTitle>Datenbank-Verbindung fehlgeschlagen</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">Die App konnte keine Verbindung zur Cloud-Datenbank herstellen.</p>
                      <code className="text-xs bg-destructive/10 p-2 rounded block overflow-auto">
                        {error.message}
                      </code>
                      <p className="mt-4 text-sm italic">
                        Hinweis: Stellen Sie sicher, dass Ihr Firebase-Projekt korrekt konfiguriert ist.
                      </p>
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
