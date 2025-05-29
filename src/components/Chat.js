
import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import io from "socket.io-client";

const socket = io("https://ws-chat-server-v6ih.onrender.com", {
  withCredentials: true
});

const Chat = ({ userPhone, receiverPhone, receiverName }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.emit("join-room", { room: getRoomId(userPhone, receiverPhone) });

    socket.on("receive-message", (data) => {
      setChat((prev) => [...prev, { sender: data.sender, message: data.message }]);
    });

    return () => socket.off("receive-message");
  }, [userPhone, receiverPhone]);

  const getRoomId = (a, b) => [a, b].sort().join("-");

  const sendMessage = () => {
    if (message.trim()) {
      const room = getRoomId(userPhone, receiverPhone);
      socket.emit("send-message", { room, sender: userPhone, message });
      setChat((prev) => [...prev, { sender: userPhone, message }]);
      setMessage("");
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        💬 Chat with {receiverName}
      </Typography>
      <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: "auto", mb: 2, p: 2 }}>
        {chat.map((c, i) => (
          <Box key={i} textAlign={c.sender === userPhone ? "right" : "left"}>
            <Typography>{c.message}</Typography>
          </Box>
        ))}
      </Paper>
      <TextField
        fullWidth
        label="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        sx={{ mb: 1 }}
      />
      <Button variant="contained" fullWidth onClick={sendMessage}>
        Send
      </Button>
    </Box>
  );
};

export default Chat;
