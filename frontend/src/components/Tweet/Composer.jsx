import { useMemo, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const canPost = useMemo(() => text.trim().length > 0 || images.length > 0, [text, images]);
  const overLimit = text.length > 280;

  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      uploaded.push({ url: data.url, width: data.width, height: data.height });
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const post = async () => {
    if (!canPost || overLimit) return;
    const { data } = await api.post('/tweets', { text, images });
    setText('');
    setImages([]);
    onPosted?.(data);
  };

  return (
    <div className="glass rounded-[32px] p-5 shadow-glass">
      <div className="flex gap-4">
        <img src={user?.avatar || 'https://i.pravatar.cc/150?img=1'} className="h-12 w-12 rounded-full object-cover" alt="" />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What is happening?"
            className="min-h-28 w-full resize-none bg-transparent text-lg outline-none placeholder:text-slate-500"
          />
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {images.map((img, idx) => (
                <div key={img.url + idx} className="relative overflow-hidden rounded-2xl">
                  <img src={img.url} className="h-40 w-full object-cover" />
                  <button onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))} className="absolute right-2 top-2 rounded-full bg-slate-950/80 p-1">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <label className="liquid-hover cursor-pointer rounded-2xl bg-white/5 px-3 py-2 border border-white/10">
                <span className="material-symbols-outlined align-middle">image</span>
                <input type="file" accept="image/*" className="hidden" multiple onChange={(e) => uploadFiles(Array.from(e.target.files || []))} />
              </label>
              <span className={`text-sm ${overLimit ? 'text-red-400' : 'text-slate-400'}`}>{text.length}/280</span>
              {uploading && <span className="text-sm text-brand-200">Uploading...</span>}
            </div>
            <button disabled={!canPost || overLimit} onClick={post} className="liquid-hover rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white shadow-tactile disabled:opacity-40">
              Chirp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
