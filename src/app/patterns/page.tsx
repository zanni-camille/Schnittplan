'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
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
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Pattern, Category, Fabric, Creator } from '@/lib/definitions';
import { PlusCircle, Search, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useMemoFirebase } from '@/firebase/hooks';


export default function PatternsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);

  const userId = user?.uid || 'user-1'; // Temporary fallback for development

  const patternsQuery = useMemoFirebase(() => 
    firestore && userId ? query(collection(firestore, 'users', userId, 'patterns')) : null
  , [firestore, userId]);
  const { data: patterns, loading: patternsLoading } = useCollection<Pattern>(patternsQuery);

  const globalCategoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const userCategoriesQuery = useMemoFirebase(() => firestore && userId ? collection(firestore, 'users', userId, 'categories') : null, [firestore, userId]);
  
  const globalFabricsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'fabrics') : null, [firestore]);
  const userFabricsQuery = useMemoFirebase(() => firestore && userId ? collection(firestore, 'users', userId, 'fabrics') : null, [firestore, userId]);
  
  const userCreatorsQuery = useMemoFirebase(() => firestore && userId ? collection(firestore, 'users', userId, 'creators') : null, [firestore, userId]);

  const { data: globalCategories } = useCollection<Category>(globalCategoriesQuery);
  const { data: userCategories } = useCollection<Category>(userCategoriesQuery);
  const allCategories = useMemo(() => [...(globalCategories || []), ...(userCategories || [])], [globalCategories, userCategories]);
  
  const { data: globalFabrics } = useCollection<Fabric>(globalFabricsQuery);
  const { data: userFabrics } = useCollection<Fabric>(userFabricsQuery);
  const allFabrics = useMemo(() => [...(globalFabrics || []), ...(userFabrics || [])], [globalFabrics, userFabrics]);

  const { data: creators } = useCollection<Creator>(userCreatorsQuery);


  const filteredPatterns = useMemo(() => {
    if (!patterns || !creators) return [];
    return patterns.filter((pattern) => {
      const creator = creators.find(c => c.id === pattern.creatorId);
      const matchesSearch =
        pattern.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (creator && creator.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        !selectedCategory || pattern.categoryIds.includes(selectedCategory);
      const matchesFabric =
        !selectedFabric || pattern.fabricIds.includes(selectedFabric);
      const matchesCreator =
        !selectedCreator || pattern.creatorId === selectedCreator;

      return matchesSearch && matchesCategory && matchesFabric && matchesCreator;
    });
  }, [searchQuery, selectedCategory, selectedFabric, selectedCreator, patterns, creators]);
  
  const handleSetCategory = (value: string) => {
    setSelectedCategory(value === 'all' ? null : value);
  };
  
  const handleSetFabric = (value: string) => {
    setSelectedFabric(value === 'all' ? null : value);
  };
  
  const handleSetCreator = (value: string) => {
    setSelectedCreator(value === 'all' ? null : value);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedFabric(null);
    setSelectedCreator(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Schnittmuster-Bibliothek</h1>
          <p className="text-muted-foreground">
            Durchsuche und verwalte deine Sammlung von Schnittmustern.
          </p>
        </div>
        <Button asChild>
          <Link href="/patterns/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Schnittmuster hinzufügen
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Suchen..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <Select onValueChange={handleSetCategory} value={selectedCategory || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="Nach Kategorie filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleSetFabric} value={selectedFabric || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="Nach Stoff filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Stoffe</SelectItem>
                {allFabrics.map(fabric => (
                  <SelectItem key={fabric.id} value={fabric.id}>{fabric.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Select onValueChange={handleSetCreator} value={selectedCreator || 'all'}>
              <SelectTrigger>
                <SelectValue placeholder="Nach Designer filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Designer</SelectItem>
                {creators?.map(creator => (
                  <SelectItem key={creator.id} value={creator.id}>{creator.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleResetFilters}>
                    <RotateCcw className="h-4 w-4" />
                    <span className="sr-only">Filter zurücksetzen</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter zurücksetzen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredPatterns.map((pattern) => {
          const creator = creators?.find(c => c.id === pattern.creatorId);
          return (
            <Card key={pattern.id} className="overflow-hidden group transition-shadow hover:shadow-xl">
              <Link href={`/patterns/${pattern.id}`} className="block">
                <CardContent className="p-0">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={pattern.imageUrl}
                      alt={pattern.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-10"
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
