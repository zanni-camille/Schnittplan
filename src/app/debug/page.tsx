'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, getDocs, limit, query, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, XCircle, Loader2, Database, ShieldAlert, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DebugPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isTesting, setIsTesting] = useState(false);
  const [dbStatus, setDbStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [configInfo, setConfigInfo] = useState<{
    envFound: boolean;
    runtimeConfig: any;
  }>({ envFound: false, runtimeConfig: null });

  useEffect(() => {
    // Check for config
    const config = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
    setConfigInfo({
      envFound: !!config,
      runtimeConfig: config ? "Vorhanden (maskiert)" : "Nicht gefunden",
    });
  }, []);

  const handleTestConnection = async () => {
    if (!firestore) return;
    setIsTesting(true);
    setErrorMsg(null);
    setDbStatus('idle');

    try {
      // 1. Einfacher Lese-Versuch
      const testCol = collection(firestore, '_connection_test');
      const q = query(testCol, limit(1));
      await getDocs(q);
      
      // 2. Einfacher Schreib-Versuch
      await addDoc(testCol, {
        timestamp: serverTimestamp(),
        testBy: user?.email || 'anonymous',
      });

      setDbStatus('success');
      toast({
        title: "Verbindung erfolgreich!",
        description: "Daten konnten gelesen und geschrieben werden.",
      });
    } catch (err: any) {
      console.error("Debug test failed:", err);
      setDbStatus('error');
      setErrorMsg(err.message || "Unbekannter Fehler beim Zugriff auf Firestore.");
      toast({
        variant: "destructive",
        title: "Verbindung fehlgeschlagen",
        description: err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Wifi className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight font-headline">Datenbank-Diagnose</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Konfigurations-Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Konfiguration
            </CardTitle>
            <CardDescription>Status der Firebase-Umgebungsvariablen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Umgebungsvariable:</span>
              <Badge variant={configInfo.envFound ? "default" : "destructive"}>
                {configInfo.envFound ? "Gefunden" : "Fehlt"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Laufzeit-Status:</span>
              <span className="text-sm text-muted-foreground">{configInfo.runtimeConfig}</span>
            </div>
            <p className="text-xs text-muted-foreground italic">
              Hinweis: Wenn die Konfiguration fehlt, stelle sicher, dass das Projekt in Firebase Studio korrekt verknüpft ist.
            </p>
          </CardContent>
        </Card>

        {/* Live-Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5" />
              Verbindungstest
            </CardTitle>
            <CardDescription>Versuche eine Test-Operation in Firestore</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center py-6">
            {dbStatus === 'idle' && !isTesting && (
              <p className="text-sm text-muted-foreground mb-4">Klicke auf den Button, um die Schreib-/Leserechte zu prüfen.</p>
            )}
            
            {isTesting && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm">Teste Firestore Zugriff...</span>
              </div>
            )}

            {dbStatus === 'success' && (
              <div className="flex flex-col items-center gap-2 text-green-600">
                <CheckCircle2 className="h-10 w-10" />
                <span className="font-bold">Verbunden & Schreibbereit!</span>
              </div>
            )}

            {dbStatus === 'error' && (
              <div className="flex flex-col items-center gap-2 text-destructive">
                <XCircle className="h-10 w-10" />
                <span className="font-bold">Fehler beim Zugriff</span>
                <p className="text-xs mt-2 p-2 bg-destructive/10 rounded border border-destructive/20 max-w-full overflow-auto">
                  {errorMsg}
                </p>
              </div>
            )}

            <Button 
              className="w-full mt-4" 
              onClick={handleTestConnection} 
              disabled={isTesting}
            >
              {isTesting ? "Wird geprüft..." : "Jetzt testen"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Informationen zur Fehlerbehebung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <p>
            <strong>"Missing or insufficient permissions":</strong> Deine Firestore-Regeln im Produktionsmodus blockieren den Zugriff. Gehe in der Firebase Console zu "Firestore Database" &gt; "Rules" und erlaube den Zugriff für Testzwecke oder konfiguriere die Regeln.
          </p>
          <p>
            <strong>"404 Not Found" (Konfiguration):</strong> Die App kann die Konfigurationsdatei nicht vom Server laden. Dies passiert oft, wenn die Umgebungsvariable <code>NEXT_PUBLIC_FIREBASE_CONFIG</code> lokal nicht gesetzt ist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
