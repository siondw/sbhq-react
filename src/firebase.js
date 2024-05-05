import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // If you still need database 



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqI0rYVeekxs1h_cEpzlHh92sr0tAbKUU",
  authDomain: "sbhq-26286.firebaseapp.com",
  databaseURL: "https://sbhq-26286-default-rtdb.firebaseio.com/",
  projectId: "sbhq-26286",
  storageBucket: "sbhq-26286.appspot.com",
  messagingSenderId: "985898293549",
  appId: "1:985898293549:web:bcf48be50fa859d0685ba4",
  measurementId: "G-WRNFP0Q112"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize auth
export const auth = getAuth(app); 

// Initialize database 
export const database = getDatabase(app); 

// In your firebase.js (or where you initialize Firebase) 
console.log('Firebase app:', app); 

console.log('auth type:', typeof auth); 


