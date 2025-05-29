import React from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box textAlign="center">
        <Typography variant="h4" gutterBottom>
          💬 Welcome to Prem's Chat App
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          A secure, real-time messaging experience — just like WhatsApp.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/create-account")}
          sx={{ mt: 4 }}
        >
          🚀 Create Account
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
