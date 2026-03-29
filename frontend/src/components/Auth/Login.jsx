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

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const submit = async (e) => {
    e.preventDefault();
    await login(form.email, form.password);
    navigate('/');
  };
  return (
    <Shell
      title="Welcome back"
      footer={<div className="mt-5 text-center text-sm text-slate-400">No account? <Link className="text-brand-200 hover:underline" to="/signup">Create one</Link></div>}
    >
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
        <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
        <div className="text-right text-sm"><Link to="/forgot-password" className="text-brand-200 hover:underline">Forgot password?</Link></div>
        <button className="w-full rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-tactile">Sign In</button>
      </form>
    </Shell>
  );
}
