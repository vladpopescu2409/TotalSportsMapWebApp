import { initializeApp } from "firebase/app"; 
import { GoogleAuthProvider, getAuth, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut} from "firebase/auth";
import { getFirestore} from "firebase/firestore";
import { getDatabase, ref, set } from 'firebase/database';


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

const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;

    // Save user data in Realtime Database
    await set(ref(database, 'users/' + user.uid), {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      authProvider: "google",
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
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

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    set(ref(database, 'users/' + user.uid), {
      uid: user.uid,
      name,
      email,
    });
  } catch (error) {
    console.error("Error writing to Realtime Database:", error);
    alert(error.message);
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
  addTennisFieldsToFirebase
};