// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqI0rYVeekxs1h_cEpzlHh92sr0tAbKUU",
  authDomain: "sbhq-26286.firebaseapp.com",
  projectId: "sbhq-26286",
  storageBucket: "sbhq-26286.appspot.com",
  messagingSenderId: "985898293549",
  appId: "1:985898293549:web:bcf48be50fa859d0685ba4",
  measurementId: "G-WRNFP0Q112"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebase);

export default firebase;