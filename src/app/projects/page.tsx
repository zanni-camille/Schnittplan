import Link from 'next/link';
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
import { PlusCircle, Eye, Pen } from 'lucide-react';

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

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {PROJECTS.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <Progress value={project.progress} aria-label={`${project.progress}% abgeschlossen`} />
                <p className="text-sm text-muted-foreground">{project.progress}% abgeschlossen</p>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button asChild className="w-full">
                  <Link href={`/projects/${project.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Öffnen
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={`/projects/${project.id}/edit`}>
                    <Pen className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
