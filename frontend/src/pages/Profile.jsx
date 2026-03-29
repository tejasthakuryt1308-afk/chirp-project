import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileFeed from '../components/Profile/ProfileFeed';
import EditProfile from '../components/Profile/EditProfile';
import Loading from '../components/Common/Loading';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { id } = useParams();
  const { user: me, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    const [u, t] = await Promise.all([api.get(`/users/${id}`), api.get(`/users/${id}/tweets`)]);
    setProfile(u.data);
    setItems(t.data);
  };

  useEffect(() => { load(); }, [id]);

  if (!profile) return <Loading text="Loading profile" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-24 space-y-4">
      <ProfileHeader
        user={profile}
        isOwnProfile={me?._id === profile._id}
        onEdit={() => setEditOpen(true)}
        onFollow={async () => {
          await api.post(`/users/${profile._id}/follow`);
          load();
        }}
      />
      <ProfileFeed items={items} />
      <EditProfile open={editOpen} onClose={() => setEditOpen(false)} user={profile} onSaved={(updated) => { setProfile(updated); if (me?._id === updated._id) setUser(updated); }} />
    </div>
  );
}
