# PlateShare

**Reduce Food Waste. Feed Those in Need.**

PlateShare is a real-time food-sharing platform that connects Canteens/Messes with NGOs and Volunteers to distribute surplus food before it goes to waste. The app helps ensure that good food reaches people who need it, reducing waste and fighting hunger.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [How It Works](#how-it-works)
- [User Roles](#user-roles)
- [AI Assistant](#ai-assistant)
- [Voice Features](#voice-features)
- [Firebase Configuration](#firebase-configuration)
- [API Keys Required](#api-keys-required)
- [Usage Guide](#usage-guide)
- [Future Enhancements](#future-enhancements)

---

## ✨ Features

### Core Features
- **Real-time Food Posting**: Messes can post surplus food with quantity, location, and pickup time
- **Interactive Maps**: View available food on an interactive map with location markers
- **Two-Way Dashboard**: Separate interfaces for Mess/Canteen and NGO/Volunteer users
- **Instant Notifications**: Real-time updates when food is posted or accepted
- **Location Picker**: Select pickup location using an interactive map or current GPS location
- **Date Selection**: Choose between "Today" and "Tomorrow" for food availability
- **Confirmation Modals**: Double-check before posting or accepting food

### AI-Powered Features
- **AI Chat Assistant**: Conversational AI to explain the app and answer questions
- **Voice Assistant**: Voice-activated help using speech recognition
- **Voice Food Posting**: Post food using natural voice commands (Mess users only)
- **Intelligent Fallbacks**: Works even without Gemini API with pre-programmed responses

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Floating Action Buttons**: Quick access to AI help and voice features
- **Clean UI**: Modern, intuitive interface with smooth animations
- **Role-Based Access**: Automatic redirection based on user role

---

## 🛠️ Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with animations
- **JavaScript (ES6+)**: Modern JavaScript with ES modules
- **Leaflet.js**: Interactive maps and location markers

### Backend & Database
- **Firebase Authentication**: Secure user authentication
- **Cloud Firestore**: Real-time NoSQL database
- **Vercel Hosting**: For deployment

### AI & Voice
- **Google Gemini AI**: Conversational AI assistant
- **Web Speech API**: Voice recognition and text-to-speech
- **Natural Language Processing**: Intent detection for voice commands

---

## 📁 Project Structure

```
plateshare/
│
├── index.html              # Landing page with hero, features, signup
├── signin.html             # Sign-in page
├── signup.html             # Sign-up page
├── mess.html               # Mess/Canteen dashboard
├── ngo.html                # NGO/Volunteer dashboard
│
├── app.js                  # Firebase config, auth, map initialization
├── mess.js                 # Mess dashboard logic (post food, voice input)
├── ngo.js                  # NGO dashboard logic (accept food, pickups)
├── gemini-ai.js            # AI assistant (chat + voice)
│
├── style.css               # All styling and animations
│
└── README.md               # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account ([firebase.google.com](https://firebase.google.com))
- Google Gemini API key ([ai.google.dev](https://ai.google.dev))
- Basic knowledge of HTML/CSS/JavaScript

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/plateshare.git
cd plateshare
```

### Step 2: Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Follow the setup wizard

2. **Enable Authentication**:
   - In Firebase Console, go to **Authentication** → **Sign-in method**
   - Enable **Email/Password** authentication

3. **Create Firestore Database**:
   - Go to **Firestore Database** → **Create database**
   - Start in **Test mode** (or configure security rules later)
   - Choose a location closest to your users

4. **Get Firebase Config**:
   - Go to **Project Settings** → **General**
   - Scroll to "Your apps" → Click the web icon `</>`
   - Copy the `firebaseConfig` object

5. **Update app.js**:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID"
   };
   ```

### Step 3: Gemini AI Setup

1. **Get API Key**:
   - Visit [Google AI Studio](https://ai.google.dev)
   - Click "Get API Key"
   - Create a new API key

2. **Update gemini-ai.js**:
   ```javascript
   const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
   ```

### Step 4: Run the Project

You can run the project in several ways:

**Option A: Using VS Code Live Server**
1. Install the "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

**Option B: Using Python**
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000
```

**Option C: Using Node.js**
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server

# Open http://localhost:8080
```

---

## 🔄 How It Works

### 1. **User Registration**
- Users sign up with name, email, password
- Choose role: **Mess/Canteen** or **NGO/Volunteer**
- Data stored in Firestore `users` collection

### 2. **Mess Posts Food**
- Select food name, quantity, date, time, and location
- Can use voice input for hands-free posting
- Food saved to `food_posts` collection with status "available"
- Appears on map for nearby NGOs

### 3. **NGO Views & Accepts**
- Sees all available food in real-time
- Can view food on interactive map
- Accepts pickup with confirmation
- Status changes to "pickup", food moves to "Accepted Food" section

### 4. **Real-time Updates**
- Uses Firestore `onSnapshot` for live updates
- No page refresh needed
- Changes appear instantly for all users

---

## 👥 User Roles

### Mess/Canteen Dashboard
**Features:**
- Post surplus food with details
- Choose "Today" or "Tomorrow" for availability
- Pick location on map or use GPS
- View previously posted food
- Voice-activated food posting
- Confirmation modal before posting

**Voice Commands Example:**
> "Food is rice and curry, 50 plates, available till 3 PM tomorrow, use current location"

### NGO/Volunteer Dashboard
**Features:**
- View all available food nearby
- See food on interactive map
- Accept pickup with confirmation
- Track accepted food pickups
- Real-time updates

---

## 🤖 AI Assistant

### Chat Mode
- Type questions about PlateShare
- Get instant responses
- Remembers conversation context (last 6 messages)

### Voice Mode
- Speak your question
- AI responds with voice
- Natural conversation flow

### Supported Queries
- "What is PlateShare?"
- "How does it work?"
- "How do I sign up?"
- "How do I login?"
- "Why is this important?"
- "Who are you?"

### Fallback System
If Gemini API fails or isn't configured, the AI uses intelligent fallback responses based on intent detection.

---

## 🎤 Voice Features

### Voice Food Posting (Mess Dashboard)
1. Click the 🎤 button (bottom-right)
2. Speak naturally: "Food is [name], [quantity] plates, available till [time], [location]"
3. System extracts:
   - Food name
   - Quantity
   - Time (with AM/PM)
   - Date (today/tomorrow)
   - Location preference
4. Prompts for missing information
5. Confirms before posting

### Voice AI Assistant (All Pages)
1. Click the 🤖 button (bottom-right)
2. Choose "Voice" mode
3. Ask your question
4. AI responds with voice

**Note:** Voice features require:
- Chrome, Edge, or Safari
- Microphone permission
- Stable internet connection

---

## 🔧 Firebase Configuration

### Firestore Collections

**`users` Collection:**
```javascript
{
  uid: "string",           // Auto-generated
  name: "string",          // User's name
  email: "string",         // Email address
  role: "mess" | "ngo",    // User role
  createdAt: Timestamp     // Registration time
}
```

**`food_posts` Collection:**
```javascript
{
  foodName: "string",        // e.g., "Rice and Curry"
  quantity: number,          // Number of plates
  availableTill: Timestamp,  // Pickup deadline
  location: "string",        // Address/description
  lat: number,               // Latitude
  lng: number,               // Longitude
  messId: "string",          // UID of posting mess
  status: "available" | "pickup",
  pickedBy: "string",        // UID of NGO (if accepted)
  pickedByName: "string",    // Name of NGO (if accepted)
  pickedAt: Timestamp,       // When accepted (if accepted)
  createdAt: Timestamp       // When posted
}
```

### Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone authenticated can read food posts
    match /food_posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

---

## 🔑 API Keys Required

### 1. Firebase Config
Already in your project after Firebase setup.

### 2. Gemini AI API Key
- **Free tier**: 60 requests/minute
- **Get it**: [ai.google.dev](https://ai.google.dev)
- **Used for**: AI chat and voice assistant

**Optional:** The app works without Gemini using fallback responses, but the AI will be less conversational.

---

## 📖 Usage Guide

### For Mess/Canteen Users

1. **Sign Up**:
   - Enter name, email, password
   - Select "Mess/Canteen" role
   - Click "Sign Up"

2. **Post Food**:
   - Enter food name and quantity
   - Choose "Today" or "Tomorrow"
   - Set pickup time
   - Click 📍 to select location on map
   - Click "Post Food"

3. **Voice Posting** (Optional):
   - Click 🎤 button
   - Speak naturally
   - Confirm details

### For NGO/Volunteer Users

1. **Sign Up**:
   - Enter name, email, password
   - Select "NGO/Volunteer" role
   - Click "Sign Up"

2. **Find Food**:
   - View "Available Food Nearby"
   - Or click "Nearby Search on Map"

3. **Accept Pickup**:
   - Click "Accept Pickup" on any food item
   - Confirm in modal
   - Food moves to "Accepted Food"

### Using AI Assistant

1. Click 🤖 button (any page)
2. Choose "Chat" or "Voice"
3. Ask questions about PlateShare

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Push notifications for new food posts
- [ ] Distance calculation and sorting
- [ ] Food preference filters (veg/non-veg)
- [ ] Rating system for messes and NGOs
- [ ] Image upload for food items
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Export pickup history as PDF

### Technical Improvements
- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Better error handling
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Performance monitoring

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Developer

Built with ❤️ to reduce food waste and help those in need.

**Questions or Issues?**
- Open an issue on GitHub
- Contact: [ritu12mandi@gmail.com]

---

## 🙏 Acknowledgments

- **Firebase** for backend infrastructure
- **Google Gemini AI** for conversational AI
- **Leaflet.js** for interactive maps
- **OpenStreetMap** for map tiles and geocoding
- All contributors and supporters

---

**PlateShare** - *Where surplus food meets hungry hearts* 🍽️💚
