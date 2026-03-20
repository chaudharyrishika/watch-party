# 🎬 YouTube Watch Party System

A real-time Watch Party web application that allows multiple users to watch YouTube videos together in sync.

Users can join rooms, watch videos simultaneously, and experience synchronized playback (play, pause, seek, change video) using WebSockets.

---

## 🚀 Live Demo

Frontend: watch-party-azure.vercel.app 

Backend: https://watch-party-yqqw.onrender.com  

---

## 🧠 Features

- 🔗 Create or Join Rooms using Room ID
- 👑 Host & 👤 Participant roles
- ▶️ Play / ⏸ Pause synchronization
- ⏩ Seek synchronization
- 🎬 Change video for all participants
- 👥 Live participant list with roles
- 🔄 Automatic host reassignment when host leaves
- ⚡ Real-time updates using WebSockets

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Socket.IO Client
- YouTube IFrame API

### Backend
- Node.js
- Express.js
- Socket.IO

---

## ⚙️ How It Works

1. User enters a username and room ID  
2. First user becomes **Host**, others become **Participants**  
3. Host controls:
   - Play / Pause  
   - Seek  
   - Change Video  
4. All actions are sent via WebSockets and synced across users in real-time  
5. Backend validates role before executing actions  

---

## 📂 Project Structure
watch-party/
│
├── client/ # Frontend (React)
│ ├── src/
│ ├── index.html
│ └── tailwind.config.js
│
├── server/ # Backend (Node + Socket.IO)
│ └── server.js
│
└── README.md

---

## 🧪 Run Locally

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/watch-party.git
cd watch-party
