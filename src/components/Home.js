import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
} from "@mui/material";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        🔐 Chat Room with Admin Approval
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Secure real-time chat — powered by OTP login & group invites
      </Typography>

      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/create-account")}
          fullWidth
        >
          🚀 Create Account & Start
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
