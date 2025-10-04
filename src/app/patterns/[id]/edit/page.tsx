'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  PATTERNS,
  CREATORS,
  FABRICS,
  CATEGORIES,
  TARGET_GROUPS,
} from '@/lib/placeholder-data';
import { ArrowLeft, Save, Upload, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { id } = params;
  const { toast } = useToast();

  const pattern = PATTERNS.find((p) => p.id === id);

  const form = useForm<PatternFormValues>({
    resolver: zodResolver(patternFormSchema),
    defaultValues: {
      ...pattern,
      additionalPdfUrls: pattern?.additionalPdfUrls?.map(url => ({ value: url })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'additionalPdfUrls'
  });

  if (!pattern) {
    notFound();
  }

  function onSubmit(data: PatternFormValues) {
    toast({
      title: 'Gespeichert!',
      description: `Schnittmuster "${data.title}" wurde erfolgreich aktualisiert.`,
    });
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
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
                    <Image
                        src={pattern.imageUrl}
                        alt={pattern.title}
                        fill
                        className="object-cover"
                        data-ai-hint={pattern.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button type="button">
                            <Upload className="mr-2 h-4 w-4" />
                            Bild ändern
                        </Button>
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
                                        {CREATORS.map(creator => (
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
                                        {TARGET_GROUPS.map(group => (
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
                            {CATEGORIES.map((item) => (
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
                            {FABRICS.map((item) => (
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
                                <div className="flex gap-2">
                                <FormControl>
                                    <Input placeholder="PDF-Datei auswählen..." value={field.value || ''} readOnly />
                                </FormControl>
                                <Button type="button" variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Hochladen
                                </Button>
                                </div>
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
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2">
                                                <FormControl>
                                                    <Input {...field} placeholder={`Zusätzliches PDF ${index + 1}`} />
                                                </FormControl>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
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
