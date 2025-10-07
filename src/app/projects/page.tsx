import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PROJECTS } from '@/lib/placeholder-data';
import { PlusCircle } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Meine Projekte</h1>
          <p className="text-muted-foreground">
            Verwalte und verfolge deine Nähprojekte.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Projekt erstellen
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PROJECTS.map((project) => (
          <Card key={project.id} className="flex flex-col overflow-hidden group transition-shadow hover:shadow-xl">
            <Link href={`/projects/${project.id}`} className="flex flex-col h-full">
              {project.imageUrl && (
                <div className="relative aspect-video">
                  <Image
                    src={project.imageUrl}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    data-ai-hint={project.imageHint}
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
