import { useState, useEffect } from 'react';
import { Bell, Search, Menu, User, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import { authService } from '../api/auth';

import ThemeToggle from './ThemeToggle';
import AdminCommandPalette from './admin/AdminCommandPalette';

function AdminHeader({ toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleOpenPalette = () => setIsCommandPaletteOpen(true);
    window.addEventListener("open-admin-command-palette", handleOpenPalette);
    return () => window.removeEventListener("open-admin-command-palette", handleOpenPalette);
  }, []);
  const [documentAlerts, setDocumentAlerts] = useState({
    pending_documents: 0,
    expiring_documents: 0,
    expired_documents: 0,
    pending_drivers: 0,
    total_alerts: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.status === 'success') {
        // Only show unread notifications in the dropdown to satisfy "attended to let remove" requirement
        const allNotifications = response.data.data.notifications || [];
        setNotifications(allNotifications.filter(n => !n.read_at));
        setUnreadCount(response.data.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchDocumentAlerts = async () => {
    try {
      const response = await api.get('/admin/dashboard/overview');
      if (response.data.status === 'success' && response.data.data.notifications) {
        setDocumentAlerts(response.data.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch document alerts:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchDocumentAlerts();
    const interval = setInterval(fetchNotifications, 30000);
    const alertInterval = setInterval(fetchDocumentAlerts, 60000);
    return () => {
      clearInterval(interval);
      clearInterval(alertInterval);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await api.get(`/admin/search?q=${encodeURIComponent(query)}&type=all&limit=5`);
      if (response.data.status === 'success') {
        setSearchResults(response.data.data);
        setShowSearchResults(true);
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 w-96 relative">
            <Search size={20} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search users, drivers, documents..."
              className="bg-transparent outline-none flex-1 text-sm text-slate-800 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            />
            {searchLoading && (
              <div className="w-4 h-4 border-2 border-brandMint border-t-transparent rounded-full animate-spin"></div>
            )}
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 rounded-lg shadow-lg border border-slate-800 z-50 max-h-96 overflow-y-auto">
                {searchResults.drivers && searchResults.drivers.length > 0 && (
                  <div className="p-2">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">Drivers</h4>
                    {searchResults.drivers.map((driver) => (
                      <a
                        key={driver.id}
                        href={driver.url}
                        className="block px-3 py-2 hover:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <User size={16} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-300">{driver.name}</p>
                            <p className="text-xs text-slate-500">{driver.license_number}</p>
                          </div>
                          <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                            driver.is_verified ? 'bg-brandMint/10 text-brandMint' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {driver.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                
                {searchResults.users && searchResults.users.length > 0 && (
                  <div className="p-2 border-t border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">Users</h4>
                    {searchResults.users.map((user) => (
                      <a
                        key={user.id}
                        href={user.url}
                        className="block px-3 py-2 hover:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                            <User size={16} className="text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-300">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                          <span className="ml-auto text-xs text-slate-500">{user.role}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                
                {searchResults.documents && searchResults.documents.length > 0 && (
                  <div className="p-2 border-t border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-2">Documents</h4>
                    {searchResults.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        className="block px-3 py-2 hover:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center">
                            <Search size={16} className="text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-300">{doc.document_type}</p>
                            <p className="text-xs text-slate-500">{doc.driver_name}</p>
                          </div>
                          <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                            doc.status === 'approved' ? 'bg-brandMint/10 text-brandMint' : 
                            doc.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
                
                {searchResults.total_results === 0 && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Quick Command Palette Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-300 transition-colors"
            title="Open Admin Command Center (Ctrl + K)"
          >
            <Search size={14} className="text-brandMint" />
            <span className="hidden sm:inline">Commands</span>
            <kbd className="text-[10px] bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">Ctrl K</kbd>
          </button>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-800 rounded-lg"
            >
              <Bell size={20} className="text-slate-400" />
              {(unreadCount > 0 || documentAlerts.total_alerts > 0) && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {unreadCount + documentAlerts.total_alerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-slate-950 rounded-lg shadow-lg border border-slate-800 z-50">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-semibold text-white">Notifications</h3>
                  {(unreadCount > 0 || documentAlerts.total_alerts > 0) && (
                    <button onClick={handleMarkAllAsRead} className="text-xs text-brandMint hover:text-brandMint/80 font-medium">
                      Mark all as read
                    </button>
                  )}
                </div>
                
                {/* Document Alerts Section */}
                {documentAlerts.total_alerts > 0 && (
                  <div className="p-4 border-b border-slate-800 bg-orange-500/10">
                    <h4 className="text-sm font-semibold text-orange-400 mb-2">Document Alerts</h4>
                    <div className="space-y-2">
                      {documentAlerts.pending_documents > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                          <span className="text-slate-300">{documentAlerts.pending_documents} pending documents</span>
                        </div>
                      )}
                      {documentAlerts.expiring_documents > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span className="text-slate-300">{documentAlerts.expiring_documents} expiring soon</span>
                        </div>
                      )}
                      {documentAlerts.expired_documents > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="text-slate-300">{documentAlerts.expired_documents} expired</span>
                        </div>
                      )}
                      {documentAlerts.pending_drivers > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-slate-300">{documentAlerts.pending_drivers} pending drivers</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 && documentAlerts.total_alerts === 0 ? (
                    <p className="text-sm text-slate-500 p-4 text-center">No notifications</p>
                  ) : (
                    notifications.map((notification) => {
                      const data = notification.data || {};
                      const isUnread = !notification.read_at;
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-slate-800 hover:bg-slate-800 transition-colors group ${
                            isUnread ? 'bg-brandMint/5 font-medium' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1" onClick={() => handleMarkAsRead(notification.id)}>
                              <p className="text-sm text-slate-300">{data.message || data.title}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="text-[10px] font-bold uppercase tracking-wider text-brandMint opacity-0 group-hover:opacity-100 hover:text-white transition-all bg-brandMint/10 px-2 py-1 rounded"
                            >
                              Attend
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg"
            >
              <div className="w-8 h-8 bg-brandMint/20 rounded-full flex items-center justify-center border border-brandMint/30 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={18} className="text-brandMint" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500">{user?.email || 'admin@ogadriver.ng'}</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-950 rounded-lg shadow-lg border border-slate-800 z-50">
                <div className="p-4 border-b border-slate-800">
                  <p className="font-medium text-white">{user?.name || 'Admin'}</p>
                  <p className="text-sm text-slate-500">{user?.email || 'admin@ogadriver.ng'}</p>
                </div>
                <div className="py-2">
                  <a href="/admin/profile" className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                    My Profile
                  </a>
                  <button 
                    onClick={() => authService.logout()}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800 text-red-400"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Command Palette */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </header>
  );
}

export default AdminHeader;
