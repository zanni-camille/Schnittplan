'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PROJECTS, PATTERNS } from '@/lib/placeholder-data';
import { ArrowLeft, Pen, Trash2, Scissors } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;

  const project = PROJECTS.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  const handleDelete = () => {
    console.log(`Deleting project ${project.id}`);
    toast({
      title: 'Projekt gelöscht',
      description: `"${project.name}" wurde erfolgreich entfernt.`,
    });
    router.push('/projects');
  };

  const relatedPatterns = PATTERNS.filter(pattern => project.patternIds.includes(pattern.id));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <Button asChild variant="ghost">
            <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zur Projektliste
            </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="secondary">
                <Pen className="mr-2 h-4 w-4" />
                Projekt bearbeiten
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
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">{project.name}</CardTitle>
          <CardDescription className="text-lg">{project.description}</CardDescription>
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
        {relatedPatterns.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                        data-ai-hint={pattern.imageHint}
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
          <p className="text-muted-foreground">Diesem Projekt sind keine Schnittmuster zugeordnet.</p>
        )}
      </section>
    </div>
  );
}
