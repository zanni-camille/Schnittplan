import type { Category, Fabric, TargetGroup, Creator, Project, Pattern } from '@/lib/definitions';

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Dresses' },
  { id: 'cat-2', name: 'Tops' },
  { id: 'cat-3', name: 'Pants' },
  { id: 'cat-4', name: 'Skirts' },
  { id: 'cat-5', name: 'Outerwear' },
  { id: 'cat-6', name: 'Accessories' },
];

export const FABRICS: Fabric[] = [
  { id: 'fab-1', name: 'Cotton' },
  { id: 'fab-2', name: 'Linen' },
  { id: 'fab-3', name: 'Wool' },
  { id: 'fab-4', name: 'Silk' },
  { id: 'fab-5', name: 'Knit' },
  { id: 'fab-6', name: 'Denim' },
];

export const TARGET_GROUPS: TargetGroup[] = [
  { id: 'tg-1', name: 'Women' },
  { id: 'tg-2', name: 'Men' },
  { id: 'tg-3', name: 'Children' },
  { id: 'tg-4', name: 'Unisex' },
];

export const CREATORS: Creator[] = [
  { id: 'cre-1', name: 'Indie Sew', url: 'https://indiesew.com' },
  { id: 'cre-2', name: 'Pattern Co.', url: 'https://patternco.com' },
  { id: 'cre-3', name: 'Fabric Store', url: 'https://fabricstore.com' },
];

export const PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Summer Wardrobe',
    description: 'A collection of light and airy garments for the summer season.',
    startDate: '2024-06-01T00:00:00.000Z',
    progress: 75,
    patternIds: ['pat-1', 'pat-2'],
  },
  {
    id: 'proj-2',
    name: 'Winter Collection',
    description: 'Cozy and warm clothes for the cold months.',
    startDate: '2024-01-15T00:00:00.000Z',
    progress: 40,
    patternIds: ['pat-4'],
  },
  {
    id: 'proj-3',
    name: 'Kids\' Play Clothes',
    description: 'Durable and fun outfits for children.',
    startDate: '2024-07-10T00:00:00.000Z',
    progress: 10,
    patternIds: ['pat-6'],
  },
];

export const PATTERNS: Pattern[] = [
  {
    id: 'pat-1',
    title: 'Summer Sundress',
    imageUrl: 'https://picsum.photos/seed/p1/600/800',
    imageHint: 'dress sewing',
    description: 'A beautiful and simple sundress perfect for warm weather.',
    targetGroupId: 'tg-1',
    fabricIds: ['fab-1', 'fab-2'],
    categoryIds: ['cat-1'],
    creatorId: 'cre-1',
    projectId: 'proj-1',
    url: 'https://example.com/sundress'
  },
  {
    id: 'pat-2',
    title: 'Linen Trousers',
    imageUrl: 'https://picsum.photos/seed/p2/600/800',
    imageHint: 'trousers sewing',
    description: 'Comfortable and stylish wide-leg linen trousers.',
    targetGroupId: 'tg-4',
    fabricIds: ['fab-2'],
    categoryIds: ['cat-3'],
    creatorId: 'cre-2',
    projectId: 'proj-1',
    url: 'https://example.com/linentrousers'
  },
  {
    id: 'pat-3',
    title: 'Classic Oxford Shirt',
    imageUrl: 'https://picsum.photos/seed/p3/600/800',
    imageHint: 'shirt fabric',
    description: 'A timeless oxford shirt pattern for a sharp look.',
    targetGroupId: 'tg-2',
    fabricIds: ['fab-1'],
    categoryIds: ['cat-2'],
    creatorId: 'cre-3',
  },
  {
    id: 'pat-4',
    title: 'Chunky Knit Sweater',
    imageUrl: 'https://picsum.photos/seed/p4/600/800',
    imageHint: 'knitting wool',
    description: 'A warm and cozy sweater, perfect for winter evenings.',
    targetGroupId: 'tg-4',
    fabricIds: ['fab-3', 'fab-5'],
    categoryIds: ['cat-2', 'cat-5'],
    creatorId: 'cre-1',
    projectId: 'proj-2',
  },
  {
    id: 'pat-5',
    title: 'A-Line Skirt',
    imageUrl: 'https://picsum.photos/seed/p5/600/800',
    imageHint: 'skirt pattern',
    description: 'A simple and elegant A-line skirt.',
    targetGroupId: 'tg-1',
    fabricIds: ['fab-1', 'fab-6'],
    categoryIds: ['cat-4'],
    creatorId: 'cre-2',
  },
  {
    id: 'pat-6',
    title: 'Kids\' Pajama Set',
    imageUrl: 'https://picsum.photos/seed/p6/600/800',
    imageHint: 'pajamas kids',
    description: 'A comfortable and cute pajama set for children.',
    targetGroupId: 'tg-3',
    fabricIds: ['fab-1', 'fab-5'],
    categoryIds: ['cat-2', 'cat-3'],
    creatorId: 'cre-3',
    projectId: 'proj-3',
  },
];
