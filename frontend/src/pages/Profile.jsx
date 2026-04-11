import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, Lock, Save, Loader2 } from 'lucide-react';
import { updateUser } from '../store/authSlice';
import authService from '../services/authService';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  const handleProfileChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await authService.updateProfile(form);
      dispatch(updateUser(res.data.user || res.data));
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    try {
      setChangingPw(true);
      setPwError('');
      await authService.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPwMessage('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* Profile Info */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-5">Personal Information</h2>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              name="name"
              value={form.name}
              onChange={handleProfileChange}
              placeholder="Full name"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleProfileChange}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              name="phone"
              value={form.phone}
              onChange={handleProfileChange}
              placeholder="Phone number"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {message && <p className="mt-3 text-success text-sm">{message}</p>}
        {error && <p className="mt-3 text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-5">Change Password</h2>

        <div className="space-y-4">
          {[
            { name: 'current', placeholder: 'Current password' },
            { name: 'newPass', placeholder: 'New password' },
            { name: 'confirm', placeholder: 'Confirm new password' },
          ].map(({ name, placeholder }) => (
            <div key={name} className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name={name}
                value={passwords[name]}
                onChange={handlePwChange}
                placeholder={placeholder}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ))}
        </div>

        {pwMessage && <p className="mt-3 text-success text-sm">{pwMessage}</p>}
        {pwError && <p className="mt-3 text-danger text-sm">{pwError}</p>}

        <button
          type="submit"
          disabled={changingPw}
          className="mt-5 flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-900 transition-colors disabled:opacity-60"
        >
          {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Change Password
        </button>
      </form>
    </div>
  );
}
