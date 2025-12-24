/****************************************************
 * PlateShare – Gemini AI Assistant (STABLE)
 * Chat + Voice | Conversational | Demo-safe
 ****************************************************/

/* ================= CONFIG ================= */

const GEMINI_API_KEY = "YOUR_API_KEY_HERE";
const GEMINI_MODEL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

let chatHistory = [];

/* ================= MODAL ================= */

window.openAIAssistant = () => {
  document.getElementById("aiModal").style.display = "block";
};

window.closeAIAssistant = () => {
  document.getElementById("aiModal").style.display = "none";
  document.getElementById("chatArea").classList.add("hidden");
  document.getElementById("chatMessages").innerHTML = "";
  chatHistory = [];
};

/* ================= CHAT ================= */

window.startChat = () => {
  document.getElementById("chatArea").classList.remove("hidden");

  const intro =
    "Hi 👋 I’m PlateShare AI. I’m here to explain the app, guide you, and answer your questions.";

  addAIMessage(intro);

  chatHistory.push({
    role: "assistant",
    text: intro
  });
};

window.sendChat = async () => {
  const input = document.getElementById("chatInput");
  const question = input.value.trim();
  if (!question) return;

  addUserMessage(question);

  chatHistory.push({
    role: "user",
    text: question
  });

  input.value = "";

  const reply = await askGemini();

  addAIMessage(reply);

  chatHistory.push({
    role: "assistant",
    text: reply
  });
};

/* ================= GEMINI ================= */

async function askGemini() {
  try {
    const response = await fetch(
      `${GEMINI_MODEL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "system",
              parts: [
                {
                  text: `
You are PlateShare AI, a friendly human assistant.

Speak naturally like a real person.
Explain things clearly with examples.
Remember the conversation.
Avoid robotic or documentation-style replies.

PlateShare context:
PlateShare helps reduce food waste by connecting Mess/Canteens
with NGOs and Volunteers for real-time food pickup.
                  `
                }
              ]
            },
            ...chatHistory.slice(-6).map(msg => ({
              role: msg.role,
              parts: [{ text: msg.text }]
            }))
          ]
        })
      }
    );

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;

    if (Array.isArray(parts)) {
      const text = parts.map(p => p.text).join(" ").trim();
      if (text.length > 0) return text;
    }

    return fallbackResponse(chatHistory[chatHistory.length - 1]?.text || "");


  } catch (err) {
    console.error("Gemini error:", err);
    return fallbackResponse(chatHistory[chatHistory.length - 1]?.text || "");

  }
}

/* ================= FALLBACK ================= */

function fallbackResponse(lastUserMessage = "") {
  const intent = detectIntent(lastUserMessage);

  switch (intent) {
    /* ===== WHO ARE YOU ===== */
    case INTENTS.IDENTITY:
      return `
I’m PlateShare AI 😊  
I help you understand the app, guide you through signup and login,
and answer questions about how PlateShare works.
      `;

    /* ===== WHAT IS THIS APP ===== */
    case INTENTS.WHAT_IS_APP:
      return `
PlateShare is a food-sharing app that reduces food waste.

When messes or canteens have extra cooked food,
they post it on PlateShare.
Nearby NGOs and volunteers collect it
and distribute it to people in need.
      `;

    /* ===== HOW IT WORKS ===== */
    case INTENTS.HOW_IT_WORKS:
      return `
PlateShare works in a simple way.

Messes post surplus food with quantity, time, and location.
NGOs nearby see this food instantly on the app.
They accept the pickup and distribute the food
before it goes to waste.
      `;

    /* ===== SIGNIN / LOGIN (🔥 YOUR REQUIREMENT) ===== */
    case INTENTS.AUTH_LOGIN:
      return `
To sign in or login, you must first create an account.

If you haven’t signed up yet,
click the Sign Up button on the home page,
enter your details, and choose your role.

Once signup is complete,
you can use the Sign In option to login anytime.
      `;

    /* ===== SIGNUP ===== */
    case INTENTS.AUTH_SIGNUP:
      return `
To sign up, click the Sign Up button on the home page.

Enter your name, email, password,
and select your role (Mess/Canteen or NGO/Volunteer).
After signup, you can login and start using the app.
      `;

    /* ===== WHY IMPORTANT ===== */
    case INTENTS.IMPORTANCE:
      return `
PlateShare is important because it reduces food waste
and helps connect surplus food with people who need it.

It ensures good food is not thrown away
and reaches the right people on time.
      `;

    /* ===== UNKNOWN ===== */
    default:
      return `
I’m here to help  
You can ask me about the app, how it works,
how to signup or login, or why PlateShare is important.
      `;
  }
}




/* ================= UI HELPERS ================= */

function addUserMessage(text) {
  const box = document.getElementById("chatMessages");
  box.innerHTML += `<p><b>You:</b> ${text}</p>`;
  box.scrollTop = box.scrollHeight;
}

function addAIMessage(text) {
  const box = document.getElementById("chatMessages");
  box.innerHTML += `<p><b>AI:</b> ${text}</p>`;
  box.scrollTop = box.scrollHeight;
}

/* ================= VOICE ================= */

window.startVoice = () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice not supported");
    return;
  }

  const rec = new webkitSpeechRecognition();
  rec.lang = "en-IN";
  rec.start();

  rec.onresult = async (e) => {
    const text = e.results[0][0].transcript;

    startChat();
    addUserMessage(text);

    chatHistory.push({ role: "user", text });

    const reply = await askGemini();
    addAIMessage(reply);
    speak(reply);

    chatHistory.push({ role: "assistant", text: reply });
  };
};

/* ================= SPEECH ================= */

speechSynthesis.onvoiceschanged = () => {};

function speak(text) {
  const voices = speechSynthesis.getVoices();
  const female =
    voices.find(v => v.lang === "en-IN") ||
    voices.find(v => v.name.toLowerCase().includes("female")) ||
    voices[0];

  const u = new SpeechSynthesisUtterance(text);
  u.voice = female;
  u.lang = "en-IN";
  u.rate = 0.82;
  u.pitch = 1.15;

  speechSynthesis.speak(u);
}

const INTENTS = {
  IDENTITY: "identity",
  WHAT_IS_APP: "what_is_app",
  HOW_IT_WORKS: "how_it_works",
  AUTH_LOGIN: "auth_login",
  AUTH_SIGNUP: "auth_signup",
  IMPORTANCE: "importance",
  UNKNOWN: "unknown"
};


function detectIntent(text = "") {
  const q = text.toLowerCase();

  if (q.includes("who") && q.includes("you"))
    return INTENTS.IDENTITY;

  if (
    q.includes("login") ||
    q.includes("log in") ||
    q.includes("signin") ||
    q.includes("sign in")
  )
    return INTENTS.AUTH_LOGIN;

  if (
    q.includes("signup") ||
    q.includes("sign up") ||
    q.includes("register") ||
    q.includes("create account")
  )
    return INTENTS.AUTH_SIGNUP;

  if (q.includes("how"))
    return INTENTS.HOW_IT_WORKS;

  if (q.includes("what") && q.includes("app"))
    return INTENTS.WHAT_IS_APP;

  if (q.includes("why") || q.includes("important"))
    return INTENTS.IMPORTANCE;

  return INTENTS.UNKNOWN;
}
