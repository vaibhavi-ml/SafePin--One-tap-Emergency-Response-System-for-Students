// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// 🔑 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC3jGs1IWuhourxEQ8hOjrTMm3IO9apC4A",
  authDomain: "hostel-emergency-locator.firebaseapp.com",
  projectId: "hostel-emergency-locator",
  storageBucket: "hostel-emergency-locator.firebasestorage.app",
  messagingSenderId: "917765002280",
  appId: "1:917765002280:web:0c75d67c9d9a111233111d",
  measurementId: "G-G5WMNSP6LS",
};

// ✅ 1. Initialize app FIRST
const app = initializeApp(firebaseConfig);

// ✅ 2. Initialize services USING app
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// ✅ 3. Export everything AFTER initialization
export {
  // core
  app,
  auth,
  db,
  messaging,

  // auth helpers
  signInWithEmailAndPassword,
  signInAnonymously,

  // firestore helpers
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc, 

  // messaging helpers
  getToken,
  onMessage,
};
