import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, name } = location.state || {};

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", type: "info" });

  const verifyOtp = async () => {
    if (!otp || !phone) {
      setSnack({ open: true, message: "OTP is required", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      // const res = await fetch("https://ws-chat-server-v6ih.onrender.com/verify-otp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ otp, phone, name }),
      // });
      const res = await axios.post("https://ws-chat-server-v6ih.onrender.com/verify-otp", {
        phone, otp, name
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // const data = await res.json();

      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify({ phone, name }));
        setSnack({ open: true, message: "OTP Verified", type: "success" });
        navigate("/dashboard");
      } else {
        setSnack({ open: true, message: data.message || "Verification failed", type: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: "Server error", type: "error" });
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        🔐 Verify OTP
      </Typography>

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
        {loading ? <CircularProgress size={24} /> : "✅ Verify"}
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

export default VerifyOtp;
