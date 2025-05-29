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

const socket = io("https://ws-chat-server-v6ih.onrender.com", {
  withCredentials: true,
});

const GroupChat = () => {
  const { groupId } = useParams();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const scrollRef = useRef();

  useEffect(() => {
    socket.emit("join-group", { groupId });

    socket.on("receive-group-message", ({ from, message }) => {
      setChat((prev) => [...prev, { from, message }]);
    });

    return () => {
      socket.off("receive-group-message");
    };
  }, [groupId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send-group-message", {
        groupId,
        message,
      });
      setChat((prev) => [...prev, { from: "You", message }]);
      setMessage("");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          🧑‍🤝‍🧑 Group Chat
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
                textAlign: msg.from === "You" ? "right" : "left",
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  display: "inline-block",
                  p: 1,
                  bgcolor: msg.from === "You" ? "#e1f5fe" : "#dcedc8",
                  borderRadius: 1,
                }}
              >
                <strong>{msg.from}:</strong> {msg.message}
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

export default GroupChat;
