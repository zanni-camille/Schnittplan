'use client';

import Link from 'next/link';
import { notFound, useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Pen, Trash2, Globe, Scissors } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { doc, deleteDoc, collection, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Creator, Pattern } from '@/lib/definitions';

export default function CreatorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const userId = user?.uid || 'user-1';
  const id = params.id as string;

  const creatorRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'users', userId, 'creators', id) : null
  , [firestore, userId, id]);
  const { data: creator, loading: creatorLoading } = useDoc<Creator>(creatorRef);

  const patternsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'users', userId, 'patterns'), where('creatorId', '==', id)) : null
  , [firestore, userId, id]);
  const { data: relatedPatterns } = useCollection<Pattern>(patternsQuery);
  
  if (creatorLoading) return <div className="p-8 text-center">Wird geladen...</div>;
  if (!creator) notFound();

  const handleDelete = async () => {
    if (!creatorRef) return;
    try {
      await deleteDoc(creatorRef);
      toast({
        title: 'Designer gelöscht',
        description: `"${creator.name}" wurde erfolgreich entfernt.`,
      });
      router.push('/creators');
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Löschen fehlgeschlagen.',
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex items-center justify-between">
         <Button asChild variant="ghost">
            <Link href="/creators">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Designer-Liste
            </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="secondary" asChild>
                <Link href={`/creators/${id}/edit`}>
                    <Pen className="mr-2 h-4 w-4" />
                    Bearbeiten
                </Link>
            </Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Löschen</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bist du sicher?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird der Designer "{creator.name}" dauerhaft gelöscht.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-32 w-32 mb-4">
            <AvatarImage src={`https://avatar.vercel.sh/${creator.name}.png`} alt={creator.name} />
            <AvatarFallback className="text-5xl">{creator.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-bold tracking-tight font-headline">{creator.name}</h1>
        {creator.url && (
            <Button variant="link" asChild className="mt-2">
                <Link href={creator.url} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" />
                    Webseite besuchen
                </Link>
            </Button>
        )}
      </div>

      <section>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4 flex items-center gap-2">
          <Scissors />
          Schnittmuster von {creator.name}
        </h2>
        {relatedPatterns && relatedPatterns.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedPatterns.map((pattern) => (
                <Card key={pattern.id} className="overflow-hidden transition-transform hover:scale-105 hover:shadow-lg group">
                  <Link href={`/patterns/${pattern.id}`} className="block">
                    <CardContent className="p-0">
                      <div className="aspect-[3/4] relative">
                        <Image
                          src={pattern.imageUrl}
                          alt={pattern.title}
                          fill
                          className="object-cover"
                          data-ai-hint={pattern.imageHint}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold truncate">{pattern.title}</h3>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Von diesem Designer sind noch keine Schnittmuster in deiner Bibliothek.</p>
          </div>
        )}
      </section>
    </div>
  );
}
