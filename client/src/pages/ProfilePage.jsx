import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { updateProfile, changePassword } from '../redux/slices/authSlice';
import { FiUser, FiMail, FiPhone, FiEdit2, FiLock, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const { register: regProfile, handleSubmit: hsProfile, formState: { errors: epErrors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone || '', bio: user?.bio || '' },
  });

  const { register: regPass, handleSubmit: hsPass, watch, reset: resetPass, formState: { errors: passErrors } } = useForm();

  const getInitial = (name) => name?.charAt(0).toUpperCase() || 'U';

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onProfileSubmit = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('bio', data.bio);
    if (avatarFile) formData.append('avatar', avatarFile);

    const result = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully! ✅');
      setEditMode(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      toast.error(result.payload);
    }
  };

  const onPasswordSubmit = async (data) => {
    const result = await dispatch(changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }));
    if (changePassword.fulfilled.match(result)) {
      toast.success('Password changed successfully! 🔐');
      resetPass();
    } else {
      toast.error(result.payload);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 className="page-title">My Profile</h1>
      <p className="page-subtitle">Manage your personal information and security</p>

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {avatarPreview ? (
                <img src={avatarPreview} alt="preview" />
              ) : user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} />
              ) : (
                getInitial(user?.name)
              )}
            </div>
            {editMode && (
              <>
                <label htmlFor="avatar-upload" className="profile-avatar-edit" title="Change photo">
                  <FiEdit2 />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{user?.email}</p>
            <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          </div>

          <button
            className={`btn ${editMode ? 'btn-outline' : 'btn-primary'} btn-sm`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancel' : <><FiEdit2 /> Edit Profile</>}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={hsProfile(onProfileSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input className="form-input" placeholder="Full Name" {...regProfile('name', { required: 'Name is required' })} />
                </div>
                {epErrors.name && <span className="form-error">{epErrors.name.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="input-wrapper">
                  <FiPhone className="input-icon" />
                  <input className="form-input" placeholder="Phone number" {...regProfile('phone')} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Tell us about yourself..."
                {...regProfile('bio', { maxLength: { value: 300, message: 'Max 300 chars' } })}
                style={{ resize: 'vertical' }}
              />
              {epErrors.bio && <span className="form-error">{epErrors.bio.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
              {loading ? <><div className="spinner" /> Saving...</> : <><FiSave /> Save Changes</>}
            </button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '8px' }}>
            <div>
              <div className="form-label" style={{ marginBottom: '4px' }}>Email</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMail style={{ color: 'var(--primary)' }} />
                <span>{user?.email}</span>
              </div>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: '4px' }}>Phone</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiPhone style={{ color: 'var(--primary)' }} />
                <span>{user?.phone || '—'}</span>
              </div>
            </div>
            {user?.bio && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="form-label" style={{ marginBottom: '4px' }}>Bio</div>
                <p style={{ color: 'var(--text-secondary)' }}>{user.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Change Password Card */}
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <FiLock style={{ color: 'var(--primary)' }} /> Change Password
        </h3>
        <form onSubmit={hsPass(onPasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '480px' }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Enter current password"
              {...regPass('currentPassword', { required: 'Current password is required' })}
            />
            {passErrors.currentPassword && <span className="form-error">{passErrors.currentPassword.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Min 6 characters"
              {...regPass('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
            />
            {passErrors.newPassword && <span className="form-error">{passErrors.newPassword.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Repeat new password"
              {...regPass('confirmNewPassword', {
                required: 'Please confirm',
                validate: (v) => v === watch('newPassword') || "Passwords don't match",
              })}
            />
            {passErrors.confirmNewPassword && <span className="form-error">{passErrors.confirmNewPassword.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? <><div className="spinner" /> Updating...</> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
