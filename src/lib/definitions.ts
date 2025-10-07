export type Project = {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO date string
  progress: number; // 0-100
  patternIds: string[];
  imageUrls?: string[];
  imageHints?: string[];
  completionDates?: string[]; // Array of ISO date strings for each piece
};

export type Pattern = {
  id: string;
  title: string;
  imageUrl: string;
  imageHint: string;
  description?: string;
  instructionUrl?: string;
  additionalPdfUrls?: string[];
  targetGroupId: string;
  fabricIds: string[];
  categoryIds: string[];
  url?: string;
  creatorId: string;
  projectId?: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Fabric = {
  id: string;
  name: string;
};

export type TargetGroup = {
  id: string;
  name: string;
};

export type Creator = {
  id: string;
  name: string;
  url?: string;
};
