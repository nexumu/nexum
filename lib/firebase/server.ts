import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-nOS5fyhai4fcHBnDYDYOOEFNBQ1FuOM",
  authDomain: "nexum-737c3.firebaseapp.com",
  projectId: "nexum-737c3",
  storageBucket: "nexum-737c3.firebasestorage.app",
  messagingSenderId: "689132608029",
  appId: "1:689132608029:web:4624f56cd616bfc03604f4",
  measurementId: "G-6LK5BFPXV9"
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.warn(
    `Firebase config is missing: ${missingKeys.join(", ")}. ` +
    "Add them to your environment variables."
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
