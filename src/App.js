// App.js
import React, { useEffect, useState } from "react";
import {
  Container, TextField, Button, Typography, Snackbar, Alert, Box, CircularProgress
} from "@mui/material";
import io from "socket.io-client";

const socket = io("https://ws-chat-server-v6ih.onrender.com", {
  withCredentials: true
});

function App() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("FAMILY");
  const [isVerified, setIsVerified] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", type: "info" });

  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    socket.on("chat-history", (msgs) => {
      setChat(msgs);
      setIsApproved(true);
    });

    socket.on("waiting-approval", () => {
      setSnack({ open: true, message: "⏳ Waiting for approval...", type: "info" });
    });

    socket.on("user-approved", ({ room: r, phone: p }) => {
      if (p === phone && r === room) {
        socket.emit("request-join", { room, user: name, phone });
      }
    });

    socket.on("pending-requests", ({ room: r, pending }) => {
      if (r === room) setPending(pending);
    });

    return () => {
      socket.off("receive-message");
      socket.off("chat-history");
      socket.off("user-approved");
      socket.off("pending-requests");
      socket.off("waiting-approval");
    };
  }, [room, phone]);

  const sendOtp = async () => {
    setLoading(true);
    const res = await fetch("https://ws-chat-server-v6ih.onrender.com/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    setSnack({ open: true, message: data.message, type: res.ok ? "success" : "error" });
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const requestJoin = () => {
    socket.emit("request-join", { room, user: name, phone });
  };

  const approveUser = (p) => {
    socket.emit("approve-user", { room, phone: p });
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("send-message", { room, user: name, message });
    setMessage("");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>💬 WhatsApp-Style Chat App</Typography>

      {!isVerified ? (
        <>
          <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />
          <TextField label="Phone" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} sx={{ mb: 2 }} />
          <Button onClick={sendOtp} variant="outlined" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Send OTP"}
          </Button>
          <TextField label="OTP" fullWidth value={otp} onChange={(e) => setOtp(e.target.value)} sx={{ mt: 2, mb: 2 }} />
          <Button onClick={verifyOtp} variant="contained" fullWidth disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Verify OTP"}
          </Button>
        </>
      ) : !isApproved ? (
        <>
          <TextField label="Room Name" fullWidth value={room} onChange={(e) => setRoom(e.target.value)} sx={{ mb: 2 }} />
          <Button onClick={requestJoin} variant="contained" color="primary" fullWidth>
            Request to Join Room
          </Button>
        </>
      ) : (
        <>
          <Typography variant="h6">Room: {room}</Typography>
          <Box sx={{ maxHeight: 300, overflowY: "auto", p: 1, border: "1px solid #ccc", mb: 2 }}>
            {chat.map((msg, i) => (
              <Typography key={i}><strong>{msg.user}:</strong> {msg.message} <small>({msg.time})</small></Typography>
            ))}
          </Box>
          <TextField label="Your Message" fullWidth value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button variant="contained" sx={{ mt: 1 }} onClick={sendMessage} fullWidth>
            Send
          </Button>

          {pending.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mt: 3 }}>Pending Join Requests:</Typography>
              {pending.map((p, i) => (
                <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography>{p}</Typography>
                  <Button variant="outlined" size="small" onClick={() => approveUser(p)}>Approve</Button>
                </Box>
              ))}
            </>
          )}
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
