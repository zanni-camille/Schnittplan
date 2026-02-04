
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirebase, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, getDocs, limit, query, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { CheckCircle2, XCircle, Loader2, Database, ShieldAlert, Wifi, RefreshCcw } from 'lucide-react';
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
    configData: any;
  }>({ envFound: false, configData: null });

  useEffect(() => {
    const config = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
    if (config) {
      try {
        const parsed = JSON.parse(config);
        setConfigInfo({
          envFound: true,
          configData: {
            projectId: parsed.projectId,
            authDomain: parsed.authDomain,
            region: "Zürich (europe-west12/3)" // Manuelle Info aus User-Prompt
          },
        });
      } catch (e) {
        setConfigInfo({ envFound: false, configData: "Fehler beim Parsen" });
      }
    }
  }, []);

  const handleTestConnection = async () => {
    if (!firestore) {
      setDbStatus('error');
      setErrorMsg("Firestore Instanz nicht vorhanden. Initialisierung fehlgeschlagen.");
      return;
    }
    
    setIsTesting(true);
    setErrorMsg(null);
    setDbStatus('idle');

    try {
      // Test-Dokument erstellen
      const testCol = collection(firestore, '_debug_test');
      const testDoc = await addDoc(testCol, {
        timestamp: serverTimestamp(),
        message: "Verbindungstest erfolgreich",
        user: user?.uid || 'anonymous'
      });
      
      // Test-Dokument wieder löschen
      await deleteDoc(doc(firestore, '_debug_test', testDoc.id));

      setDbStatus('success');
      toast({
        title: "Test erfolgreich!",
        description: "Datenbank ist schreib- und lesebereit.",
      });
    } catch (err: any) {
      console.error("Debug test failed:", err);
      setDbStatus('error');
      setErrorMsg(err.message || "Unbekannter Fehler");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wifi className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight font-headline">Datenbank-Diagnose</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Neu laden
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-blue-500" />
              Umgebung & Konfig
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">Status</p>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span>Konfigurations-Variable:</span>
                <Badge variant={configInfo.envFound ? "default" : "destructive"}>
                  {configInfo.envFound ? "Aktiv" : "Fehlt"}
                </Badge>
              </div>
            </div>
            
            {configInfo.configData && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Details</p>
                <div className="p-3 bg-muted/30 rounded-lg text-sm font-mono space-y-1">
                  <p>Projekt: {configInfo.configData.projectId}</p>
                  <p>Region: {configInfo.configData.region}</p>
                </div>
              </div>
            )}
            
            {!configInfo.envFound && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                Warnung: Die App erhält keine Konfigurationsdaten. Bitte stelle sicher, dass das Firebase-Projekt verknüpft ist.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-500" />
              Funktionstest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center py-4">
            {dbStatus === 'success' ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h3 className="text-xl font-bold">Alles OK!</h3>
                <p className="text-sm text-muted-foreground">Die Test-Operation (Schreiben & Löschen) war erfolgreich.</p>
              </div>
            ) : dbStatus === 'error' ? (
              <div className="py-6 flex flex-col items-center gap-3">
                <XCircle className="h-16 w-16 text-destructive" />
                <h3 className="text-xl font-bold">Fehler</h3>
                <p className="text-sm text-destructive max-w-full overflow-hidden text-ellipsis px-4">
                  {errorMsg}
                </p>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center gap-3">
                <Loader2 className={cn("h-16 w-16 text-primary", isTesting && "animate-spin")} />
                <p className="text-sm text-muted-foreground">Bereit für den Verbindungstest.</p>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleTestConnection} 
              disabled={isTesting || !firestore}
            >
              {isTesting ? "Test läuft..." : "Verbindung jetzt testen"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase">Pro-Tipp für den Testmodus</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Da du die Datenbank im <strong>Testmodus</strong> erstellt hast, sind die Schreibrechte für 30 Tage offen. Sobald der Test hier "Erfolgreich" anzeigt, kannst du im <strong>Verwaltungs-Tab</strong> die Standarddaten (Kategorien etc.) generieren.
        </CardContent>
      </Card>
    </div>
  );
}
