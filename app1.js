// 🔹 Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAqq2ZYDUx7LWCfBFzcKIiCXveTTVAz9r0",
  authDomain: "plateshare-eafce.firebaseapp.com",
  projectId: "plateshare-eafce"
};

// 🔹 Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 SIGNUP
window.signup = async function () {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email,
    role
  });

  redirect(role);
};

// 🔹 LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", cred.user.uid));
  redirect(snap.data().role);
};

// 🔹 REDIRECT
function redirect(role) {
  if (role === "mess") {
    window.location.href = "mess.html";
  } else if (role === "ngo") {
    window.location.href = "ngo.html";
  }
}

// 🔹 DASHBOARD PROTECTION
onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  const role = snap.data().role;

  if (location.pathname.includes("mess") && role !== "mess") {
    location.href = "signin.html";
  }

  if (location.pathname.includes("ngo") && role !== "ngo") {
    location.href = "signin.html";
  }
});
