'use client';

import { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handlePermissionError = (err: FirestorePermissionError) => {
      setError(err);
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-md animate-in slide-in-from-right-full">
      <Alert variant="destructive" className="bg-destructive text-destructive-foreground relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-1 top-1 h-6 w-6 text-destructive-foreground hover:bg-white/20"
          onClick={() => setError(null)}
        >
          <X className="h-4 w-4" />
        </Button>
        <AlertCircle className="h-4 w-4 stroke-white" />
        <AlertTitle className="font-bold">Zugriff verweigert (Firestore)</AlertTitle>
        <AlertDescription className="mt-2 text-xs space-y-1">
          <p><strong>Pfad:</strong> {error.context.path}</p>
          <p><strong>Aktion:</strong> {error.context.operation}</p>
          <p className="mt-2 opacity-90 italic">
            Im Produktionsmodus müssen Security Rules konfiguriert werden, um Schreib-/Lesezugriffe zu erlauben.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
