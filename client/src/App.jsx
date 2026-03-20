import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import YouTube from "react-youtube";

const socket = io("https://watch-party-yqqw.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [participants, setParticipants] = useState({});
  // Sync video seek without infinite loop
  const isSyncing = useRef(false);
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ"); // default video
  const [inputValue, setInputValue] = useState("");
  const [myId, setMyId] = useState("");

  const leaveRoom = () => {
  socket.emit("leave_room", { roomId });

  setJoined(false);
  setParticipants({});
};

  const playerRef = useRef(null);
    // Extract YouTube video ID from URL
function extractVideoId(url) {
    const regex = /(?:v=|youtu.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
  }
const joinRoom = () => {
  if (!username || !roomId) {
    alert("Please enter username and room ID");
    return;
  }

  socket.emit("join_room", { roomId, username });
  setJoined(true);
};

 useEffect(() => {
  socket.on("user_joined", (data) => {
    setParticipants(data.participants);
  });

  
  socket.on("play", () => {
    if (playerRef.current) {
      playerRef.current.playVideo();
    }
  });

  
  socket.on("pause", () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  });

socket.on("seek", ({ time }) => {
  if (playerRef.current) {
    isSyncing.current = true;
    playerRef.current.seekTo(time, true);
  }
});

 socket.on("change_video", ({ videoId }) => {
    setVideoId(videoId);
  });

  socket.on("connect", () => {
  setMyId(socket.id);
});

 return () => {
    socket.off("user_joined");
    socket.off("play");
    socket.off("pause");
    socket.off("seek");
    socket.off("change_video");
    socket.off("connect");
  };

}, []);

 if (!joined) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl mb-4">🎬 Join Watch Party</h1>

      <input
        className="p-2 mb-2 text-black rounded"
        placeholder="Enter username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="p-2 mb-4 text-black rounded"
        placeholder="Enter room ID"
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button
        className="bg-blue-500 px-4 py-2 rounded"
        onClick={joinRoom}
      >
        Join Room
      </button>
    </div>
  );
}

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center p-6">

    <h1 className="text-4xl font-bold mb-6">🎬 Watch Party</h1>

    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-2xl">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg">Room: {roomId}</h2>

        <button
          onClick={leaveRoom}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
        >
          Leave 🚪
        </button>
      </div>

     <p className="mb-2 text-sm text-gray-300">
  Role: 
  <span className="ml-2 font-semibold text-yellow-400">
    {participants[myId]?.role === "host" ? "👑 Host" : "👤 Participant"}
  </span>
</p>

      {/* YouTube URL Input */}
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 p-2 rounded text-black"
          placeholder="Paste YouTube URL..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <button
        disabled={participants[myId]?.role !== "host"}
          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
          onClick={() => {
            const id = extractVideoId(inputValue);
            if (!id) return alert("Invalid URL ❌");

           setVideoId(id);
setInputValue("");
socket.emit("change_video", { roomId, videoId: id });
          }}
        >
          Set
        </button>
      </div>

      {/* Participants */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Participants</h3>
        <ul className="space-y-1 text-sm">
          {Object.entries(participants).map(([id, user]) => (
            <li
              key={id}
              className="bg-gray-700 px-2 py-1 rounded flex justify-between"
            >
              <span>
                {user.username}
                {id === myId && " (You)"}
              </span>

              <span>
                {user.role === "host" ? "👑 Host" : "👤"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* YouTube Player */}
      <div className="flex justify-center mb-4">
        <YouTube
          videoId={videoId}
          opts={{ width: "100%", height: "350" }}
          onReady={(e) => (playerRef.current = e.target)}
          onStateChange={(e) => {
            if (isSyncing.current) {
              isSyncing.current = false;
              return;
            }

            if (e.data === 1) {
              const currentTime = playerRef.current.getCurrentTime();

              socket.emit("seek", {
                roomId,
                time: currentTime
              });
            }
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          disabled={participants[myId]?.role !== "host"}
          onClick={() => socket.emit("play", { roomId })}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded disabled:bg-gray-600"
        >
          ▶ Play
        </button>

        <button
          disabled={participants[myId]?.role !== "host"}
          onClick={() => socket.emit("pause", { roomId })}
          className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded disabled:bg-gray-600"
        >
          ⏸ Pause
        </button>
      </div>

    </div>
  </div>
);
}

export default App;