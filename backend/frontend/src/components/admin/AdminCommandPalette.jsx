import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Shield, Users, Truck, DollarSign, Terminal, PhoneCall,
  Activity, AlertTriangle, Moon, Sun, Ghost, ArrowRight, Zap
} from "lucide-react";
import api from "../../api/axios";

export default function AdminCommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const defaultCommands = [
    {
      category: "Quick Navigation",
      title: "User Management & Verification Control",
      subtitle: "Manage operatives, hirers, and document verifications",
      icon: Users,
      action: () => navigate("/admin/users"),
    },
    {
      category: "Quick Navigation",
      title: "Operative Fleet Radar & Live Map",
      subtitle: "Track live online drivers across Nigeria",
      icon: Truck,
      action: () => navigate("/admin/fleet-map"),
    },
    {
      category: "Financial Control",
      title: "1-Click Batch Payout Dispatcher",
      subtitle: "Execute automated bulk bank payouts for drivers",
      icon: DollarSign,
      action: () => navigate("/admin/payouts"),
    },
    {
      category: "System Telemetry",
      title: "AI Guarantor Verification Call Logs",
      subtitle: "Inspect automated AI phone call transcripts and status",
      icon: PhoneCall,
      action: () => navigate("/admin/call-logs"),
    },
    {
      category: "System Telemetry",
      title: "1-Click Server Maintenance Terminal",
      subtitle: "Run artisan optimize, cache clear, seeders, and status checks",
      icon: Terminal,
      action: () => navigate("/admin/terminal"),
    },
    {
      category: "Security & Emergency",
      title: "Emergency Kill-Switch Switchboard",
      subtitle: "Toggle maintenance mode, disallow payouts, or lock logins",
      icon: AlertTriangle,
      action: () => navigate("/admin/emergency"),
    },
  ];


  // Handle Search Input Debounce
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/admin/users?search=${encodeURIComponent(query)}&limit=5`);
        const users = res.data?.data || res.data || [];
        const userItems = users.map(u => ({
          category: "User Quick Match",
          title: `${u.name} (${u.role?.toUpperCase()})`,
          subtitle: `${u.email} | ${u.phone || "No phone"}`,
          icon: Shield,
          action: () => navigate(`/admin/users/${u.id}`),
        }));
        setSearchResults(userItems);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, navigate]);

  const activeList = query.trim()
    ? searchResults.length > 0 ? searchResults : defaultCommands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()))
    : defaultCommands;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose(); else window.dispatchEvent(new CustomEvent("open-admin-command-palette"));
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Search Bar Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search size={20} className="text-brandMint shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search user by name/email/phone (Ctrl + K)..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="w-full bg-transparent text-white font-medium text-base placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono uppercase bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">ESC to close</kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {searching ? (
            <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <Zap size={16} className="animate-spin text-brandMint" /> Searching OgaDriver system...
            </div>
          ) : activeList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching commands or users found for "{query}"
            </div>
          ) : (
            activeList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    selectedIndex === idx ? "bg-slate-800 border border-brandMint/30" : "hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-800 text-brandMint shrink-0 border border-slate-700">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                    <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-600 hover:text-brandMint transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Super Admin Quick Command Center</span>
          <span className="text-brandMint font-bold">OgaDriver Control v2.5</span>
        </div>
      </div>
    </div>
  );
}
