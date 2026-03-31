import { useNavigate } from 'react-router-dom';  
import { useState } from 'react';
import ImageGrid from './ImageGrid';  
import { timeAgo } from '../../utils/helpers';  

export default function TweetCard({ item, onLike, onRetweet, onReply, onShare, onBookmark }) {  
  const navigate = useNavigate();  

  const rawAuthor = item.author || item.user || {};  
  const isNews = item.isNewsArticle;  

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

  // ✅ LIKE STATE
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes ?? Math.floor(Math.random() * 500 + 10));  

  const comments = item.comments ?? Math.floor(Math.random() * 100 + 5);  
  const retweets = item.retweets ?? Math.floor(Math.random() * 200 + 5);  

  // ✅ SAFE AVATAR / LOGO
  const avatar =
    rawAuthor.avatar ||
    (isNews && item.newsLogo) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name || 'User')}&background=random&color=fff`;

  // ❤️ LIKE HANDLER
  const handleLike = () => {
    setLiked(prev => !prev);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    onLike?.(item);
  };

  // 💬 COMMENT HANDLER
  const handleComment = () => {
    onReply?.(item);
    console.log("Open comments:", item._id);
  };

  return (  
    <article className="glass rounded-[32px] p-5 shadow-glass">  

      <div className="flex items-start gap-4">  

        {/* PROFILE / LOGO (FIXED CROPPING) */}
        <button  
          onClick={() => navigate(`/profile/${rawAuthor._id || rawAuthor.id || ''}`)}  
          className="shrink-0"
        >  
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img  
              src={avatar}  
              alt="avatar"  
              className="h-10 w-10 object-contain"
            />  
          </div>
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
          <div className="mt-3 flex gap-6 text-sm text-slate-400">  

            {/* ❤️ LIKE */}
            <button onClick={handleLike} className="flex items-center gap-1 hover:text-red-500">  
              <span className={`material-symbols-outlined ${liked ? 'text-red-500' : ''}`}>  
                favorite  
              </span>  
              <span>{likes}</span>  
            </button>  

            {/* 💬 COMMENT */}
            <button onClick={handleComment} className="flex items-center gap-1 hover:text-blue-400">  
              <span className="material-symbols-outlined">  
                chat_bubble  
              </span>  
              <span>{comments}</span>  
            </button>  

            {/* 🔁 RETWEET */}
            <button onClick={() => onRetweet?.(item)} className="flex items-center gap-1 hover:text-green-400">  
              <span className="material-symbols-outlined">  
                repeat  
              </span>  
              <span>{retweets}</span>  
            </button>  

          </div>  

        </div>  
      </div>  
    </article>  
  );  
}
