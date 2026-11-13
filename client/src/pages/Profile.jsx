import React, { useState } from 'react';
import { User, Lock, Phone, Mail, GraduationCap, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'security'

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [parentPhone, setParentPhone] = useState(user?.parentPhone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const res = await axiosClient.put('/auth/profile', { name, phone, parentPhone });
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setPwdSaving(true);
    try {
      const res = await axiosClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Profile & Security Settings</h1>
        <p className="text-xs text-slate-500">
          Manage your personal account details, contact info, and update your password
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'details'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          Security & Password
        </button>
      </div>

      {activeTab === 'details' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          {profileMsg && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl uppercase shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500">
                {user?.role === 'teacher' ? user?.designation || 'Faculty Member' : 'Enrolled Student'} &bull;{' '}
                {user?.department?.name || 'Department'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {user?.role === 'student' ? `Roll No: ${user.rollNumber}` : `ID: ${user?.employeeId || 'N/A'}`}
                </span>
                {user?.classSection && (
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    Class {user.classSection.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {user?.role === 'student' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Parent / Guardian Contact
                  </label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="+91 98765 11111"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
              >
                {profileSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>

          {pwdMsg && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                pwdMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {pwdMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={pwdSaving}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
            >
              {pwdSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
