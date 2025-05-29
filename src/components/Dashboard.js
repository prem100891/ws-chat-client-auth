import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Snackbar,
  Alert
} from "@mui/material";

const Dashboard = ({ navigateToChat }) => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/all-users");
      const data = await res.json();
      setUsers(data.filter(u => u.phone !== currentUser.phone));
    } catch (err) {
      setSnack({ open: true, message: "Failed to fetch users", type: "error" });
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/chat-requests?phone=" + currentUser.phone);
      const data = await res.json();
      setRequests(data);
    } catch {
      setSnack({ open: true, message: "Failed to fetch requests", type: "error" });
    }
  };

  const sendRequest = async (to) => {
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: currentUser.phone, to })
      });
      const data = await res.json();
      setSnack({ open: true, message: data.message, type: res.ok ? "success" : "error" });
      fetchRequests();
    } catch {
      setSnack({ open: true, message: "Request failed", type: "error" });
    }
  };

  const acceptRequest = async (from) => {
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/accept-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: currentUser.phone })
      });
      const data = await res.json();
      setSnack({ open: true, message: data.message, type: res.ok ? "success" : "error" });
      fetchRequests();
    } catch {
      setSnack({ open: true, message: "Accept failed", type: "error" });
    }
  };

  const canChatWith = (userPhone) => {
    return requests.some(
      r =>
        (r.from === userPhone && r.to === currentUser.phone && r.accepted) ||
        (r.from === currentUser.phone && r.to === userPhone && r.accepted)
    );
  };

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        👥 Welcome, {currentUser.name}
      </Typography>

      <Typography variant="h6" sx={{ mt: 3 }}>
        All Users
      </Typography>

      <Box mt={2}>
        {users.map(user => (
          <Box
            key={user.phone}
            sx={{
              p: 2,
              border: "1px solid #ccc",
              borderRadius: 2,
              mb: 2
            }}
          >
            <Typography>{user.name} ({user.phone})</Typography>
            {canChatWith(user.phone) ? (
              <Button
                variant="contained"
                onClick={() => navigateToChat(user)}
                sx={{ mt: 1 }}
              >
                💬 Chat
              </Button>
            ) : requests.some(r => r.from === user.phone && r.to === currentUser.phone && !r.accepted) ? (
              <Button
                variant="outlined"
                onClick={() => acceptRequest(user.phone)}
                sx={{ mt: 1 }}
              >
                ✅ Accept Request
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={() => sendRequest(user.phone)}
                sx={{ mt: 1 }}
              >
                🤝 Send Request
              </Button>
            )}
          </Box>
        ))}
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.type} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
