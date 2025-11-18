import React, { useEffect, useState } from 'react';
import axios from 'axios';
export default function DepositForm(){
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ fullName:'', whatsapp:'', email:'', country:'India', stakeAmount:500, planKey:'bit', txHash:'', userId:'' });
  useEffect(()=>{ /* fetch plans later */ }, []);
  const submit = async (e) => {
    e.preventDefault();
    try{
      await axios.post('https://<YOUR_BACKEND_URL>/deposit', form);
      alert('Deposit submitted for verification');
    }catch(err){ alert('error'); }
  };
  return (
    <form onSubmit={submit} className="card">
      <div className="grid">
        <div>
          <label className="small">Full name</label>
          <input value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} required />
        </div>
        <div>
          <label className="small">WhatsApp</label>
          <input value={form.whatsapp} onChange={e=>setForm({...form, whatsapp:e.target.value})} required />
        </div>
      </div>
      <div style={{marginTop:8}}>
        <label className="small">Stake Amount</label>
        <select value={form.stakeAmount} onChange={e=>setForm({...form, stakeAmount: Number(e.target.value)})}>
          <option value={100}>$100</option>
          <option value={500}>$500</option>
          <option value={1000}>$1000</option>
          <option value={2000}>$2000</option>
          <option value={5000}>$5000</option>
        </select>
      </div>
      <div style={{marginTop:8}}>
        <label className="small">Custom amount (>$5000)</label>
        <input type="number" placeholder="Custom amount" onChange={e=>setForm({...form, stakeAmount: Number(e.target.value)})} />
      </div>
      <div style={{marginTop:8}}>
        <label className="small">Plan</label>
        <select value={form.planKey} onChange={e=>setForm({...form, planKey: e.target.value})}>
          <option value="bit">Bit Profit Plan</option>
          <option value="double">Double Bit (6 months)</option>
          <option value="triple">Triple Bit (1 year)</option>
          <option value="standard">Standard Plan</option>
        </select>
      </div>
      <div style={{marginTop:8}}>
        <label className="small">Tx Hash / Deposit ID</label>
        <input value={form.txHash} onChange={e=>setForm({...form, txHash: e.target.value})} required />
      </div>
      <div style={{marginTop:8}}>
        <button type="submit">Submit Deposit</button>
      </div>
    </form>
  );
}
