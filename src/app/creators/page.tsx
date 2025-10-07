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
import { CREATORS } from '@/lib/placeholder-data';
import { PlusCircle, Globe, ChevronRight } from 'lucide-react';

export default function CreatorsPage() {
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CREATORS.map((creator) => (
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
    </div>
  );
}
