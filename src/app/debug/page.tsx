
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { CheckCircle2, XCircle, Loader2, Database, ShieldAlert, Wifi, RefreshCcw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
            region: "Zürich (europe-west12)"
          },
        });
      } catch (e) {
        setConfigInfo({ envFound: false, configData: "Fehler beim Parsen der Umgebungsvariable" });
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
      const testCol = collection(firestore, '_debug_test');
      const testDoc = await addDoc(testCol, {
        timestamp: serverTimestamp(),
        message: "Verbindungstest erfolgreich",
        user: user?.uid || 'anonymous'
      });
      
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

      {!configInfo.envFound && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Konfiguration fehlt (404)
            </CardTitle>
            <CardDescription>
              Die App kann keine Verbindung zu Firebase herstellen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background rounded-lg border text-sm space-y-2">
              <p className="font-bold">Lösungsschritte:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Klicke in Firebase Studio oben auf das <strong>Firebase-Icon</strong> oder die <strong>Einstellungen</strong>.</li>
                <li>Stelle sicher, dass ein aktives Projekt ausgewählt ist.</li>
                <li>Falls bereits verknüpft, klicke auf "Projekt aktualisieren" oder "Verbindung neu laden".</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-blue-500" />
              Status-Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
              <span>Umgebungsvariable:</span>
              <Badge variant={configInfo.envFound ? "default" : "destructive"}>
                {configInfo.envFound ? "Gefunden" : "Fehlt"}
              </Badge>
            </div>
            
            {configInfo.configData && (
              <div className="p-3 bg-muted/30 rounded-lg text-xs font-mono space-y-1">
                <p>Projekt-ID: {configInfo.configData.projectId}</p>
                <p>Region: {configInfo.configData.region}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-orange-500" />
              Live-Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {dbStatus === 'success' ? (
              <div className="py-4 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <h3 className="font-bold">Verbunden</h3>
              </div>
            ) : dbStatus === 'error' ? (
              <div className="py-4 flex flex-col items-center gap-2">
                <XCircle className="h-12 w-12 text-destructive" />
                <p className="text-xs text-destructive px-2 line-clamp-3">{errorMsg}</p>
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center gap-2">
                <Loader2 className={cn("h-12 w-12 text-muted-foreground", isTesting && "animate-spin")} />
                <p className="text-xs text-muted-foreground">Warte auf Test...</p>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleTestConnection} 
              disabled={isTesting || !firestore}
            >
              {isTesting ? "Teste..." : "Verbindung prüfen"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
