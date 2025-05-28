// App.js (UI for OTP + Admin-only Invite + List Invited Members)
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
  Fade
} from "@mui/material";

const socket = io("https://ws-chat-server-v6ih.onrender.com", {
  withCredentials: true
});

function App() {
  const [room, setRoom] = useState("FAMILY-ROOM");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [inviteNumber, setInviteNumber] = useState("");
  const [invitedList, setInvitedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    socket.on("receive-message", ({ user, message }) => {
      setChat((prev) => [...prev, { user, message }]);
    });
    socket.on("join-denied", (msg) => {
      setSnack({ open: true, message: msg, type: "error" });
    });
    return () => {
      socket.off("receive-message");
      socket.off("join-denied");
    };
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const sendOtp = async () => {
    if (!phone || otpAttempts >= 3) return;
    setLoading(true);
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        setResendTimer(30);
        setOtpAttempts(prev => prev + 1);
      }
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
        fetchInvitedList(room);
        setSnack({ open: true, message: data.message, type: "success" });
      } else {
        setSnack({ open: true, message: data.message, type: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: "OTP verification failed", type: "error" });
    }
    setLoading(false);
  };

  const fetchInvitedList = async (room) => {
    try {
      const res = await fetch(`https://ws-chat-server-v6ih.onrender.com/room/${room}/invites`);
      const data = await res.json();
      setInvitedList(data.invited || []);
    } catch (err) {
      console.error("Failed to fetch invited list");
    }
  };

  const joinRoom = () => {
    if (room && name && isVerified) {
      socket.emit("join-room", { room, user: name, phone });
    }
  };

  const handleInvite = async () => {
    if (!inviteNumber) return;
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/invite-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: inviteNumber, room, invitedBy: phone })
      });
      const data = await res.json();
      setSnack({ open: true, message: data.message, type: res.ok ? "success" : "error" });
      setInviteNumber("");
      if (res.ok) fetchInvitedList(room);
    } catch (err) {
      setSnack({ open: true, message: "Invite failed", type: "error" });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔐 OTP-Protected Chat with Admin Invites
      </Typography>

      {!isVerified ? (
        <Fade in={!isVerified} timeout={400}>
          <Box>
            <TextField label="Your Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth sx={{ mb: 2 }} />
            <TextField label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth sx={{ mb: 2 }} />
            <Button
              onClick={sendOtp}
              variant="outlined"
              disabled={loading || resendTimer > 0 || otpAttempts >= 3}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Send OTP"}
            </Button>

            {isOtpSent && (
              <>
                <TextField label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} fullWidth sx={{ my: 2 }} />
                <Button onClick={verifyOtp} variant="contained" disabled={loading} fullWidth>
                  {loading ? <CircularProgress size={24} /> : "Verify OTP"}
                </Button>
              </>
            )}

            {otpAttempts >= 3 && (
              <Typography color="error" sx={{ mt: 1 }}>
                ⚠️ You have reached the maximum OTP request attempts.
              </Typography>
            )}
          </Box>
        </Fade>
      ) : (
        <>
          <Box mb={2}>
            <TextField label="Room" value={room} onChange={(e) => setRoom(e.target.value)} fullWidth sx={{ mb: 2 }} />
            <Button variant="contained" color="primary" onClick={joinRoom} fullWidth>
              Join Room
            </Button>
          </Box>

          {invitedList[0] === phone && (
            <Box mb={2}>
              <TextField label="Invite Contact Number" value={inviteNumber} onChange={(e) => setInviteNumber(e.target.value)} fullWidth sx={{ mb: 1 }} />
              <Button variant="outlined" color="success" onClick={handleInvite} fullWidth>
                📩 Invite to Room
              </Button>
            </Box>
          )}

          <Box mb={2}>
            <Typography variant="subtitle1">✅ Invited Members:</Typography>
            <ul>
              {invitedList.map((phone, i) => (
                <li key={i}>{phone}</li>
              ))}
            </ul>
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