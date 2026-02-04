import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { getFirebaseConfig } from './config';

export {
  useCollection,
} from './firestore/use-collection';
export {
  useDoc,
} from './firestore/use-doc';
export {
  useUser
} from './auth/use-user';
export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './provider';

export {
  FirebaseClientProvider,
} from './client-provider';

export { errorEmitter } from './error-emitter';
export { FirestorePermissionError } from './errors';

export async function initializeFirebase(): Promise<{
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}> {
  try {
    const config = await getFirebaseConfig();
    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(config);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    return { app, auth, firestore };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    throw error;
  }
}
