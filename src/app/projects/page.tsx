'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, FolderKanban } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Project } from '@/lib/definitions';

export default function ProjectsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const userId = user?.uid || 'user-1';

  const [filter, setFilter] = useState('all');

  const projectsQuery = useMemoFirebase(() => 
    firestore && userId ? query(collection(firestore, 'users', userId, 'projects')) : null
  , [firestore, userId]);
  const { data: projects, loading } = useCollection<Project>(projectsQuery);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) => {
      if (filter === 'all') return true;
      if (filter === 'planned') return project.progress === 0;
      if (filter === 'started') return project.progress > 0 && project.progress < 100;
      if (filter === 'finished') return project.progress === 100;
      return true;
    });
  }, [projects, filter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Meine Projekte</h1>
          <p className="text-muted-foreground">
            Verwalte und verfolge deine Nähprojekte.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="planned">Geplant</SelectItem>
              <SelectItem value="started">In Arbeit</SelectItem>
              <SelectItem value="finished">Fertiggestellt</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Neues Projekt
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Card key={i} className="h-64 animate-pulse bg-muted" />)}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="flex flex-col overflow-hidden group transition-shadow hover:shadow-xl">
              <Link href={`/projects/${project.id}`} className="flex flex-col h-full">
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
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2">
                    <Progress value={project.progress} aria-label={`${project.progress}% abgeschlossen`} />
                    <p className="text-sm text-muted-foreground">{project.progress}% abgeschlossen</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed flex flex-col items-center justify-center p-12 text-center bg-muted/10">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Keine Projekte gefunden</h3>
          <p className="text-muted-foreground mb-4">Du hast noch keine Projekte in dieser Kategorie.</p>
          <Button variant="outline" asChild>
            <Link href="/projects/new">Erstes Projekt erstellen</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
