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
import { PlusCircle, Globe } from 'lucide-react';

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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Designer hinzufügen
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CREATORS.map((creator) => (
          <Card key={creator.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${creator.name}.png`} alt={creator.name} />
                  <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline text-2xl">{creator.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {creator.url && (
                <Button variant="ghost" asChild className="text-muted-foreground">
                  <Link href={creator.url} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" />
                    Webseite besuchen
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
