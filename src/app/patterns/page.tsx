import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PATTERNS, CATEGORIES, FABRICS, CREATORS } from '@/lib/placeholder-data';
import { PlusCircle, Search } from 'lucide-react';

export default function PatternsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Pattern Library</h1>
          <p className="text-muted-foreground">
            Browse and manage your collection of sewing patterns.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Pattern
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patterns..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by fabric" />
              </SelectTrigger>
              <SelectContent>
                {FABRICS.map(fabric => (
                  <SelectItem key={fabric.id} value={fabric.id}>{fabric.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by creator" />
              </SelectTrigger>
              <SelectContent>
                {CREATORS.map(creator => (
                  <SelectItem key={creator.id} value={creator.id}>{creator.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {PATTERNS.map((pattern) => {
          const creator = CREATORS.find(c => c.id === pattern.creatorId);
          return (
            <Card key={pattern.id} className="overflow-hidden group transition-shadow hover:shadow-xl">
              <Link href={`/patterns/${pattern.id}`}>
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
                <CardFooter className="p-4 flex-col items-start">
                    <h3 className="font-semibold truncate w-full">{pattern.title}</h3>
                    <p className="text-sm text-muted-foreground">{creator?.name}</p>
                </CardFooter>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
