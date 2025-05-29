// src/pages/GroupChat.js
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Paper,
  Drawer,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import axios from 'axios';

const GroupChat = ({ socket }) => {
  const { groupName } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [groupDetails, setGroupDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const scrollRef = useRef();

  // 🔄 Fetch group info and verify access
  useEffect(() => {
    axios
      .get(`https://ws-chat-server-v6ih.onrender.com/group/${groupName}`)
      .then((res) => {
        setGroupDetails(res.data);
        if (!res.data.members.find((m) => m.phone === user?.phone)) {
          alert("You are not allowed in this group.");
          navigate("/dashboard");
        } else if (res.data.admin === user.phone) {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        alert("Group not found");
        navigate("/dashboard");
      });
  }, [groupName, user, navigate]);

  // 🔄 Fetch group members
  const fetchMembers = async () => {
    try {
      const res = await axios.get(`https://ws-chat-server-v6ih.onrender.com/group-members/${groupName}`);
      setMembers(res.data);
    } catch {
      setMembers([]);
    }
  };

  // 🚪 Toggle member drawer
  const toggleDrawer = () => {
    if (!drawerOpen) fetchMembers();
    setDrawerOpen(!drawerOpen);
  };

  // 🔌 Join group and listen for messages
  useEffect(() => {
    socket?.emit("join-group", { groupName, user });

    socket?.on("receive-group-message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    return () => socket?.off("receive-group-message");
  }, [socket, groupName]);

  // 💬 Send message
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send-group-message", {
        groupName,
        sender: user.name,
        message,
      });
      setMessages((prev) => [...prev, { sender: user.name, message }]);
      setMessage("");
    }
  };

  // 🔽 Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🚪 Leave group
  const handleLeaveGroup = async () => {
    try {
      await axios.post("https://ws-chat-server-v6ih.onrender.com/leave-group", {
        groupName: groupDetails.name,
        memberPhone: user.phone,
      });
      alert("You left the group.");
      navigate("/dashboard");
    } catch {
      alert("Error leaving group");
    }
  };

  // ❌ Delete group (admin only)
  const handleDeleteGroup = async () => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this group?");
      if (!confirm) return;

      await axios.post("https://ws-chat-server-v6ih.onrender.com/delete-group", {
        groupName: groupDetails.name,
        adminPhone: user.phone,
      });
      alert("Group deleted successfully.");
      navigate("/dashboard");
    } catch {
      alert("Error deleting group");
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          💬 {groupName}
        </Typography>

        <Box mt={2}>
          <Button variant="outlined" color="error" onClick={handleLeaveGroup}>
            🚪 Leave Group
          </Button>
          {isAdmin && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteGroup}
              sx={{ ml: 2 }}
            >
              🗑 Delete Group
            </Button>
          )}
        </Box>

        {/* 💬 Chat Messages */}
        <Paper
          sx={{
            height: 300,
            overflowY: "auto",
            my: 3,
            p: 2,
            border: "1px solid #ccc",
          }}
        >
          {messages.map((msg, idx) => (
            <Typography key={idx} ref={scrollRef}>
              <strong>{msg.sender}:</strong> {msg.message}
            </Typography>
          ))}
        </Paper>

        {/* ✏️ Message Input */}
        <TextField
          fullWidth
          label="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button variant="contained" fullWidth sx={{ mt: 1 }} onClick={sendMessage}>
          ➤ Send
        </Button>
      </Box>

      {/* 👥 Group Member Drawer */}
      <IconButton
        onClick={toggleDrawer}
        sx={{ position: "fixed", top: 10, right: 10 }}
      >
        <PeopleIcon />
      </IconButton>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box width={250} p={2}>
          <Typography variant="h6">👥 Group Members</Typography>
          <Divider sx={{ my: 1 }} />
          <List>
            {members.map((m) => (
              <ListItem key={m.phone}>
                <ListItemText
                  primary={m.name}
                  secondary={m.phone === user.phone ? "You" : m.phone}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default GroupChat;
