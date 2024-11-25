import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyBHNLhMZPgqu4s9EsAFztxu",
  authDomain: "alertx-8b6eb.firebaseapp.com",
  databaseURL: "https://alertx-8b6eb-default-rtdb.firebaseio.com",
  projectId: "alertx-8b6eb",
  storageBucket: "alertx-8b6eb.appspot.com",
  messagingSenderId: "785011938444",
  appId: "1:785011938444:web:f814f9a312a1fa8d8357a9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

export { db, storage };