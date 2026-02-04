'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pen, Trash2, Scissors, CalendarCheck } from 'lucide-react';
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/carousel"
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { doc, deleteDoc, collection, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Project, Pattern } from '@/lib/definitions';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const userId = user?.uid || 'user-1';
  const id = params.id as string;

  const projectRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'users', userId, 'projects', id) : null
  , [firestore, userId, id]);
  const { data: project, loading: projectLoading } = useDoc<Project>(projectRef);

  const patternsQuery = useMemoFirebase(() => 
    firestore && project?.patternIds?.length 
      ? query(collection(firestore, 'users', userId, 'patterns'), where('id', 'in', project.patternIds)) 
      : null
  , [firestore, userId, project?.patternIds]);
  const { data: relatedPatterns } = useCollection<Pattern>(patternsQuery);

  if (projectLoading) return <div className="p-8 text-center">Wird geladen...</div>;
  if (!project) notFound();

  const handleDelete = async () => {
    if (!projectRef) return;
    try {
      await deleteDoc(projectRef);
      toast({
        title: 'Projekt gelöscht',
        description: `"${project.name}" wurde erfolgreich entfernt.`,
      });
      router.push('/projects');
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
            <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Projektliste
            </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="secondary" asChild>
                <Link href={`/projects/${id}/edit`}>
                    <Pen className="mr-2 h-4 w-4" />
                    Projekt bearbeiten
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
                    Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird das Projekt "{project.name}" dauerhaft gelöscht.
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
      
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-6">
          {project.imageUrls && project.imageUrls.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {project.imageUrls.map((url, index) => (
                  <CarouselItem key={index}>
                    <Card className="overflow-hidden">
                      <div className="aspect-video relative">
                        <Image
                          src={url}
                          alt={`${project.name} - Bild ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {project.imageUrls.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                  <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                </>
              )}
            </Carousel>
          ) : (
             <Card className="aspect-video flex items-center justify-center bg-muted/20 border-dashed">
                <p className="text-muted-foreground text-sm">Keine Projektbilder</p>
             </Card>
          )}
          {project.completionDates && project.completionDates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarCheck />
                  Fertigstellungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {project.completionDates.map((date, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      Teil {index + 1}: {format(new Date(date), 'dd. MMMM yyyy', { locale: de })}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-4xl">{project.name}</CardTitle>
              <CardDescription className="text-lg">{project.description || 'Keine Beschreibung vorhanden.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Fortschritt: {project.progress}%</h3>
                <Progress value={project.progress} />
              </div>
            </CardContent>
          </Card>

          <section>
            <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4 flex items-center gap-2">
              <Scissors />
              Zugehörige Schnittmuster
            </h2>
            {relatedPatterns && relatedPatterns.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedPatterns.map((pattern) => (
                  <Card key={pattern.id} className="overflow-hidden group transition-shadow hover:shadow-xl">
                    <Link href={`/patterns/${pattern.id}`} className="block">
                      <CardContent className="p-0">
                        <div className="aspect-[3/4] relative">
                          <Image
                            src={pattern.imageUrl}
                            alt={pattern.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      </CardContent>
                      <div className="p-4">
                          <h3 className="font-semibold truncate w-full">{pattern.title}</h3>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-muted/5">
                <p className="text-muted-foreground">Diesem Projekt sind noch keine Schnittmuster zugeordnet.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
