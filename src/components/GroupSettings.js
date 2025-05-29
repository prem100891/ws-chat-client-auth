import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function GroupSettings({ user }) {
  const [groupName, setGroupName] = useState("");
  const [myGroups, setMyGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });
  const navigate = useNavigate();

  const fetchGroups = async () => {
    const res = await fetch(`https://ws-chat-server-v6ih.onrender.com/my-groups/${user.phone}`);
    const data = await res.json();
    setMyGroups(data);
  };

  useEffect(() => {
    if (user?.phone) fetchGroups();
  }, [user]);

  const handleCreateGroup = async () => {
    if (!groupName) return;
    const res = await fetch("https://ws-chat-server-v6ih.onrender.com/create-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupName, adminPhone: user.phone, adminName: user.name }),
    });
    const data = await res.json();
    setSnack({ open: true, message: data.message, type: res.ok ? "success" : "error" });
    setGroupName("");
    if (res.ok) fetchGroups();
  };

  const handleAddMember = async () => {
    if (!selectedGroup || !phone) return;
    const res = await fetch("https://ws-chat-server-v6ih.onrender.com/add-group-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupName: selectedGroup,
        memberPhone: phone,
        addedBy: user.phone,
      }),
    });
    const data = await res.json();
    setSnack({ open: true, message: data.message, type: res.ok ? "success" : "error" });
    setPhone("");
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>⚙️ Group Settings</Typography>

      {/* Create New Group */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="New Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth sx={{ mb: 1 }}
        />
        <Button variant="contained" onClick={handleCreateGroup} fullWidth>
          ➕ Create Group
        </Button>
      </Box>

      {/* Select Group to Add Members */}
      {myGroups.length > 0 && (
        <>
          <Typography variant="h6">🔽 Select a Group</Typography>
          <List dense>
            {myGroups.map((g) => (
              <ListItem
                button
                selected={selectedGroup === g.name}
                onClick={() => setSelectedGroup(g.name)}
                key={g.name}
              >
                <ListItemText primary={`${g.name} (${g.members.length} members)`} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Add Members */}
      {selectedGroup && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>📱 Add Member by Phone Number</Typography>
          <TextField
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth sx={{ mb: 1 }}
          />
          <Button variant="outlined" onClick={handleAddMember} fullWidth>
            ➕ Add Member / Send SMS Invite
          </Button>
        </Box>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.type} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GroupSettings;
