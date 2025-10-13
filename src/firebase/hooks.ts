'use client';

import { useMemo } from 'react';

// A helper hook to memoize firestore queries and document references.
// This is to prevent infinite loops when using useCollection or useDoc.
// TODO: Find a better name for this.
export const useMemoFirebase = useMemo;
