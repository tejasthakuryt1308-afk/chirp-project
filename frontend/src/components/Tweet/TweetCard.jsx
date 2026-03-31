import { useNavigate } from 'react-router-dom';
import ImageGrid from './ImageGrid';
import TweetActions from './TweetActions';
import { formatCount, timeAgo } from '../../utils/helpers';

export default function TweetCard({ item, onLike, onRetweet, onReply, onShare, onBookmark }) {
  const navigate = useNavigate();

  // ✅ SUPPORT BOTH BACKEND FORMATS
  const rawAuthor = item.author || item.user || {};

  // ✅ CHECK IF NEWS
  const isNews = item.isNewsArticle;

  // ✅ CLEAN HANDLE + NAME FOR NEWS
  const author = {
    ...rawAuthor,
    name: isNews ? item.newsSource || rawAuthor.name || 'News' : rawAuthor.name,
    handle: isNews
      ? (item.newsSource || "news")
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/[^a-z0-9]/g, "")
      : rawAuthor.handle || 'user'
  };

  // ✅ FAKE ENGAGEMENT (fallback)
  const likes = item.likes ?? Math.floor(Math.random() * 500 + 10);
  const comments = item.comments ?? Math.floor(Math.random() * 100 + 5);
  const retweets = item.retweets ?? Math.floor(Math.random() * 200 + 5);

  // ✅ NEWS LOGO FETCHER
  const getNewsLogo = (source) => {
    if (!source) return null;

    const map = {
      "bbc": "bbc.com",
      "ndtv": "ndtv.com",
      "cnn": "cnn.com",
      "reuters": "reuters.com",
      "theguardian": "theguardian.com",
      "the guardian": "theguardian.com",
      "nytimes": "nytimes.com"
    };

    const key = source.toLowerCase().replace(/\s+/g, "");
    console.log("NEWS DATA:", item);
    return map[key]
      ? `https://logo.clearbit.com/${map[key]}`
      : null;
  };

  // ✅ AVATAR FIX
 const avatar =
  rawAuthor.avatar ||
  (isNews ? item.newsLogo : null) || // ✅ USE BACKEND LOGO
  `https://ui-avatars.com/api/?name=${author.name || 'User'}&background=0D8ABC&color=fff`;

  return (
    <article className="glass rounded-[32px] p-5 shadow-glass">
      {/* ✅ FIXED ALIGNMENT (TOP LEFT) */}
      <div className="flex items-start gap-4">

        {/* PROFILE IMAGE */}
        <button
          onClick={() => navigate(`/profile/${rawAuthor._id || rawAuthor.id || ''}`)}
          className="shrink-0"
        >
          <img
            src={avatar}
            className="h-12 w-12 rounded-full object-cover"
            alt="avatar"
          />
        </button>

        <div className="min-w-0 flex-1">

          {/* HEADER */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <button
              className="font-semibold text-white hover:underline"
              onClick={() => navigate(`/profile/${rawAuthor._id || rawAuthor.id || ''}`)}
            >
              {author.name || 'Unknown'}
            </button>

            <span className="lowercase">@{author.handle}</span>

            {rawAuthor.verified && (
              <span className="material-symbols-outlined fill text-brand-300 text-sm">
                verified
              </span>
            )}

            <span>·</span>
            <span>{timeAgo(item.createdAt)}</span>
          </div>

          {/* TEXT */}
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-slate-100">
            {item.text}
          </p>

          {/* IMAGE */}
          {item.images?.length ? <ImageGrid images={item.images} /> : null}

          {/* ARTICLE */}
          {item.articleUrl && (
            <a
              href={item.articleUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-2xl bg-white/5 px-4 py-2 text-sm text-brand-200 hover:bg-white/10"
            >
              Read article
            </a>
          )}

          {/* ACTIONS */}
          <TweetActions
            item={{
              ...item,
              likes,
              comments,
              retweets
            }}
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
