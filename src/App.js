import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import CreateAccount from './components/CreateAccount';
import OtpVerification from './components/OtpVerification';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import GroupSettings from './components/GroupSettings';
import GroupChat from './components/GroupChat';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/chat/:contact" element={<Chat />} />
      <Route path="/groups" element={<GroupSettings />} />
      <Route path="/group-chat/:groupId" element={<GroupChat />} />
    </Routes>
  );
}

export default App;
