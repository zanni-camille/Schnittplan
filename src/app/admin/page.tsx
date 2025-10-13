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
import {
  CATEGORIES,
  FABRICS,
  TARGET_GROUPS,
  PATTERNS,
  Category,
  Fabric,
  TargetGroup,
} from '@/lib/placeholder-data';
import { Pen, PlusCircle, Trash2, Save, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type EditableItem = {
  id: string;
  name: string;
};

export default function AdminPage() {
  const { toast } = useToast();
  const [targetGroups, setTargetGroups] = useState<TargetGroup[]>(TARGET_GROUPS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [fabrics, setFabrics] = useState<Fabric[]>(FABRICS);
  
  const [newTargetGroup, setNewTargetGroup] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newFabric, setNewFabric] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<{ id: string, name: string } | null>(null);

  const isEditing = newTargetGroup !== null || newCategory !== null || newFabric !== null || editingItem !== null;

  const handleAddNew = (
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (isEditing) return;
    setter('');
  };

  const handleSaveNew = (
    listName: 'Zielgruppe' | 'Kategorie' | 'Stoffempfehlung',
    value: string | null,
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    newSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (!value?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Der Name darf nicht leer sein.',
      });
      return;
    }
    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    const newId = `${listName.toLowerCase()}-${Date.now()}`;
    setter((prev) => [...prev, { id: newId, name: formattedValue }]);
    newSetter(null);
    toast({
      title: 'Gespeichert!',
      description: `Die neue ${listName} "${formattedValue}" wurde hinzugefügt.`,
    });
  };

  const handleEdit = (item: EditableItem) => {
    if (isEditing) return;
    setEditingItem({ ...item });
  };

  const handleUpdate = (
    listName: 'Zielgruppe' | 'Kategorie' | 'Stoffempfehlung',
    setter: React.Dispatch<React.SetStateAction<EditableItem[]>>
  ) => {
    if (!editingItem) return;
     if (!editingItem.name?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Der Name darf nicht leer sein.',
      });
      return;
    }
    const formattedValue = editingItem.name.charAt(0).toUpperCase() + editingItem.name.slice(1);
    setter(prev => prev.map(item => item.id === editingItem.id ? { ...item, name: formattedValue } : item));
    toast({
      title: 'Aktualisiert!',
      description: `Die ${listName} wurde in "${formattedValue}" umbenannt.`,
    });
    setEditingItem(null);
  };

  const handleCancel = () => {
    setNewTargetGroup(null);
    setNewCategory(null);
    setNewFabric(null);
    setEditingItem(null);
  };
  
  const handleDeleteTargetGroup = (groupId: string, groupName: string) => {
    setTargetGroups(prev => prev.filter(g => g.id !== groupId));
    toast({
      title: 'Gelöscht!',
      description: `Die Zielgruppe "${groupName}" wurde entfernt.`,
    });
  };
  
  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    toast({
      title: 'Gelöscht!',
      description: `Die Kategorie "${categoryName}" wurde entfernt.`,
    });
  };

  const handleDeleteFabric = (fabricId: string, fabricName: string) => {
    setFabrics(prev => prev.filter(f => f.id !== fabricId));
    toast({
      title: 'Gelöscht!',
      description: `Die Stoffempfehlung "${fabricName}" wurde entfernt.`,
    });
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
            <Button variant="ghost" size="icon" onClick={handleCancel}>
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
              {/* The div is necessary for the tooltip to work on a disabled button */}
              <div>{deleteButton}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Kann nicht gelöscht werden, da es noch verwendet wird.</p>
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
               Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird "{itemName}" dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Verwaltung
        </h1>
        <p className="text-muted-foreground">
          Verwalte die Stammdaten für deine Schnittmuster-Bibliothek.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Target Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Zielgruppen</CardTitle>
            <CardDescription>Für wen ist das Muster?</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[80px] text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targetGroups.map((group) => {
                  const isUsed = PATTERNS.some(p => p.targetGroupId === group.id);
                  const isCurrentlyEditing = editingItem?.id === group.id;

                  if (isCurrentlyEditing) {
                    return (
                      <TableRow key={group.id}>
                        <TableCell>
                          <Input
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            autoFocus
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleUpdate('Zielgruppe', setTargetGroups)}>
                              <Save className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleCancel}>
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(group)} disabled={isEditing}>
                            <Pen className="h-4 w-4" />
                          </Button>
                          {renderDeleteDialog(group.name, () => handleDeleteTargetGroup(group.id, group.name), isUsed)}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                 {renderNewRow(
                  newTargetGroup,
                  (e) => setNewTargetGroup(e.target.value),
                  () => handleSaveNew('Zielgruppe', newTargetGroup, setTargetGroups, setNewTargetGroup),
                  "Neue Zielgruppe"
                )}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button size="sm" onClick={() => handleAddNew(setNewTargetGroup)} disabled={isEditing} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Neu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Kategorien</CardTitle>
            <CardDescription>Art des Kleidungsstücks.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[80px] text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                   const isUsed = PATTERNS.some(p => p.categoryIds.includes(category.id));
                   const isCurrentlyEditing = editingItem?.id === category.id;

                   if (isCurrentlyEditing) {
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <Input
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            autoFocus
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleUpdate('Kategorie', setCategories)}>
                              <Save className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleCancel}>
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                   }

                   return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(category)} disabled={isEditing}>
                            <Pen className="h-4 w-4" />
                          </Button>
                          {renderDeleteDialog(category.name, () => handleDeleteCategory(category.id, category.name), isUsed)}
                        </div>
                      </TableCell>
                    </TableRow>
                   );
                })}
                {renderNewRow(
                  newCategory,
                  (e) => setNewCategory(e.target.value),
                  () => handleSaveNew('Kategorie', newCategory, setCategories, setNewCategory),
                  "Neue Kategorie"
                )}
              </TableBody>
            </Table>
             <div className="mt-4">
              <Button size="sm" onClick={() => handleAddNew(setNewCategory)} disabled={isEditing} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Neu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fabrics */}
        <Card>
          <CardHeader>
            <CardTitle>Stoffempfehlungen</CardTitle>
            <CardDescription>Geeignete Stoffarten.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[80px] text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fabrics.map((fabric) => {
                  const isUsed = PATTERNS.some(p => p.fabricIds.includes(fabric.id));
                  const isCurrentlyEditing = editingItem?.id === fabric.id;

                  if (isCurrentlyEditing) {
                    return (
                      <TableRow key={fabric.id}>
                        <TableCell>
                          <Input
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            autoFocus
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleUpdate('Stoffempfehlung', setFabrics)}>
                              <Save className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleCancel}>
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  
                  return (
                  <TableRow key={fabric.id}>
                    <TableCell className="font-medium">{fabric.name}</TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(fabric)} disabled={isEditing}>
                          <Pen className="h-4 w-4" />
                        </Button>
                        {renderDeleteDialog(fabric.name, () => handleDeleteFabric(fabric.id, fabric.name), isUsed)}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
                 {renderNewRow(
                  newFabric,
                  (e) => setNewFabric(e.target.value),
                  () => handleSaveNew('Stoffempfehlung', newFabric, setFabrics, setNewFabric),
                  "Neue Stoffart"
                )}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button size="sm" onClick={() => handleAddNew(setNewFabric)} disabled={isEditing} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Neu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
