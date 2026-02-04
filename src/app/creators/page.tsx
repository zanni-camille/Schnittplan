'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, ChevronRight, Users } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Creator } from '@/lib/definitions';

export default function CreatorsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const userId = user?.uid || 'user-1';

  const creatorsQuery = useMemoFirebase(() => 
    firestore && userId ? query(collection(firestore, 'users', userId, 'creators')) : null
  , [firestore, userId]);
  const { data: creators, loading } = useCollection<Creator>(creatorsQuery);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Designer</h1>
          <p className="text-muted-foreground">
            Verwalte deine Lieblings-Schnittmuster-Designer und -Marken.
          </p>
        </div>
        <Button asChild>
          <Link href="/creators/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Designer hinzufügen
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
        </div>
      ) : creators && creators.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <Link href={`/creators/${creator.id}`} key={creator.id} className="block group">
              <Card className="transition-all group-hover:shadow-lg group-hover:border-primary/50 h-full">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${creator.name}.png`} alt={creator.name} />
                        <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <CardTitle className="font-headline text-2xl">{creator.name}</CardTitle>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Keine Designer gefunden</h3>
          <p className="text-muted-foreground mb-4">Füge Designer hinzu, um sie deinen Schnittmustern zuzuordnen.</p>
          <Button variant="outline" asChild>
            <Link href="/creators/new">Designer hinzufügen</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
