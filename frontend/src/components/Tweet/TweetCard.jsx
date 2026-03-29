import { useNavigate } from 'react-router-dom';
import ImageGrid from './ImageGrid';
import TweetActions from './TweetActions';
import { formatCount, timeAgo } from '../../utils/helpers';

export default function TweetCard({ item, onLike, onRetweet, onReply, onShare, onBookmark }) {
  const navigate = useNavigate();
  const author = item.author || {};
  return (
    <article className="glass rounded-[32px] p-5 shadow-glass">
      <div className="flex gap-4">
        <button onClick={() => navigate(`/profile/${author._id || author.id}`)} className="shrink-0">
          <img src={author.avatar || 'https://i.pravatar.cc/150?img=1'} className="h-12 w-12 rounded-full object-cover" alt="" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <button className="font-semibold text-white hover:underline" onClick={() => navigate(`/profile/${author._id || author.id}`)}>{author.name || 'Unknown'}</button>
            <span>@{author.handle || 'user'}</span>
            {author.verified && <span className="material-symbols-outlined fill text-brand-300 text-sm">verified</span>}
            <span>·</span>
            <span>{timeAgo(item.createdAt)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-slate-100">{item.text}</p>
          {item.images?.length ? <ImageGrid images={item.images} /> : null}
          {item.isNewsArticle && item.articleUrl ? (
            <a href={item.articleUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-2xl bg-white/5 px-4 py-2 text-sm text-brand-200 hover:bg-white/10">
              Read article
            </a>
          ) : null}
          <TweetActions
            item={item}
            onLike={() => onLike?.(item)}
            onRetweet={() => onRetweet?.(item)}
            onReply={() => onReply?.(item)}
            onShare={() => onShare?.(item)}
            onBookmark={() => onBookmark?.(item)}
          />
        </div>
      </div>
    </article>
  );
}
