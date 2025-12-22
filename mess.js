import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

/* ================= POST FOOD ================= */
window.postFood = async function () {
  const foodName = document.getElementById("foodName").value;
  const quantity = document.getElementById("quantity").value;
  const availableTill = document.getElementById("availableTill").value;
  const location = document.getElementById("location").value;

  if (!foodName || !quantity || !availableTill || !location) {
    alert("Please fill all fields");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("Not logged in");
    return;
  }

  await addDoc(collection(db, "food_posts"), {
    foodName,
    quantity: Number(quantity),
    availableTill,
    location,
    messId: user.uid,              // 🔥 CRITICAL
    status: "available",
    createdAt: serverTimestamp()   // 🔥 REQUIRED FOR ORDERING
  });

  // Clear form
  document.getElementById("foodName").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("availableTill").value = "";
  document.getElementById("location").value = "";
};

/* ================= LOAD PREVIOUS FOOD ================= */
const loadPreviousFood = (messId) => {
  const foodList = document.getElementById("previousFoodList");

  if (!foodList) {
    console.error("previousFoodList div not found");
    return;
  }

  const q = query(
    collection(db, "food_posts"),
    where("messId", "==", messId),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    foodList.innerHTML = "";

    if (snapshot.empty) {
      foodList.innerHTML = "<p>No food posted yet.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const food = doc.data();

      const div = document.createElement("div");
      div.className = "food-card";

      div.innerHTML = `
        <b>${food.foodName}</b><br>
        Quantity: ${food.quantity} plates<br>
        Location: ${food.location}<br>
        Status: <span style="color:${
          food.status === "available" ? "green" : "orange"
        }">${food.status}</span>
      `;

      foodList.appendChild(div);
    });
  });
};

/* ================= AUTH ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "signin.html";
    return;
  }

  // 🔥 THIS ENSURES UID === messId
  loadPreviousFood(user.uid);
});
