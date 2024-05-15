import { getDatabase, ref, get, set, child } from "firebase/database";
import { getAuth } from "firebase/auth";

const db = getDatabase();
const auth = getAuth();

export const checkUserExists = async (uid) => {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `users/${uid}`));
  return snapshot.exists();
};

export const addUserToDB = async (uid, displayName, phoneNumber) => {
  const user = auth.currentUser;
  if (user) {
    await set(ref(db, `users/${uid}`), {
      username: displayName,
      phoneNumber: phoneNumber
    });
  } else {
    throw new Error("User is not authenticated.");
  }
};

export const getUserDetails = async (uid) => {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, `users/${uid}`));
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    console.log("No data available");
    return null;
  }
};
