import React from 'react';
import ProfileStats from './ProfileStats';
import Avatar from '../ui/Avatar';
import StartConversation from '../messaging/StartConversation';

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
  onAvatarUpload,
  onSignout,
  isFollowing = false,
  followLoading = false,
  onFollow,
  onFollowersClick,
  onFollowingClick
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
          userId={userData.id}
        />

        {/* Profile Info */}
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={onEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={onFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={onFormChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
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
              <ProfileStats 
                stats={stats} 
                onFollowersClick={onFollowersClick}
                onFollowingClick={onFollowingClick}
              />

              {/* Action Buttons */}
              {isOwnProfile ? (
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={onEditClick}
                    className="btn-primary"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={onSignout}
                    className="btn-secondary"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={onFollow}
                    disabled={followLoading}
                    className={`btn-primary ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
                  </button>
                  <StartConversation
                    targetUser={userData}
                    className="btn-secondary"
                  />
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