import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Shell = ({ title, children, footer }) => (
  <div className="min-h-screen flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md glass rounded-[32px] p-6 shadow-glass">
      <div className="mb-6 text-center">
        <img 
          src="/logo.png" 
          alt="Chirp Logo" 
          className="mx-auto h-12 w-auto mb-4" 
          onError={(e)=>{e.currentTarget.style.display='none'}} 
        />
        <div className="font-headline text-3xl font-black text-white">{title}</div>
      </div>
      {children}
      {footer}
    </div>
  </div>
);

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    handle: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    avatar: ''
  });

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alert('Passwords do not match ❌');
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        handle: form.handle,
        email: form.email,
        password: form.password,
        bio: form.bio,
        avatar: form.avatar
      };

      await signup(payload);

      alert("Signup successful ✅");

      navigate('/');

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
        "Signup failed ❌ (maybe user already exists)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell
      title="Create account"
      footer={
        <div className="mt-5 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link className="text-brand-200 hover:underline" to="/login">
            Sign in
          </Link>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-3">

        {['name','handle','email','password','confirmPassword','bio','avatar'].map((k) => (
          k === 'bio' ? (
            <textarea
              key={k}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none"
              placeholder="Bio"
              value={form[k]}
              onChange={(e)=>setForm({...form,[k]:e.target.value})}
            />
          ) : k.includes('password') ? (
            <input
              key={k}
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none"
              placeholder={k === 'confirmPassword' ? 'Confirm Password' : 'Password'}
              value={form[k]}
              onChange={(e)=>setForm({...form,[k]:e.target.value})}
            />
          ) : (
            <input
              key={k}
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none"
              placeholder={k === 'handle' ? '@handle' : k.charAt(0).toUpperCase() + k.slice(1)}
              value={form[k]}
              onChange={(e)=>setForm({...form,[k]:e.target.value})}
            />
          )
        ))}

        <button 
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-brand-500 py-3 font-semibold text-white shadow-tactile"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

      </form>
    </Shell>
  );
}
