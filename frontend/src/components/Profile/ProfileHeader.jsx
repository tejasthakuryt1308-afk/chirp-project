export default function ProfileHeader({ user, isOwnProfile, onEdit, onFollow }) {
  return (
    <div className="glass rounded-[32px] overflow-hidden shadow-glass">
      <div className="h-44 bg-gradient-to-r from-brand-800 via-slate-900 to-sky-900" />
      <div className="p-5">
        <div className="-mt-20 flex items-end justify-between gap-4">
          <img src={user.avatar || 'https://i.pravatar.cc/150?img=1'} className="h-36 w-36 rounded-[32px] border-4 border-slate-950 object-cover shadow-glass" />
          {isOwnProfile ? (
            <button onClick={onEdit} className="liquid-hover rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-tactile">Edit Profile</button>
          ) : (
            <button onClick={onFollow} className="liquid-hover rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-tactile">Follow</button>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h1 className="font-headline text-2xl font-bold text-white">{user.name}</h1>
            {user.verified && <span className="material-symbols-outlined fill text-brand-300">verified</span>}
          </div>
          <div className="text-slate-400">@{user.handle}</div>
          <p className="mt-3 max-w-2xl text-slate-200">{user.bio}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
            {user.location ? <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">location_on</span>{user.location}</span> : null}
            {user.website ? <a className="flex items-center gap-2 hover:underline" href={user.website} target="_blank" rel="noreferrer"><span className="material-symbols-outlined text-sm">link</span>{user.website}</a> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
