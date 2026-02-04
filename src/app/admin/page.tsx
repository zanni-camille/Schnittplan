
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pen, PlusCircle, Trash2, Save, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Category, Fabric, TargetGroup } from '@/lib/definitions';

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  // Firestore Queries für globale Listen (ohne userId)
  const catQuery = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const fabQuery = useMemoFirebase(() => firestore ? collection(firestore, 'fabrics') : null, [firestore]);
  const tgQuery = useMemoFirebase(() => firestore ? collection(firestore, 'targetGroups') : null, [firestore]);

  const { data: categories, loading: loadingCats } = useCollection<Category>(catQuery);
  const { data: fabrics, loading: loadingFabs } = useCollection<Fabric>(fabQuery);
  const { data: targetGroups, loading: loadingTgs } = useCollection<TargetGroup>(tgQuery);

  const [newTargetGroup, setNewTargetGroup] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newFabric, setNewFabric] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<{ id: string, name: string, type: 'cat' | 'fab' | 'tg' } | null>(null);

  const isEditing = newTargetGroup !== null || newCategory !== null || newFabric !== null || editingItem !== null;

  const handleAddNew = (setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (isEditing) return;
    setter('');
  };

  const handleSaveNew = async (collectionName: string, value: string | null, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (!value?.trim() || !firestore) return;

    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    try {
      await addDoc(collection(firestore, collectionName), { name: formattedValue });
      setter(null);
      toast({ title: 'Gespeichert!', description: `"${formattedValue}" wurde hinzugefügt.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Konnte nicht gespeichert werden.' });
    }
  };

  const handleUpdate = async (collectionName: string) => {
    if (!editingItem || !firestore || !editingItem.name.trim()) return;

    const formattedValue = editingItem.name.charAt(0).toUpperCase() + editingItem.name.slice(1);
    try {
      await updateDoc(doc(firestore, collectionName, editingItem.id), { name: formattedValue });
      setEditingItem(null);
      toast({ title: 'Aktualisiert!', description: 'Eintrag wurde erfolgreich umbenannt.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Update fehlgeschlagen.' });
    }
  };

  const handleDelete = async (collectionName: string, id: string, name: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, collectionName, id));
      toast({ title: 'Gelöscht!', description: `"${name}" wurde entfernt.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Konnte nicht gelöscht werden.' });
    }
  };

  const renderList = (title: string, data: any[] | null, loading: boolean, collectionName: string, newValue: string | null, setNewValue: React.Dispatch<React.SetStateAction<string | null>>) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.map((item) => {
                const isCurrentlyEditing = editingItem?.id === item.id;
                return isCurrentlyEditing ? (
                  <TableRow key={item.id}>
                    <TableCell><Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleUpdate(collectionName)} /></TableCell>
                    <TableCell className="text-right flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleUpdate(collectionName)}><Save className="h-4 w-4 text-primary" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)}><XCircle className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setEditingItem({ ...item, type: collectionName as any })} disabled={isEditing}><Pen className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive" disabled={isEditing}><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Löschen bestätigen</AlertDialogTitle>
                            <AlertDialogDescription>Möchten Sie "{item.name}" wirklich aus den Stammdaten entfernen?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(collectionName, item.id, item.name)}>Löschen</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
              {newValue !== null && (
                <TableRow>
                  <TableCell><Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Neu..." autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveNew(collectionName, newValue, setNewValue)} /></TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleSaveNew(collectionName, newValue, setNewValue)}><Save className="h-4 w-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setNewValue(null)}><XCircle className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <Button size="sm" onClick={() => handleAddNew(setNewValue)} disabled={isEditing} className="w-full mt-4"><PlusCircle className="mr-2 h-4 w-4" />Neu</Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Globale Stammdaten</h1>
        <p className="text-muted-foreground">Verwalte die Kategorien und Stoffe, die für alle Benutzer sichtbar sind.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {renderList("Zielgruppen", targetGroups, loadingTgs, "targetGroups", newTargetGroup, setNewTargetGroup)}
        {renderList("Kategorien", categories, loadingCats, "categories", newCategory, setNewCategory)}
        {renderList("Stoffe", fabrics, loadingFabs, "fabrics", newFabric, setNewFabric)}
      </div>
    </div>
  );
}
