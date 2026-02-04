'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, Save, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const projectFormSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  description: z.string().optional(),
  progress: z.number().min(0).max(100),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function ProjectNewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const userId = user?.uid || 'user-1';

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      progress: 0,
    },
  });

  async function onSubmit(data: ProjectFormValues) {
    if (!firestore) return;
    try {
      await addDoc(collection(firestore, 'users', userId, 'projects'), {
        ...data,
        startDate: new Date().toISOString(),
        patternIds: [],
        imageUrls: [],
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Projekt erstellt!',
        description: `"${data.name}" wurde erfolgreich angelegt.`,
      });
      router.push('/projects');
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Projekt konnte nicht gespeichert werden.',
      });
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Button asChild variant="ghost">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Neues Projekt starten</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projektname</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Mein erstes Sommerkleid" {...field} />
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
                      <Textarea placeholder="Was möchtest du nähen?" {...field} />
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
                    <FormLabel>Aktueller Fortschritt: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        onValueChange={(val) => field.onChange(val[0])}
                        max={100}
                        step={5}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Projekt anlegen
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
