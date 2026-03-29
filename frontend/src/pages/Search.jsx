import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import TweetCard from '../components/Tweet/TweetCard';

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') || '';
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!q) return setItems([]);
      const { data } = await api.get(`/tweets/search?q=${encodeURIComponent(q)}`);
      setItems(data);
    };
    load();
  }, [q]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-24 space-y-4">
      <div className="glass rounded-[28px] p-5">
        <div className="font-headline text-2xl text-white">Search</div>
        <div className="mt-2 text-slate-400">Results for <span className="text-white font-semibold">{q || '—'}</span></div>
      </div>
      {items.map((item) => <TweetCard key={item._id} item={item} onLike={() => {}} onRetweet={() => {}} onReply={() => navigate(`/tweet/${item._id}`)} onShare={() => {}} onBookmark={() => {}} />)}
    </div>
  );
}
