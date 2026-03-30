import { useEffect, useState } from 'react';
import Modal from '../Common/Modal';
import api from '../../utils/api';

export default function EditProfile({ open, onClose, user, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
    coverPhoto: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || '',
        coverPhoto: user.coverPhoto || ''
      });
    }
  }, [user]);

  const save = async () => {
    try {
      const { data } = await api.put(`/users/${user._id}`, form);
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="font-headline text-xl text-white">Edit Profile</div>

        <div className="mt-4 grid gap-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
            placeholder="Name"
          />

          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
            placeholder="Bio"
          />

          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
            placeholder="Location"
          />

          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
            placeholder="Website"
          />

          <input
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white"
            placeholder="Avatar URL"
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-2xl border px-4 py-2 text-white">
            Cancel
          </button>
          <button onClick={save} className="rounded-2xl bg-brand-500 px-4 py-2 text-white">
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
