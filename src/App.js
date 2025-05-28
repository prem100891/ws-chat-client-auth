// App.js (Frontend with OTP + Invite + Chat)
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Container,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  CircularProgress
} from "@mui/material";

const socket = io("https://ws-chat-server-v6ih.onrender.com", {
  withCredentials: true
});

function App() {
  const [room, setRoom] = useState("FAMILY-ROOM");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [inviteNumber, setInviteNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    socket.on("receive-message", ({ user, message }) => {
      setChat((prev) => [...prev, { user, message }]);
    });
    return () => socket.off("receive-message");
  }, []);

  const sendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      setSnack({ open: true, message: data.message, type: res.ok ? "success" : "error" });
    } catch (err) {
      setSnack({ open: true, message: "Failed to send OTP", type: "error" });
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp || !phone) return;
    setLoading(true);
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerified(true);
        setSnack({ open: true, message: data.message, type: "success" });
      } else {
        setSnack({ open: true, message: data.message, type: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: "OTP verification failed", type: "error" });
    }
    setLoading(false);
  };

  const joinRoom = () => {
    if (room && name && isVerified) {
      socket.emit("join-room", { room, user: name });
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send-message", { room, message, user: name });
      setChat((prev) => [...prev, { user: name, message }]);
      setMessage("");
    }
  };

  const handleInvite = async () => {
    if (!inviteNumber) return;
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/invite-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: inviteNumber, room, invitedBy: name })
      });
      const data = await res.json();
      setSnack({ open: true, message: data.message, type: res.ok ? "success" : "error" });
      setInviteNumber("");
    } catch (err) {
      setSnack({ open: true, message: "Invite failed", type: "error" });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔐 OTP-Protected Real-Time Chat
      </Typography>

      {!isVerified ? (
        <Box>
          <TextField label="Your Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <Button onClick={sendOtp} variant="outlined" disabled={loading} fullWidth>
            {loading ? <CircularProgress size={24} /> : "Send OTP"}
          </Button>
          <TextField label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} fullWidth sx={{ my: 2 }} />
          <Button onClick={verifyOtp} variant="contained" disabled={loading} fullWidth>
            {loading ? <CircularProgress size={24} /> : "Verify OTP"}
          </Button>
        </Box>
      ) : (
        <>
          <Box mb={2}>
            <TextField label="Room" value={room} onChange={(e) => setRoom(e.target.value)} fullWidth sx={{ mb: 2 }} />
            <Button variant="contained" color="primary" onClick={joinRoom} fullWidth>
              Join Room
            </Button>
          </Box>

          <Box mb={2}>
            <TextField label="Invite Contact Number" value={inviteNumber} onChange={(e) => setInviteNumber(e.target.value)} fullWidth sx={{ mb: 1 }} />
            <Button variant="outlined" color="success" onClick={handleInvite} fullWidth>
              📩 Invite to Room
            </Button>
          </Box>

          <Box mb={2}>
            <TextField label="Type your message" value={message} onChange={(e) => setMessage(e.target.value)} fullWidth sx={{ mb: 1 }} />
            <Button variant="contained" onClick={sendMessage} fullWidth>
              Send
            </Button>
          </Box>

          <Box>
            <Typography variant="h6">💬 Messages:</Typography>
            <Box sx={{ maxHeight: 300, overflowY: "auto", p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
              {chat.map((msg, i) => (
                <Box key={i} mb={1}>
                  <strong>{msg.user}:</strong> {msg.message}
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.type} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
