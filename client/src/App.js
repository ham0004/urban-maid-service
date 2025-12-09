import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/auth/Register';
import EmailVerification from './components/auth/EmailVerification';
import SearchMaids from './components/booking/SearchMaids';
// import UpdateProfile from './components/profile/UpdateProfile'; // Module 1
// import ChangePassword from './components/profile/ChangePassword'; // Module 1

// TODO: Import other components as they are completed
// import Login from './components/auth/Login';
// import MaidProfile from './components/profile/MaidProfile';


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

          {/* Module 2 Routes */}
          <Route path="/maids/search" element={<SearchMaids />} />

          {/* TODO: Add these routes as team members complete them */}
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/profile/maid" element={<MaidProfile />} /> */}
          {/* <Route path="/profile/update" element={<UpdateProfile />} /> */}
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