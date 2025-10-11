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
  CATEGORIES,
  FABRICS,
  TARGET_GROUPS,
  Category,
  Fabric,
  TargetGroup,
} from '@/lib/placeholder-data';
import { Pen, PlusCircle, Trash2, Save, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const handleSave = (
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
    const newId = `${listName.toLowerCase()}-${Date.now()}`;
    setter((prev) => [...prev, { id: newId, name: value }]);
    newSetter(null);
    toast({
      title: 'Gespeichert!',
      description: `Die neue ${listName} "${value}" wurde hinzugefügt.`,
    });
  };

  const handleCancel = (
    newSetter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    newSetter(null);
  };
  
  const renderNewRow = (
    value: string | null,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onSave: () => void,
    onCancel: () => void,
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
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Zielgruppen</CardTitle>
              <CardDescription>Für wen ist das Muster?</CardDescription>
            </div>
            <Button size="sm" onClick={() => setNewTargetGroup('')} disabled={newTargetGroup !== null}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Neu
            </Button>
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
                {targetGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                 {renderNewRow(
                  newTargetGroup,
                  (e) => setNewTargetGroup(e.target.value),
                  () => handleSave('Zielgruppe', newTargetGroup, setTargetGroups, setNewTargetGroup),
                  () => handleCancel(setNewTargetGroup),
                  "Neue Zielgruppe"
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Kategorien</CardTitle>
              <CardDescription>Art des Kleidungsstücks.</CardDescription>
            </div>
            <Button size="sm" onClick={() => setNewCategory('')} disabled={newCategory !== null}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Neu
            </Button>
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
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {renderNewRow(
                  newCategory,
                  (e) => setNewCategory(e.target.value),
                  () => handleSave('Kategorie', newCategory, setCategories, setNewCategory),
                  () => handleCancel(setNewCategory),
                  "Neue Kategorie"
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Fabrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Stoffempfehlungen</CardTitle>
              <CardDescription>Geeignete Stoffarten.</CardDescription>
            </div>
            <Button size="sm" onClick={() => setNewFabric('')} disabled={newFabric !== null}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Neu
            </Button>
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
                {fabrics.map((fabric) => (
                  <TableRow key={fabric.id}>
                    <TableCell className="font-medium">{fabric.name}</TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                 {renderNewRow(
                  newFabric,
                  (e) => setNewFabric(e.target.value),
                  () => handleSave('Stoffempfehlung', newFabric, setFabrics, setNewFabric),
                  () => handleCancel(setNewFabric),
                  "Neue Stoffart"
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
