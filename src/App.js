// App.js (Frontend - Room Join Request with Admin Approval)
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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider
} from "@mui/material";

const socket = io("https://ws-chat-server-v6ih.onrender.com", {
  withCredentials: true
});

function App() {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    socket.on("receive-message", ({ user, message }) => {
      setChat((prev) => [...prev, { user, message }]);
    });

    socket.on("pending-requests", (requests) => {
      setPendingRequests(requests);
    });

    return () => {
      socket.off("receive-message");
      socket.off("pending-requests");
    };
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

  const requestToJoinRoom = () => {
    if (room && name && isVerified) {
      socket.emit("request-join-room", { room, user: name, phone });
    }
  };

  const approveRequest = (userPhone) => {
    socket.emit("approve-user", { room, phone: userPhone });
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send-message", { room, message, user: name });
      setChat((prev) => [...prev, { user: name, message }]);
      setMessage("");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔐 Chat Room with Admin Approval
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
          <TextField label="Room Name" value={room} onChange={(e) => setRoom(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <Button variant="contained" color="primary" onClick={requestToJoinRoom} fullWidth>
            🚪 Request to Join Room
          </Button>

          <Box my={2}>
            <TextField label="Message" value={message} onChange={(e) => setMessage(e.target.value)} fullWidth sx={{ mb: 1 }} />
            <Button onClick={sendMessage} variant="contained" fullWidth>
              Send
            </Button>
          </Box>

          <Typography variant="h6">💬 Messages</Typography>
          <Box sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
            {chat.map((c, i) => (
              <Box key={i} mb={1}>
                <strong>{c.user}:</strong> {c.message}
              </Box>
            ))}
          </Box>

          {pendingRequests.length > 0 && (
            <Box mt={4}>
              <Typography variant="h6">🕒 Pending Requests</Typography>
              <List>
                {pendingRequests.map((req, i) => (
                  <ListItem key={i} disablePadding>
                    <ListItemText primary={`${req.user} (${req.phone})`} />
                    <ListItemButton onClick={() => approveRequest(req.phone)}>Approve</ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider />
            </Box>
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
