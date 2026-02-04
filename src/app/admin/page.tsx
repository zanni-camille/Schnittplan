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
import { Pen, PlusCircle, Trash2, Save, XCircle, Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Category, Fabric, TargetGroup } from '@/lib/definitions';
import { CATEGORIES, FABRICS, TARGET_GROUPS } from '@/lib/placeholder-data';

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const catQuery = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const fabQuery = useMemoFirebase(() => firestore ? collection(firestore, 'fabrics') : null, [firestore]);
  const tgQuery = useMemoFirebase(() => firestore ? collection(firestore, 'targetGroups') : null, [firestore]);

  const { data: categories, loading: loadingCats } = useCollection<Category>(catQuery);
  const { data: fabrics, loading: loadingFabs } = useCollection<Fabric>(fabQuery);
  const { data: targetGroups, loading: loadingTgs } = useCollection<TargetGroup>(tgQuery);

  const [newTargetGroup, setNewTargetGroup] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newFabric, setNewFabric] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const [editingItem, setEditingItem] = useState<{ id: string, name: string, type: string } | null>(null);

  const isOperationInProgress = newTargetGroup !== null || newCategory !== null || newFabric !== null || editingItem !== null || isSeeding;

  const handleAddNew = (setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    setter('');
  };

  const handleSeedData = async () => {
    if (!firestore || isSeeding) return;
    setIsSeeding(true);
    
    try {
      const seed = async (colName: string, items: any[]) => {
        const colRef = collection(firestore, colName);
        for (const item of items) {
          await addDoc(colRef, { name: item.name });
        }
      };

      await seed('categories', CATEGORIES);
      await seed('fabrics', FABRICS);
      await seed('targetGroups', TARGET_GROUPS);

      toast({
        title: "Daten initialisiert",
        description: "Standard-Kategorien, Stoffe und Zielgruppen wurden erstellt.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Fehler beim Initialisieren",
        description: "Stelle sicher, dass Firestore aktiv ist und Schreibzugriff erlaubt ist.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveNew = (collectionName: string, value: string | null, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (!value?.trim() || !firestore) return;

    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    const colRef = collection(firestore, collectionName);
    const data = { name: formattedValue };

    addDoc(colRef, data)
      .then(() => {
        setter(null);
        toast({ title: 'Gespeichert!', description: `"${formattedValue}" wurde hinzugefügt.` });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        }));
      });
  };

  const handleUpdate = (collectionName: string) => {
    if (!editingItem || !firestore || !editingItem.name.trim()) return;

    const formattedValue = editingItem.name.charAt(0).toUpperCase() + editingItem.name.slice(1);
    const docRef = doc(firestore, collectionName, editingItem.id);
    const data = { name: formattedValue };

    updateDoc(docRef, data)
      .then(() => {
        setEditingItem(null);
        toast({ title: 'Aktualisiert!', description: 'Eintrag wurde erfolgreich umbenannt.' });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        }));
      });
  };

  const handleDelete = (collectionName: string, id: string, name: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, collectionName, id);

    deleteDoc(docRef)
      .then(() => {
        toast({ title: 'Gelöscht!', description: `"${name}" wurde entfernt.` });
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        }));
      });
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
                      <Button variant="ghost" size="icon" onClick={() => setEditingItem({ ...item, type: collectionName })} disabled={isOperationInProgress}><Pen className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive" disabled={isOperationInProgress}><Trash2 className="h-4 w-4" /></Button>
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
        <Button size="sm" onClick={() => handleAddNew(setNewValue)} disabled={isOperationInProgress} className="w-full mt-4"><PlusCircle className="mr-2 h-4 w-4" />Neu</Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Stammdaten Verwaltung</h1>
          <p className="text-muted-foreground">Verwalte Zielgruppen, Kategorien und Stoffe für deine Bibliothek.</p>
        </div>
        <Button variant="outline" onClick={handleSeedData} disabled={isOperationInProgress}>
          {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
          Testdaten initialisieren
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {renderList("Zielgruppen", targetGroups, loadingTgs, "targetGroups", newTargetGroup, setNewTargetGroup)}
        {renderList("Kategorien", categories, loadingCats, "categories", newCategory, setNewCategory)}
        {renderList("Stoffe", fabrics, loadingFabs, "fabrics", newFabric, setNewFabric)}
      </div>
    </div>
  );
}
