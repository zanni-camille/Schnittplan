
'use client';

import { useEffect, useState } from 'react';
import type {
  Query,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';

interface WithId {
  id: string;
}

export function useCollection<T extends DocumentData>(
  query: Query<T> | null
) {
  const [snapshot, setSnapshot] = useState<QuerySnapshot<T> | null>(null);
  const [data, setData] = useState<(T & WithId)[] | null>(null);
  // Wenn die Query noch null ist (während Firebase initialisiert), setzen wir loading auf true.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setSnapshot(null);
      setData(null);
      setLoading(true);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        setSnapshot(snapshot);
        setData(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error("Firestore useCollection error:", error);
        setSnapshot(null);
        setData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { snapshot, data, loading };
}
