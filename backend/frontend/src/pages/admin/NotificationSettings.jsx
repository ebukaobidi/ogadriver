import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  Save,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  EyeOff
} from 'lucide-react';
import { adminService } from '../../api/admin';

function NotificationSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    inAppNotifications: true,
    newBookingAlert: true,
    bookingConfirmation: true,
    bookingReminder: true,
    driverArrival: true,
    paymentReceived: true,
    subscriptionRenewal: true,
    promotionalEmails: false,
    systemAlerts: true,
    securityAlerts: true,
    dailyDigest: false,
    weeklyReport: true,
    monthlyReport: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await adminService.getNotificationSettings();
      if (response.status === 'success') {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to load notification settings:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await adminService.updateNotificationSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
                <p className="text-gray-600">Configure notification preferences</p>
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
            {saved && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-green-800">Notification settings saved successfully!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Channels */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-blue-600" />
                Notification Channels
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                    className={`p-2 rounded-lg ${settings.emailNotifications ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.emailNotifications ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, smsNotifications: !prev.smsNotifications }))}
                    className={`p-2 rounded-lg ${settings.smsNotifications ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.smsNotifications ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive push notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                    className={`p-2 rounded-lg ${settings.pushNotifications ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.pushNotifications ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">In-App Notifications</p>
                      <p className="text-sm text-gray-500">Show notifications in app</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, inAppNotifications: !prev.inAppNotifications }))}
                    className={`p-2 rounded-lg ${settings.inAppNotifications ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.inAppNotifications ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Booking Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-green-600" />
                Booking Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">New Booking Alert</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, newBookingAlert: !prev.newBookingAlert }))}
                    className={`p-2 rounded-lg ${settings.newBookingAlert ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.newBookingAlert ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">Booking Confirmation</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, bookingConfirmation: !prev.bookingConfirmation }))}
                    className={`p-2 rounded-lg ${settings.bookingConfirmation ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.bookingConfirmation ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">Booking Reminder</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, bookingReminder: !prev.bookingReminder }))}
                    className={`p-2 rounded-lg ${settings.bookingReminder ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.bookingReminder ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">Driver Arrival</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, driverArrival: !prev.driverArrival }))}
                    className={`p-2 rounded-lg ${settings.driverArrival ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.driverArrival ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail size={20} className="text-purple-600" />
                Financial Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">Payment Received</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, paymentReceived: !prev.paymentReceived }))}
                    className={`p-2 rounded-lg ${settings.paymentReceived ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.paymentReceived ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">Subscription Renewal</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, subscriptionRenewal: !prev.subscriptionRenewal }))}
                    className={`p-2 rounded-lg ${settings.subscriptionRenewal ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.subscriptionRenewal ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Marketing Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-orange-600" />
                Marketing Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Promotional Emails</p>
                    <p className="text-sm text-gray-500">Receive promotional content</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, promotionalEmails: !prev.promotionalEmails }))}
                    className={`p-2 rounded-lg ${settings.promotionalEmails ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.promotionalEmails ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* System Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-red-600" />
                System Notifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">System Alerts</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, systemAlerts: !prev.systemAlerts }))}
                    className={`p-2 rounded-lg ${settings.systemAlerts ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.systemAlerts ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Security Alerts</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, securityAlerts: !prev.securityAlerts }))}
                    className={`p-2 rounded-lg ${settings.securityAlerts ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.securityAlerts ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Daily Digest</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, dailyDigest: !prev.dailyDigest }))}
                    className={`p-2 rounded-lg ${settings.dailyDigest ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.dailyDigest ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Weekly Report</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, weeklyReport: !prev.weeklyReport }))}
                    className={`p-2 rounded-lg ${settings.weeklyReport ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.weeklyReport ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">Monthly Report</p>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, monthlyReport: !prev.monthlyReport }))}
                    className={`p-2 rounded-lg ${settings.monthlyReport ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    {settings.monthlyReport ? <ToggleRight size={24} className="text-green-600" /> : <ToggleLeft size={24} className="text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default NotificationSettings;
