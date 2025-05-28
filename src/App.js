import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateAccount from './CreateAccount';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <div>
        <h2>📱 Chat App</h2>
        <Link to="/create-account">Create Account</Link>
        <Routes>
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
