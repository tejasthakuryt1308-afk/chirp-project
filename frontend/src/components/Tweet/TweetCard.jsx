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

  // ✅ STATE
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(
    Array.isArray(item.likes) ? item.likes.length : 0
  );

  // ✅ COUNTS
  const likesCount = localLikeCount;
  const retweetsCount = Array.isArray(item.retweets) ? item.retweets.length : 0;
  const commentsCount = Array.isArray(item.replies) ? item.replies.length : 0;

  // ✅ AVATAR
  const avatar =
    author.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=0D8ABC&color=fff&size=128`;

  // ✅ HANDLE LIKE (with animation)
  const handleLike = () => {
    setLiked(!liked);
    setLocalLikeCount(prev => liked ? prev - 1 : prev + 1);
    onLike?.(item);
  };

  // ✅ HANDLE RETWEET
  const handleRetweet = () => {
    setRetweeted(!retweeted);
    onRetweet?.(item);
  };

  // ✅ TOGGLE COMMENTS
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <article className="glass rounded-[32px] p-5 shadow-glass hover:shadow-glass-hover transition-all">
      <div className="flex items-start gap-4">

        {/* ✅ AVATAR */}
        <img
          src={avatar}
          alt={author.name}
          className="h-12 w-12 rounded-full bg-white object-contain p-1 flex-shrink-0"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=1DA1F2&color=fff&size=128`;
          }}
        />

        <div className="flex-1 min-w-0">

          {/* ✅ HEADER */}
          <div className="flex items-center gap-2 text-sm text-slate-400 flex-wrap">
            <span className="font-semibold text-white truncate">
              {author.name || 'News'}
            </span>

            {author.verified && (
              <span className="material-symbols-outlined text-blue-400 text-base flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            )}

            <span className="text-slate-500 truncate">
              @{author.handle?.replace('@', '')}
            </span>

            <span className="text-slate-600">·</span>
            <span className="text-slate-500 flex-shrink-0">{timeAgo(item.createdAt)}</span>
          </div>

          {/* ✅ TEXT */}
          <p className="mt-2 text-slate-100 leading-relaxed whitespace-pre-wrap break-words">
            {item.text}
          </p>

          {/* ✅ IMAGE */}
          {item.images?.length > 0 && (
            <div className="mt-3">
              <ImageGrid images={item.images} />
            </div>
          )}

          {/* ✅ READ ARTICLE */}
          {item.articleUrl && (
            <a
              href={item.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="material-symbols-outlined text-base">link</span>
              Read full article
            </a>
          )}

          {/* ✅ ACTIONS */}
          <div className="flex justify-between mt-4 max-w-md">

            {/* COMMENT */}
            <button
              onClick={toggleComments}
              className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  chat_bubble_outline
                </span>
              </div>
              {commentsCount > 0 && (
                <span className="text-sm font-medium">{formatCount(commentsCount)}</span>
              )}
            </button>

            {/* RETWEET */}
            <button
              onClick={handleRetweet}
              className={`flex items-center gap-1.5 transition-colors group ${
                retweeted ? 'text-green-500' : 'text-slate-400 hover:text-green-500'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                retweeted ? 'bg-green-500/10' : 'group-hover:bg-green-500/10'
              }`}>
                <span className="material-symbols-outlined text-[20px]">
                  repeat
                </span>
              </div>
              {retweetsCount > 0 && (
                <span className="text-sm font-medium">{formatCount(retweetsCount)}</span>
              )}
            </button>

            {/* LIKE - FIXED WITH ANIMATION */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-all group ${
                liked ? 'text-pink-600' : 'text-slate-400 hover:text-pink-600'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                liked ? 'bg-pink-600/10' : 'group-hover:bg-pink-600/10'
              }`}>
                <span 
                  className={`material-symbols-outlined text-[20px] transition-all ${
                    liked ? 'animate-like' : ''
                  }`}
                  style={{ 
                    fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0"
                  }}
                >
                  favorite
                </span>
              </div>
              {likesCount > 0 && (
                <span className="text-sm font-medium">{formatCount(likesCount)}</span>
              )}
            </button>

            {/* SHARE */}
            <button
              onClick={() => {
                const url = `${window.location.origin}/tweet/${item._id}`;
                navigator.clipboard.writeText(url);
                // Show toast instead of alert
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-fade-in';
                toast.textContent = 'Link copied to clipboard!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 2000);
              }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  share
                </span>
              </div>
            </button>

          </div>

          {/* ✅ COMMENTS SECTION */}
          {showComments && item.replies && item.replies.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3 animate-slide-down">
              <div className="text-sm font-semibold text-slate-300 mb-3">
                {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
              </div>
              {item.replies.map((reply, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-slate-800/30 rounded-2xl">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {reply.user?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">
                        {reply.user || 'User'}
                      </span>
                      <span>·</span>
                      <span>{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-200 break-words">
                      {reply.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ✅ NO COMMENTS MESSAGE */}
          {showComments && (!item.replies || item.replies.length === 0) && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 text-center text-slate-400 text-sm animate-slide-down">
              No comments yet. Be the first to comment!
            </div>
          )}

        </div>
      </div>
    </article>
  );
              }
