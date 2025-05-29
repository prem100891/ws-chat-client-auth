import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";

const JoinGroup = () => {
  const [searchParams] = useSearchParams();
  const groupName = searchParams.get("group");
  const [joined, setJoined] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const joinGroup = async () => {
    const res = await fetch("https://ws-chat-server-v6ih.onrender.com/approve-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupName, phone: user.phone })
    });
    const data = await res.json();
    if (data.message) {
      setJoined(true);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4">🔗 Join Group: {groupName}</Typography>
      <Typography variant="body1" my={2}>
        You're invited to join this group.
      </Typography>

      {joined ? (
        <>
          <Typography color="green">✅ Joined successfully!</Typography>
          <Button onClick={() => navigate("/dashboard")} variant="contained">
            Go to Dashboard
          </Button>
        </>
      ) : (
        <Button onClick={joinGroup} variant="contained" color="primary">
          Join Group
        </Button>
      )}
    </Box>
  );
};

export default JoinGroup;
