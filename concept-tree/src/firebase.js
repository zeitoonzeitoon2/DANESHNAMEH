// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, collection } from "firebase/firestore";

// این متغیرها به صورت گلوبال از محیط Canvas تامین می شوند.
// استفاده از مقادیر سخت‌کد شده ممکن است در این محیط باعث بروز مشکل شود.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Public data references
// اینجا متغیرهای graphDocRef و articlesCollectionRef را به درستی export می کنیم.
export const graphDocRef = doc(db, `artifacts/${appId}/public/graphData`);
export const articlesCollectionRef = collection(db, `artifacts/${appId}/public/articles`);
