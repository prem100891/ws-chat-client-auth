// src/socket.js
import { io } from "socket.io-client";

// ✅ Replace below with your actual Render or backend server URL
const socket = io("https://ws-chat-server-v6ih.onrender.com", {
  transports: ["websocket"],
  withCredentials: true
});

export default socket;
