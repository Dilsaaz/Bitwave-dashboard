import React, { useState } from 'react';
import axios from 'axios';
export default function AdminLogin({ onLogin }){
  const [email, setEmail] = useState('admin@bitwave.local');
  const [password, setPassword] = useState('');
  const login = async ()=> {
    try {
      const r = await axios.post('https://<YOUR_BACKEND_URL>/admin/login', { email, password });
      if(r.data.token) onLogin(r.data.token);
      else alert('Login failed');
    } catch(e){ alert('Login failed'); }
  };
  return (
    <div className="card">
      <h3>Admin Login</h3>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" />
      <div style={{marginTop:8}}>
        <button onClick={login}>Login</button>
        <div className="muted small" style={{marginTop:8}}>Seed admin: admin@bitwave.local (use seed route to create if missing)</div>
      </div>
    </div>
  );
}
