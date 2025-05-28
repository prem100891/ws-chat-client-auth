import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";

function App() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

  const handleSendOtp = async () => {
    if (!phone) {
      setSnack({ open: true, message: "Phone number is required", type: "warning" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://ws-chat-server-v6ih.onrender.com/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone }),
        credentials: "include" // 🔐 Needed if server uses credentials
      });

      const data = await response.json();

      if (response.ok) {
        setSnack({ open: true, message: data.message, type: "success" });
      } else {
        throw new Error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      setSnack({ open: true, message: error.message, type: "error" });
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "5rem", textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        🔐 Enter your phone to receive OTP
      </Typography>

      <TextField
        label="Phone Number"
        variant="outlined"
        fullWidth
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ marginBottom: "1.5rem" }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSendOtp}
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : "Send OTP"}
      </Button>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.type}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
