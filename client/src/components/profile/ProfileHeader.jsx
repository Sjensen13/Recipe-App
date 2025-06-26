import React from 'react';
import ProfileStats from './ProfileStats';
import Avatar from '../ui/Avatar';

const ProfileHeader = ({ 
  userData, 
  isOwnProfile, 
  isEditing, 
  editForm, 
  uploadingAvatar,
  stats = {},
  onEditClick, 
  onEditSubmit, 
  onEditCancel, 
  onFormChange, 
  onAvatarUpload 
}) => {
  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar Section */}
        <Avatar
          src={userData.avatar_url}
          alt={userData.name}
          size="lg"
          showUploadButton={isEditing}
          onUpload={onAvatarUpload}
          uploading={uploadingAvatar}
        />

        {/* Profile Info */}
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={onEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => onFormChange('username', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => onFormChange('name', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => onFormChange('bio', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={onEditCancel}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {userData.name}
              </h1>
              <p className="text-gray-600 mb-2">@{userData.username}</p>
              <p className="text-gray-700 mb-4">{userData.bio}</p>
              
              {/* Stats */}
              <ProfileStats stats={stats} />

              {/* Action Buttons */}
              {isOwnProfile ? (
                <button 
                  onClick={onEditClick}
                  className="btn-primary mt-4"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3 mt-4">
                  <button className="btn-primary">
                    Follow
                  </button>
                  <button className="btn-secondary">
                    Message
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 