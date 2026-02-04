'use client';

import { useState, useMemo } from 'react';
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
import { Pen, PlusCircle, Trash2, Save, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/hooks';
import type { Category, Fabric, TargetGroup, Pattern } from '@/lib/definitions';

type EditableItem = {
  id: string;
  name: string;
};

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const userId = user?.uid || 'user-1';

  // Firestore Queries for global lists
  const catQuery = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const fabQuery = useMemoFirebase(() => firestore ? collection(firestore, 'fabrics') : null, [firestore]);
  const tgQuery = useMemoFirebase(() => firestore ? collection(firestore, 'targetGroups') : null, [firestore]);

  const { data: categories } = useCollection<Category>(catQuery);
  const { data: fabrics } = useCollection<Fabric>(fabQuery);
  const { data: targetGroups } = useCollection<TargetGroup>(tgQuery);

  // For usage checking
  const patternsQuery = useMemoFirebase(() => 
    firestore && userId ? query(collection(firestore, 'users', userId, 'patterns')) : null
  , [firestore, userId]);
  const { data: allPatterns } = useCollection<Pattern>(patternsQuery);
  
  const [newTargetGroup, setNewTargetGroup] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newFabric, setNewFabric] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<{ id: string, name: string, type: 'cat' | 'fab' | 'tg' } | null>(null);

  const isEditing = newTargetGroup !== null || newCategory !== null || newFabric !== null || editingItem !== null;

  const handleAddNew = (
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (isEditing) return;
    setter('');
  };

  const handleSaveNew = async (
    listName: 'Zielgruppe' | 'Kategorie' | 'Stoffempfehlung',
    collectionName: string,
    value: string | null,
    newSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (!value?.trim() || !firestore) return;

    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    try {
      await addDoc(collection(firestore, collectionName), { name: formattedValue });
      newSetter(null);
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
      toast({ title: 'Aktualisiert!', description: `Eintrag wurde in "${formattedValue}" umbenannt.` });
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

  const renderNewRow = (
    value: string | null,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onSave: () => void,
    placeholder: string
  ) => {
    if (value === null) return null;
    return (
      <TableRow>
        <TableCell>
          <Input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoFocus
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={onSave}>
              <Save className="h-4 w-4 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setNewTargetGroup(null); setNewCategory(null); setNewFabric(null); }}>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderDeleteDialog = (itemName: string, onConfirm: () => void, isDisabled: boolean) => {
    const deleteButton = (
      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDisabled || isEditing}>
          <Trash2 className="h-4 w-4" />
      </Button>
    );

    if (isDisabled) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>{deleteButton}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Wird noch in einem Schnittmuster verwendet.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {deleteButton}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bist du sicher?</AlertDialogTitle>
            <AlertDialogDescription>
               "{itemName}" wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Verwaltung</h1>
        <p className="text-muted-foreground">Verwalte die globalen Stammdaten für alle Benutzer.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Target Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Zielgruppen</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
              <TableBody>
                {targetGroups?.map((group) => {
                  const isUsed = allPatterns?.some(p => p.targetGroupId === group.id);
                  const isCurrentlyEditing = editingItem?.id === group.id;
                  return isCurrentlyEditing ? (
                    <TableRow key={group.id}>
                      <TableCell><Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} autoFocus /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleUpdate('targetGroups')}><Save className="h-4 w-4 text-primary" /></Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem({ ...group, type: 'tg' })} disabled={isEditing}><Pen className="h-4 w-4" /></Button>
                        {renderDeleteDialog(group.name, () => handleDelete('targetGroups', group.id, group.name), !!isUsed)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {renderNewRow(newTargetGroup, (e) => setNewTargetGroup(e.target.value), () => handleSaveNew('Zielgruppe', 'targetGroups', newTargetGroup, setNewTargetGroup), "Neu")}
              </TableBody>
            </Table>
            <Button size="sm" onClick={() => handleAddNew(setNewTargetGroup)} disabled={isEditing} className="w-full mt-4"><PlusCircle className="mr-2 h-4 w-4" />Neu</Button>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
              <TableBody>
                {categories?.map((category) => {
                  const isUsed = allPatterns?.some(p => p.categoryIds.includes(category.id));
                  const isCurrentlyEditing = editingItem?.id === category.id;
                  return isCurrentlyEditing ? (
                    <TableRow key={category.id}>
                      <TableCell><Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} autoFocus /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleUpdate('categories')}><Save className="h-4 w-4 text-primary" /></Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem({ ...category, type: 'cat' })} disabled={isEditing}><Pen className="h-4 w-4" /></Button>
                        {renderDeleteDialog(category.name, () => handleDelete('categories', category.id, category.name), !!isUsed)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {renderNewRow(newCategory, (e) => setNewCategory(e.target.value), () => handleSaveNew('Kategorie', 'categories', newCategory, setNewCategory), "Neu")}
              </TableBody>
            </Table>
            <Button size="sm" onClick={() => handleAddNew(setNewCategory)} disabled={isEditing} className="w-full mt-4"><PlusCircle className="mr-2 h-4 w-4" />Neu</Button>
          </CardContent>
        </Card>

        {/* Fabrics */}
        <Card>
          <CardHeader>
            <CardTitle>Stoffe</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
              <TableBody>
                {fabrics?.map((fabric) => {
                  const isUsed = allPatterns?.some(p => p.fabricIds.includes(fabric.id));
                  const isCurrentlyEditing = editingItem?.id === fabric.id;
                  return isCurrentlyEditing ? (
                    <TableRow key={fabric.id}>
                      <TableCell><Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} autoFocus /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleUpdate('fabrics')}><Save className="h-4 w-4 text-primary" /></Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={fabric.id}>
                      <TableCell className="font-medium">{fabric.name}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem({ ...fabric, type: 'fab' })} disabled={isEditing}><Pen className="h-4 w-4" /></Button>
                        {renderDeleteDialog(fabric.name, () => handleDelete('fabrics', fabric.id, fabric.name), !!isUsed)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {renderNewRow(newFabric, (e) => setNewFabric(e.target.value), () => handleSaveNew('Stoffempfehlung', 'fabrics', newFabric, setNewFabric), "Neu")}
              </TableBody>
            </Table>
            <Button size="sm" onClick={() => handleAddNew(setNewFabric)} disabled={isEditing} className="w-full mt-4"><PlusCircle className="mr-2 h-4 w-4" />Neu</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
