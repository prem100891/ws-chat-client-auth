import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", type: "info" });

  const sendOtp = async () => {
    if (!name || !phone) {
      setSnack({ open: true, message: "Enter name and phone", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/verify-otp", { state: { phone, name } });
      } else {
        setSnack({ open: true, message: data.message, type: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: "Something went wrong!", type: "error" });
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        👤 Create Your Account
      </Typography>

      <TextField
        label="Full Name"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Mobile Number"
        fullWidth
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        onClick={sendOtp}
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : "📩 Send OTP"}
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
};

export default CreateAccount;
