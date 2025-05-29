import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";

const CreateAccount = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok) {
        setSnack({ open: true, message: data.message, type: "success" });
        setStep(2);
      } else {
        setSnack({ open: true, message: data.error || "Failed to send OTP", type: "error" });
      }
    } catch {
      setSnack({ open: true, message: "Network error", type: "error" });
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp || !phone || !name) return;
    setLoading(true);
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("user", JSON.stringify({ name, phone }));
        onSuccess();
      } else {
        setSnack({ open: true, message: data.message || "Invalid OTP", type: "error" });
      }
    } catch {
      setSnack({ open: true, message: "OTP verification failed", type: "error" });
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        {step === 1 ? "Create Account" : "Verify OTP"}
      </Typography>

      {step === 1 && (
        <Box>
          <TextField
            label="Your Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Phone Number"
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
            {loading ? <CircularProgress size={24} /> : "Send OTP"}
          </Button>
        </Box>
      )}

      {step === 2 && (
        <Box>
          <TextField
            label="Enter OTP"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={verifyOtp}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Verify OTP"}
          </Button>
        </Box>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.type} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateAccount;
