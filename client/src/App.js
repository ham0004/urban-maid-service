import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/auth/Register';
import EmailVerification from './components/auth/EmailVerification';
import Login from './components/auth/Login';
import Dashboard from './components/common/Dashboard';
// TODO: Import other components as they are completed
// import MaidProfile from './components/profile/MaidProfile';
// import ChangePassword from './components/profile/ChangePassword';
// import ProfileUpdate from './components/profile/ProfileUpdate';

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
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* TODO: Add these routes as team members complete them */}
          {/* <Route path="/profile/maid" element={<MaidProfile />} /> */}
          {/* <Route path="/profile/update" element={<ProfileUpdate />} /> */}
          {/* <Route path="/profile/change-password" element={<ChangePassword />} /> */}

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