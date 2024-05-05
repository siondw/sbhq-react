import { ref, set, get } from "firebase/database";
import { database } from "../firebase"; // Adjust the import path based on your project structure

export function checkUserExists(uid) {
  const userRef = ref(database, `users/${uid}`);
  return get(userRef)
    .then((snapshot) => {
      return snapshot.exists(); // Returns true if the user exists, false otherwise
    })
    .catch((error) => {
      console.error("Failed to check user existence:", error);
      throw error; // Rethrow to handle the error outside of this function
    });
}

export function addUserToDB(uid, username, phoneNumber) {
  const userRef = ref(database, `users/${uid}`);
  return set(userRef, {
    username: username,
    phoneNumber: phoneNumber,
  })
    .then(() => {
      console.log("User added successfully");
    })
    .catch((error) => {
      console.error("Failed to add user to the database:", error);
      throw error; // Rethrow to handle the error outside of this function
    });
}

export function getUserDetails(uid) {
  const userRef = ref(database, `users/${uid}`);
  return get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val(); // Returns the user's details
      } else {
        throw new Error("User not found");
      }
    })
    .catch((error) => {
      console.error("Failed to get user details:", error);
      throw error; // Rethrow to handle the error outside of this function
    });
}
