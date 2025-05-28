import React, { useEffect, useRef, useState } from "react";
import {
  Container, TextField, Button, Box, Typography, Paper, List,
  ListItem, ListItemText, Select, MenuItem, Avatar, InputLabel, FormControl
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("General");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    if (!loggedIn) return;

    ws.current = new WebSocket("https://ws-chat-server-v6ih.onrender.com/");

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        type: "join",
        username,
        room
      }));
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.room === room || msg.type === "system") {
        setMessages(prev => [...prev, msg]);
      }
    };

    return () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: "leave",
          username,
          room
        }));
        ws.current.close();
      }
    };
  }, [loggedIn, room]);

  useEffect(() => {
    if (input.trim()) {
      setTyping(true);
      const timeout = setTimeout(() => setTyping(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [input]);

  const sendMessage = () => {
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: "message",
        username,
        text: input,
        room,
        timestamp: new Date().toLocaleTimeString()
      }));
      setInput("");
    }
  };

  if (!loggedIn) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <ChatIcon sx={{ fontSize: 50, color: "#1976d2", mb: 2 }} />
        <Typography variant="h5" gutterBottom>
  🔐 Join the Chat Room{' '}
  <span style={{ fontSize: "0.75rem", color: "red", fontStyle: "italic" }}>
    &copy; Developed by <strong style={{ fontSize: "0.9rem" }}>Prem S. Bharti</strong>
  </span>
</Typography>



        <TextField
          fullWidth
          label="Enter Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ my: 2 }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={() => setLoggedIn(true)}
          disabled={!username}
        >
          Join
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom textAlign="center">
        💬 Welcome, <b>{username}</b>
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Room</InputLabel>
        <Select value={room} onChange={(e) => setRoom(e.target.value)} label="Room">
          <MenuItem value="General">General</MenuItem>
          <MenuItem value="Tech">Tech</MenuItem>
          <MenuItem value="Random">Random</MenuItem>
        </Select>
      </FormControl>

      <Paper elevation={3} sx={{
        height: 350,
        overflowY: "auto",
        p: 2,
        mb: 2,
        borderRadius: 2,
        bgcolor: "#f1f8e9"
      }}>
        <List>
          {messages.map((msg, idx) => (
            <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
              <Box
                sx={{
                  p: 1.2,
                  bgcolor: msg.type === "system"
                    ? "#fff3e0"
                    : msg.username === username
                      ? "#bbdefb"
                      : "#e0f2f1",
                  borderRadius: 2,
                  width: "100%"
                }}
              >
                <ListItemText
                  primary={
                    msg.type === "system"
                      ? `🔔 ${msg.text}`
                      : <span><strong>{msg.username}</strong> <span style={{ fontSize: '0.75rem', color: "#666" }}>({msg.timestamp})</span>: {msg.text}</span>
                  }
                />
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {typing && (
        <Typography variant="caption" sx={{ mb: 1, display: "block", color: "#888" }}>
          ✍️ {username} is typing...
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          label="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button variant="contained" onClick={sendMessage} endIcon={<SendIcon />}>
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default App;
