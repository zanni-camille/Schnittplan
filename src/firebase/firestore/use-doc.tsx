'use client';

import { useEffect, useState } from 'react';
import type { DocumentReference, DocumentData } from 'firebase/firestore';
import { onSnapshot, doc } from 'firebase/firestore';
import { useFirestore } from '..';

interface WithId {
  id: string;
}

export function useDoc<T extends DocumentData>(
  ref: DocumentReference<T> | null
) {
  const [data, setData] = useState<(T & WithId) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading };
}

export function useDoc_experimental<T extends DocumentData>(
  collectionPath: string,
  id: string
) {
  const firestore = useFirestore();
  const ref = doc(firestore, collectionPath, id) as DocumentReference<T>;
  return useDoc(ref);
}
