// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAe8KAbQxu-pbzFs_UybjxTcCSzHAwQAXQ",
  authDomain: "family-fantasy-league-c62d0.firebaseapp.com",
  projectId: "family-fantasy-league-c62d0",
  storageBucket: "family-fantasy-league-c62d0.firebasestorage.app",
  messagingSenderId: "484346285032",
  appId: "1:484346285032:web:9d2e5fe52e37f5afd0325d",
  measurementId: "G-GDCW1VWKFY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
