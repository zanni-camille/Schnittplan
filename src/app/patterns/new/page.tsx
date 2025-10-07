'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  CREATORS,
  FABRICS,
  CATEGORIES,
  TARGET_GROUPS,
} from '@/lib/placeholder-data';
import { ArrowLeft, Save, Upload, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';

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

export default function PatternNewPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [imageUrl, setImageUrl] = useState<string>('https://picsum.photos/seed/newPattern/600/800');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const instructionPdfInputRef = useRef<HTMLInputElement>(null);
  const additionalPdfInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<PatternFormValues>({
    resolver: zodResolver(patternFormSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryIds: [],
      fabricIds: [],
      additionalPdfUrls: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'additionalPdfUrls'
  });

  function onSubmit(data: PatternFormValues) {
    const newId = `pat-${Date.now()}`;
    console.log("Creating new pattern:", { id: newId, ...data });
    toast({
      title: 'Gespeichert!',
      description: `Schnittmuster "${data.title}" wurde erfolgreich erstellt.`,
    });
    // Here you would typically call an API to save the data
    // For now, we just log it and redirect.
    router.push(`/patterns`);
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
      };
      reader.readAsDataURL(file);
      console.log("Selected image:", file.name);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
            <Button asChild variant="ghost">
                <Link href={`/patterns`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zur Liste
                </Link>
            </Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Schnittmuster speichern
            </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Card className="overflow-hidden">
                <div className="aspect-[3/4] relative group">
                    <Image
                        src={imageUrl}
                        alt="Neues Schnittmuster"
                        fill
                        className="object-cover"
                        data-ai-hint="placeholder image"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button type="button" onClick={() => imageInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Bild hochladen
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
                    <CardTitle>Neues Schnittmuster anlegen</CardTitle>
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
                                        </Trigger>
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
                                              ? field.onChange([...(field.value || []), item.id])
                                              : field.onChange(
                                                  (field.value || []).filter(
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
                                              ? field.onChange([...(field.value || []), item.id])
                                              : field.onChange(
                                                  (field.value || []).filter(
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
                                <div className="flex-grow">
                                  <FormControl>
                                      <Input placeholder="Keine Datei ausgewählt" value={field.value || ''} readOnly />
                                  </FormControl>
                                  <input type="file" ref={instructionPdfInputRef} className="hidden" accept=".pdf" onChange={(e) => handleFileSelect(e, field)} />
                                </div>
                                <Button type="button" variant="outline" onClick={() => instructionPdfInputRef.current?.click()}>
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
                                    render={({ field: formField }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-grow">
                                                  <FormControl>
                                                      <Input {...formField} placeholder={`Keine Datei ausgewählt`} readOnly />
                                                  </FormControl>
                                                  <input
                                                    type="file"
                                                    ref={(el) => (additionalPdfInputRefs.current[index] = el)}
                                                    className="hidden"
                                                    accept=".pdf"
                                                    onChange={(e) => handleFileSelect(e, formField)}
                                                  />
                                                </div>
                                                <Button type="button" variant="outline" size="icon" onClick={() => additionalPdfInputRefs.current[index]?.click()}>
                                                  <Upload className="h-4 w-4" />
                                                </Button>
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
