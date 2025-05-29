
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
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const user = JSON.parse(userData);
  const name = user?.name;
  const phone = user?.phone?.replace("+91", "");;

  const [users, setUsers] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {

    const userData = localStorage.getItem("user");
    const user = JSON.parse(userData);
    const name = user?.name;
    const phone = user?.phone?.replace("+91", "");
    const phoneWithNineOne = user?.phone;
  
    console.log(name, "name & phone -->", phone);
  
    if (!phone || !name) {
      navigate("/");
      return;
    }
  
    fetchUsers(phone);
  }, []);
  
  const fetchUsers = async (phone) => {
    try {
      let url = `https://ws-chat-server-v6ih.onrender.com/users/${phone}`;
      const res = await axios.get(url);
      console.log("Prem res dash -->", res, "phone -->", phone, "url -->", url);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnack({ open: true, message: "Failed to load users", type: "error" });
    }
  };
  

  const sendRequest = async (to) => {
    try {
      const res = await axios.post("https://ws-chat-server-v6ih.onrender.com/send-request", { from: phone, to });
      setSnack({ open: true, message: res.data.message, type: "success" });
    } catch {
      setSnack({ open: true, message: "Request failed", type: "error" });
    }
  };

  const acceptRequest = async (from) => {
    try {
      const res = await axios.post("https://ws-chat-server-v6ih.onrender.com/accept-request", { from, to: phoneWithNineOne });
      setSnack({ open: true, message: res.data.message, type: "success" });
      fetchUsers(phone);
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
