import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'; // Import connectDatabaseEmulator

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
const auth = getAuth(app); 

// Initialize database 
const database = getDatabase(app); 

// Connect to emulators if running locally
if (window.location.hostname === "localhost") {
  // Point to the RTDB emulator running on localhost.
  connectDatabaseEmulator(database, "127.0.0.1", 9000);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}

// Export auth and database
export { auth, database };

// Log Firebase app and auth type for debugging
console.log('Firebase app:', app); 
console.log('auth type:', typeof auth); 
