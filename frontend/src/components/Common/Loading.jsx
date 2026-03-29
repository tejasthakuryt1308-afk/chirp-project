export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="glass rounded-3xl px-6 py-4 shadow-glass flex items-center gap-3">
        <span className="material-symbols-outlined animate-spin text-brand-300">refresh</span>
        <div className="font-headline text-white">{text}</div>
      </div>
    </div>
  );
}
