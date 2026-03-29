import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Shell = ({ title, children, footer }) => (
  <div className="min-h-screen flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md glass rounded-[32px] p-6 shadow-glass">
      <div className="mb-6 text-center">
        <img src="/logo.png" alt="Chirp Logo" className="mx-auto h-12 w-auto mb-4" onError={(e)=>{e.currentTarget.style.display='none'}} />
        <div className="font-headline text-3xl font-black text-white">{title}</div>
      </div>
      {children}
      {footer}
    </div>
  </div>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await api.post('/auth/forgot-password', { email });
    setDone(true);
  };

  return (
    <Shell title="Reset password" footer={<div className="mt-5 text-center text-sm text-slate-400"><Link className="text-brand-200 hover:underline" to="/login">Back to login</Link></div>}>
      {done ? (
        <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-200">If that email exists, a reset link has been sent.</div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <button className="w-full rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-tactile">Send reset link</button>
        </form>
      )}
    </Shell>
  );
}
