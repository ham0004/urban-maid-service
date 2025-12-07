# Urban Maid Service System

A comprehensive web-based platform connecting customers with verified domestic service providers (maids) for household cleaning and maintenance services.

## 📋 Project Information

**Course:** CSE471 - System Analysis and Design  
**Group:** 10  
**Lab Section:** 02  
**Semester:** Fall 2025  
**Submission Date:** 10/28/2025

### 👥 Team Members

| ID | Name | Role |
|---|---|---|
| 22101262 | Sayed Ilham Azhar Harun | Member-1 |
| 22201442 | MD. Abdulla Al Bari | Member-2 |
| 22101614 | Shaikh Mohammad Ali Shams | Member-3 |
| 22101057 | Shakib Shadman Shoumik | Member-4 |

---

## 🚀 Tech Stack

- **Language:** JavaScript (ES6+)
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose as ODM)
- **Styling:** TailwindCSS
- **Deployment:** Vercel
- **APIs:**
  - Stripe (Payments)
  - Firebase FCM API (SMS Notifications)
  - SendGrid (Email)
  - Google Maps (Location Services)
  - Google Gemini (AI Analytics)

---

## 📊 Project Progress

### ✅ Module 1: User, Auth & Profile (IN PROGRESS)

| Feature | Assigned To | Status | Branch |
|---------|-------------|--------|--------|
| User Registration & Email Verification | Member-1 | 🟡 In Progress | `feature/user-registration-email-verification` |
| Profile & Maid ID Verification | Member-2 | ⚪ Not Started | `feature/profile-maid-verification` |
| Secure Login & Session Management | Member-3 | ⚪ Not Started | `feature/secure-login-session` |
| Change Password & Profile Updates | Member-4 | ⚪ Not Started | `feature/password-profile-updates` |

### ⚪ Module 2: Booking, Scheduling & Search (UPCOMING)

| Feature | Assigned To | Status |
|---------|-------------|--------|
| Service Category Management | Member-1 | ⚪ Not Started |
| Real-time Booking & Conflict Handling | Member-2 | ⚪ Not Started |
| Maid Scheduling & Availability | Member-3 | ⚪ Not Started |
| Search & Filter Options | Member-4 | ⚪ Not Started |

### ⚪ Module 3: Payments, Notifications, Admin & Analytics (UPCOMING)

| Feature | Assigned To | Status |
|---------|-------------|--------|
| Subscription & Membership Plans | Member-1 | ⚪ Not Started |
| Admin Dashboard & Maid Approval | Member-1 | ⚪ Not Started |
| Service History & Invoice Generation | Member-2 | ⚪ Not Started |
| SMS Notifications & Alerts | Member-2 | ⚪ Not Started |
| Payment Gateway Integration | Member-3 | ⚪ Not Started |
| Ratings & Review Submission | Member-3 | ⚪ Not Started |
| In-app Chat Support | Member-4 | ⚪ Not Started |
| AI-Powered Analytics & Reporting | Member-4 | ⚪ Not Started |

---

## 📁 Project Structure

```
urban-maid-service/
├── client/                      # Frontend (React.js)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── profile/        # Profile management components
│   │   │   ├── booking/        # Booking components
│   │   │   ├── admin/          # Admin dashboard components
│   │   │   ├── payment/        # Payment components
│   │   │   ├── chat/           # Chat interface
│   │   │   └── common/         # Shared components
│   │   ├── pages/              # Page components
│   │   ├── utils/              # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                      # Backend (Node.js + Express.js)
│   ├── config/                 # Configuration files
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── controllers/            # Business logic
│   ├── middleware/             # Custom middleware
│   ├── services/               # External API integrations
│   ├── utils/                  # Helper functions
│   ├── socket/                 # WebSocket handlers
│   ├── server.js               # Main server file
│   └── package.json
├── docs/                        # Documentation
├── README.md
└── .gitignore
```

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/urban-maid-service.git
cd urban-maid-service
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Environment Variables

Create `.env` file in the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/urban-maid-service
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/urban-maid-service

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# SendGrid (Email)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Frontend URL (for email verification links)
CLIENT_URL=http://localhost:3000

# Stripe (for Module 3)
STRIPE_SECRET_KEY=your_stripe_secret_key

# Firebase FCM (for Module 3)
FIREBASE_SERVER_KEY=your_firebase_server_key

# Google Maps (for Module 2)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google Gemini (for Module 3)
GEMINI_API_KEY=your_gemini_api_key
```

Create `.env` file in the `client/` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Run the Application

**Backend (Terminal 1):**
```bash
cd server
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd client
npm start
```

**Access Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## 🌿 Git Workflow & Branching Strategy

### Branch Naming Convention

```
feature/feature-name-here
bugfix/bug-description
hotfix/urgent-fix-name
```

### Workflow for Team Members

#### 1. Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/urban-maid-service.git
cd urban-maid-service
npm install
cd client && npm install
cd ../server && npm install
```

#### 2. Create Feature Branch
```bash
# Make sure you're on main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/your-feature-name
```

#### 3. Work & Commit
```bash
# Make your changes
# Stage changes
git add .

# Commit with meaningful message
git commit -m "Implemented user registration with email verification"

# Push to GitHub (makes branch visible to team)
git push origin feature/your-feature-name
```

#### 4. Create Pull Request
- Go to GitHub repository
- Click "Pull Requests" → "New Pull Request"
- Select your branch
- Add description of changes
- Request review from team members
- Wait for approval

#### 5. Merge & Update
```bash
# After PR is approved and merged, update your local main
git checkout main
git pull origin main

# Delete old feature branch (optional)
git branch -d feature/your-feature-name
```

### Important Rules

- ✅ **NEVER** push directly to `main` branch
- ✅ **ALWAYS** create a feature branch for your work
- ✅ **ALWAYS** pull latest `main` before creating a new branch
- ✅ Write clear commit messages
- ✅ Test your code before creating Pull Request
- ✅ Request code review from at least one team member

---

## 📚 API Documentation

### Module 1 - Authentication & Profile APIs

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "customer" // or "maid"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "userId": "507f1f77bcf86cd799439011"
}
```

#### Email Verification
```http
GET /api/auth/verify/:token

Response: 200 OK
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "isVerified": true
  }
}
```

#### Create Maid Profile
```http
POST /api/profile/maid
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "experience": "5 years",
  "skills": ["cleaning", "cooking"],
  "idDocument": [file upload]
}

Response: 201 Created
{
  "success": true,
  "message": "Maid profile created. Waiting for admin approval.",
  "maidId": "507f1f77bcf86cd799439012"
}
```

#### Update Profile
```http
PUT /api/profile/update
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+8801712345678"
}

Response: 200 OK
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### Change Password
```http
PUT /api/profile/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}

Response: 200 OK
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

---

## 🚢 Deployment

### Backend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd server
vercel --prod
```

### Frontend Deployment (Vercel)

```bash
cd client
vercel --prod
```

---

## 📝 Contributing

1. Pick an unassigned feature from the project board
2. Create a feature branch
3. Implement the feature
4. Write tests
5. Create Pull Request
6. Wait for code review
7. Address feedback
8. Merge after approval

---

## 🐛 Known Issues

- None currently

---

## 📞 Support

For questions or issues, contact:
- **Member-1:** [email protected]
- **Member-2:** [email protected]
- **Member-3:** [email protected]
- **Member-4:** [email protected]

---

## 📄 License

This project is for academic purposes only (CSE471 - BRAC University).

---

**Last Updated:** November 2025  
**Status:** Module 1 - In Progress