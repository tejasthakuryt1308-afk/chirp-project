import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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

import { useParams } from 'react-router-dom';
import api from '../../utils/api';

export default function ResetPassword() {
  const { token } = useParams();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert('Passwords do not match');
    const { data } = await api.post(`/auth/reset-password/${token}`, { password: form.password });
    localStorage.setItem('chirp_token', data.token);
    navigate('/');
    window.location.reload();
  };

  return (
    <Shell title="Set new password" footer={null}>
      <form onSubmit={submit} className="space-y-3">
        <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none" placeholder="New password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
        <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none" placeholder="Confirm password" value={form.confirmPassword} onChange={(e)=>setForm({...form,confirmPassword:e.target.value})} />
        <button className="w-full rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-tactile">Reset password</button>
      </form>
    </Shell>
  );
}
