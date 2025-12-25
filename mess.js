import {
  getFirestore, collection, addDoc, query, where,
  onSnapshot, serverTimestamp, orderBy, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { getAuth, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

let map, marker;
let selectedLat = null;
let selectedLng = null;


window.selectedDate = null;

/* ================= DATE ================= */
function setActiveDateButton(id) {
  ["todayBtn", "tomorrowBtn"].forEach(b => {
    document.getElementById(b)?.classList.remove("active");
  });
  document.getElementById(id)?.classList.add("active");
}

window.setToday = () => {
  const d = new Date();
  d.setHours(0,0,0,0);
  window.selectedDate = d;
  setActiveDateButton("todayBtn");
};

window.setTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0,0,0,0);
  window.selectedDate = d;
  setActiveDateButton("tomorrowBtn");
};

/* ================= AUTH ================= */
onAuthStateChanged(auth, async user => {
  if (!user) return location.href = "signin.html";
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    document.getElementById("messName").innerText =
      `Mess/Canteen (${snap.data().name})`;
  }
  loadPreviousFood(user.uid);
});

/* ================= POST FOOD ================= */
window.postFood = async () => {
  const foodName = foodNameInput.value;
  const quantity = quantityInput.value;
  const timeValue = availableTill.value;
  const location = locationInput.value;

  if (!foodName || !quantity || !timeValue || !location || !window.selectedDate)
    return alert("Please complete all fields");

  const [h, m] = timeValue.split(":");
  const dt = new Date(window.selectedDate);
  dt.setHours(h, m, 0, 0);

  await addDoc(collection(db, "food_posts"), {
    foodName,
    quantity: Number(quantity),
    availableTill: dt,
    location,
    lat: selectedLat,
    lng: selectedLng,
    messId: auth.currentUser.uid,
    status: "available",
    createdAt: serverTimestamp()
  });

  foodNameInput.value = quantityInput.value =
  availableTill.value = locationInput.value = "";
};

/* ================= LOAD PREVIOUS ================= */
function loadPreviousFood(id) {
  const q = query(
    collection(db, "food_posts"),
    where("messId", "==", id),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snap => {
    previousFoodList.innerHTML = "";
    snap.forEach(d => {
      previousFoodList.innerHTML += `
        <div class="food-card">
          <b>${d.data().foodName}</b><br>
          ${d.data().quantity} plates<br>
          ${d.data().location}
        </div>`;
    });
  });
}

/* ================= VOICE FOOD POST ================= */

let voiceData = {};
let voiceRecognition = null;
let isVoiceActive = false;

window.startVoiceFoodPost = function () {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice input not supported");
    return;
  }

  // 🔥 hard reset
  cancelVoiceFoodPost();

  voiceRecognition = new webkitSpeechRecognition();
  const rec = voiceRecognition;
  isVoiceActive = true;

  rec.lang = "en-IN";
  rec.continuous = false;
  rec.interimResults = false;

  rec.onresult = async (e) => {
    if (!isVoiceActive) return;

    const speech = e.results[0][0].transcript.toLowerCase();
    console.log("Voice:", speech);

    extractVoiceData(speech);
    await handleMissingVoiceData();

    cancelVoiceFoodPost(); // ✅ auto-close after success
  };

  rec.onerror = () => {
    cancelVoiceFoodPost();
  };

  rec.onend = () => {
    cancelVoiceFoodPost();
  };

  openVoiceModal();
  rec.start();
};



function extractVoiceData(text) {
  if (text.includes("tomorrow")) setTomorrow();
  if (text.includes("today")) setToday();

  const food = text.match(/foods? are (.+)/);
  if (food) voiceData.foodName = food[1];

  const qty = text.match(/(\d+)\s*(plate|plates)/);
  if (qty) voiceData.quantity = qty[1];

  const time = text.match(/(\d+)\s*(am|pm)/);
  if (time) {
    let h = +time[1];
    if (time[2] === "pm" && h < 12) h += 12;
    voiceData.time = `${h}:00`;
  }

  if (text.includes("current location")) useCurrentLocation();
}

async function handleMissingVoiceData() {
  if (!voiceData.foodName) voiceData.foodName = prompt("Food name?");
  if (!voiceData.quantity) voiceData.quantity = prompt("Quantity?");
  if (!voiceData.time) voiceData.time = prompt("Available till (HH:MM)?");
  if (!locationInput.value) return openMap();
  fillFormFromVoice();
}

function fillFormFromVoice() {
  foodNameInput.value = voiceData.foodName;
  quantityInput.value = voiceData.quantity;
  availableTill.value = voiceData.time;
  openConfirmPost();
}

/* ================= VOICE MODAL ================= */
function openVoiceModal() {
  document.getElementById("voiceModal").classList.add("show");
}

function closeVoiceModal() {
  document.getElementById("voiceModal").classList.remove("show");
}


window.cancelVoiceFoodPost = function () {
  if (!isVoiceActive) return;

  isVoiceActive = false;

  // 🔥 hide modal FIRST
  closeVoiceModal();

  // 🔥 kill recognition safely
  if (voiceRecognition) {
    voiceRecognition.onresult = null;
    voiceRecognition.onerror = null;
    voiceRecognition.onend = null;

    try {
      voiceRecognition.stop();
    } catch (e) {}

    voiceRecognition = null;
  }

  // 🔥 reset data
  voiceData = {};
  console.log("🎤 Voice input cancelled");
};


document.querySelector(".voice-modal-content").addEventListener("click", e => {
  e.stopPropagation();
});

document.getElementById("voiceModal").addEventListener("click", () => {
  cancelVoiceFoodPost();
});

/* ================= MAP LOCATION PICKER ================= */

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();

    return data.display_name || "Selected location";
  } catch (err) {
    console.error("Reverse geocoding failed", err);
    return "Selected location";
  }
}


window.openMap = function () {
  const modal = document.getElementById("mapModal");
  modal.style.display = "block";

  setTimeout(() => {
    if (!map) {
      map = L.map("map").setView([20.5937, 78.9629], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);

      map.on("click", async function (e) {
        selectedLat = e.latlng.lat;
        selectedLng = e.latlng.lng;

        if (marker) map.removeLayer(marker);
        marker = L.marker([selectedLat, selectedLng]).addTo(map);

        const address = await reverseGeocode(selectedLat, selectedLng);
        document.getElementById("location").value = address;
      });
    }

    map.invalidateSize(); // ✅ works now
  }, 300);
};


window.closeMap = function () {
  document.getElementById("mapModal").style.display = "none";


  if (selectedLat && selectedLng) {
    document.getElementById("location").value =
      `Lat: ${selectedLat.toFixed(5)}, Lng: ${selectedLng.toFixed(5)}`;
  }
};

window.useCurrentLocation = function () {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  // ✅ ensure map exists
  if (!map) openMap();

  navigator.geolocation.getCurrentPosition(async pos => {
    selectedLat = pos.coords.latitude;
    selectedLng = pos.coords.longitude;

    if (marker) map.removeLayer(marker);
    marker = L.marker([selectedLat, selectedLng]).addTo(map);

    map.setView([selectedLat, selectedLng], 16);

    const address = await reverseGeocode(selectedLat, selectedLng);
    document.getElementById("location").value = address;
  }, () => {
    alert("Location access denied");
  });
};






