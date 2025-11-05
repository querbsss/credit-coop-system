import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import userIcon from '../assets/icons/user/user.svg';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, updatePassword, fetchMembershipData } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMembershipData = async () => {
      try {
        console.log('Starting to fetch membership data');
        const data = await fetchMembershipData();
        console.log('Membership data fetched successfully:', data);
        setMembershipData(data);
      } catch (error) {
        console.error('Failed to fetch membership data:', error);
        setErrorMessage(`Failed to fetch membership data: ${error.message}`);
        // Log additional details that might help debugging
        console.log('Current auth state:', {
          token: localStorage.getItem('memberPortalToken'),
          user: user
        });
      } finally {
        setLoading(false);
      }
    };

    getMembershipData();
  }, [fetchMembershipData, user]);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update profile');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Password validation
    if (passwordData.newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password updated successfully!');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Password update error:', error);
      setErrorMessage(error.message || 'Failed to update password');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="profile-page">
      <Header />
      <main className="profile-main">
        <div className="container">
          <div className="profile-header">
            <h1>Profile Settings</h1>
            <div className="avatar-large">
              <img src={userIcon} alt="User Profile" className="user-icon" />
            </div>
          </div>

          {(successMessage || errorMessage) && (
            <div className={`alert ${successMessage ? 'alert-success' : 'alert-error'}`}>
              {successMessage || errorMessage}
            </div>
          )}

          <div className="profile-content">
            <div className="card profile-card">
              <div className="card-header">
                <h2>Personal Information</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileSubmit}>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  {loading ? (
                    <p>Loading membership data...</p>
                  ) : membershipData ? (
                    <>
                      <div className="info-group">
                        <label>First Name</label>
                        <p>{membershipData.first_name}</p>
                      </div>
                      <div className="info-group">
                        <label>Middle Name</label>
                        <p>{membershipData.middle_name || 'Not provided'}</p>
                      </div>
                      <div className="info-group">
                        <label>Last Name</label>
                        <p>{membershipData.last_name}</p>
                      </div>
                      <div className="info-group">
                        <label>Suffix</label>
                        <p>{membershipData.suffix || 'Not provided'}</p>
                      </div>
                      <div className="info-group">
                        <label>Contact Number</label>
                        <p>{membershipData.contact_number || 'Not provided'}</p>
                      </div>
                      <div className="info-group">
                        <label>Address</label>
                        <p>{membershipData.address || 'Not provided'}</p>
                      </div>
                      <div className="info-group">
                        <label>Membership Type</label>
                        <p>{membershipData.membership_type}</p>
                      </div>
                      <div className="info-group">
                        <label>Date of Birth</label>
                        <p>{new Date(membershipData.date_of_birth).toLocaleDateString()}</p>
                      </div>
                      <div className="info-group">
                        <label>Gender</label>
                        <p>{membershipData.gender}</p>
                      </div>
                      <div className="info-group">
                        <label>Civil Status</label>
                        <p>{membershipData.civil_status}</p>
                      </div>
                      <div className="info-group">
                        <label>Member Since</label>
                        <p>{new Date(membershipData.created_at).toLocaleDateString()}</p>
                      </div>
                    </>
                  ) : (
                    <div className="info-group">
                      <p>No membership data available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card password-card">
              <div className="card-header">
                <h2>Change Password</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                >
                  {isChangingPassword ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {isChangingPassword && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;