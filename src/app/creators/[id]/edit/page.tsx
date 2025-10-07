'use client';

import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CREATORS } from '@/lib/placeholder-data';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const creatorFormSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  url: z.string().url('Ungültige URL').optional().or(z.literal('')),
});

type CreatorFormValues = z.infer<typeof creatorFormSchema>;

export default function CreatorEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { toast } = useToast();

  const creator = CREATORS.find((p) => p.id === id);

  const form = useForm<CreatorFormValues>({
    resolver: zodResolver(creatorFormSchema),
    defaultValues: creator,
  });
  
  if (!creator) {
    notFound();
  }
  
  const creatorName = form.watch('name');

  function onSubmit(data: CreatorFormValues) {
    toast({
      title: 'Gespeichert!',
      description: `Designer "${data.name}" wurde erfolgreich aktualisiert.`,
    });
    console.log(data);
    router.push(`/creators/${id}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
            <Button asChild variant="ghost">
                <Link href={`/creators/${id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zur Ansicht
                </Link>
            </Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Änderungen speichern
            </Button>
        </div>
        
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        {creatorName && <AvatarImage src={`https://avatar.vercel.sh/${creatorName}.png`} alt={creatorName} />}
                        <AvatarFallback className="text-4xl">
                            {creatorName ? creatorName.charAt(0) : '?'}
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle>Designer bearbeiten</CardTitle>
                    <CardDescription>Aktualisieren Sie die Informationen des Designers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name des Designers</FormLabel>
                                <FormControl>
                                    <Input placeholder="z.B. Indie Sew" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Webseite</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://beispiel.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
      </form>
    </Form>
  );
}
