import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, User, Mail, Phone, Shield, Briefcase, Key, Ban, Trash2,
  Eye, Send, CheckCircle, XCircle, Loader2, Copy, Check,
  Ghost, Wallet, CheckSquare, DollarSign, Zap
} from "lucide-react";
import { adminService } from "../../api/admin";
import api from "../../api/axios";

function UserQuickActionModal({ user, onClose, onRefresh }) {
  const navigate = useNavigate();
  const adminRole = localStorage.getItem("admin_role") || "admin";
  const canDoDangerousActions = ["super_admin", "security_admin"].includes(adminRole);

  const [showEmail, setShowEmail]       = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody]       = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent]       = useState(false);

  const [showReset, setShowReset]       = useState(false);
  const [resetType, setResetType]       = useState("generate");
  const [customPw, setCustomPw]         = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult]   = useState(null);
  const [copiedPw, setCopiedPw]         = useState(false);

  const [showWallet, setShowWallet]     = useState(false);
  const [walletAmount, setWalletAmount] = useState("5000");
  const [walletLoading, setWalletLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);


  const handleManualVerify = async () => {
    if (!confirm(`Manually verify phone/registration OTP for ${user.name}?`)) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/users/${user.id}/manual-verify`);
      alert(res.data?.message || "User manually verified.");
      onRefresh();
      onClose();
    } catch (err) {
      alert("Manual verification failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreditWalletSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(walletAmount);
    if (!amount || amount <= 0) return alert("Enter a valid credit amount.");
    setWalletLoading(true);
    try {
      const res = await api.post(`/admin/users/${user.id}/credit`, { amount });
      alert(res.data?.message || `Wallet credited with ₦${amount.toLocaleString()}`);
      setShowWallet(false);
      onRefresh();
    } catch (err) {
      alert("Wallet credit failed: " + (err.response?.data?.message || err.message));
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const getRoleBadge = (role) => {
    const cls = {
      driver: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      hirer:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
      admin:  "bg-brandMint/10 text-brandMint border-brandMint/20",
    }[role] ?? "bg-slate-800 text-slate-300 border-slate-700";
    const label = { driver: "Operative", hirer: "Employer", admin: "Admin" }[role] ?? role;
    return (
      <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest border ${cls}`}>
        {label}
      </span>
    );
  };

  const getStatusDot = (status) =>
    status === "active"
      ? <span className="w-2 h-2 rounded-full bg-brandMint inline-block mr-1.5" />
      : <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1.5" />;

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailBody.trim()) return;
    setEmailLoading(true);
    try {
      await adminService.sendUserMessage(user.id, {
        subject: emailSubject || "Message from OgaDriver Admin",
        message: emailBody,
        channels: ["email"],
      });
      setEmailSent(true);
      setTimeout(() => { setShowEmail(false); setEmailSent(false); setEmailSubject(""); setEmailBody(""); }, 1800);
    } catch (err) {
      alert("Failed to send: " + (err.response?.data?.message || err.message));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetType === "custom" && customPw.length < 6) return alert("Password must be at least 6 characters.");
    setResetLoading(true);
    setResetResult(null);
    try {
      const res = await adminService.resetUserPassword(user.id, {
        password: resetType === "custom" ? customPw : null,
        send_email: false,
      });
      setResetResult(res);
    } catch (err) {
      alert("Reset failed: " + (err.response?.data?.message || err.message));
    } finally {
      setResetLoading(false);
    }
  };

  const copyPassword = () => {
    if (!resetResult?.password) return;
    navigator.clipboard.writeText(resetResult.password);
    setCopiedPw(true);
    setTimeout(() => setCopiedPw(false), 2000);
  };

  const handleSuspend = async () => {
    const verb = user.status === "active" ? "suspend" : "restore";
    if (!confirm(`${verb} this account?`)) return;
    setActionLoading(true);
    try {
      await adminService.suspendUser(user.id);
      onRefresh();
      onClose();
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermaban = async () => {
    if (!confirm("PERMANENTLY ban this user? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      await adminService.permabanUser(user.id);
      onRefresh();
      onClose();
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Quick Actions</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="px-6 py-5 flex items-center gap-4 border-b border-slate-800 bg-slate-950/60">
          <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <User size={26} className="text-slate-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-lg leading-tight truncate">{user.name}</p>
            <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{user.email}</p>
            {user.phone && user.phone !== "N/A" && (
              <p className="text-xs text-slate-500 font-mono truncate">{user.phone}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {getRoleBadge(user.role)}
              <span className="text-xs font-mono text-slate-400 flex items-center">
                {getStatusDot(user.status)}{user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        {!showEmail && !showReset && !showWallet && (
          <div className="px-6 py-4 space-y-2">
            <button onClick={() => navigate(`/admin/users/${user.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-brandMint/10 border border-slate-700 hover:border-brandMint/40 rounded-xl text-sm font-bold text-slate-300 hover:text-brandMint transition-all">
              <Eye size={16} className="shrink-0" /> View Full Profile
            </button>

            <button onClick={() => navigate(`/admin/users/${user.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-900/20 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/60 rounded-xl text-sm font-bold text-blue-300 hover:text-blue-200 transition-all">
              <Shield size={16} className="shrink-0 text-blue-400" /> Read-Only Support Inspection
            </button>

            <button onClick={() => setShowWallet(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-900/20 hover:bg-emerald-600/20 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl text-sm font-bold text-emerald-300 hover:text-emerald-200 transition-all">
              <Wallet size={16} className="shrink-0 text-emerald-400" /> Credit User Wallet
            </button>

            <button onClick={handleManualVerify} disabled={actionLoading}
              className="w-full flex items-center gap-3 px-4 py-3 bg-cyan-900/20 hover:bg-cyan-600/20 border border-cyan-500/30 hover:border-cyan-500/60 rounded-xl text-sm font-bold text-cyan-300 hover:text-cyan-200 transition-all">
              <CheckSquare size={16} className="shrink-0 text-cyan-400" /> Bypass & Verify OTP Manually
            </button>

            <button onClick={() => setShowEmail(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/40 rounded-xl text-sm font-bold text-slate-300 hover:text-blue-400 transition-all">
              <Send size={16} className="shrink-0" /> Send Direct Email
            </button>
            <button onClick={() => { setShowReset(true); setResetResult(null); setCustomPw(""); setResetType("generate"); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/40 rounded-xl text-sm font-bold text-slate-300 hover:text-amber-400 transition-all">
              <Key size={16} className="shrink-0" /> Reset Password
            </button>
            {canDoDangerousActions && user.role !== "super_admin" && (
              <>
                <button onClick={handleSuspend} disabled={actionLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-orange-500/10 border border-slate-700 hover:border-orange-500/40 rounded-xl text-sm font-bold text-slate-300 hover:text-orange-400 transition-all disabled:opacity-50">
                  {actionLoading ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Ban size={16} className="shrink-0" />}
                  {user.status === "active" ? "Suspend Account" : "Restore Account"}
                </button>
                <button onClick={handlePermaban} disabled={actionLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/40 rounded-xl text-sm font-bold text-slate-300 hover:text-red-400 transition-all disabled:opacity-50">
                  {actionLoading ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Trash2 size={16} className="shrink-0" />}
                  Permaban User
                </button>
              </>
            )}
          </div>
        )}

        {/* Credit Wallet Panel */}
        {showWallet && (
          <form onSubmit={handleCreditWalletSubmit} className="px-6 py-4 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <button type="button" onClick={() => setShowWallet(false)} className="text-slate-500 hover:text-white transition-colors text-xs">← Back</button>
              <span className="text-sm font-bold text-white">Credit User Wallet</span>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Amount in NGN (₦)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₦</span>
                <input type="number" required placeholder="5000" value={walletAmount}
                  onChange={e => setWalletAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-brandMint transition-colors" />
              </div>
            </div>
            <button type="submit" disabled={walletLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm rounded-xl transition-colors">
              {walletLoading ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
              {walletLoading ? "Crediting…" : `Credit ₦${Number(walletAmount || 0).toLocaleString()}`}
            </button>
          </form>
        )}

        {/* Email Panel */}
        {showEmail && (
          <form onSubmit={handleSendEmail} className="px-6 py-4 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <button type="button" onClick={() => setShowEmail(false)} className="text-slate-500 hover:text-white transition-colors text-xs">← Back</button>
              <span className="text-sm font-bold text-white">Compose Email</span>
            </div>
            <input type="text" placeholder="Subject (optional)" value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brandMint transition-colors" />
            <textarea required rows={4} placeholder="Your message..." value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brandMint transition-colors resize-none" />
            <button type="submit" disabled={emailLoading || emailSent}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors">
              {emailLoading ? <Loader2 size={16} className="animate-spin" /> : emailSent ? <Check size={16} /> : <Send size={16} />}
              {emailSent ? "Sent!" : emailLoading ? "Sending…" : `Send to ${user.email}`}
            </button>
          </form>
        )}

        {/* Reset Password Panel */}
        {showReset && (
          <form onSubmit={handleResetPassword} className="px-6 py-4 space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <button type="button" onClick={() => setShowReset(false)} className="text-slate-500 hover:text-white transition-colors text-xs">← Back</button>
              <span className="text-sm font-bold text-white">Reset Password</span>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setResetType("generate")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${resetType === "generate" ? "bg-brandMint/10 border-brandMint text-brandMint" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                Auto-Generate
              </button>
              <button type="button" onClick={() => setResetType("custom")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${resetType === "custom" ? "bg-brandMint/10 border-brandMint text-brandMint" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                Set Custom
              </button>
            </div>
            {resetType === "custom" && (
              <input type="text" placeholder="Min 6 characters" value={customPw}
                onChange={e => setCustomPw(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors" />
            )}
            {resetResult && (
              <div className="p-3 bg-slate-950 border border-brandMint/30 rounded-xl">
                <p className="text-xs text-slate-500 mb-1 uppercase font-mono">New Password</p>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-brandMint font-mono font-bold text-sm tracking-widest">{resetResult.password}</span>
                  <button type="button" onClick={copyPassword} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-brandMint">
                    {copiedPw ? <Check size={14} className="text-brandMint" /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">Copy and relay this to the user manually.</p>
              </div>
            )}
            {!resetResult && (
              <button type="submit" disabled={resetLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-sm rounded-xl transition-colors">
                {resetLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                {resetLoading ? "Resetting…" : "Reset Password"}
              </button>
            )}
          </form>
        )}

      </div>
    </div>
  );
}

export default UserQuickActionModal;
