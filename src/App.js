import React, { useEffect, useRef, useState } from "react";
import {
  Container, TextField, Button, Box, Typography, Paper, List,
  ListItem, ListItemText, Select, MenuItem
} from "@mui/material";

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

    ws.current = new WebSocket("ws://localhost:8080");

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
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>🔐 Login to Join Chat</Typography>
        <TextField fullWidth label="Enter Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Box mt={2}>
          <Button variant="contained" fullWidth disabled={!username} onClick={() => setLoggedIn(true)}>
            Join Chat
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>💬 Welcome {username}</Typography>
      <Box mb={2}>
        <Select value={room} onChange={(e) => setRoom(e.target.value)} size="small">
          <MenuItem value="General">General</MenuItem>
          <MenuItem value="Tech">Tech</MenuItem>
          <MenuItem value="Random">Random</MenuItem>
        </Select>
      </Box>

      <Paper variant="outlined" sx={{ height: 300, overflowY: "auto", mb: 1 }}>
        <List dense>
          {messages.map((msg, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={
                  msg.type === "message"
                    ? `${msg.username} (${msg.timestamp}): ${msg.text}`
                    : msg.text
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {typing && <Typography variant="caption">✍️ {username} is typing...</Typography>}

      <Box display="flex" gap={2} mt={1}>
        <TextField
          fullWidth
          label="Type a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button variant="contained" onClick={sendMessage}>Send</Button>
      </Box>
    </Container>
  );
};

export default App;
