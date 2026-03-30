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

  const [previewAvatar, setPreviewAvatar] = useState('');
  const [previewCover, setPreviewCover] = useState('');

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

      setPreviewAvatar(user.avatar || '');
      setPreviewCover(user.coverPhoto || '');
    }
  }, [user]);

  // ✅ HANDLE IMAGE UPLOAD
  const handleImage = (file, type) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      if (type === 'avatar') {
        setForm({ ...form, avatar: reader.result });
        setPreviewAvatar(reader.result);
      } else {
        setForm({ ...form, coverPhoto: reader.result });
        setPreviewCover(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const save = async () => {
    try {
      const { data } = await api.put(`/users/${user._id}`, form);
      onSaved?.(data);
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile ❌");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6">
        <div className="font-headline text-xl text-white">Edit Profile</div>

        <div className="mt-4 grid gap-3">

          {/* NAME */}
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none"
            placeholder="Name"
          />

          {/* BIO */}
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="min-h-28 rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none"
            placeholder="Bio"
          />

          {/* LOCATION */}
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none"
            placeholder="Location"
          />

          {/* WEBSITE */}
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white outline-none"
            placeholder="Website"
          />

          {/* AVATAR UPLOAD */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Profile Photo</label>
            {previewAvatar && (
              <img src={previewAvatar} className="h-16 w-16 rounded-full object-cover" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files[0], 'avatar')}
              className="text-white"
            />
          </div>

          {/* COVER PHOTO UPLOAD */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Cover Photo</label>
            {previewCover && (
              <img src={previewCover} className="h-24 w-full object-cover rounded-xl" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImage(e.target.files[0], 'cover')}
              className="text-white"
            />
          </div>

        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 px-4 py-2 text-white"
          >
            Cancel
          </button>

          <button
            onClick={save}
            className="rounded-2xl bg-brand-500 px-4 py-2 font-semibold text-white"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
