import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDKQR6q8VrRqDoQnPOpftuZ0p1BiAE3WhA",
  authDomain: "homefix-c1317.firebaseapp.com",
  projectId: "homefix-c1317",
  storageBucket: "homefix-c1317.firebasestorage.app",
  messagingSenderId: "18432677982",
  appId: "1:18432677982:web:771bcec2ea6392d4bdfccf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
