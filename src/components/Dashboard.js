
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const user = JSON.parse(userData);
  const name = user?.name;
  const phone = user?.phone;

  const [users, setUsers] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    console.log(name, phone, 'name & phone-->')
    if (!phone || !name) {
      navigate("/");
      return;
    }
    phone && fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`https://ws-chat-server-v6ih.onrender.com/users/${phone}`);
      setUsers(res.data);
    } catch {
      setSnack({ open: true, message: "Failed to load users", type: "error" });
    }
  };

  const sendRequest = async (to) => {
    try {
      const res = await axios.post("/send-request", { from: phone, to });
      setSnack({ open: true, message: res.data.message, type: "success" });
    } catch {
      setSnack({ open: true, message: "Request failed", type: "error" });
    }
  };

  const acceptRequest = async (from) => {
    try {
      const res = await axios.post("https://ws-chat-server-v6ih.onrender.com/accept-request", { from, to: phone });
      setSnack({ open: true, message: res.data.message, type: "success" });
      fetchUsers();
    } catch {
      setSnack({ open: true, message: "Accept failed", type: "error" });
    }
  };

  const chatWith = (userPhone) => {
    navigate(`/chat/${userPhone}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        👥 Welcome {name}, Dashboard
      </Typography>

      <List>
        {users.map((user, i) => (
          <ListItem key={i} divider>
            <ListItemText primary={`${user.name} (${user.phone})`} />
            {user.accepted?.includes(phone) && user.requests?.includes(phone) ? (
              <Button variant="contained" onClick={() => chatWith(user.phone)}>
                Chat
              </Button>
            ) : user.requests?.includes(phone) ? (
              <Button variant="outlined" onClick={() => acceptRequest(user.phone)}>
                Accept
              </Button>
            ) : user.accepted?.includes(phone) ? (
              <Button variant="contained" onClick={() => chatWith(user.phone)}>
                Chat
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => sendRequest(user.phone)}>
                Send Request
              </Button>
            )}
          </ListItem>
        ))}
      </List>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.type}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
