import { Link } from 'react-router-dom';

export default function MobileNav({ onCompose }) {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-2 text-xs">
          <Link to="/" className="flex flex-col items-center py-2 text-slate-200"><span className="material-symbols-outlined">home</span>Home</Link>
          <Link to="/search" className="flex flex-col items-center py-2 text-slate-200"><span className="material-symbols-outlined">search</span>Search</Link>
          <button onClick={onCompose} className="flex flex-col items-center py-2 text-brand-200"><span className="material-symbols-outlined">add_circle</span>Post</button>
          <Link to="/bookmarks" className="flex flex-col items-center py-2 text-slate-200"><span className="material-symbols-outlined">bookmark</span>Saved</Link>
          <Link to="/login" className="flex flex-col items-center py-2 text-slate-200"><span className="material-symbols-outlined">person</span>Account</Link>
        </div>
      </div>

      <button onClick={onCompose} className="fixed bottom-20 right-4 z-40 lg:hidden rounded-full bg-brand-500 p-4 shadow-tactile">
        <span className="material-symbols-outlined text-white">edit</span>
      </button>
    </>
  );
}
