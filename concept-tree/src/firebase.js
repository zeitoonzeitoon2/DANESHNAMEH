// src/firebase.js

// Firebase SDK را برای برنامه وب اولیه سازی می کند
import { initializeApp } from "firebase/app";
// Firestore Database و Authentication را ایمپورت می کند.
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// اطلاعات پیکربندی پروژه Firebase شما.
// این اطلاعات را از کنسول Firebase خود کپی کنید.
// توجه: این مقادیر باید با مقادیر واقعی پروژه شما جایگزین شوند.
const firebaseConfig = {
  apiKey: "AIzaSyA3uKmbMsC1q8q52mxVOujFg8bl-jtuspc",
  authDomain: "daneshnamehapp-b9685.firebaseapp.com",
  projectId: "daneshnamehapp-b9685",
  storageBucket: "daneshnamehapp-b9685.firebasestorage.app",
  messagingSenderId: "865618306278",
  appId: "1:865618306278:web:32bc6dd2cb7c1323664727"
};

// برنامه Firebase را با اطلاعات پیکربندی شما اولیه سازی می کند.
const app = initializeApp(firebaseConfig);

// سرویس های Firestore Database و Authentication را دریافت می کند.
const db = getFirestore(app);
const auth = getAuth(app);

// سرویس های 'db' و 'auth' را برای استفاده در سایر فایل ها export می کند.
export { db, auth };
