import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

/* ================= AVAILABLE FOOD ================= */
const loadAvailableFood = () => {
  const foodList = document.getElementById("ngoFoodList");

  const q = query(
    collection(db, "food_posts"),
    where("status", "==", "available"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    foodList.innerHTML = "";

    if (snapshot.empty) {
      foodList.innerHTML = "<p>No food available.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const food = docSnap.data();
      const foodId = docSnap.id;

      const div = document.createElement("div");
      div.className = "food-card";

      div.innerHTML = `
        <b>${food.foodName}</b><br>
        Quantity: ${food.quantity}<br>
        Location: ${food.location}<br><br>
        <button class="primary-btn" onclick="acceptPickup('${foodId}')">
          Accept Pickup
        </button>
      `;

      foodList.appendChild(div);
    });
  });
};

/* ================= MY PICKUPS ================= */
const loadMyPickups = (ngoId) => {
  const pickupList = document.getElementById("pickupFoodList");

  const q = query(
    collection(db, "food_posts"),
    where("status", "==", "pickup"),
    where("pickedBy", "==", ngoId),
    orderBy("pickedAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    pickupList.innerHTML = "";

    if (snapshot.empty) {
      pickupList.innerHTML = "<p>No pickups yet.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const food = docSnap.data();

      const div = document.createElement("div");
      div.className = "food-card";

      div.innerHTML = `
        <b>${food.foodName}</b><br>
        Quantity: ${food.quantity}<br>
        Location: ${food.location}<br>
        <b>Status:</b> Pickup Accepted
      `;

      pickupList.appendChild(div);
    });
  });
};

/* ================= ACCEPT PICKUP ================= */
window.acceptPickup = async function (foodId) {
  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, "food_posts", foodId), {
    status: "pickup",
    pickedBy: user.uid,
    pickedAt: serverTimestamp()
  });
};

/* ================= AUTH ================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "signin.html";
    return;
  }

  loadAvailableFood();
  loadMyPickups(user.uid);
});
