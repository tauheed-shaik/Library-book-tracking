import React, { useState, useEffect } from 'react';
import { issueAPI, fineAPI, reservationAPI, bookAPI, userAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({});
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [issuesRes, finesRes, resRes] = await Promise.all([
        issueAPI.getUserHistory(),
        fineAPI.getFines(),
        reservationAPI.getUserReservations()
      ]);

      setStats({
        activeIssues: issuesRes.data.history.filter(i => i.status === 'issued').length,
        totalFines: finesRes.data.fines.reduce((sum, f) => sum + (f.status === 'pending' ? f.amount : 0), 0),
        reservations: resRes.data.reservations.length
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300`}>
        <div className="p-4">
          <h1 className={`text-2xl font-bold ${sidebarOpen ? '' : 'hidden'}`}>📚</h1>
        </div>

        <nav className="mt-8 space-y-2">
          {[
            { id: 'overview', label: 'Dashboard', icon: '📊' },
            { id: 'books', label: 'Books', icon: '📚' },
            { id: 'issues', label: 'My Issues', icon: '📖' },
            { id: 'fines', label: 'Fines', icon: '💰' },
            { id: 'reservations', label: 'Reservations', icon: '🔔' },
            { id: 'profile', label: 'Profile', icon: '👤' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${activeTab === item.id ? 'bg-blue-600' : 'hover:bg-gray-800'
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
          <div className="flex items-center gap-4">
            <NotificationsDropdown />
            <div className="text-right">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.role}</p>
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-blue-50">
                  <h3 className="text-gray-700 text-sm font-semibold">Active Issues</h3>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{stats.activeIssues || 0}</p>
                </div>
                <div className="card bg-red-50">
                  <h3 className="text-gray-700 text-sm font-semibold">Pending Fines</h3>
                  <p className="text-4xl font-bold text-red-600 mt-2">₹{stats.totalFines || 0}</p>
                </div>
                <div className="card bg-green-50">
                  <h3 className="text-gray-700 text-sm font-semibold">Reservations</h3>
                  <p className="text-4xl font-bold text-green-600 mt-2">{stats.reservations || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">📖 Quick Actions</h3>
                  <div className="space-y-2">
                    <button onClick={() => setActiveTab('books')} className="btn-primary w-full">
                      Browse Books
                    </button>
                    <button onClick={() => setActiveTab('fines')} className="btn-secondary w-full">
                      Pay Fines
                    </button>
                    <button onClick={() => setActiveTab('issues')} className="btn-secondary w-full">
                      View Current Issues
                    </button>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">✨ AI Librarian Insights</h3>
                  <AIInsightsSection />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'books' && <BookCatalogSection />}
          {activeTab === 'issues' && <IssuesSection />}
          {activeTab === 'fines' && <FinesSection />}
          {activeTab === 'reservations' && <ReservationsSection />}
          {activeTab === 'profile' && <ProfileSection />}
        </main>
      </div>
    </div>
  );
};

const BookCatalogSection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookAPI.getAllBooks(1, 50, null, search);
      setBooks(response.data.books || []);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (bookId) => {
    try {
      await reservationAPI.reserveBook(bookId);
      toast.success('Book reserved successfully!');
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reserve book');
    }
  };

  const handleIssue = async (bookId) => {
    try {
      await issueAPI.issueBook(bookId);
      toast.success('Book issued successfully!');
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue book');
    }
  };

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">📚 Books Available</h2>
        <div className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            placeholder="Search title, author, ISBN..."
            className="input-field py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
          />
          <button onClick={fetchBooks} className="btn-primary">Search</button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>)}
        </div>
      ) : books.length === 0 ? (
        <p className="text-gray-600">No books found matching your search.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <div key={book._id} className="border rounded-xl p-4 hover:shadow-lg transition flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-blue-800">{book.title}</h3>
                <p className="text-gray-600 text-sm">By {book.author}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {book.category?.name || 'General'}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Out of Stock'}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-3 line-clamp-2">{book.description || 'No description available.'}</p>
              </div>
              <div className="mt-4 pt-4 border-t flex gap-2">
                {book.availableCopies > 0 ? (
                  <>
                    <button
                      onClick={() => handleIssue(book._id)}
                      className="btn-primary flex-1 text-[11px] py-2"
                    >
                      Issue Now
                    </button>
                    <button
                      onClick={() => handleReserve(book._id)}
                      className="btn-secondary flex-1 text-[11px] py-2"
                    >
                      Reserve
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="btn-secondary w-full text-sm opacity-50 cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const IssuesSection = () => {
  const [issues, setIssues] = useState([]);

  const fetchIssues = async () => {
    try {
      const response = await issueAPI.getUserHistory();
      setIssues(response.data.history);
    } catch (error) {
      toast.error('Failed to load issues');
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleRenew = async (id) => {
    try {
      await issueAPI.renewBook(id);
      toast.success('Book renewed!');
      fetchIssues();
    } catch (error) {
      toast.error('Renewal failed');
    }
  };

  const handleReturn = async (id) => {
    try {
      await issueAPI.returnBook(id);
      toast.success('Book returned!');
      fetchIssues();
    } catch (error) {
      toast.error('Return failed');
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">📖 My Borrowed Books</h2>
      {issues.length === 0 ? (
        <p className="text-gray-600">No borrowed books yet.</p>
      ) : (
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2">Book Title</th>
              <th className="text-left py-2">Issue Date</th>
              <th className="text-left py-2">Due Date</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue._id} className="border-b hover:bg-gray-50">
                <td className="py-3">{issue.bookId?.title}</td>
                <td className="py-3">{new Date(issue.issueDate).toLocaleDateString()}</td>
                <td className="py-3">{new Date(issue.dueDate).toLocaleDateString()}</td>
                <td className="py-3 px-2">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${issue.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'returned' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {issue.status.toUpperCase()}
                    </span>
                    {issue.status === 'issued' && (
                      <div className="flex gap-1">
                        <button onClick={() => handleRenew(issue._id)} className="text-[10px] text-blue-600 hover:bg-blue-50 px-1 rounded font-bold underline">Renew</button>
                        <button onClick={() => handleReturn(issue._id)} className="text-[10px] text-green-600 hover:bg-green-50 px-1 rounded font-bold underline">Return</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const FinesSection = () => {
  const [fines, setFines] = useState([]);

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const response = await fineAPI.getFines();
        setFines(response.data.fines);
      } catch (error) {
        toast.error('Failed to load fines');
      }
    };
    fetchFines();
  }, []);

  const handleExplainFine = async (fineId) => {
    try {
      const response = await fineAPI.getFineExplanation(fineId);
      toast.info(response.data.explanation, {
        autoClose: 10000,
        icon: '🤖'
      });
    } catch (error) {
      toast.error('AI is busy right now');
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">💰 My Fines</h2>
      {fines.length === 0 ? (
        <p className="text-green-600">No pending fines!</p>
      ) : (
        <div className="space-y-3">
          {fines.map(fine => (
            <div key={fine._id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">₹{fine.amount}</p>
                    <button
                      onClick={() => handleExplainFine(fine._id)}
                      className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full hover:bg-indigo-200 transition"
                    >
                      AI Explain
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{fine.reason}</p>
                  <p className="text-xs text-gray-500">{fine.daysOverdue} days overdue</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${fine.status === 'pending' ? 'bg-red-100 text-red-800' :
                  fine.status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {fine.status.charAt(0).toUpperCase() + fine.status.slice(1)}
                </span>
              </div>
              {fine.status === 'pending' && (
                <button className="btn-primary mt-3 text-sm w-full">Pay Fine</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReservationsSection = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await reservationAPI.getUserReservations();
      setReservations(response.data.reservations);
    } catch (error) {
      toast.error('Failed to load reservations');
    }
  };

  const handleCancel = async (id) => {
    try {
      await reservationAPI.cancelReservation(id, 'User cancelled');
      toast.info('Reservation cancelled');
      fetchReservations();
    } catch (error) {
      toast.error('Cancellation failed');
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4">🔔 My Reservations</h2>
      {reservations.length === 0 ? (
        <p className="text-gray-600">No active reservations.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map(res => (
            <div key={res._id} className="border p-4 rounded-xl flex justify-between items-center group hover:bg-gray-50 transition">
              <div>
                <h4 className="font-bold">{res.bookId?.title}</h4>
                <p className="text-sm text-gray-500">Reserved on: {new Date(res.reservationDate).toLocaleDateString()}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${res.status === 'ready' ? 'bg-green-100 text-green-800 animate-pulse' : 'bg-blue-100 text-blue-800'
                  }`}>
                  {res.status.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => handleCancel(res._id)}
                className="text-red-600 hover:text-red-800 text-sm font-semibold opacity-0 group-hover:opacity-100 transition"
              >
                Cancel Request
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AIInsightsSection = () => {
  const [insights, setInsights] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, summaryRes] = await Promise.all([
          userAPI.getPersonalizedInsights(),
          userAPI.getAIBorrowingSummary()
        ]);
        setInsights(insightsRes.data.insights);
        setSummary(summaryRes.data.summary);
      } catch (e) {
        console.error('AI load error');
      }
    };
    fetchData();
  }, []);

  if (!insights && !summary) return <p className="text-indigo-100 text-sm italic">Gathering data for your personal reading insights...</p>;

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
        <p className="font-semibold mb-1 opacity-80 uppercase tracking-tighter text-[10px]">Your Reading Habit Summary</p>
        <p>{summary}</p>
      </div>
      <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border-l-4 border-yellow-400">
        <p className="font-semibold mb-1 opacity-80 uppercase tracking-tighter text-[10px]">Librarian's Personal Recommendation</p>
        <p>{insights}</p>
      </div>
    </div>
  );
};

const ProfileSection = () => {
  const { user } = useAuth();

  return (
    <div className="card max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">👤 My Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="text-gray-600 text-sm">Name</label>
          <p className="font-semibold">{user?.name}</p>
        </div>
        <div>
          <label className="text-gray-600 text-sm">Email</label>
          <p className="font-semibold">{user?.email}</p>
        </div>
        <div>
          <label className="text-gray-600 text-sm">Role</label>
          <p className="font-semibold capitalize">{user?.role}</p>
        </div>
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
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 border-2 border-white rounded-full"></span>
        )}
      </button>

      {show && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-xl border z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h4 className="font-bold">Notifications</h4>
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{notifications.length} New</span>
          </div>
          <div className="max-h-96 overflow-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                <Bell size={32} className="mx-auto mb-2 opacity-20" />
                No new notifications
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} className="p-4 border-b hover:bg-gray-50 flex gap-3 group">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => markRead(n._id)} className="text-blue-600 opacity-0 group-hover:opacity-100 transition text-xs">Read</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
