import { getDatabase, ref, get } from 'firebase/database';

export const checkOpenLobbies = async () => {
  const db = getDatabase();
  const contestsRef = ref(db, 'contests');
  const snapshot = await get(contestsRef);
  const contests = snapshot.val();
  console.log("Contests from database:", contests); // Debugging statement
  if (contests) {
    for (const contestId in contests) {
      console.log(`Checking contest ${contestId} for open lobby`); // Debugging statement
      if (contests[contestId].lobbyOpen) {
        console.log(`Contest ${contestId} has an open lobby`); // Debugging statement
        return { id: contestId, ...contests[contestId] };
      }
    }
  }
  console.log("No open lobbies found"); // Debugging statement
  return null;
};
