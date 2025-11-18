import React, { useState, useEffect } from 'react';
import axios from 'axios';
export default function AdminDashboard({ token, onLogout }){
  const [users, setUsers] = useState([]);
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('India');
  const [csv, setCsv] = useState('');
  const [pending, setPending] = useState([]);

  const headers = { Authorization: 'Bearer ' + token };

  const fetchUsers = async ()=> {
    try{ const r = await axios.get('https://<YOUR_BACKEND_URL>/admin/users', { headers }); setUsers(r.data); }catch(e){}
  };
  const fetchPending = async ()=> {
    try{ const r = await axios.get('https://<YOUR_BACKEND_URL>/admin/deposits/pending', { headers }); setPending(r.data); }catch(e){}
  };
  useEffect(()=>{ fetchUsers(); fetchPending(); }, []);

  const createInvestor = async () => {
    try {
      const r = await axios.post('https://<YOUR_BACKEND_URL>/admin/create-investor', { fullName, whatsapp, email, country }, { headers });
      alert('Created: ' + r.data.username + ' / ' + r.data.password + '\nSend these to investor securely.');
      fetchUsers();
    } catch(e){ alert('error'); }
  };

  const importCsv = async () => {
    try {
      const r = await axios.post('https://<YOUR_BACKEND_URL>/admin/import-csv', { csv }, { headers });
      alert('Imported: ' + (r.data.created?.length || 0) + ' users. Check console for credentials.');
      console.log('created', r.data.created);
      fetchUsers();
    } catch(e){ alert('import error'); }
  };

  const approve = async (id) => {
    try {
      await axios.post('https://<YOUR_BACKEND_URL>/admin/deposits/'+id+'/approve', {}, { headers });
      alert('Approved');
      fetchPending();
    } catch(e){ alert('approve error'); }
  };
  const reject = async (id) => {
    try {
      await axios.post('https://<YOUR_BACKEND_URL>/admin/deposits/'+id+'/reject', {}, { headers });
      alert('Rejected');
      fetchPending();
    } catch(e){ alert('reject error'); }
  };

  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h3>Admin Dashboard</h3>
        <div>
          <button onClick={onLogout} style={{background:'#ef4444'}}>Logout</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <h4>Create Investor</h4>
        <div className="grid">
          <div>
            <input placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
          </div>
          <div>
            <input placeholder="WhatsApp" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} />
          </div>
          <div>
            <input placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <input placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} />
          </div>
        </div>
        <div style={{marginTop:8}}>
          <button onClick={createInvestor}>Create & Get Credentials</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <h4>Bulk Import (CSV)</h4>
        <div className="muted small">Paste rows: fullName,whatsapp,email,country (one per line)</div>
        <textarea rows={6} value={csv} onChange={e=>setCsv(e.target.value)} />
        <div style={{marginTop:8}}>
          <button onClick={importCsv}>Import CSV</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <h4>Pending Deposits</h4>
        <div className="muted small">Approve deposits to create stakes</div>
        <ul>
          {pending.map(p=>(
            <li key={p._id} style={{marginTop:8}}>
              <b>{p.fullName}</b> — ${p.stakeAmount} — {p.planKey} — Tx:{p.txHash}
              <div style={{marginTop:6}}>
                <button onClick={()=>approve(p._id)}>Approve</button>
                <button onClick={()=>reject(p._id)} style={{marginLeft:8}}>Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{marginTop:12}}>
        <h4>Users</h4>
        <div className="muted small">Total users: {users.length}</div>
        <ul>
          {users.map(u=> <li key={u._id}>{u.fullName} — {u.username} — {u.whatsapp}</li>)}
        </ul>
      </div>
    </div>
  );
}
