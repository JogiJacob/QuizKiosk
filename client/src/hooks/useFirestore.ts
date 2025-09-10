import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useCollection<T>(collectionName: string, conditions?: any[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = collection(db, collectionName);
    
    if (conditions && conditions.length > 0) {
      q = query(q, ...conditions) as any;
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot: any) => {
        const items = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to Date objects
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
          completedAt: doc.data().completedAt?.toDate?.() || doc.data().completedAt,
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err: any) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, JSON.stringify(conditions)]);

  return { data, loading, error };
}

export function useDocument<T>(collectionName: string, docId: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, docId);
    const unsubscribe = onSnapshot(docRef,
      (doc: any) => {
        if (doc.exists()) {
          const docData = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
            updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
            completedAt: doc.data().completedAt?.toDate?.() || doc.data().completedAt,
          } as T;
          setData(docData);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err: any) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, docId]);

  return { data, loading, error };
}

export async function createDocument(collectionName: string, data: any) {
  const docData = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  return await addDoc(collection(db, collectionName), docData);
}

export async function updateDocument(collectionName: string, docId: string, data: any) {
  const docData = {
    ...data,
    updatedAt: Timestamp.now(),
  };
  
  const docRef = doc(db, collectionName, docId);
  return await updateDoc(docRef, docData);
}

export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  return await deleteDoc(docRef);
}
