import TweetCard from '../Tweet/TweetCard';

export default function ProfileFeed({ items, onLike, onRetweet, onReply, onShare, onBookmark }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <TweetCard key={item._id} item={item} onLike={onLike} onRetweet={onRetweet} onReply={onReply} onShare={onShare} onBookmark={onBookmark} />
      ))}
    </div>
  );
}
