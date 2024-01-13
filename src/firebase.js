import { initializeApp } from "firebase/app"; 
import { GoogleAuthProvider, getAuth, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut} from "firebase/auth";
import { getFirestore} from "firebase/firestore";
import { getDatabase, ref, set, get, update } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyBMggM1vkjwyU25JvH-udyRuhsUhxCZ6Pc",
  authDomain: "totalsportsmapwebapp.firebaseapp.com",
  projectId: "totalsportsmapwebapp",
  storageBucket: "totalsportsmapwebapp.appspot.com",
  messagingSenderId: "756388456753",
  appId: "1:756388456753:web:34bb7288e9f5096087e810",
  databaseURL: "https://totalsportsmapwebapp-default-rtdb.europe-west1.firebasedatabase.app/",
  measurementId: "G-CXH4263D7J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);
//const usersRef = ref(database, 'users');
const googleProvider = new GoogleAuthProvider();

const createUserInDatabase = async (user, authProvider, name = '') => {
  try {
    await set(ref(database, 'users/' + user.uid), {
      uid: user.uid,
      name: name || user.displayName,
      authProvider: authProvider,
      email: user.email,
      footballFieldsFavouriteList: [],
      basketballFieldsFavouriteList: [],
      tennisFieldsFavouriteList: []
    });
  } catch (error) {
    console.error("Error writing user data to Realtime Database:", error);
  }
};

const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    await createUserInDatabase(user, "google");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await createUserInDatabase(user, "normal", name);
  } catch (error) {
    console.error("Error writing to Realtime Database:", error);
    alert(error.message);
  }
};

const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logout = () => {
  signOut(auth);
};

const addFootballFieldsToFirebase = async (fieldsData) => {
  const footballFieldsRef = ref(database, 'footballfields');
  try {
    await set(footballFieldsRef, fieldsData);
    console.log("Football fields added to Firebase successfully");
  } catch (error) {
    console.error("Error adding football fields to Firebase:", error);
  }
};

const addBasketballFieldsToFirebase = async (fieldsData) => {
  const basketballFieldsRef = ref(database, 'basketballfields');
  try {
    await set(basketballFieldsRef, fieldsData);
    console.log("Basketball fields added to Firebase successfully");
  } catch (error) {
    console.error("Error adding basketball fields to Firebase:", error);
  }
};

const addTennisFieldsToFirebase = async (fieldsData) => {
  const tennisFieldsRef = ref(database, 'tennisfields');
  try {
    await set(tennisFieldsRef, fieldsData);
    console.log("Tennis fields added to Firebase successfully");
  } catch (error) {
    console.error("Error adding tennis fields to Firebase:", error);
  }
};

const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  return user ? user.uid : null;
};

const addToFavorites = async (fieldId, favoriteListName) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("User not logged in");
    return;
  }

  const userRef = ref(database, 'users/' + user.uid);
  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let userData = snapshot.val();
        let favorites = userData[favoriteListName] || [];

        // Check if the fieldId is in the favorites array
        if (!favorites.includes(fieldId)) {
          favorites.push(fieldId);
          // Create an object with the specific fieldListName and update the user's data
          const updateData = { [favoriteListName]: favorites };
          update(userRef, updateData);
          alert("Field added to favorites!");
          console.log("Field added to favorites!");
        } else {
          console.log("Field is already in favorites.");
          alert("Field is already in favorites.");
        }
      } else {
        console.error("User not found in database");
      }
    })
    .catch((error) => {
      console.error("Error reading user data from Realtime Database:", error);
    });
};

const removeFromFavorites = async (fieldId, favoriteListName) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("User not logged in");
    return;
  }

  const userRef = ref(database, 'users/' + user.uid);
  get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        let userData = snapshot.val();
        let favorites = userData[favoriteListName] || [];

        // Check if the fieldId is in the favorites array
        const index = favorites.indexOf(fieldId);
        if (index !== -1) {
          // Remove the fieldId from the favorites array
          favorites.splice(index, 1);
          // Create an object with the specific fieldListName and update the user's data
          const updateData = { [favoriteListName]: favorites };
          update(userRef, updateData);
          alert("Field removed from favorites!");
          console.log("Field removed from favorites!");
        } else {
          alert("Field is not in favorites.");
          console.log("Field is not in favorites.");
        }
      } else {
        console.error("User not found in database");
      }
    })
    .catch((error) => {
      console.error("Error reading user data from Realtime Database:", error);
    });
};

export {
  auth,
  db,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordReset,
  logout,
  sendPasswordResetEmail,
  addFootballFieldsToFirebase,
  addBasketballFieldsToFirebase,
  addTennisFieldsToFirebase,
  addToFavorites,
  removeFromFavorites,
  getCurrentUserId
};