import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import GroupChat from "./components/GroupChat";
import GroupSettings from "./components/GroupSettings";
import JoinGroup from './components/JoinGroup';
import CreateAccount from "./pages/CreateAccount";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat/:phone" element={<Chat />} />
      <Route path="/settings" element={<GroupSettings />} />
      <Route path="/group/:groupName" element={<GroupChat />} />
      <Route path="/join" element={<JoinGroup />} />
      <Route path="/create-account" element={<CreateAccount />}/>

    </Routes>
  );
}

export default App;
