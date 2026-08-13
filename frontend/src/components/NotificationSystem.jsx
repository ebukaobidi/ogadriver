import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  Briefcase, 
  ShieldCheck,
  Star,
  Calendar
} from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
    setUnreadCount(prev => prev + 1);
    
    // Play notification sound (optional)
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore autoplay errors
    } catch (e) {}
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
  };

  // Convenience methods for common notification types
  const notifyNewProposal = (proposal) => {
    addNotification({
      type: 'proposal',
      title: 'New Employment Proposal',
      message: `${proposal.hirer_name} has sent you a proposal for ${proposal.contract_type}`,
      icon: Briefcase,
      color: 'brandMint',
      action: () => window.location.href = '/driver?tab=proposals',
      data: proposal
    });
  };

  const notifyContractUpdate = (contract, status) => {
    const messages = {
      'accepted': 'Your contract has been accepted!',
      'in_progress': 'Contract is now in progress',
      'completed': 'Contract completed successfully',
      'cancelled': 'Contract has been cancelled'
    };
    
    addNotification({
      type: 'contract',
      title: 'Contract Update',
      message: messages[status] || `Contract status changed to ${status}`,
      icon: CheckCircle2,
      color: status === 'cancelled' ? 'red' : 'brandMint',
      action: () => window.location.href = '/driver?tab=active',
      data: contract
    });
  };

  const notifyVerificationUpdate = (status) => {
    const messages = {
      'verified': 'Your verification has been approved!',
      'pending': 'Your verification is under review',
      'failed': 'Verification failed. Please resubmit documents.'
    };
    
    addNotification({
      type: 'verification',
      title: 'Verification Status Update',
      message: messages[status] || `Verification status: ${status}`,
      icon: ShieldCheck,
      color: status === 'verified' ? 'brandMint' : status === 'failed' ? 'red' : 'amber',
      action: () => window.location.href = '/driver?tab=compliance',
      data: { status }
    });
  };

  const notifyRating = (rating) => {
    addNotification({
      type: 'rating',
      title: 'New Rating Received',
      message: `You received a ${rating.rating}-star rating from ${rating.hirer_name}`,
      icon: Star,
      color: 'amber',
      action: () => window.location.href = '/driver?tab=ratings',
      data: rating
    });
  };

  const notifyAppointment = (appointment) => {
    addNotification({
      type: 'appointment',
      title: 'New Appointment Scheduled',
      message: `Assessment appointment on ${new Date(appointment.date).toLocaleDateString()}`,
      icon: Calendar,
      color: 'blue',
      action: () => window.location.href = '/driver?tab=active',
      data: appointment
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    notifyNewProposal,
    notifyContractUpdate,
    notifyVerificationUpdate,
    notifyRating,
    notifyAppointment
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

const NotificationIcon = ({ type, color, className }) => {
  const icons = {
    proposal: Briefcase,
    contract: CheckCircle2,
    verification: ShieldCheck,
    rating: Star,
    appointment: Calendar,
    info: Info,
    warning: AlertTriangle
  };
  
  const Icon = icons[type] || icons.info;
  const colors = {
    brandMint: 'text-brandMint',
    red: 'text-red-500',
    amber: 'text-amber-500',
    blue: 'text-blue-500'
  };
  
  return <Icon className={`${colors[color] || colors.brandMint} ${className}`} />;
};

export const NotificationBell = () => {
  const { unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-brandMint hover:text-brandMint/80"
                >
                  Mark all read
                </button>
              )}
            </div>
            <NotificationList onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
};

export const NotificationList = ({ onClose }) => {
  const { notifications, markAsRead, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No notifications yet</p>
      </div>
    );
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-h-80 overflow-y-auto">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors ${
            !notification.read ? 'bg-slate-800/30' : ''
          }`}
          onClick={() => {
            markAsRead(notification.id);
            if (notification.action) notification.action();
            if (onClose) onClose();
          }}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <NotificationIcon 
                type={notification.type} 
                color={notification.color} 
                className="w-5 h-5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-sm">{notification.title}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="text-slate-500 hover:text-slate-300 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notification.message}</p>
              <p className="text-[10px] text-slate-500 mt-2">{formatTime(notification.createdAt)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const NotificationToast = () => {
  const { notifications, markAsRead } = useNotifications();
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].read) {
      setCurrentNotification(notifications[0]);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!visible || !currentNotification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-2xl max-w-sm">
        <div className="flex gap-3">
          <NotificationIcon 
            type={currentNotification.type} 
            color={currentNotification.color} 
            className="w-5 h-5 flex-shrink-0"
          />
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm">{currentNotification.title}</h4>
            <p className="text-xs text-slate-400 mt-1">{currentNotification.message}</p>
          </div>
          <button
            onClick={() => {
              markAsRead(currentNotification.id);
              setVisible(false);
            }}
            className="text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
