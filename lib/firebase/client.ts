import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADuG8ukoUAO5DH0pk5aQEKq0bppKFtrcs",
  authDomain: "e-commerce-test-b9da4.firebaseapp.com",
  projectId: "e-commerce-test-b9da4",
  storageBucket: "e-commerce-test-b9da4.firebasestorage.app",
  messagingSenderId: "239853411541",
  appId: "1:239853411541:web:1ffd2b2bf3efb72baed65c"
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
