import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Divider,
} from "@mui/material";

const socketURL = process.env.REACT_APP_SOCKET_URL;

if (!socketURL) {
  console.error("Missing VITE_SOCKET_URL in .env");
}

const socket = io(process.env.REACT_APP_SOCKET_URL || "https://ws-chat-server-v6ih.onrender.com", {
  withCredentials: true,
});

const Chat = () => {
  const { myNumber, peerNumber } = useParams();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    socket.emit("join-private-room", {
      user1: myNumber,
      user2: peerNumber,
    });

    socket.on("receive-message", ({ from, to, message }) => {
      if ((from === myNumber && to === peerNumber) || (from === peerNumber && to === myNumber)) {
        setChat((prev) => [...prev, { from, message }]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [myNumber, peerNumber]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send-private-message", {
        from: myNumber,
        to: peerNumber,
        message,
      });
      setChat((prev) => [...prev, { from: myNumber, message }]);
      setMessage("");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          💬 Chat with {peerNumber}
        </Typography>
        <Divider />
        <Box
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            mt: 2,
            mb: 2,
            p: 1,
            border: "1px solid #ccc",
            borderRadius: 2,
          }}
        >
          {chat.map((msg, idx) => (
            <Box
              key={idx}
              ref={scrollRef}
              sx={{
                textAlign: msg.from === myNumber ? "right" : "left",
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  display: "inline-block",
                  p: 1,
                  bgcolor: msg.from === myNumber ? "#e1f5fe" : "#dcedc8",
                  borderRadius: 1,
                }}
              >
                {msg.message}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            placeholder="Type a message"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;
