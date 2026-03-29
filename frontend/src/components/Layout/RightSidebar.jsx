import { useNavigate } from 'react-router-dom';

export default function RightSidebar({ trends = [], suggestions = [] }) {
  const navigate = useNavigate();
  return (
    <aside className="hidden xl:block w-80 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="glass rounded-[28px] p-4">
          <div className="font-headline text-white text-lg mb-3">Trending</div>
          <div className="space-y-2">
            {trends.map((trend) => (
              <button key={trend.label} onClick={() => navigate(`/search?q=${encodeURIComponent(trend.label)}`)} className="w-full text-left rounded-2xl px-4 py-3 hover:bg-white/5 transition">
                <div className="text-sm text-slate-400">{trend.count} chirps</div>
                <div className="font-semibold text-white">{trend.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-[28px] p-4">
          <div className="font-headline text-white text-lg mb-3">Who to Follow</div>
          <div className="space-y-3">
            {suggestions.map((user) => (
              <div key={user._id} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-white/5">
                <button className="flex items-center gap-3 text-left" onClick={() => navigate(`/profile/${user._id}`)}>
                  <img src={user.avatar || 'https://i.pravatar.cc/150?img=1'} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-sm text-slate-400">@{user.handle}</div>
                  </div>
                </button>
                <button className="rounded-2xl bg-brand-500 px-3 py-2 text-xs text-white">Follow</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
