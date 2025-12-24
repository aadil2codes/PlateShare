import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,          // 🔥 ADD THIS
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";


import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

let ngoMap;
let ngoMarkers = [];


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
  Quantity: ${food.quantity} plates<br>
  Location: ${food.location}<br>
  <b>Available till:</b> ${formatDateTime(food.availableTill)}<br><br>

  <button class="primary-btn"
    onclick="openConfirmAccept(
      '${foodId}',
      '${food.foodName}',
      '${food.quantity}',
      '${food.location}',
      '${food.availableTill}'
    )">
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
  Quantity: ${food.quantity} plates<br>
  Location: ${food.location}<br>
  <b>Available till:</b> ${formatDateTime(food.availableTill)}<br>
  <b>Status:</b> Picked
`;
;

      pickupList.appendChild(div);
    });
  });
};

/* ================= ACCEPT PICKUP ================= */
window.acceptPickup = async function (foodId) {
  const user = auth.currentUser;
  if (!user) return;

  const userSnap = await getDoc(doc(db, "users", user.uid));
  const ngoName = userSnap.exists() ? userSnap.data().name : "Unknown";

  await updateDoc(doc(db, "food_posts", foodId), {
    status: "pickup",
    pickedBy: user.uid,
    pickedByName: ngoName,   // 🔥 NEW
    pickedAt: serverTimestamp()
  });
  document.getElementById("ngoMapModal").style.display = "none";
};

/* ================= AUTH ================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "signin.html";
    return;
  }

  // 🔥 Fetch NGO name
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    const name = snap.data().name;
    document.getElementById("ngoName").innerText = `NGO/Volunteer (${name})`;
  }

  loadAvailableFood();
  loadMyPickups(user.uid);
});

window.openFoodMap = function () {
  document.getElementById("ngoMapModal").style.display = "block";

  setTimeout(() => {
    if (!ngoMap) {
      ngoMap = L.map("ngoFoodMap").setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(ngoMap);

      loadFoodMarkersOnMap();
    }

    ngoMap.invalidateSize();
  }, 300);
};

window.closeFoodMap = function () {
  document.getElementById("ngoMapModal").style.display = "none";
};

function loadFoodMarkersOnMap() {
  const q = query(
    collection(db, "food_posts"),
    where("status", "==", "available")
  );

  onSnapshot(q, (snapshot) => {
    ngoMarkers.forEach(m => ngoMap.removeLayer(m));
    ngoMarkers = [];

    snapshot.forEach((docSnap) => {
      const food = docSnap.data();
      if (!food.lat || !food.lng) return;

      const marker = L.marker([food.lat, food.lng])
        .addTo(ngoMap)
        .bindPopup(`
  <b>${food.foodName}</b><br>
  Quantity: ${food.quantity} plates<br>
  Location: ${food.location}<br>
  <b>Available till:</b> ${formatDateTime(food.availableTill)}<br><br>

  <button
    class="primary-btn"
    style="width:100%;"
    onclick="openConfirmAccept(
      '${docSnap.id}',
      '${food.foodName}',
      '${food.quantity}',
      '${food.location}',
      '${food.availableTill}'
    )"
  >
    Accept Food
  </button>
`);



      ngoMarkers.push(marker);
    });
  });
}

let pendingFoodId = null;

window.openConfirmAccept = function (id, name, qty, loc, till) {
  pendingFoodId = id;

  document.getElementById("aFood").innerText = name;
  document.getElementById("aQty").innerText = qty;
  document.getElementById("aLoc").innerText = loc;
  document.getElementById("aTime").innerText = formatDateTime(till);

  document.getElementById("confirmAcceptModal").style.display = "block";
};


window.closeConfirmAccept = function () {
  pendingFoodId = null;
  document.getElementById("confirmAcceptModal").style.display = "none";
};

window.confirmAcceptFood = function () {
  if (!pendingFoodId) return;
  acceptPickup(pendingFoodId);
  closeConfirmAccept();
};

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
