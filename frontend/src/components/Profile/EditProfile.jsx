// In your Edit Profile component
const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    location: user.location || '',
    website: user.website || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 5000000) { // 5MB limit
      setAvatarFile(file);
    } else {
      alert('File too large. Max 5MB');
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 5000000) {
      setCoverFile(file);
    } else {
      alert('File too large. Max 5MB');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let avatarUrl = user.avatar;
      let coverUrl = user.coverPhoto;

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('image', avatarFile);
        
        const uploadRes = await fetch(`${API_URL}/upload/image`, {
          method: 'POST',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.url;
      }

      // Upload cover if changed
      if (coverFile) {
        const formData = new FormData();
        formData.append('image', coverFile);
        
        const uploadRes = await fetch(`${API_URL}/upload/image`, {
          method: 'POST',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        coverUrl = uploadData.url;
      }

      // Update profile
      const response = await fetch(`${API_URL}/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          ...formData,
          avatar: avatarUrl,
          coverPhoto: coverUrl
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast('Profile updated successfully!', 'success');
        // Update user in state
        setUser(data);
        setShowEditModal(false);
      }
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl p-6 max-w-md w-full border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <img 
                src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar} 
                className="w-20 h-20 rounded-full object-cover"
                alt="Avatar preview"
              />
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Choose File
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Cover Photo Upload */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Cover Photo
            </label>
            <div className="flex items-center gap-4">
              {(coverFile || user.coverPhoto) && (
                <img 
                  src={coverFile ? URL.createObjectURL(coverFile) : user.coverPhoto} 
                  className="w-full h-32 rounded-lg object-cover"
                  alt="Cover preview"
                />
              )}
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap">
                Choose File
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              maxLength={160}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/160</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="New York, USA"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
