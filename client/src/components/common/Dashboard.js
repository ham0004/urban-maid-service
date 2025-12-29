import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      // Redirect to login if no user data or token
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }

    setLoading(false);
  }, [navigate]);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/chat/user/unread');
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
        setUnreadCount(0);
      }
    };

    if (user) {
      fetchUnreadCount();
      
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to home
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">🏠 Urban Maid Service</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Welcome, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${user.role === 'maid'
              ? 'bg-blue-100 text-blue-800'
              : user.role === 'admin'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
              }`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email Address</label>
                <p className="text-lg text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Account Status</label>
                <p className="text-lg">
                  {user.role === 'maid' ? (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${user.maidProfile?.verificationStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : user.maidProfile?.verificationStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : user.maidProfile?.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                      {user.maidProfile?.verificationStatus === 'approved' && '✅ Verified'}
                      {user.maidProfile?.verificationStatus === 'pending' && '⏳ Pending Review'}
                      {user.maidProfile?.verificationStatus === 'rejected' && '❌ Rejected'}
                      {(!user.maidProfile?.verificationStatus || user.maidProfile?.verificationStatus === 'unverified') && '⚠️ Unverified'}
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✅ Verified
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">User ID</label>
                <p className="text-lg text-gray-900 font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role Type</label>
                <p className="text-lg text-gray-900 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Member Since</label>
                <p className="text-lg text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Now 4 cards instead of 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Profile</h3>
            <p className="text-gray-600 mb-4">View and update your profile information</p>
            <button
              onClick={() => navigate('/profile/update')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Profile
            </button>
          </div>

          {/* History Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">History</h3>
            <p className="text-gray-600 mb-4">View past services, payments & invoices</p>
            <button
              onClick={() => navigate('/history')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              View History
            </button>
          </div>

          {/* Settings Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600 mb-4">Manage your account settings and preferences</p>
            <button
              onClick={() => navigate('/profile/update')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Settings
            </button>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Security</h3>
            <p className="text-gray-600 mb-4">Change your password and security settings</p>
            <button
              onClick={() => navigate('/profile/change-password')}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Floating Chat Button - Bottom Right Corner */}
        <button
          onClick={() => navigate('/chat')}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group z-50"
          title={unreadCount > 0 ? `${unreadCount} unread messages` : 'Open Messages'}
        >
          <span className="text-3xl">💬</span>
          {/* Real-time notification badge - only shows when there are unread messages */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Role-Specific Section */}
        {user.role === 'maid' && (
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <h3 className="text-xl font-bold text-blue-900 mb-2">🧹 Maid Dashboard</h3>
            <p className="text-blue-800 mb-4">
              As a maid, you can view available bookings, manage your profile, and track your earnings.
            </p>
            <div className="space-x-3">
              <button
                onClick={() => navigate('/bookings/maid')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/history')}
                className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              >
                View History
              </button>
            </div>
          </div>
        )}

        {user.role === 'customer' && (
          <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-6 rounded">
            <h3 className="text-xl font-bold text-green-900 mb-2">📅 Customer Dashboard</h3>
            <p className="text-green-800 mb-4">
              As a customer, you can book services, manage your bookings, and rate service providers.
            </p>
            <div className="space-x-3">
              <button
                onClick={() => navigate('/search-maids')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Find a Maid
              </button>
              <button
                onClick={() => navigate('/bookings/new')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Book Directly
              </button>
              <button
                onClick={() => navigate('/bookings/my')}
                className="px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate('/history')}
                className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
              >
                View History
              </button>
            </div>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <h3 className="text-xl font-bold text-red-900 mb-2">👨‍💼 Admin Dashboard</h3>
            <p className="text-red-800 mb-4">
              As an admin, you can manage users, verify maids, and oversee platform activities.
            </p>
            <div className="space-x-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Admin Panel
              </button>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                📊 Analytics Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;