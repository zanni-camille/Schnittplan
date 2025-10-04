import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PATTERNS,
  CREATORS,
  FABRICS,
  CATEGORIES,
  TARGET_GROUPS,
} from '@/lib/placeholder-data';
import { ExternalLink, Paperclip, SewingPin, Tag, Users, Fabric } from 'lucide-react';

export default function PatternDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const pattern = PATTERNS.find((p) => p.id === params.id);

  if (!pattern) {
    notFound();
  }

  const creator = CREATORS.find((c) => c.id === pattern.creatorId);
  const targetGroup = TARGET_GROUPS.find((tg) => tg.id === pattern.targetGroupId);
  const categories = CATEGORIES.filter((c) => pattern.categoryIds.includes(c.id));
  const fabrics = FABRICS.filter((f) => pattern.fabricIds.includes(f.id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden">
            <div className="aspect-[3/4] relative">
              <Image
                src={pattern.imageUrl}
                alt={pattern.title}
                fill
                className="object-cover"
                data-ai-hint={pattern.imageHint}
              />
            </div>
          </Card>
          
          {pattern.url && (
            <Button asChild className="w-full">
              <Link href={pattern.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Muster ansehen
              </Link>
            </Button>
          )}

          {pattern.pdfUrl && (
             <Button asChild variant="secondary" className="w-full">
               <Link href={pattern.pdfUrl} target="_blank" rel="noopener noreferrer">
                 <Paperclip className="mr-2 h-4 w-4" />
                 PDF herunterladen
               </Link>
             </Button>
           )}
        </div>

        <div className="md:col-span-2 space-y-8">
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              {creator?.name || 'Unbekannter Designer'}
            </p>
            <h1 className="text-4xl font-bold tracking-tight font-headline mt-1">
              {pattern.title}
            </h1>
          </div>

          {pattern.description && (
            <p className="text-lg text-muted-foreground">{pattern.description}</p>
          )}

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SewingPin />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold mr-2">Zielgruppe:</span>
                    <Badge variant="secondary">{targetGroup?.name}</Badge>
                </div>
                <div className="flex items-start gap-2">
                    <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <span className="font-semibold mr-2 shrink-0">Kategorien:</span>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <Badge key={cat.id} variant="secondary">
                                {cat.name}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Fabric className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <span className="font-semibold mr-2 shrink-0">Stoffe:</span>
                    <div className="flex flex-wrap gap-2">
                        {fabrics.map((fab) => (
                            <Badge key={fab.id} variant="secondary">
                                {fab.name}
                            </Badge>
                        ))}
                    </div>
                </div>
              </CardContent>
            </Card>

            {creator?.url && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Über den Designer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Besuchen Sie die Website von {creator.name} für weitere Schnittmuster.
                  </p>
                  <Button asChild variant="outline">
                    <Link href={creator.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Website besuchen
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
