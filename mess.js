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

let map, marker;
let selectedLat = null;
let selectedLng = null;


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

  if (!selectedLat || !selectedLng) {
    alert("Please select location from map");
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
    lat: selectedLat,
    lng: selectedLng,
    messId: user.uid,
    status: "available",
    createdAt: serverTimestamp()
  });

  // Clear form
  document.getElementById("foodName").value = "";
  document.getElementById("quantity").value = "";
  document.getElementById("availableTill").value = "";
  document.getElementById("location").value = "";

  selectedLat = null;
  selectedLng = null;
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

window.openMap = function () {
  document.getElementById("mapModal").style.display = "block";

  setTimeout(() => {
    if (!map) {
      map = L.map("map").setView([20.5937, 78.9629], 5); // India default

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);

      map.on("click", async (e) => {
         if (marker) map.removeLayer(marker);

         selectedLat = e.latlng.lat;
         selectedLng = e.latlng.lng;

         marker = L.marker([selectedLat, selectedLng]).addTo(map);

         const address = await reverseGeocode(selectedLat, selectedLng);
         document.getElementById("location").value = address;
      });


    }
  }, 300);
};

window.closeMap = function () {
  document.getElementById("mapModal").style.display = "none";
};

window.useCurrentLocation = function () {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    selectedLat = pos.coords.latitude;
    selectedLng = pos.coords.longitude;

    if (marker) map.removeLayer(marker);

    marker = L.marker([selectedLat, selectedLng]).addTo(map);
    map.setView([selectedLat, selectedLng], 15);

    const address = await reverseGeocode(selectedLat, selectedLng);
    document.getElementById("location").value = address;
  });
};

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`
    );

    const data = await res.json();

    if (!data.features || data.features.length === 0) {
      return `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`;
    }

    const p = data.features[0].properties;

    // Build clean plain-text address
    const parts = [
      p.name,
      p.street,
      p.city,
      p.state,
      p.country
    ].filter(Boolean);

    return parts.join(", ");
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`;
  }
}


