// 1. Fixed the capital 'I' here:
import { useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import Composer from '../components/Tweet/Composer';
import TweetCard from '../components/Tweet/TweetCard';
import Loading from '../components/Common/Loading';
import { useAuth } from '../context/AuthContext';
import { usePullToRefresh } from '../hooks/usePullToRefresh'; // Make sure this file is renamed to .jsx!

export default function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await api.get(`/tweets?limit=20${category ? `&category=${category}` : ''}`);
    setItems(data.items);
    setLoading(false);
  };

  useEffect(() => { load(); }, [category]);
  
  // 2. Capture the 'pulling' state from your custom hook
  const pulling = usePullToRefresh(load);

  const trends = useMemo(() => [
    { label: '#startup', count: 124 },
    { label: '#ai', count: 98 },
    { label: '#news', count: 76 }
  ], []);

  const suggestions = useMemo(() => [
    { _id: '1', name: 'Reuters', handle: 'reuters', avatar: 'https://logo.clearbit.com/reuters.com' },
    { _id: '2', name: 'BBC News', handle: 'bbc', avatar: 'https://logo.clearbit.com/bbc.com' }
  ], []);

  const act = async (type, item) => {
    if (type === 'like') {
      await api[item.isLiked ? 'delete' : 'post'](`/tweets/${item._id}/like`);
    }
    if (type === 'retweet') {
      await api[item.isRetweeted ? 'delete' : 'post'](`/tweets/${item._id}/retweet`);
    }
    if (type === 'bookmark') {
      alert('Bookmarking is supported in backend schema; wire the endpoint as needed.');
    }
    load();
  };

  const share = async (item) => {
    await navigator.clipboard.writeText(`${window.location.origin}/tweet/${item._id}`);
    alert('Link copied!');
  };

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 pb-24 lg:pb-8 relative">
      
      {/* 3. The Pull-to-Refresh Indicator */}
      {pulling && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 bg-white shadow-lg flex items-center justify-center p-1"></div>
        </div>
      )}

      <div className="hidden lg:block w-80 shrink-0">
        <div className="sticky top-24 space-y-6">
          <div className="glass rounded-[28px] p-4">
            <div className="font-headline text-white text-lg mb-3">News Categories</div>
            <div className="space-y-2">
              {['general','sports','entertainment','business','technology','science','health','world'].map((c) => (
                <button key={c} onClick={() => setCategory(c)} className="w-full text-left px-4 py-3 hover:bg-slate-200/10 rounded-xl cursor-pointer capitalize">
                  {c === 'general' ? '📰 All News' : c === 'sports' ? '⚽ Sports' : c === 'entertainment' ? '🎬 Entertainment' : c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="min-w-0 flex-1 space-y-4">
        {user ? <Composer onPosted={(tweet) => setItems((prev) => [tweet, ...prev])} /> : null}
        {loading ? <Loading text="Loading chirps" /> : items.map((item) => (
          <TweetCard
            key={item._id}
            item={item}
            onLike={(t) => act('like', t)}
            onRetweet={(t) => act('retweet', t)}
            onReply={() => {}}
            onShare={share}
            onBookmark={(t) => act('bookmark', t)}
          />
        ))}
      </main>

      <div className="hidden xl:block w-80 shrink-0">
        <div className="sticky top-24 space-y-6">
          <div className="glass rounded-[28px] p-4">
            <div className="font-headline text-white text-lg mb-3">Trending</div>
            <div className="space-y-2">
              {trends.map((t) => (
                <div key={t.label} className="rounded-2xl px-4 py-3 hover:bg-white/5">
                  <div className="text-sm text-slate-400">{t.count} chirps</div>
                  <div className="font-semibold text-white">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-[28px] p-4">
            <div className="font-headline text-white text-lg mb-3">Who to Follow</div>
            <div className="space-y-3">
              {suggestions.map((u) => (
                <div key={u._id} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-sm text-slate-400">@{u.handle}</div>
                    </div>
                  </div>
                  <button className="rounded-2xl bg-brand-500 px-3 py-2 text-xs text-white">Follow</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
