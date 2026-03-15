// 🔹 Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";


// 🔹 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAqq2ZYDUx7LWCfBFzcKIiCXveTTVAz9r0",
  authDomain: "plateshare-eafce.firebaseapp.com",
  projectId: "plateshare-eafce"
};

// 🔹 Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =======================
// 🗺 FOOD MAP
// =======================

let foodMap;
let foodMarkers = [];

function initFoodMap() {

  const mapDiv = document.getElementById("foodMap");
  if (!mapDiv) return;

  foodMap = L.map("foodMap").setView([20.5937, 78.9629], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(foodMap);

  loadFoodMarkers();
}

function loadFoodMarkers() {

  const q = query(
    collection(db, "food_posts"),
    where("status", "==", "available")
  );

  onSnapshot(q, (snapshot) => {

    foodMarkers.forEach(m => foodMap.removeLayer(m));
    foodMarkers = [];

    snapshot.forEach((docSnap) => {

      const food = docSnap.data();

      if (!food.lat || !food.lng) return;

      const marker = L.marker([food.lat, food.lng])
        .addTo(foodMap)
        .bindPopup(`
          <b>${food.foodName}</b><br>
          Quantity: ${food.quantity} plates<br>
          Location: ${food.location}<br>
          <b>Available till:</b> ${formatDateTime(food.availableTill)}
        `);

      foodMarkers.push(marker);

    });

  });
}

// Load map only if map exists
document.addEventListener("DOMContentLoaded", initFoodMap);


// =======================
// 🔐 SIGNUP
// =======================

window.signup = async function () {

  try {

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const role = document.querySelector(
      'input[name="role"]:checked'
    )?.value;

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    if (!role) {
      alert("Please select a role");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // 🔥 CREATE USER
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // 🔥 SEND EMAIL VERIFICATION
    await sendEmailVerification(cred.user);

    // 🔥 SAVE USER PROFILE
    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role,
      createdAt: new Date()
    });

    alert("Verification email sent. Please verify before logging in.");

    // 🔒 FORCE LOGOUT
    await signOut(auth);

    // 🔁 REDIRECT TO LOGIN
    window.location.href = "signin.html";

  } catch (error) {

    console.error("Signup error:", error);
    alert(error.message);

  }

};


// =======================
// 🔐 LOGIN
// =======================

window.login = async function () {

  try {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const cred = await signInWithEmailAndPassword(auth, email, password);

    if (!cred.user.emailVerified) {
      alert("Please verify your email before logging in.");
      await signOut(auth);
      return;
    }

    const userRef = doc(db, "users", cred.user.uid);
    const snap = await getDoc(userRef);

    // 🔥 CREATE PROFILE IF MISSING
    if (!snap.exists()) {

      await setDoc(userRef, {
        email: cred.user.email,
        role: "ngo",   // default role
        createdAt: new Date()
      });

    }

    const userData = (await getDoc(userRef)).data();

    redirect(userData.role);

  } catch (error) {

    console.error(error);
    alert(error.message);

  }

};


// =======================
// 🔁 REDIRECT BASED ON ROLE
// =======================

function redirect(role) {

  if (role === "mess") {
    window.location.href = "mess.html";
  }

  else if (role === "ngo") {
    window.location.href = "ngo.html";
  }

}


// =======================
// 🔒 DASHBOARD PROTECTION
// =======================

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  // 🔒 BLOCK UNVERIFIED USERS
  if (!user.emailVerified) {

    alert("Please verify your email first.");

    await signOut(auth);

    location.href = "signin.html";

    return;

  }

  const snap = await getDoc(doc(db, "users", user.uid));

  if (!snap.exists()) {
    console.error("User document missing.");
    return;
  }

  const role = snap.data().role;

  if (location.pathname.includes("mess") && role !== "mess") {
    location.href = "signin.html";
  }

  if (location.pathname.includes("ngo") && role !== "ngo") {
    location.href = "signin.html";
  }

});


// =======================
// 🕒 DATE FORMATTER
// =======================

function formatDateTime(ts) {

  if (!ts) return "";

  const date = ts.toDate ? ts.toDate() : new Date(ts);

  return date.toLocaleString("en-IN", {

    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true

  });

}
