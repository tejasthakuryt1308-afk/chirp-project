export default function TweetActions({ item, onLike, onRetweet, onReply, onShare, onBookmark }) {
  const base = 'flex items-center gap-2 rounded-2xl px-3 py-2 transition hover:bg-white/5';
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-300">
      <button className={base} onClick={onReply}><span className="material-symbols-outlined">chat_bubble</span>{item.repliesCount || 0}</button>
      <button className={base} onClick={onRetweet}><span className={`material-symbols-outlined ${item.isRetweeted ? 'text-emerald-400' : ''}`}>repeat</span>{item.retweetsCount || 0}</button>
      <button className={base} onClick={onLike}><span className={`material-symbols-outlined ${item.isLiked ? 'fill text-red-400' : ''}`}>favorite</span>{item.likesCount || 0}</button>
      <button className={base} onClick={onBookmark}><span className="material-symbols-outlined">bookmark</span>Save</button>
      <button className={base} onClick={onShare}><span className="material-symbols-outlined">share</span>Share</button>
    </div>
  );
}
