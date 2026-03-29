import { useEffect, useState } from 'react';
import api from '../utils/api';
import TweetCard from '../components/Tweet/TweetCard';

export default function Bookmarks() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await api.get('/users/me/bookmarks');
      setItems(data);
    };
    load();
  }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-24 space-y-4">
      <div className="glass rounded-[28px] p-5">
        <div className="font-headline text-2xl text-white">Bookmarks</div>
      </div>
      {items.map((item) => <TweetCard key={item._id} item={item} onLike={() => {}} onRetweet={() => {}} onReply={() => {}} onShare={() => {}} onBookmark={() => {}} />)}
    </div>
  );
}
