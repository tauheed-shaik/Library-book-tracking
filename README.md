# 📚 Smart Library Management System (MERN + AI)

A state-of-the-art Library Management Platform built with the MERN stack, featuring deep **AI integration via Grok API**, comprehensive circulation management, and a premium administrative dashboard.

[![API Tests](https://img.shields.io/badge/API_Tests-Passed-green?style=for-the-badge)](https://github.com/)
[![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)](https://github.com/)
[![AI](https://img.shields.io/badge/AI-Grok_Powered-purple?style=for-the-badge)](https://x.ai/grok)

---

## 🚀 Key Features

### 🧑‍🎓 User Features
- **Smart Catalog**: Advanced search and filtering by category.
- **Instant Issuing**: Self-issue books directly from the dashboard.
- **Circulation Management**: Renew and return books digitally.
- **Reservation System**: Request popular books and track pickup status.
- **AI Librarian**: 
  - **Fine Explanations**: Personalized AI breakdown of why fines were charged.
  - **Reading Insights**: Personalized summaries and recommendations based on habits.
- **Notifications**: Real-time alerts for overdue books and reservation availability.

### 🧑‍🏫 Librarian (Staff) Features
- **Inventory Control**: Add, Update, and Delete books with identity tracking (ISBN/ID).
- **Direct Issuing**: Manually issue books to any user via ISBN or Book ID.
- **Queue Management**: Approve reservations and mark them ready for user pickup.
- **Circulation Overlook**: Monitor all active issues and overdue assets.
- **AI Forecasting**: Predict demand for book categories using Grok AI.

### 🛡️ Admin Features
- **System Dashboard**: Real-time stats and global overview.
- **User Governance**: Activate or Suspend user accounts instantly.
- **Policy Control**: Dynamic configuration of fine amounts and issue periods.
- **Audit Logs**: Deep security tracking of every system action.
- **Advanced Analytics**: Detailed system growth and circulation metrics.

---

## 🧪 API Test Results

The system has been thoroughly tested for reliability and role-based access control. Below are the latest test results:

| Status | Method | Path | Description | Code | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ✅ Pass | POST | `/api/auth/register` | User Registration | 201 | User registered successfully |
| ✅ Pass | POST | `/api/auth/login` | User Login | 200 | Login successful |
| ✅ Pass | POST | `/api/auth/admin-login` | Admin Login | 200 | Master Admin login successful |
| ✅ Pass | GET | `/api/books` | Get all books (Public) | 200 | Success |
| ✅ Pass | GET | `/api/books/categories` | Get categories (Public) | 200 | Success |
| ✅ Pass | GET | `/api/books/search?q=Node` | Search books (Public) | 200 | Success |
| ✅ Pass | POST | `/api/books` | Add Book (Admin) | 201 | Book added successfully |
| ✅ Pass | GET | `/api/issues/history` | Get User Issue History | 200 | Success |
| ✅ Pass | POST | `/api/issues/issue` | Issue Book (User) | 201 | Book issued successfully |
| ✅ Pass | GET | `/api/issues/active` | Get Active Issues (Admin) | 200 | Success |
| ✅ Pass | GET | `/api/issues/overdue` | Get Overdue Books (Admin) | 200 | Success |
| ✅ Pass | GET | `/api/fines` | Get User Fines | 200 | Success |
| ✅ Pass | GET | `/api/fines/user-total` | Get User Total Fines | 200 | Success |
| ✅ Pass | GET | `/api/fines/policy` | Get Fine Policy (User) | 200 | Success |
| ✅ Pass | POST | `/api/reservations` | Reserve Book (User) | 201 | Book reserved successfully |
| ✅ Pass | GET | `/api/reservations` | Get User Reservations | 200 | Success |
| ✅ Pass | GET | `/api/reservations/all` | Get All Reservations (Admin) | 200 | Success |
| ✅ Pass | GET | `/api/admin/dashboard/stats` | Admin Dashboard Stats | 200 | Success |
| ✅ Pass | GET | `/api/admin/users` | Get User Management | 200 | Success |
| ✅ Pass | GET | `/api/admin/analytics` | Get System Analytics | 200 | Success |
| ✅ Pass | GET | `/api/admin/audit-logs` | Get Audit Logs | 200 | Success |
| ✅ Pass | GET | `/api/user/notifications` | Get Notifications | 200 | Success |
| ✅ Pass | GET | `/api/user/borrowing-summary` | Get AI Borrowing Summary | 200 | Success |
| ✅ Pass | GET | `/api/user/personalized-insights` | Get AI Personalized Insights | 200 | Success |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, React Toastify.
- **Backend**: Node.js, Express.js, JWT (Authentication).
- **Database**: MongoDB Atlas.
- **AI Integration**: Grok API (for intelligent analytics and insights).
- **Security**: Helmet, Rate Limiting, RBAC (Role Based Access Control).

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js installed.
- MongoDB connection string.
- Grok API Key (for AI features).

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 🤖 AI Capabilities (Grok Powered)

1. **AI Fine Explanation**: Explains fine logic to users to improve transparency.
2. **Reading Habit Analysis**: Generates AI summaries of historical borrowing data.
3. **Personalized Recommendations**: Suggests next reads based on user profile.
4. **Staff Demand Forecast**: Helps librarians stock the right books at the right time.

---

**Made with ❤️ for Modern Libraries**
