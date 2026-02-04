
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
import { AlertCircle, Loader2, Database, WifiOff } from 'lucide-react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      });
  }, []);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex min-h-screen w-full bg-background">
        <SiteSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SiteHeader />
          <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {error ? (
              <div className="max-w-2xl mx-auto mt-12 space-y-6">
                <Alert variant="destructive" className="border-2">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle className="text-lg font-bold">Verbindungsproblem</AlertTitle>
                  <AlertDescription className="mt-2 text-base">
                    {error.message}
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-4">
                  <div className="bg-card p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                      <Database className="h-6 w-6" />
                      <h3 className="text-xl font-bold">Nächste Schritte</h3>
                    </div>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">1.</span>
                        <span>Gehe zur <strong>Debug-Seite</strong>, um die genaue Konfiguration zu sehen.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">2.</span>
                        <span>Stelle sicher, dass du das Projekt in Firebase Studio korrekt verbunden hast.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">3.</span>
                        <span>Lade die Seite neu (F5), sobald die Konfiguration bereitsteht.</span>
                      </li>
                    </ul>
                    <Button asChild className="w-full mt-6" variant="outline">
                      <Link href="/debug">Zur Diagnose-Seite</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-headline text-xl italic">
                  Initialisiere SchnittPlan...
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
