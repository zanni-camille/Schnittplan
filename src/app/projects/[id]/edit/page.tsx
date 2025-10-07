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
import {
  PROJECTS,
  PATTERNS,
} from '@/lib/placeholder-data';
import { ArrowLeft, Save, Upload, Trash2, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


const projectFormSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  description: z.string().optional(),
  progress: z.number().min(0).max(100),
  patternIds: z.array(z.string()).optional(),
  completionDates: z.array(z.object({ value: z.date() })).optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();

  const project = PROJECTS.find((p) => p.id === id);

  const [imageUrl, setImageUrl] = useState<string>(project?.imageUrl || 'https://picsum.photos/seed/newProject/800/600');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name,
      description: project?.description,
      progress: project?.progress,
      patternIds: project?.patternIds,
      completionDates: project?.completionDates?.map(date => ({ value: new Date(date) })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'completionDates'
  });

  if (!project) {
    notFound();
  }

  function onSubmit(data: ProjectFormValues) {
    toast({
      title: 'Gespeichert!',
      description: `Projekt "${data.name}" wurde erfolgreich aktualisiert.`,
    });
    console.log(data);
    router.push(`/projects/${id}`);
  }

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
          <div className="md:col-span-1 space-y-4">
            <Card className="overflow-hidden">
                <div className="aspect-video relative group">
                    <Image
                        src={imageUrl}
                        alt={project.name}
                        fill
                        className="object-cover"
                        data-ai-hint={project.imageHint}
                    />
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
            <Card>
                <CardHeader>
                    <CardTitle>Fertigstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <FormField
                                key={field.id}
                                control={form.control}
                                name={`completionDates.${index}.value`}
                                render={({ field: formField }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !formField.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {formField.value ? format(formField.value, "PPP") : <span>Datum auswählen</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formField.value}
                                                        onSelect={formField.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
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
                        onClick={() => append({ value: new Date() })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Datum hinzufügen
                    </Button>
                </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Projektdaten bearbeiten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Projektname</FormLabel>
                                <FormControl>
                                    <Input placeholder="z.B. Sommergarderobe" {...field} />
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
                                    <Textarea placeholder="Eine kurze Beschreibung des Projekts..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="progress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fortschritt: {field.value}%</FormLabel>
                                <FormControl>
                                    <Slider
                                        defaultValue={[field.value]}
                                        onValueChange={(value) => field.onChange(value[0])}
                                        max={100}
                                        step={5}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Zugehörige Schnittmuster</CardTitle>
                </CardHeader>
                <CardContent>
                   <FormField
                      control={form.control}
                      name="patternIds"
                      render={() => (
                        <FormItem>
                          <div className="space-y-2">
                            {PATTERNS.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="patternIds"
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
                                            const currentValue = field.value || [];
                                            return checked
                                              ? field.onChange([...currentValue, item.id])
                                              : field.onChange(
                                                  currentValue?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.title}
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
          </div>
        </div>
      </form>
    </Form>
  );
}
