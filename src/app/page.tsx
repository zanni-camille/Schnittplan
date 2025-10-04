import Image from 'next/image';
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
import { PROJECTS, PATTERNS } from '@/lib/placeholder-data';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const activeProjects = PROJECTS.slice(0, 3);
  const recentPatterns = PATTERNS.slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your creative world.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Pattern
          </Button>
          <Button variant="secondary">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">
          Active Projects
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription className="truncate">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={project.progress} />
                  <p className="text-sm text-muted-foreground">{project.progress}% complete</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={`/projects/${project.id}`}>View Project</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">
          Recent Patterns
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentPatterns.map((pattern) => (
            <Link href={`/patterns/${pattern.id}`} key={pattern.id}>
              <Card className="overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
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
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
