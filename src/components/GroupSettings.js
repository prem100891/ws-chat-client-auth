import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const GroupSettings = () => {
  const [groupName, setGroupName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [members, setMembers] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

  const handleCreateGroup = async () => {
    if (!groupName) return;
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/create-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSnack({ open: true, message: "Group created successfully", type: "success" });
      } else {
        setSnack({ open: true, message: data.message || "Failed to create group", type: "error" });
      }
    } catch {
      setSnack({ open: true, message: "Network error", type: "error" });
    }
  };

  const handleAddMember = async () => {
    if (!memberPhone) return;
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/add-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, memberPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers((prev) => [...prev, memberPhone]);
        setSnack({ open: true, message: "Member added successfully", type: "success" });
        setMemberPhone("");
      } else {
        setSnack({ open: true, message: data.message || "Failed to add member", type: "error" });
      }
    } catch {
      setSnack({ open: true, message: "Network error", type: "error" });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        ⚙️ Group Settings
      </Typography>
      <TextField
        label="Group Name"
        fullWidth
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleCreateGroup} fullWidth>
        Create Group
      </Button>
      <Divider sx={{ my: 3 }} />
      <TextField
        label="Add Member (Phone)"
        fullWidth
        value={memberPhone}
        onChange={(e) => setMemberPhone(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="outlined" onClick={handleAddMember} fullWidth>
        ➕ Add Member
      </Button>
      <Typography variant="h6" sx={{ mt: 3 }}>
        👥 Members:
      </Typography>
      <List>
        {members.map((m, idx) => (
          <ListItem key={idx}>
            <ListItemText primary={m} />
          </ListItem>
        ))}
      </List>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.type}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default GroupSettings;
