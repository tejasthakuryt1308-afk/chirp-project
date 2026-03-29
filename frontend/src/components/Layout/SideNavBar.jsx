import { NavLink } from 'react-router-dom';

const categories = [
  ['All News', 'general'],
  ['Sports', 'sports'],
  ['Entertainment', 'entertainment'],
  ['Business', 'business'],
  ['Technology', 'technology'],
  ['Science', 'science'],
  ['Health', 'health'],
  ['World News', 'world']
];

export default function SideNavBar({ onCategoryClick }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
      isActive ? 'bg-brand-500/20 text-brand-200' : 'hover:bg-white/5 text-slate-200'
    }`;

  return (
    <aside className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="glass rounded-[28px] p-4">
          <div className="font-headline text-white text-lg mb-3">Navigate</div>
          <div className="space-y-1">
            <NavLink to="/" className={linkClass}><span className="material-symbols-outlined">home</span>Home</NavLink>
            <NavLink to="/bookmarks" className={linkClass}><span className="material-symbols-outlined">bookmark</span>Bookmarks</NavLink>
            <NavLink to="/search" className={linkClass}><span className="material-symbols-outlined">manage_search</span>Search</NavLink>
          </div>
        </div>

        <div className="glass rounded-[28px] p-4">
          <div className="font-headline text-white text-lg mb-3">News Categories</div>
          <div className="space-y-2">
            {categories.map(([label, category]) => (
              <button key={category} onClick={() => onCategoryClick?.(category)} className="w-full text-left px-4 py-3 hover:bg-slate-200/10 rounded-xl cursor-pointer">
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
