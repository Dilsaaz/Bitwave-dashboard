import React, { useState } from 'react';
import DepositForm from './DepositForm';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('bw_token') || '');
  return (
    <div className="container">
      <h1 style={{fontSize:22}}>BitWave Dashboard</h1>
      {!token ? <AdminLogin onLogin={(t)=>{ localStorage.setItem('bw_token', t); setToken(t); }} /> : <AdminDashboard token={token} onLogout={()=>{ localStorage.removeItem('bw_token'); setToken(''); }} /> }
      <hr />
      <h2>Public Deposit Form</h2>
      <DepositForm />
    </div>
  );
}
