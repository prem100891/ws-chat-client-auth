import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import { useLocation } from "react-router-dom";

const OtpVerification = () => {
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

  const phone = location.state?.phone || "";

  const handleVerifyOtp = async () => {
    if (!phone || !otp) {
      setSnack({ open: true, message: "Phone and OTP required", type: "warning" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://ws-chat-server-v6ih.onrender.com/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phone, otp }),
        credentials: "include"
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSnack({ open: true, message: data.message, type: "success" });
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (error) {
      setSnack({ open: true, message: error.message, type: "error" });
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "4rem", textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        ✅ Verify OTP
      </Typography>

      <TextField
        label="Phone Number"
        variant="outlined"
        fullWidth
        value={phone}
        disabled
        style={{ marginBottom: "1rem" }}
      />

      <TextField
        label="Enter OTP"
        variant="outlined"
        fullWidth
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={{ marginBottom: "1.5rem" }}
      />

      <Button
        variant="contained"
        color="success"
        onClick={handleVerifyOtp}
        disabled={loading}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : "Verify OTP"}
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

export default OtpVerification;
