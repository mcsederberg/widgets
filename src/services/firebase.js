
import { getFirestore } from 'firebase/firestore';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmtiavzhKAvt_MXtv6waZ8635xae4Xs_4",
  authDomain: "widgets-58d31.firebaseapp.com",
  projectId: "widgets-58d31",
  storageBucket: "widgets-58d31.firebasestorage.app",
  messagingSenderId: "357520021093",
  appId: "1:357520021093:web:febfa7ed20d446c499188c",
  measurementId: "G-YY2JG813VB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };