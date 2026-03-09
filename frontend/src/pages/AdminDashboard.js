import React, { useState, useEffect } from 'react';
import { adminAPI, bookAPI, issueAPI, reservationAPI, userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({});
  const { logout } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.stats || {});
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300`}>
        <div className="p-4">
          <h1 className={`text-2xl font-bold ${sidebarOpen ? '' : 'hidden'}`}>🛡️</h1>
        </div>

        <nav className="mt-8 space-y-2">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'books', label: 'Books', icon: '📚' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'issues', label: 'Issues', icon: '📖' },
            { id: 'fines', label: 'Fines', icon: '💰' },
            { id: 'reservations', label: 'Reservations', icon: '🔔' },
            { id: 'policies', label: 'Policies', icon: '⚙️' },
            { id: 'analytics', label: 'Analytics', icon: '📈' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === item.id ? 'bg-red-600' : 'hover:bg-gray-800'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Library Admin Panel</h1>
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">🛡️ Admin Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card bg-blue-50">
                  <h3 className="text-gray-700 text-sm font-semibold">Total Users</h3>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalUsers || 0}</p>
                </div>
                <div className="card bg-green-50">
                  <h3 className="text-gray-700 text-sm font-semibold">Total Books</h3>
                  <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalBooks || 0}</p>
                </div>
                <div className="card bg-yellow-50">
                  <h3 className="text-gray-700 text-sm font-semibold">Active Issues</h3>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.activeIssues || 0}</p>
                </div>
                <div className="card bg-red-50">
                  <h3 className="text-gray-700 text-sm font-semibold">Overdue Books</h3>
                  <p className="text-4xl font-bold text-red-600 mt-2">{stats.overdueBooks || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">📊 System Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Fines</span>
                      <span className="font-bold text-red-600">₹{stats.totalFinesAmount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Reservations</span>
                      <span className="font-bold">{stats.activeReservations || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Fines Count</span>
                      <span className="font-bold">{stats.pendingFines || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4">⚡ Quick Actions</h3>
                  <div className="space-y-2">
                    <button onClick={() => setActiveTab('users')} className="btn-primary w-full">
                      Manage Users
                    </button>
                    <button onClick={() => setActiveTab('policies')} className="btn-primary w-full">
                      Update Policies
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className="btn-secondary w-full">
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'books' && <BooksManagement />}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'issues' && <IssuesManagement />}
          {activeTab === 'reservations' && <ReservationsManagement />}
          {activeTab === 'policies' && <PoliciesManagement />}
          {activeTab === 'analytics' && <AnalyticsSection />}
          {activeTab === 'audit-logs' && <AuditLogsSection />}
        </main>
      </div>
    </div>
  );
};

const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newBook, setNewBook] = useState({
    title: '', author: '', isbn: '', category: '', totalCopies: 1, publishedYear: new Date().getFullYear(), description: ''
  });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await bookAPI.getAllBooks(1, 100);
      setBooks(response.data.books || []);
    } catch (error) {
      toast.error('Failed to load books');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await bookAPI.getCategories();
      setCategories(response.data.categories || []);
      if (response.data.categories?.length > 0) {
        setNewBook(prev => ({ ...prev, category: response.data.categories[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await bookAPI.addBook(newBook);
      toast.success('Book added successfully!');
      setShowModal(false);
      fetchBooks();
      setNewBook({
        title: '', author: '', isbn: '', category: categories[0]?._id || '', totalCopies: 1, publishedYear: new Date().getFullYear(), description: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add book');
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookAPI.deleteBook(id);
        toast.success('Book deleted');
        fetchBooks();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const handleForecast = async (categoryId, catName) => {
    try {
      const response = await adminAPI.getDemandForecast(categoryId);
      toast.info(`Demand for ${catName}: ${response.data.forecast}`, {
        autoClose: 8000,
        icon: '📈'
      });
    } catch (error) {
      toast.error('Forecast failed');
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📚 Book Management</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add New Book</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Book Info</th>
              <th className="text-left px-4 py-3">Identities (ISBN/ID)</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Available</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(books.length > 0 ? books : []).map(book => (
              <tr key={book._id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-4">
                  <p className="font-bold text-gray-800">{book.title}</p>
                  <p className="text-xs text-gray-500">{book.author}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 group">
                      <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-600">ISBN:</span>
                      <code className="text-[10px] font-mono select-all bg-gray-50 px-1">{book.isbn}</code>
                    </div>
                    <div className="flex items-center gap-1 group">
                      <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-600">ID:</span>
                      <code className="text-[10px] font-mono select-all bg-gray-50 px-1">{book._id}</code>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] w-fit italic font-bold">
                      {book.category?.name || 'N/A'}
                    </span>
                    <button
                      onClick={() => handleForecast(book.category?._id, book.category?.name)}
                      className="text-[10px] text-indigo-600 hover:underline text-left"
                    >
                      AI Forecast
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4">{book.availableCopies}/{book.totalCopies}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold transition">Edit</button>
                    <button
                      onClick={() => handleDeleteBook(book._id)}
                      className="text-red-600 hover:text-red-800 font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add New Book</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <input
                placeholder="Book Title"
                className="input-field"
                required
                value={newBook.title}
                onChange={e => setNewBook({ ...newBook, title: e.target.value })}
              />
              <input
                placeholder="Author"
                className="input-field"
                required
                value={newBook.author}
                onChange={e => setNewBook({ ...newBook, author: e.target.value })}
              />
              <input
                placeholder="ISBN"
                className="input-field"
                required
                value={newBook.isbn}
                onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
              />
              <select
                className="input-field"
                required
                value={newBook.category}
                onChange={e => setNewBook({ ...newBook, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Copies"
                  className="input-field"
                  required
                  min="1"
                  value={newBook.totalCopies}
                  onChange={e => setNewBook({ ...newBook, totalCopies: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Year"
                  className="input-field"
                  required
                  value={newBook.publishedYear}
                  onChange={e => setNewBook({ ...newBook, publishedYear: e.target.value })}
                />
              </div>
              <textarea
                placeholder="Description"
                className="input-field min-h-[100px]"
                value={newBook.description}
                onChange={e => setNewBook({ ...newBook, description: e.target.value })}
              ></textarea>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const UsersManagement = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUserManagement();
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const handleUpdateStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await adminAPI.updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error('Status update failed');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleIssueToUser = async (userId) => {
    const bookId = prompt('Enter Book ID or ISBN to issue (Find these in the "Books" tab):');
    if (!bookId) return;
    try {
      await issueAPI.staffIssue(userId, bookId);
      toast.success('Book issued to user!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Issue failed');
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">👥 User Management</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2 px-2">Name</th>
              <th className="text-left py-2 px-2">Email</th>
              <th className="text-left py-2 px-2">Role</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(users.length > 0 ? users : []).map(user => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2 font-medium">{user.name}</td>
                <td className="py-3 px-2 text-gray-600">{user.email}</td>
                <td className="py-3 px-2 capitalize">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">{user.role}</span>
                </td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.membershipStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.membershipStatus}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(user._id, user.membershipStatus)}
                      className={`text-[10px] font-bold px-2 py-1 rounded border ${user.membershipStatus === 'active' ? 'text-red-600 border-red-200 bg-red-50' : 'text-green-600 border-green-200 bg-green-50'}`}
                    >
                      {user.membershipStatus === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleIssueToUser(user._id)}
                      className="text-[10px] font-bold px-2 py-1 rounded border text-indigo-600 border-indigo-200 bg-indigo-50"
                    >
                      Issue Book
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PoliciesManagement = () => {
  const [policy, setPolicy] = useState({});

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await adminAPI.getFinePolicyConfig();
        setPolicy(response.data.policy || {});
      } catch (error) {
        toast.error('Failed to load policy');
      }
    };
    fetchPolicy();
  }, []);

  return (
    <div className="card max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">⚙️ Fine Policy Configuration</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Daily Fine Amount (₹)</label>
          <input type="number" defaultValue={policy?.dailyFineAmount || 0} className="input-field" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Max Days for Fine</label>
          <input type="number" defaultValue={policy?.maxDaysForFine || 0} className="input-field" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Max Fine Amount (₹)</label>
          <input type="number" defaultValue={policy?.maxFineAmount || 0} className="input-field" />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Issue Period (Days)</label>
          <input type="number" defaultValue={policy?.issuePeriodDays || 0} className="input-field" />
        </div>
        <button className="btn-primary mt-6 w-full">Save Changes</button>
      </div>
    </div>
  );
};

const AnalyticsSection = () => {
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminAPI.getSystemAnalytics();
        setAnalytics(response.data.analytics || {});
      } catch (error) {
        toast.error('Failed to load analytics');
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">📈 System Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50">
          <p className="text-gray-600 text-sm">Recent Issues (30 days)</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.recentIssues || 0}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-gray-600 text-sm">Recent Returns (30 days)</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{analytics.recentReturns || 0}</p>
        </div>
        <div className="card bg-red-50">
          <p className="text-gray-600 text-sm">Recent Fines (30 days)</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{analytics.recentFines || 0}</p>
        </div>
      </div>
    </div>
  );
};

const IssuesManagement = () => {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await issueAPI.getActiveIssues();
      setIssues(response.data.issues || []);
    } catch (error) {
      toast.error('Failed to load issues');
    }
  };

  const handleReturn = async (issueId) => {
    try {
      await issueAPI.returnBook(issueId);
      toast.success('Book returned successfully!');
      fetchIssues();
    } catch (error) {
      toast.error('Return failed');
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">📖 Active Issues</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Book</th>
              <th className="text-left px-4 py-3">Due Date</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{issue.userId?.name}</td>
                <td className="px-4 py-3 font-medium">{issue.bookId?.title}</td>
                <td className="px-4 py-3">{new Date(issue.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleReturn(issue._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-xs"
                  >
                    Mark Returned
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReservationsManagement = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await reservationAPI.getAllReservations();
      setReservations(response.data.reservations || []);
    } catch (error) {
      toast.error('Failed to load reservations');
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await reservationAPI.approveReservation(id);
      if (action === 'ready') await reservationAPI.markReservationReady(id);
      toast.success(`Reservation ${action}ed!`);
      fetchReservations();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">🔔 Reservations Queue</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Book</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(res => (
              <tr key={res._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{res.userId?.name}</td>
                <td className="px-4 py-3">{res.bookId?.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${res.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {res.status}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  {res.status === 'pending' && (
                    <button onClick={() => handleAction(res._id, 'approve')} className="btn-primary text-xs py-1 px-2">Approve</button>
                  )}
                  {res.status === 'approved' && (
                    <button onClick={() => handleAction(res._id, 'ready')} className="bg-blue-600 text-white text-xs py-1 px-2 rounded">Mark Ready</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AuditLogsSection = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await adminAPI.getAuditLogs();
        setLogs(response.data.logs || []);
      } catch (error) {
        toast.error('Failed to load logs');
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">📜 System Audit Logs</h2>
      <div className="space-y-2">
        {logs.map(log => (
          <div key={log._id} className="text-xs p-2 border-l-2 border-blue-500 bg-gray-50 flex justify-between">
            <span><strong>{log.action}</strong> by {log.userId?.name || 'System'}</span>
            <span className="text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await userAPI.getNotifications();
        setNotifications(res.data.notifications || []);
      } catch (e) { }
    };
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await userAPI.markNotificationAsRead(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (e) { }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <div className="relative">
          <Menu size={24} className="opacity-0 absolute" /> {/* Placeholder for size */}
          <span className="text-2xl">🔔</span>
        </div>
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 border-2 border-white rounded-full"></span>
        )}
      </button>

      {show && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-xl border z-50 animate-in fade-in slide-in-from-top-4 duration-200 text-left">
          <div className="p-4 border-b flex justify-between items-center">
            <h4 className="font-bold text-gray-800">System Notifications</h4>
            <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{notifications.length}</span>
          </div>
          <div className="max-h-96 overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No new alerts
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} className="p-4 border-b hover:bg-gray-50 flex gap-3 group">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => markRead(n._id)} className="text-red-600 opacity-0 group-hover:opacity-100 transition text-xs">Clear</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
