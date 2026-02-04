'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Scissors, FolderKanban } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Pattern, Project } from '@/lib/definitions';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const userId = user?.uid || 'user-1';

  const projectsQuery = useMemoFirebase(() => 
    firestore && userId ? query(collection(firestore, 'users', userId, 'projects'), limit(3)) : null
  , [firestore, userId]);
  const { data: activeProjects, loading: projectsLoading } = useCollection<Project>(projectsQuery);

  const patternsQuery = useMemoFirebase(() => 
    firestore && userId ? query(collection(firestore, 'users', userId, 'patterns'), limit(4)) : null
  , [firestore, userId]);
  const { data: recentPatterns, loading: patternsLoading } = useCollection<Pattern>(patternsQuery);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Übersicht
          </h1>
          <p className="text-muted-foreground">
            Willkommen zurück! Hier ist eine Übersicht deiner kreativen Welt.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/patterns/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Schnittmuster
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/projects">
               <PlusCircle className="mr-2 h-4 w-4" />
               Neues Projekt
            </Link>
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4 flex items-center gap-2">
          <FolderKanban className="h-6 w-6" />
          Aktive Projekte
        </h2>
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Card key={i} className="h-48 animate-pulse bg-muted" />)}
          </div>
        ) : activeProjects && activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden group transition-shadow hover:shadow-xl">
                <Link href={`/projects/${project.id}`} className="block h-full">
                  {project.imageUrls && project.imageUrls.length > 0 && (
                      <div className="relative aspect-video">
                          <Image 
                              src={project.imageUrls[0]}
                              alt={project.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                          />
                      </div>
                  )}
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription className="truncate">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Progress value={project.progress} />
                      <p className="text-sm text-muted-foreground">{project.progress}% abgeschlossen</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Noch keine Projekte</h3>
            <p className="text-muted-foreground mb-4">Starte dein erstes Nähprojekt!</p>
            <Button variant="outline" asChild>
              <Link href="/projects">Projekt erstellen</Link>
            </Button>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4 flex items-center gap-2">
          <Scissors className="h-6 w-6" />
          Neueste Schnittmuster
        </h2>
        {patternsLoading ? (
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Card key={i} className="aspect-[3/4] animate-pulse bg-muted" />)}
          </div>
        ) : recentPatterns && recentPatterns.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recentPatterns.map((pattern) => (
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
          <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center">
            <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Keine Schnittmuster gefunden</h3>
            <p className="text-muted-foreground mb-4">Füge deine Schnittmuster zur Bibliothek hinzu.</p>
            <Button variant="outline" asChild>
              <Link href="/patterns/new">Schnittmuster hinzufügen</Link>
            </Button>
          </Card>
        )}
      </section>
    </div>
  );
}
