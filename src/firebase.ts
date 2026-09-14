import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "aa-portal-sanctuary",
  appId: "1:359114308016:web:6cc7703a608f1ac28cfe75",
  storageBucket: "aa-portal-sanctuary.firebasestorage.app",
  apiKey: "AIzaSyA9fcptAbbXGGX2wiCHe3oQWTRXPAZDo1s",
  authDomain: "aa-portal-sanctuary.firebaseapp.com",
  messagingSenderId: "359114308016"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
