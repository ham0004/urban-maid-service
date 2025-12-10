import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/auth/Register';
import EmailVerification from './components/auth/EmailVerification';
import UpdateProfile from './components/profile/UpdateProfile';
import ChangePassword from './components/profile/ChangePassword';

import Login from './components/auth/Login';
import Dashboard from './components/common/Dashboard';

// Maid Verification Components
import MaidVerification from './components/maid/MaidVerification';
import VerificationPending from './components/maid/VerificationPending';
import VerificationRejected from './components/maid/VerificationRejected';

// Maid Scheduling Components (Module 2 Feature 3 - Member-3)
import MaidSchedule from './components/maid/MaidSchedule';
import BlockSlot from './components/maid/BlockSlot';

// Admin Components (Module 2)
import AdminDashboard from './components/admin/AdminDashboard';

// Booking Components (Module 2 Feature 2)
import BookingForm from './components/booking/BookingForm';
import MyBookings from './components/booking/MyBookings';
import MaidBookings from './components/booking/MaidBookings';

// Member-4 Components (Search & Filter)
import MaidSearch from './components/maid/MaidSearch';
import MaidProfileSetup from './components/maid/MaidProfileSetup';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-indigo-600 mb-4">
                    🏠 Urban Maid Service
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Your trusted platform for household services
                  </p>
                  <div className="space-x-4">
                    <a
                      href="/register"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      Get Started
                    </a>
                    <a
                      href="/login"
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Login
                    </a>
                  </div>
                </div>
              </div>
            }
          />

          {/* Module 1 Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:userId/:token" element={<EmailVerification />} />
          <Route path="/profile/update" element={<UpdateProfile />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />

          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Admin Routes (Module 2) */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Booking Routes (Module 2 Feature 2) */}
          <Route path="/bookings/new" element={<BookingForm />} />
          <Route path="/bookings/my" element={<MyBookings />} />
          <Route path="/bookings/maid" element={<MaidBookings />} />

          {/* Maid Verification Routes (Member-2) */}
          <Route path="/maid/verification" element={<MaidVerification />} />
          <Route path="/maid/verification-pending" element={<VerificationPending />} />
          <Route path="/maid/verification-rejected" element={<VerificationRejected />} />

          {/* Maid Scheduling Routes (Module 2 Feature 3 - Member-3) */}
          <Route path="/maid/schedule" element={<MaidSchedule />} />
          <Route path="/maid/block-slot" element={<BlockSlot />} />

          {/* Member-4 Routes (Search & Profile Setup) */}
          <Route path="/search-maids" element={<MaidSearch />} />
          <Route path="/maid/profile-setup" element={<MaidProfileSetup />} />

          {/* 404 Not Found */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <a
                    href="/"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;