import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ImageGrid from './ImageGrid';
import { formatCount, timeAgo } from '../../utils/helpers';

export default function TweetCard({ item, onLike, onRetweet, onReply }) {
  const navigate = useNavigate();

  const isNews = item.isNewsArticle;

  const author = {
    name: isNews ? item.newsSource : item.author?.name,
    handle: isNews ? item.newsHandle : item.author?.handle,
    avatar: isNews ? item.newsLogo : item.author?.avatar,
    verified: true
  };

  // ✅ FIX COUNTS (IMPORTANT)
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);

  const likesCount = Array.isArray(item.likes) ? item.likes.length : 0;
  const retweetsCount = Array.isArray(item.retweets) ? item.retweets.length : 0;

  // ✅ AVATAR FIX (NO CROPPING ISSUE)
  const avatar =
    author.avatar ||
    `https://ui-avatars.com/api/?name=${author.name}&background=0D8ABC&color=fff`;

  return (
    <article className="glass rounded-[32px] p-5 shadow-glass">
      <div className="flex items-start gap-4">

        {/* AVATAR */}
        <img
          src={avatar}
          alt="avatar"
          className="h-12 w-12 rounded-full bg-white object-contain p-1"
        />

        <div className="flex-1">

          {/* HEADER */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-semibold text-white">
              {author.name || 'News'}
            </span>

            <span>@{author.handle?.replace('@', '')}</span>

            {author.verified && (
              <span className="material-symbols-outlined text-brand-300 text-sm">
                verified
              </span>
            )}

            <span>·</span>
            <span>{timeAgo(item.createdAt)}</span>
          </div>

          {/* TEXT */}
          <p className="mt-2 text-slate-100">{item.text}</p>

          {/* IMAGE */}
          {item.images?.length ? <ImageGrid images={item.images} /> : null}

          {/* READ ARTICLE */}
          {item.articleUrl && (
            <a
              href={item.articleUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-blue-400"
            >
              Read article
            </a>
          )}

          {/* ACTIONS */}
          <div className="flex justify-between mt-4 text-slate-400 text-sm">

            {/* COMMENT */}
            <button
              onClick={() => onReply?.(item)}
              className="flex items-center gap-1 hover:text-blue-400"
            >
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>

            {/* RETWEET */}
            <button
              onClick={() => {
                setRetweeted(!retweeted);
                onRetweet?.(item);
              }}
              className={`flex items-center gap-1 ${
                retweeted ? 'text-green-400' : 'hover:text-green-400'
              }`}
            >
              <span className="material-symbols-outlined">repeat</span>
              {formatCount(retweetsCount)}
            </button>

            {/* LIKE */}
            <button
              onClick={() => {
                setLiked(!liked);
                onLike?.(item);
              }}
              className={`flex items-center gap-1 ${
                liked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <span className="material-symbols-outlined">
                {liked ? 'favorite' : 'favorite_border'}
              </span>
              {formatCount(likesCount)}
            </button>

            {/* SHARE */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/tweet/${item._id}`
                );
                alert('Link copied!');
              }}
              className="hover:text-blue-400"
            >
              <span className="material-symbols-outlined">share</span>
            </button>

          </div>
        </div>
      </div>
    </article>
  );
}
