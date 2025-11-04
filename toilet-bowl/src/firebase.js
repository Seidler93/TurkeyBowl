// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8kI1JxasbjewAcivs6TqVmCV3ugiHoXM",
  authDomain: "turkeybowl-743d7.firebaseapp.com",
  projectId: "turkeybowl-743d7",
  storageBucket: "turkeybowl-743d7.firebasestorage.app", // ✅ fixed this line
  messagingSenderId: "710583018177",
  appId: "1:710583018177:web:db56771265e5576cb9aa40"
};

const app = initializeApp(firebaseConfig);

// Firestore + Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
export { collection, addDoc, getDocs };
export default app;
