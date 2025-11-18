// backend/notify.js
// Simple notification placeholders
const https = require('https');
const nodemailer = require('nodemailer');

async function sendTelegram(message){
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if(!token || !chat){ console.log('Telegram not configured. Message:', message); return; }
  const postData = JSON.stringify({ chat_id: chat, text: message, parse_mode: 'HTML' });
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const req = https.request(url, { method: 'POST', headers: {'Content-Type':'application/json'} }, (res)=>{ res.on('data',()=>{}); });
  req.write(postData); req.end();
}

async function sendEmail(to, subject, text){
  const host = process.env.EMAIL_SMTP_HOST;
  const user = process.env.EMAIL_SMTP_USER;
  const pass = process.env.EMAIL_SMTP_PASS;
  if(!host || !user || !pass){ console.log('Email not configured. Subj:', subject); return; }
  const transporter = nodemailer.createTransport({ host, auth: { user, pass } });
  await transporter.sendMail({ from: user, to, subject, text });
}

module.exports = { sendTelegram, sendEmail };
