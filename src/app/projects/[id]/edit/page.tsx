'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Save, Upload, Trash2, PlusCircle, Calendar as CalendarIcon, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { de } from 'date-fns/locale';
import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, collection, query } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Project, Pattern } from '@/lib/definitions';


const projectFormSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  description: z.string().optional(),
  progress: z.number().min(0).max(100),
  patternIds: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional(),
  completionDates: z.array(z.object({ value: z.date() })).optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function ProjectEditPage() {
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
    firestore ? query(collection(firestore, 'users', userId, 'patterns')) : null
  , [firestore, userId]);
  const { data: allPatterns } = useCollection<Pattern>(patternsQuery);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [patternSearch, setPatternSearch] = useState('');

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      progress: 0,
      patternIds: [],
      imageUrls: [],
      completionDates: [],
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || '',
        progress: project.progress,
        patternIds: project.patternIds || [],
        imageUrls: project.imageUrls || [],
        completionDates: project.completionDates?.map(d => ({ value: new Date(d) })) || [],
      });
    }
  }, [project, form]);

  const { fields: completionDateFields, append: appendCompletionDate, remove: removeCompletionDate } = useFieldArray({
    control: form.control,
    name: 'completionDates'
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'imageUrls',
  });

  if (projectLoading) return <div className="p-8 text-center">Wird geladen...</div>;
  if (!project) notFound();

  async function onSubmit(data: ProjectFormValues) {
    if (!projectRef) return;
    try {
      await updateDoc(projectRef, {
        name: data.name,
        description: data.description || null,
        progress: data.progress,
        patternIds: data.patternIds || [],
        imageUrls: data.imageUrls || [],
        completionDates: data.completionDates?.map(d => d.value.toISOString()) || [],
      });
      toast({
        title: 'Gespeichert!',
        description: `Projekt "${data.name}" wurde erfolgreich aktualisiert.`,
      });
      router.push(`/projects/${id}`);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Update fehlgeschlagen.',
      });
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) appendImage(e.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const filteredPatterns = useMemo(() => {
    if (!allPatterns) return [];
    return allPatterns.filter(pattern => 
      pattern.title.toLowerCase().includes(patternSearch.toLowerCase())
    );
  }, [allPatterns, patternSearch]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <Button asChild variant="ghost">
                <Link href={`/projects/${id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zur Ansicht
                </Link>
            </Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Änderungen speichern
            </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle>Bildergalerie</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {imageFields.map((field, index) => (
                    <div key={field.id} className="relative group aspect-video">
                       <Image src={field.value} alt={`Projektbild ${index + 1}`} fill className="object-cover rounded-md" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(index)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
                 <Button type="button" variant="outline" className="w-full" onClick={() => imageInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Bilder hochladen
                </Button>
                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
              </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Fertigstellungen</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {completionDateFields.map((field, index) => (
                            <FormField key={field.id} control={form.control} name={`completionDates.${index}.value`} render={({ field: formField }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !formField.value && "text-muted-foreground")}>
                                                        {formField.value ? format(formField.value, "PPP", { locale: de }) : <span>Datum auswählen</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="single" selected={formField.value} onSelect={formField.onChange} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCompletionDate(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendCompletionDate({ value: new Date() })}><PlusCircle className="mr-2 h-4 w-4" />Datum hinzufügen</Button>
                </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Projektdaten bearbeiten</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Projektname</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                     <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Beschreibung</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    <FormField control={form.control} name="progress" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fortschritt: {field.value}%</FormLabel>
                                <FormControl>
                                    <Slider defaultValue={[field.value]} onValueChange={(v) => field.onChange(v[0])} max={100} step={5} />
                                </FormControl>
                            </FormItem>
                        )} />
                </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Zugehörige Schnittmuster</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Schnittmuster suchen..." className="pl-8" value={patternSearch} onChange={(e) => setPatternSearch(e.target.value)} />
                  </div>
                 <FormField control={form.control} name="patternIds" render={({ field }) => (
                      <FormItem>
                        <ScrollArea className="h-72 w-full rounded-md border">
                          <div className="p-4 space-y-2">
                            {filteredPatterns.map((item) => (
                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      return checked ? field.onChange([...currentValue, item.id]) : field.onChange(currentValue.filter((v) => v !== item.id))
                                    }} />
                                </FormControl>
                                <FormLabel className="font-normal">{item.title}</FormLabel>
                              </FormItem>
                            ))}
                          </div>
                        </ScrollArea>
                        <FormMessage />
                      </FormItem>
                    )} />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
