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
import { PROJECTS } from '@/lib/placeholder-data';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProjectsPage() {
  const [filter, setFilter] = useState('all');

  const filteredProjects = PROJECTS.filter((project) => {
    if (filter === 'all') {
      return true;
    } else if (filter === 'planned') {
      return project.progress === 0;
    } else if (filter === 'started') {
      return project.progress > 0 && project.progress < 100;
    } else if (filter === 'finished') {
      return project.progress === 100;
    }
    return true;
  });

  return (
    <div className="space-y-8">
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
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Projekt erstellen
          </Button>
        </div>
      </div>

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
                    data-ai-hint={project.imageHints?.[0]}
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
    </div>
  );
}
