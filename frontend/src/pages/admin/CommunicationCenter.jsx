import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  MessageSquare,
  Send,
  Users,
  Ticket,
  Bell,
  Search,
  Filter,
  Plus,
  Trash2,
  Archive,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Eye,
  Reply,
  Pin,
  MoreVertical
} from 'lucide-react';
import api from '../../api/axios';

function CommunicationCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('broadcast');
  const [broadcasts, setBroadcasts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    target_audience: 'all',
    priority: 'normal',
    scheduled_for: null
  });

  useEffect(() => {
    if (activeTab === 'broadcast') {
      loadBroadcasts();
    } else {
      loadTickets();
    }
  }, [activeTab, statusFilter]);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/communications/broadcasts', {
        params: {
          search: searchQuery || undefined
        }
      });

      if (response.data.success) {
        setBroadcasts(response.data.broadcasts || []);
      }
    } catch (err) {
      console.error('Failed to load broadcasts:', err);
      setBroadcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/communications/tickets', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined
        }
      });

      if (response.data.success) {
        setTickets(response.data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSending(true);
      const response = await api.post('/admin/communications/broadcasts', broadcastForm);

      if (response.data.success) {
        setBroadcasts([response.data.broadcast, ...broadcasts]);
        setShowComposeModal(false);
        setBroadcastForm({
          title: '',
          message: '',
          target_audience: 'all',
          priority: 'normal',
          scheduled_for: null
        });
      }
    } catch (err) {
      alert('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;

    try {
      setSending(true);
      const response = await api.post(`/admin/communications/tickets/${selectedTicket.id}/reply`, {
        message: replyText
      });

      if (response.data.success) {
        setTickets(prev => prev.map(t => 
          t.id === selectedTicket.id 
            ? { ...t, replies: [...(t.replies || []), response.data.reply], status: 'in_progress' }
            : t
        ));
        setReplyText('');
      }
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const response = await api.put(`/admin/communications/tickets/${ticketId}`, { status });

      if (response.data.success) {
        setTickets(prev => prev.map(t => 
          t.id === ticketId ? { ...t, status } : t
        ));
      }
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  const statusBadge = (status) => {
    const map = {
      open: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      resolved: 'bg-brandMint/10 text-brandMint border-brandMint/30',
      closed: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    };
    return `text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${map[status] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`;
  };

  const priorityBadge = (priority) => {
    const map = {
      low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      normal: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      urgent: 'bg-red-500/10 text-red-400 border-red-500/30'
    };
    return `text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${map[priority] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-slate-900 border-b border-slate-800 p-4 z-10 shrink-0">
            <h1 className="text-xl font-bold text-white">Communication Center</h1>
          </header>
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-brandMint animate-spin mx-auto mb-4" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block">Communication Center</h1>
          </div>
          {activeTab === 'broadcast' && (
            <button
              onClick={() => setShowComposeModal(true)}
              className="px-4 py-2 bg-brandMint text-corporateNavy text-sm font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> New Broadcast
            </button>
          )}
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">Communication Management</h1>
            <p className="text-slate-400">Broadcast messages and manage support tickets.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'broadcast'
                  ? 'bg-brandMint text-corporateNavy'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <MessageSquare size={18} className="inline mr-2" />
              Broadcasts
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'tickets'
                  ? 'bg-brandMint text-corporateNavy'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Ticket size={18} className="inline mr-2" />
              Support Tickets
            </button>
          </div>

          {/* Broadcasts Tab */}
          {activeTab === 'broadcast' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brandMint/10 rounded-xl"><Bell className="text-brandMint" size={24} /></div>
                    <div>
                      <p className="text-3xl font-black text-white">{broadcasts.length}</p>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Broadcasts</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl"><Users className="text-blue-400" size={24} /></div>
                    <div>
                      <p className="text-3xl font-black text-white">
                        {broadcasts.reduce((sum, b) => sum + (b.recipient_count || 0), 0).toLocaleString()}
                      </p>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Recipients</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl"><CheckCircle className="text-purple-400" size={24} /></div>
                    <div>
                      <p className="text-3xl font-black text-white">
                        {broadcasts.filter(b => b.status === 'sent').length}
                      </p>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Sent Successfully</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Broadcasts List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Broadcast History</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search broadcasts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-brandMint outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {broadcasts.map((broadcast) => (
                    <div key={broadcast.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-white">{broadcast.title}</p>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{broadcast.message}</p>
                        </div>
                        <span className={priorityBadge(broadcast.priority)}>{broadcast.priority}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {broadcast.recipient_count || 0} recipients
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(broadcast.created_at).toLocaleString()}
                        </span>
                        <span className={statusBadge(broadcast.status)}>{broadcast.status}</span>
                      </div>
                    </div>
                  ))}
                  {broadcasts.length === 0 && (
                    <div className="p-10 text-center">
                      <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 font-mono text-sm">No broadcasts found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl"><AlertCircle className="text-amber-400" size={24} /></div>
                    <div>
                      <p className="text-3xl font-black text-white">{tickets.filter(t => t.status === 'open').length}</p>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Open</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl"><Clock className="text-blue-400" size={24} /></div>
                    <div>
                      <p className="text-3xl font-black text-white">{tickets.filter(t => t.status === 'in_progress').length}</p>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">In Progress</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brandMint/10 rounded-xl"><CheckCircle className="text-brandMint" size={24} /></div>
                    <div>
                      <p className="text-3xl font-black text-white">{tickets.filter(t => t.status === 'resolved').length}</p>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Resolved</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-500/10 rounded-xl"><XCircle className="text-slate-400" size={24} /></div>
                    <div>
                      <p className="text-3xl font-black text-white">{tickets.filter(t => t.status === 'closed').length}</p>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-brandMint outline-none"
                      />
                    </div>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-4 py-2 focus:border-brandMint outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Tickets List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Support Tickets</h3>
                </div>
                <div className="divide-y divide-slate-800/50">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => { setSelectedTicket(ticket); setShowTicketDetails(true); }}
                      className="p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-white">{ticket.subject}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {ticket.user_name} • {ticket.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={priorityBadge(ticket.priority)}>{ticket.priority}</span>
                          <span className={statusBadge(ticket.status)}>{ticket.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {new Date(ticket.created_at).toLocaleString()}
                        </span>
                        {ticket.replies && ticket.replies.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} /> {ticket.replies.length} replies
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <div className="p-10 text-center">
                      <Ticket className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 font-mono text-sm">No tickets found</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Compose Broadcast Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">New Broadcast</h2>
              <button onClick={() => setShowComposeModal(false)} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Title *</label>
                <input
                  type="text"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint outline-none"
                  placeholder="Enter broadcast title"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Message *</label>
                <textarea
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint outline-none h-32 resize-none"
                  placeholder="Enter your message"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Target Audience</label>
                  <select
                    value={broadcastForm.target_audience}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, target_audience: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint outline-none"
                  >
                    <option value="all">All Users</option>
                    <option value="drivers">Drivers Only</option>
                    <option value="hirers">Employers Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">Priority</label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowComposeModal(false)}
                className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendBroadcast}
                disabled={sending}
                className="px-6 py-3 bg-brandMint text-corporateNavy font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketDetails && selectedTicket && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedTicket.user_name} • {selectedTicket.category}
                </p>
              </div>
              <button onClick={() => setShowTicketDetails(false)} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Ticket Info */}
              <div className="flex items-center gap-4 text-sm">
                <span className={priorityBadge(selectedTicket.priority)}>{selectedTicket.priority}</span>
                <span className={statusBadge(selectedTicket.status)}>{selectedTicket.status.replace('_', ' ')}</span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock size={14} /> {new Date(selectedTicket.created_at).toLocaleString()}
                </span>
              </div>

              {/* Original Message */}
              <div className="bg-slate-950 rounded-xl p-4">
                <p className="text-slate-300">{selectedTicket.message}</p>
              </div>

              {/* Replies */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-white">Replies</h3>
                  {selectedTicket.replies.map((reply, index) => (
                    <div key={index} className={`rounded-xl p-4 ${reply.is_admin ? 'bg-brandMint/10' : 'bg-slate-800'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-white">{reply.sender_name}</span>
                        <span className="text-xs text-slate-500">{new Date(reply.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-300">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-400">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint outline-none h-24 resize-none"
                  placeholder="Type your reply..."
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                      className="px-4 py-2 bg-blue-500/10 text-blue-400 font-bold rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      className="px-4 py-2 bg-brandMint/10 text-brandMint font-bold rounded-lg hover:bg-brandMint/20 transition-colors text-sm"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                      className="px-4 py-2 bg-slate-700 text-slate-300 font-bold rounded-lg hover:bg-slate-600 transition-colors text-sm"
                    >
                      Close Ticket
                    </button>
                  </div>
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-6 py-3 bg-brandMint text-corporateNavy font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunicationCenter;
