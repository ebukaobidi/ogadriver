import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Upload,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  User,
  Building2,
  Loader2,
  Gavel,
  Archive
} from 'lucide-react';
import api from '../../api/axios';

function DisputeResolution() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDisputes();
  }, [currentPage, statusFilter]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/disputes', {
        params: {
          page: currentPage,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined
        }
      });

      if (response.data.success) {
        setDisputes(response.data.disputes.data);
        setTotalPages(response.data.disputes.last_page);
      }
    } catch (err) {
      console.error('Failed to load disputes:', err);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId, resolution) => {
    if (!resolutionNotes.trim()) {
      alert('Please add resolution notes before resolving.');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${resolution} this dispute?`)) return;

    try {
      setProcessingId(`resolve-${disputeId}`);
      const response = await api.post(`/admin/disputes/${disputeId}/resolve`, {
        resolution,
        notes: resolutionNotes
      });

      if (response.data.success) {
        setDisputes(prev => prev.map(d => 
          d.id === disputeId 
            ? { ...d, status: resolution === 'approved' ? 'resolved_driver' : 'resolved_employer', resolved_at: new Date() }
            : d
        ));
        setShowDetails(false);
        setSelectedDispute(null);
        setResolutionNotes('');
      }
    } catch (err) {
      alert('Failed to resolve dispute');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEscalate = async (disputeId) => {
    try {
      setProcessingId(`escalate-${disputeId}`);
      const response = await api.post(`/admin/disputes/${disputeId}/escalate`);

      if (response.data.success) {
        setDisputes(prev => prev.map(d => 
          d.id === disputeId 
            ? { ...d, status: 'escalated', escalated_at: new Date() }
            : d
        ));
      }
    } catch (err) {
      alert('Failed to escalate dispute');
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      open: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      in_review: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      escalated: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      resolved_driver: 'bg-brandMint/10 text-brandMint border-brandMint/30',
      resolved_employer: 'bg-brandMint/10 text-brandMint border-brandMint/30',
      archived: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    };
    return `text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${map[status] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`;
  };

  const filteredDisputes = disputes.filter(d => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="bg-slate-900 border-b border-slate-800 p-4 z-10 shrink-0">
            <h1 className="text-xl font-bold text-white">Dispute Resolution Center</h1>
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
            <h1 className="text-xl font-bold text-white hidden sm:block">Dispute Resolution Center</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white">Dispute Management</h1>
            <p className="text-slate-400">Resolve conflicts between drivers and employers with evidence-based decisions.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-xl"><AlertTriangle className="text-amber-400" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{disputes.filter(d => d.status === 'open').length}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Open</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl"><Clock className="text-blue-400" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{disputes.filter(d => d.status === 'in_review').length}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">In Review</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brandMint/10 rounded-xl"><CheckCircle className="text-brandMint" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{disputes.filter(d => d.status.includes('resolved')).length}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Resolved</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl"><Gavel className="text-purple-400" size={24} /></div>
                <div>
                  <p className="text-3xl font-black text-white">{disputes.filter(d => d.status === 'escalated').length}</p>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Escalated</p>
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
                    placeholder="Search disputes..."
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
                <option value="in_review">In Review</option>
                <option value="escalated">Escalated</option>
                <option value="resolved_driver">Resolved (Driver)</option>
                <option value="resolved_employer">Resolved (Employer)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Dispute List */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="font-bold text-white uppercase tracking-wider text-sm">Dispute Queue</h3>
                </div>
                <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto">
                  {filteredDisputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      onClick={() => { setSelectedDispute(dispute); setShowDetails(true); }}
                      className={`p-4 cursor-pointer transition-all ${selectedDispute?.id === dispute.id ? 'bg-slate-800 border-l-2 border-brandMint' : 'hover:bg-slate-800/50'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">{dispute.title}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {dispute.driver_name} vs {dispute.employer_name}
                          </p>
                        </div>
                        <span className={statusBadge(dispute.status)}>{dispute.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        <span>{new Date(dispute.created_at).toLocaleDateString()}</span>
                        {dispute.evidence_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{dispute.evidence_count} evidence items</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredDisputes.length === 0 && (
                    <div className="p-10 text-center">
                      <Scale className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 font-mono text-sm">No disputes found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dispute Details */}
            {showDetails && selectedDispute ? (
              <div className="lg:col-span-3 space-y-4 overflow-y-auto max-h-[calc(100vh-260px)]">
                {/* Header */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedDispute.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">Ref: #{selectedDispute.reference_number}</p>
                    </div>
                    <button onClick={() => { setShowDetails(false); setSelectedDispute(null); }} className="text-slate-500 hover:text-white">
                      <XCircle size={20} />
                </button>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={statusBadge(selectedDispute.status)}>{selectedDispute.status.replace('_', ' ')}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{new Date(selectedDispute.created_at).toLocaleString()}</span>
                  </div>
                  
                  {/* Parties */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-slate-950 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="text-brandMint" size={16} />
                        <span className="text-xs font-mono text-slate-500 uppercase">Driver</span>
                      </div>
                      <p className="font-bold text-white">{selectedDispute.driver_name}</p>
                      <p className="text-xs text-slate-400">{selectedDispute.driver_phone}</p>
                    </div>
                    <div className="bg-slate-950 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="text-brandMint" size={16} />
                        <span className="text-xs font-mono text-slate-500 uppercase">Employer</span>
                      </div>
                      <p className="font-bold text-white">{selectedDispute.employer_name}</p>
                      <p className="text-xs text-slate-400">{selectedDispute.employer_company}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                    <FileText size={18} /> Dispute Description
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{selectedDispute.description}</p>
                </div>

                {/* Evidence */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <FileText size={18} /> Evidence ({selectedDispute.evidence?.length || 0})
                    </h4>
                    <button className="text-xs font-bold uppercase tracking-wider text-brandMint hover:text-white transition-colors flex items-center gap-1">
                      <Upload size={12} /> Add Evidence
                    </button>
                  </div>
                  {selectedDispute.evidence?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {selectedDispute.evidence.map((evidence, idx) => (
                        <div
                          key={idx}
                          onClick={() => { setSelectedEvidence(evidence); setShowEvidenceModal(true); }}
                          className="bg-slate-950 rounded-xl p-3 cursor-pointer hover:bg-slate-800 transition-colors border border-slate-800"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {evidence.type === 'image' && <ImageIcon className="text-brandMint" size={16} />}
                            {evidence.type === 'message' && <MessageSquare className="text-blue-400" size={16} />}
                            {evidence.type === 'location' && <MapPin className="text-amber-400" size={16} />}
                            {evidence.type === 'document' && <FileText className="text-purple-400" size={16} />}
                            <span className="text-xs font-bold text-white truncate">{evidence.filename}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{evidence.uploaded_by} • {new Date(evidence.uploaded_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-6">No evidence submitted yet</p>
                  )}
                </div>

                {/* Resolution */}
                {selectedDispute.status !== 'archived' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                      <Gavel size={18} /> Resolution
                    </h4>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter resolution notes and decision rationale..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:border-brandMint outline-none resize-none h-24 mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleResolve(selectedDispute.id, 'approved')}
                        disabled={processingId || selectedDispute.status.includes('resolved')}
                        className="flex-1 py-3 bg-brandMint text-corporateNavy font-bold rounded-xl uppercase tracking-wider hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === `resolve-${selectedDispute.id}` ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        Favor Driver
                      </button>
                      <button
                        onClick={() => handleResolve(selectedDispute.id, 'rejected')}
                        disabled={processingId || selectedDispute.status.includes('resolved')}
                        className="flex-1 py-3 bg-slate-950 border border-slate-700 text-slate-400 font-bold rounded-xl uppercase tracking-wider hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === `resolve-${selectedDispute.id}` ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        Favor Employer
                      </button>
                      <button
                        onClick={() => handleEscalate(selectedDispute.id)}
                        disabled={processingId || selectedDispute.status === 'escalated'}
                        className="px-4 py-3 bg-purple-500/20 text-purple-400 font-bold rounded-xl uppercase tracking-wider hover:bg-purple-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Gavel size={16} /> Escalate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="lg:col-span-3 hidden lg:flex items-center justify-center bg-slate-900/20 rounded-2xl border border-slate-800 border-dashed min-h-64">
                <div className="text-center">
                  <Scale size={40} className="text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-600 font-mono text-sm">Select a dispute to review details</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Evidence Modal */}
        {showEvidenceModal && selectedEvidence && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-white">{selectedEvidence.filename}</h3>
                <button onClick={() => { setShowEvidenceModal(false); setSelectedEvidence(null); }} className="text-slate-400 hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="p-6">
                {selectedEvidence.type === 'image' && (
                  <img src={selectedEvidence.url} alt={selectedEvidence.filename} className="w-full rounded-lg" />
                )}
                {selectedEvidence.type === 'document' && (
                  <div className="text-center py-10">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Document preview not available</p>
                    <button className="mt-4 px-4 py-2 bg-brandMint text-corporateNavy rounded-lg font-bold flex items-center gap-2 mx-auto">
                      <Download size={16} /> Download
                    </button>
                  </div>
                )}
                {selectedEvidence.type === 'message' && (
                  <div className="bg-slate-900 rounded-xl p-4">
                    <p className="text-white whitespace-pre-wrap">{selectedEvidence.content}</p>
                  </div>
                )}
                {selectedEvidence.type === 'location' && (
                  <div className="bg-slate-900 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="text-brandMint" size={20} />
                      <span className="font-bold text-white">Location Data</span>
                    </div>
                    <p className="text-slate-300">{selectedEvidence.address}</p>
                    <p className="text-xs text-slate-500 mt-2 font-mono">
                      {selectedEvidence.coordinates?.lat}, {selectedEvidence.coordinates?.lng}
                    </p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Uploaded by: {selectedEvidence.uploaded_by}</span>
                    <span>{new Date(selectedEvidence.uploaded_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DisputeResolution;
