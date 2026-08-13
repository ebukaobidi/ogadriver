import { useState } from 'react';
import { Bell, Search, Menu, User, ChevronDown } from 'lucide-react';

function AdminHeader({ toggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, message: 'New driver registration pending approval', time: '5 min ago', type: 'warning' },
    { id: 2, message: 'Payment received from Enterprise client', time: '15 min ago', type: 'success' },
    { id: 3, message: 'System maintenance scheduled for tonight', time: '1 hour ago', type: 'info' },
    { id: 4, message: 'Suspicious activity detected on user account', time: '2 hours ago', type: 'danger' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search users, drivers, jobs..."
              className="bg-transparent outline-none flex-1 text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        notification.type === 'danger' ? 'bg-red-50' :
                        notification.type === 'warning' ? 'bg-yellow-50' :
                        notification.type === 'success' ? 'bg-green-50' : ''
                      }`}
                    >
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium w-full text-center">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">Super Admin</p>
                <p className="text-xs text-gray-500">superadmin@ogadriver.ng</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium">Super Admin</p>
                  <p className="text-sm text-gray-500">superadmin@ogadriver.ng</p>
                </div>
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    Change Password
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
