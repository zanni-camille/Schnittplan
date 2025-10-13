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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Save, Upload, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, updateDoc, collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Pattern, Category, Fabric, TargetGroup, Creator } from '@/lib/definitions';


const patternFormSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().optional(),
  creatorId: z.string().min(1, 'Designer ist erforderlich'),
  targetGroupId: z.string().min(1, 'Zielgruppe ist erforderlich'),
  categoryIds: z.array(z.string()).min(1, 'Mindestens eine Kategorie auswählen'),
  fabricIds: z.array(z.string()).min(1, 'Mindestens einen Stoff auswählen'),
  url: z.string().url('Ungültige URL').optional().or(z.literal('')),
  instructionUrl: z.string().optional(),
  additionalPdfUrls: z.array(z.object({ value: z.string().optional() })).optional(),
});

type PatternFormValues = z.infer<typeof patternFormSchema>;

export default function PatternEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const instructionPdfInputRef = useRef<HTMLInputElement>(null);
  const additionalPdfInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const userId = user?.uid || 'user-1';

  const patternRef = useMemoFirebase(() => 
    (firestore && userId && id) ? doc(firestore, 'users', userId, 'patterns', id as string) : null
  , [firestore, userId, id]);
  const { data: pattern, loading: patternLoading } = useDoc<Pattern>(patternRef);

  const [imageUrl, setImageUrl] = useState<string | undefined>(pattern?.imageUrl);
  const [imageHint, setImageHint] = useState<string | undefined>(pattern?.imageHint);

  const globalCategoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const userCategoriesQuery = useMemoFirebase(() => firestore && userId ? collection(firestore, 'users', userId, 'categories') : null, [firestore, userId]);
  const { data: globalCategories } = useCollection<Category>(globalCategoriesQuery);
  const { data: userCategories } = useCollection<Category>(userCategoriesQuery);
  const allCategories = useMemo(() => [...(globalCategories || []), ...(userCategories || [])], [globalCategories, userCategories]);

  const globalFabricsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'fabrics') : null, [firestore]);
  const userFabricsQuery = useMemoFirebase(() => firestore && userId ? collection(firestore, 'users', userId, 'fabrics') : null, [firestore, userId]);
  const { data: globalFabrics } = useCollection<Fabric>(globalFabricsQuery);
  const { data: userFabrics } = useCollection<Fabric>(userFabricsQuery);
  const allFabrics = useMemo(() => [...(globalFabrics || []), ...(userFabrics || [])], [globalFabrics, userFabrics]);

  const globalTargetGroupsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'targetGroups') : null, [firestore]);
  const userTargetGroupsQuery = useMemoFirebase(() => firestore && userId ? collection(firestore, 'users', userId, 'targetGroups') : null, [firestore, userId]);
  const { data: globalTargetGroups } = useCollection<TargetGroup>(globalTargetGroupsQuery);
  const { data: userTargetGroups } = useCollection<TargetGroup>(userTargetGroupsQuery);
  const allTargetGroups = useMemo(() => [...(globalTargetGroups || []), ...(userTargetGroups || [])], [globalTargetGroups, userTargetGroups]);

  const userCreatorsQuery = useMemoFirebase(() => firestore && userId ? collection(firestore, 'users', userId, 'creators') : null, [firestore, userId]);
  const { data: creators } = useCollection<Creator>(userCreatorsQuery);

  const form = useForm<PatternFormValues>({
    resolver: zodResolver(patternFormSchema),
    values: pattern ? {
      ...pattern,
      additionalPdfUrls: pattern.additionalPdfUrls?.map(url => ({ value: url })) || [],
    } : undefined,
  });
  
  useEffect(() => {
    if (pattern) {
      setImageUrl(pattern.imageUrl);
      setImageHint(pattern.imageHint);
      form.reset({
        ...pattern,
        additionalPdfUrls: pattern.additionalPdfUrls?.map(url => ({ value: url })) || [],
      });
    }
  }, [pattern, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'additionalPdfUrls'
  });

  if (patternLoading) {
    return <div>Wird geladen...</div>;
  }
  
  if (!pattern) {
    notFound();
  }

  async function onSubmit(data: PatternFormValues) {
    if (!patternRef) return;

    try {
      await updateDoc(patternRef, {
        ...data,
        imageUrl,
        imageHint,
        additionalPdfUrls: data.additionalPdfUrls?.map(url => url.value).filter(Boolean),
      });

      toast({
        title: 'Gespeichert!',
        description: `Schnittmuster "${data.title}" wurde erfolgreich aktualisiert.`,
      });
      router.push(`/patterns/${id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Schnittmuster konnte nicht aktualisiert werden.',
      });
      console.error("Error updating document: ", error);
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const file = event.target.files?.[0];
    if (file) {
      field.onChange(file.name);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
        setImageHint(file.name.split('.')[0] || 'uploaded image');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
            <Button asChild variant="ghost">
                <Link href={`/patterns/${id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zur Ansicht
                </Link>
            </Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Änderungen speichern
            </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Card className="overflow-hidden">
                <div className="aspect-[3/4] relative group">
                    {imageUrl && (
                      <Image
                          src={imageUrl}
                          alt={pattern.title}
                          fill
                          className="object-cover"
                          data-ai-hint={imageHint}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button type="button" onClick={() => imageInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Bild ändern
                        </Button>
                        <input
                          type="file"
                          ref={imageInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                    </div>
                </div>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Stammdaten bearbeiten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Titel</FormLabel>
                                <FormControl>
                                    <Input placeholder="z.B. Sommerkleid 'Sonnengruß'" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Beschreibung</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Eine kurze Beschreibung des Schnittmusters..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="creatorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designer</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Designer auswählen" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {creators?.map(creator => (
                                            <SelectItem key={creator.id} value={creator.id}>{creator.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="targetGroupId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Zielgruppe</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Zielgruppe auswählen" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {allTargetGroups.map(group => (
                                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryIds"
                      render={() => (
                        <FormItem>
                          <FormLabel>Kategorien</FormLabel>
                          <div className="space-y-2">
                            {allCategories.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="categoryIds"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.name}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fabricIds"
                      render={() => (
                        <FormItem>
                          <FormLabel>Stoffempfehlungen</FormLabel>
                           <div className="space-y-2">
                            {allFabrics.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="fabricIds"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.name}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Links & Dateien</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Link zum Muster</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://beispiel.com/muster" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="instructionUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Anleitung (PDF)</FormLabel>
                                <FormControl>
                                  <div className="flex gap-2">
                                    <Input placeholder="Keine Datei ausgewählt" value={field.value || ''} readOnly />
                                    <Button type="button" variant="outline" onClick={() => instructionPdfInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Hochladen
                                    </Button>
                                  </div>
                                </FormControl>
                                <input type="file" ref={instructionPdfInputRef} className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e, field)} />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                     <div>
                        <FormLabel>Zusätzliche PDFs</FormLabel>
                        <div className="space-y-2 mt-2">
                            {fields.map((field, index) => (
                                <FormField
                                    key={field.id}
                                    control={form.control}
                                    name={`additionalPdfUrls.${index}.value`}
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <FormControl>
                                              <div className="flex items-center gap-2">
                                                <Input {...formField} placeholder={`Keine Datei ausgewählt`} readOnly />
                                                <Button type="button" variant="outline" size="icon" onClick={() => additionalPdfInputRefs.current[index]?.click()}>
                                                  <Upload className="h-4 w-4" />
                                                </Button>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                              </div>
                                            </FormControl>
                                             <input
                                                type="file"
                                                ref={(el) => (additionalPdfInputRefs.current[index] = el)}
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={(e) => handleFileSelect(e, formField)}
                                              />
                                             <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => append({ value: "" })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            PDF hinzufügen
                        </Button>
                    </div>

                </CardContent>
             </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
