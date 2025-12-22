import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

/* ================= LOAD AVAILABLE FOOD ================= */
const loadAvailableFood = () => {
  const foodList = document.getElementById("ngoFoodList");

  if (!foodList) {
    console.error("ngoFoodList div not found");
    return;
  }

  const q = query(
    collection(db, "food_posts"),
    where("status", "==", "available"),     // 🔥 all mess users
    orderBy("createdAt", "desc")            // 🔥 newest first
  );

  onSnapshot(q, (snapshot) => {
    foodList.innerHTML = "";

    if (snapshot.empty) {
      foodList.innerHTML = "<p>No food available right now.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const food = doc.data();
      const foodId = doc.id;

      const div = document.createElement("div");
      div.className = "food-card";

      div.innerHTML = `
        <b>${food.foodName}</b><br>
        Quantity: ${food.quantity} plates<br>
        Location: ${food.location}<br><br>
        <button class="primary-btn" onclick="acceptPickup('${foodId}')">
          Accept Pickup
        </button>
      `;

      foodList.appendChild(div);
    });
  });
};

/* ================= ACCEPT PICKUP (NEXT STEP READY) ================= */
window.acceptPickup = (foodId) => {
  alert("Pickup accepted for food ID: " + foodId);
  // We will update Firestore here in the next step
};

/* ================= AUTH ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "signin.html";
    return;
  }

  loadAvailableFood(); // 🔥 load all available food
});