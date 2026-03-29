import { useEffect, useState } from 'react';
import Modal from '../Common/Modal';
import api from '../../utils/api';

export default function EditProfile({ open, onClose, user, onSaved }) {
  const [form, setForm] = useState({ name: '', bio: '', location: '', website: '', avatar: '', coverPhoto: '' });

  useEffect(() => {
    if (user) setForm({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      avatar: user.avatar || '',
      coverPhoto: user.coverPhoto || ''
    });
  }, [user]);

  const save = async () => {
    const { data } = await api.put(`/users/${user._id}`, form);
    onSaved?.(data);
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="font-headline text-xl text-white">Edit Profile</div>
        <div className="mt-4 grid gap-3">
          {['name', 'bio', 'location', 'website', 'avatar', 'coverPhoto'].map((key) => (
            key === 'bio' ? (
              <textarea key={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="min-h-28 rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none" placeholder={key} />
            ) : (
              <input key={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none" placeholder={key} />
            )
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-2xl border border-white/10 px-4 py-2">Cancel</button>
          <button onClick={save} className="rounded-2xl bg-brand-500 px-4 py-2 font-semibold text-white">Save</button>
        </div>
      </div>
    </Modal>
  );
}
