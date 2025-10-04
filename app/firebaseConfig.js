// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBOpb7buIgtZ0mRV00ToQiP3eJ1GxbTgoM",
  authDomain: "auravision-c0f54.firebaseapp.com",
  projectId: "auravision-c0f54",
  storageBucket: "auravision-c0f54.firebasestorage.app",
  messagingSenderId: "324090744088",
  appId: "1:324090744088:web:eb8b441e1428563606226d",
  measurementId: "G-DR24JE46HQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);