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

const OtpVerification = ({ phone, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const verifyOtp = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const res = await fetch("https://ws-chat-server-v6ih.onrender.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("user", JSON.stringify({ phone }));
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
        Verify OTP
      </Typography>
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

export default OtpVerification;
