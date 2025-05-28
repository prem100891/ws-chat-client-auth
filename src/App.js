import React, { useEffect, useRef, useState } from "react";
import {
  Container, TextField, Button, Box, Typography, Paper, List,
  ListItem, ListItemText
} from "@mui/material";

const App = () => {
  const [username, setUsername] = useState("");
  const [userContact, setUserContact] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  const isNameValid = username.trim().length > 0;
  const isMobileValid = /^\d{10}$/.test(userContact);
  const isFormValid = isNameValid && isMobileValid && isVerified;

  const handleSendOtp = async () => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(generatedOtp);
    setOtpSent(true);
    await fetch("https://ws-chat-server-v6ih.onrender.com/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: `+91${userContact}`,
        otp: generatedOtp
      })
    });
  };

  const handleVerifyOtp = () => {
    if (otp === serverOtp) {
      setIsVerified(true);
    } else {
      alert("❌ OTP is incorrect");
    }
  };

  const handleJoin = () => {
    setLoggedIn(true);
  };

  useEffect(() => {
    if (!loggedIn) return;

    ws.current = new WebSocket("https://ws-chat-server-v6ih.onrender.com");

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        type: "join",
        username,
        contactNumber: userContact,
        room: "General"
      }));
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };

    return () => {
      if (ws.current) {
        ws.current.send(JSON.stringify({ type: "leave", username, room: "General" }));
        ws.current.close();
      }
    };
  }, [loggedIn]);

  const sendMessage = () => {
    if (input && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: "message",
        username,
        text: input,
        room: "General",
        timestamp: new Date().toLocaleTimeString()
      }));
      setInput("");
    }
  };

  if (!loggedIn) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>🔐 Secure Chat Join</Typography>

        <TextField
          label="Your Name"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: isNameValid ? "✅" : username.length > 0 ? "❌" : ""
          }}
        />

        <TextField
          label="Mobile Number"
          fullWidth
          value={userContact}
          onChange={(e) => setUserContact(e.target.value)}
          sx={{ mb: 1 }}
          InputProps={{
            endAdornment: isMobileValid ? "✅" : userContact.length > 0 ? "❌" : ""
          }}
        />

        {!otpSent && isMobileValid && (
          <Button onClick={handleSendOtp} variant="outlined" sx={{ mb: 2 }}>
            Send OTP
          </Button>
        )}

        {otpSent && (
          <>
            <TextField
              fullWidth
              label="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button onClick={handleVerifyOtp} variant="contained" sx={{ mb: 2 }} disabled={!otp}>
              Verify OTP
            </Button>
          </>
        )}

        {isVerified && (
          <Typography variant="body2" sx={{ color: "green", mb: 2 }}>✅ OTP Verified</Typography>
        )}

        <Button variant="contained" fullWidth disabled={!isFormValid} onClick={handleJoin}>
          Join
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>💬 Welcome, <b>{username}</b></Typography>

      <Paper sx={{ height: 350, overflowY: "auto", p: 2, mb: 2 }}>
        <List>
          {messages.map((msg, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={
                  msg.type === "message"
                    ? <span><b>{msg.username}</b> ({msg.timestamp}): {msg.text}</span>
                    : `🔔 ${msg.text}`
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          label="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button variant="contained" onClick={sendMessage}>Send</Button>
      </Box>
    </Container>
  );
};

export default App;
