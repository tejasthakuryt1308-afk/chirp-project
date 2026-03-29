import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { debounce } from '../../utils/helpers';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function TopNavBar({ onSearchResults }) {
  const [q, setQ] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const doSearch = debounce(async (value) => {
    if (!value.trim()) {
      onSearchResults([]);
      return;
    }
    const { data } = await api.get(`/tweets/search?q=${encodeURIComponent(value)}`);
    onSearchResults(data.slice(0, 8));
  }, 300);

  return (
    <div className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/logo.png" alt="Chirp Logo" className="h-8 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="text-2xl font-black text-brand-300 tracking-tighter font-headline">Chirp</span>
        </Link>

        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); doSearch(e.target.value); }}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-300/60"
            placeholder="Search Chirp"
          />
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/profile/${user._id}`)} className="liquid-hover rounded-2xl px-4 py-2 bg-white/5 border border-white/10 text-sm">Profile</button>
            <button onClick={logout} className="liquid-hover rounded-2xl px-4 py-2 bg-brand-500 text-white text-sm shadow-tactile">Logout</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')} className="liquid-hover rounded-2xl px-4 py-2 bg-white/5 border border-white/10 text-sm">Login</button>
            <button onClick={() => navigate('/signup')} className="liquid-hover rounded-2xl px-4 py-2 bg-brand-500 text-white text-sm shadow-tactile">Signup</button>
          </div>
        )}
      </div>
    </div>
  );
}
