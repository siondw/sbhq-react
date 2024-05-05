import { ref, set, get } from "firebase/database";
import { database } from '../firebase'; // Adjust the import path based on your project structure

export const registerUser = async (username, phoneNumber) => {
  const usernameLower = username.toLowerCase();
  const userRef = ref(database, `users/${usernameLower}`);

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      throw new Error('Username already taken');
    }
    await set(userRef, {
      username: usernameLower,
      phoneNumber: phoneNumber
    });
    console.log("User registered successfully!");
  } catch (error) {
    console.error("Registration error:", error);
    throw error; // Rethrow to handle it in the component
  }
};
