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
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const creatorFormSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  url: z.string().url('Ungültige URL').optional().or(z.literal('')),
});

type CreatorFormValues = z.infer<typeof creatorFormSchema>;

export default function CreatorNewPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreatorFormValues>({
    resolver: zodResolver(creatorFormSchema),
    defaultValues: {
      name: '',
      url: '',
    },
  });

  const creatorName = form.watch('name');

  function onSubmit(data: CreatorFormValues) {
    const newId = `cre-${Date.now()}`;
    console.log("Creating new creator:", { id: newId, ...data });
    toast({
      title: 'Gespeichert!',
      description: `Designer "${data.name}" wurde erfolgreich erstellt.`,
    });
    router.push(`/creators`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
            <Button asChild variant="ghost">
                <Link href="/creators">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück zur Liste
                </Link>
            </Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Designer speichern
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
                    <CardTitle>Neuen Designer anlegen</CardTitle>
                    <CardDescription>Fügen Sie einen neuen Schnittmuster-Designer zu Ihrer Sammlung hinzu.</CardDescription>
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
