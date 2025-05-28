import React, { useState } from 'react';

function CreateAccount() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const sendOtp = async () => {
    const res = await fetch('https://your-backend/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (res.ok) setOtpSent(true);
    alert(data.message);
  };

  const verifyOtp = async () => {
    const res = await fetch('https://your-backend/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      window.location.href = '/dashboard';
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <h3>Create Account</h3>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile Number" />
      <button onClick={sendOtp}>Send OTP</button>
      {otpSent && (
        <>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}
    </div>
  );
}

export default CreateAccount;
