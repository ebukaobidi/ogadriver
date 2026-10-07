import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import {
  Search,
  Plus,
  XCircle,
  Shield,
  Trash2,
  Unlock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  User,
  Calendar,
  MoreVertical,
  Ban
} from 'lucide-react';
import { adminService } from '../../api/admin';

function BlacklistManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blacklistedItems, setBlacklistedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterReason, setFilterReason] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'email', value: '', reason: '' });
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 10;

  useEffect(() => {
    loadBlacklistedItems();
  }, [currentPage]);

  useEffect(() => {
    filterItems();
  }, [searchTerm, filterType, filterReason, blacklistedItems]);

  const loadBlacklistedItems = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBlacklist({
        page: currentPage,
        search: searchTerm,
        type: filterType
      });
      if (response.status === 'success') {
        setBlacklistedItems(response.data.data);
        setTotalPages(response.data.last_page);
      }
    } catch (err) {
      console.error('Failed to load blacklist:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...blacklistedItems];

    // Local filtering for reasons since it might not be in the API search
    if (filterReason !== 'all') {
      filtered = filtered.filter(item => item.reason.includes(filterReason));
    }

    setFilteredItems(filtered);
  };

  const handleRemoveFromBlacklist = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from the blacklist?')) return;
    
    try {
      const response = await adminService.removeFromBlacklist(itemId);
      if (response.status === 'success') {
        loadBlacklistedItems();
      }
    } catch (err) {
      console.error('Failed to remove from blacklist:', err);
      alert('Failed to remove item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddToBlacklist = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.addToBlacklist(formData);
      if (response.status === 'success') {
        setShowAddModal(false);
        setFormData({ type: 'email', value: '', reason: '' });
        loadBlacklistedItems(); // Reload list
      }
    } catch (err) {
      console.error('Failed to add to blacklist:', err);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'email': return 'text-blue-600 bg-blue-100';
      case 'phone': return 'text-green-600 bg-green-100';
      case 'ip': return 'text-purple-600 bg-purple-100';
      case 'domain': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const paginatedItems = filteredItems;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blacklist...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Blacklist Management</h1>
                <p className="text-gray-600">Manage platform blacklist for security</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus size={20} />
                Add to Blacklist
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{blacklistedItems.length}</p>
                  <p className="text-sm text-gray-500">Total Blacklisted</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{blacklistedItems.filter(i => i.type === 'email').length}</p>
                  <p className="text-sm text-gray-500">Emails</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{blacklistedItems.filter(i => i.type === 'phone').length}</p>
                  <p className="text-sm text-gray-500">Phone Numbers</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertTriangle className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{blacklistedItems.filter(i => i.type === 'ip').length}</p>
                  <p className="text-sm text-gray-500">IP Addresses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search blacklist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Types</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="ip">IP Address</option>
                  <option value="domain">Domain</option>
                </select>
                <select
                  value={filterReason}
                  onChange={(e) => setFilterReason(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Reasons</option>
                  <option value="Fraudulent activity">Fraudulent activity</option>
                  <option value="Spam and harassment">Spam and harassment</option>
                  <option value="Suspicious activity">Suspicious activity</option>
                  <option value="Payment fraud">Payment fraud</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blacklist Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Added By</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Added Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          <span className="capitalize">{item.type}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-900">{item.value}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.reason}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.addedBy}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.addedDate}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRemoveFromBlacklist(item.id)}
                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg"
                            title="Remove from blacklist"
                          >
                            <Unlock size={18} className="text-green-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-green-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Add to Blacklist Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add to Blacklist</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone Number</option>
                      <option value="ip">IP Address</option>
                      <option value="domain">Domain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="text"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      placeholder="Enter value to blacklist"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      placeholder="Enter reason for blacklisting"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handleAddToBlacklist}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                  >
                    Add to Blacklist
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default BlacklistManagement;
