import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Container, TextField, Button, Typography, Snackbar,
  Alert, Box, CircularProgress, Dialog, DialogTitle,
  DialogContent, IconButton
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

const socket = io("https://ws-chat-server-v6ih.onrender.com", {
  withCredentials: true,
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
  const [pendingList, setPendingList] = useState([]);
  const [openSettings, setOpenSettings] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [memberPhone, setMemberPhone] = useState("");

  useEffect(() => {
    socket.on("receive-message", (msg) => setChat((prev) => [...prev, msg]));
    socket.on("chat-history", (msgs) => setChat(msgs));
    socket.on("waiting-approval", () => {
      setSnack({ open: true, message: "Waiting for approval", type: "info" });
    });
    socket.on("user-approved", ({ phone }) => {
      setSnack({ open: true, message: `${phone} approved.`, type: "success" });
    });
    socket.on("pending-requests", ({ pending }) => setPendingList(pending));
    socket.on("group-created", (room) => {
      setSnack({ open: true, message: `Group '${room}' created.`, type: "success" });
      setOpenSettings(false);
    });
    socket.on("group-exists", (room) => {
      setSnack({ open: true, message: `Group '${room}' already exists.`, type: "info" });
    });
    socket.on("member-added", ({ room, newPhone }) => {
      setSnack({ open: true, message: `Added ${newPhone} to ${room}.`, type: "success" });
      setMemberPhone("");
    });
    socket.on("unauthorized", (msg) => {
      setSnack({ open: true, message: msg, type: "error" });
    });

    return () => socket.disconnect();
  }, []);

  const sendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok) setOtp("");
      setSnack({ open: true, message: data.message, type: res.ok ? "success" : "error" });
    } catch {
      setSnack({ open: true, message: "Failed to send OTP", type: "error" });
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp || !phone) return;
    setLoading(true);
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerified(true);
        setSnack({ open: true, message: data.message, type: "success" });
      } else {
        setSnack({ open: true, message: data.message, type: "error" });
      }
    } catch {
      setSnack({ open: true, message: "OTP verification failed", type: "error" });
    }
    setLoading(false);
  };

  const joinRoom = () => {
    if (room && name && isVerified) {
      socket.emit("request-join", { room, user: name, phone });
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
    } catch {
      setSnack({ open: true, message: "Invite failed", type: "error" });
    }
  };

  const createGroup = () => {
    if (!newGroup || !phone) return;
    socket.emit("create-group", { room: newGroup, admin: phone });
    setRoom(newGroup);
  };

  const addMember = () => {
    if (!room || !phone || !memberPhone) return;
    socket.emit("add-member", { room, adminPhone: phone, newPhone: memberPhone });
  };

  const approveUser = (p) => {
    socket.emit("approve-user", { room, phone: p });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔐 OTP-Protected Chat{" "}
        <IconButton onClick={() => setOpenSettings(true)} sx={{ float: "right" }}>
          <SettingsIcon />
        </IconButton>
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
          <TextField label="Room" value={room} onChange={(e) => setRoom(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <Button variant="contained" onClick={joinRoom} fullWidth>
            Join Room
          </Button>

          {pendingList.length > 0 && (
            <Box my={2}>
              <Typography variant="h6">Pending Approvals:</Typography>
              {pendingList.map((p, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography sx={{ flex: 1 }}>{p}</Typography>
                  <Button variant="outlined" onClick={() => approveUser(p)}>Approve</Button>
                </Box>
              ))}
            </Box>
          )}

          <Box mt={2}>
            <TextField label="Type your message" value={message} onChange={(e) => setMessage(e.target.value)} fullWidth sx={{ mb: 1 }} />
            <Button variant="contained" onClick={sendMessage} fullWidth>
              Send
            </Button>
          </Box>

          <Box>
            <Typography variant="h6">💬 Messages:</Typography>
            <Box sx={{ maxHeight: 300, overflowY: "auto", p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
              {chat.map((msg, i) => (
                <Box key={i} mb={1}><strong>{msg.user}:</strong> {msg.message}</Box>
              ))}
            </Box>
          </Box>
        </>
      )}

      <Dialog open={openSettings} onClose={() => setOpenSettings(false)}>
        <DialogTitle>⚙️ Settings</DialogTitle>
        <DialogContent>
          <TextField
            label="New Group Name"
            fullWidth
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={createGroup} fullWidth>
            Create Group
          </Button>

          <TextField
            label="Add Member by Phone"
            fullWidth
            value={memberPhone}
            onChange={(e) => setMemberPhone(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <Button variant="outlined" onClick={addMember} fullWidth>
            Add Member
          </Button>
        </DialogContent>
      </Dialog>

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
