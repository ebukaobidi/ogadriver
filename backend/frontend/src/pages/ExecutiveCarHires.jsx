import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import SiteNavbar from '../components/SiteNavbar';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const ExecutiveCarHires = () => {
  const [hires, setHires] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  const fetchHires = async (pageNum, searchVal = search, stateVal = state) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        search: searchVal,
        state: stateVal
      });
      const response = await fetch(`${API_URL}/executive-car-hires?${params.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setHires(data.data || []);
      setPage(data.meta?.current_page || data.current_page || 1);
      setLastPage(data.meta?.last_page || data.last_page || 1);
    } catch (err) {
      console.error('Failed to load car hire services', err);
      setError('Failed to load executive car hire services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHires(page);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHires(1, search, state);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      setPage(newPage);
      fetchHires(newPage, search, state);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <SiteNavbar />
      <div className="executive-car-hires-page py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="text-center mb-10">
          <span className="text-brandMint uppercase tracking-wider text-xs font-semibold px-3 py-1 rounded-full bg-brandMint/10 border border-brandMint/20">
            Premium Executive Car Hire
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-3 text-white tracking-tight">
            Executive Car Hiring Directory
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Discover verified executive car hire services offering luxury sedans, armored vehicles, and professional chauffeur services across Nigeria.
          </p>
        </div>

        {/* Search and Filters */}
        <form onSubmit={handleSearch} className="mb-10 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur shadow-xl flex flex-col md:flex-row gap-3">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search service name, fleet types, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 pl-10 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brandMint text-sm"
            />
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            type="text"
            placeholder="State (e.g. Lagos, Abuja)"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-brandMint text-sm md:w-56"
          />

          <button
            type="submit"
            className="bg-brandMint hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition duration-200 text-sm flex items-center justify-center gap-2 shadow-lg shadow-brandMint/10"
          >
            <span>Search</span>
          </button>

          <div className="flex gap-1 border border-slate-800 rounded-xl p-1 bg-slate-950">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg text-xs font-semibold transition ${view === 'grid' ? 'bg-brandMint text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`p-2 rounded-lg text-xs font-semibold transition ${view === 'list' ? 'bg-brandMint text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              List
            </button>
          </div>
        </form>

        {/* Content list */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-brandMint mb-3"></div>
            <p className="text-slate-400 text-sm font-medium">Fetching executive car hire services...</p>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-red-950/40 border border-red-900 text-red-300 text-center my-8">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && hires.length === 0 && (
          <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-300 font-semibold mb-1">No car hire services found</p>
            <p className="text-slate-500 text-sm">Try tweaking your search term or state filter.</p>
          </div>
        )}

        {!loading && !error && hires.length > 0 && (
          <div className={view === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
            {hires.map((hire) => (
              <Link
                key={hire.id}
                to={`/executive-car-hires/${hire.slug}`}
                className="group block bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-brandMint/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brandMint/5 cursor-pointer"
              >
                {/* Card Image Banner */}
                <div className="h-44 w-full bg-slate-950 relative overflow-hidden">
                  {hire.logo_url ? (
                    <img
                      src={hire.logo_url}
                      alt={hire.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        // Fallback logic could be added here
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-600 font-mono text-xs text-center px-4">
                      [Executive Fleet Provider]
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {hire.is_verified && (
                      <span className="bg-emerald-500/90 backdrop-blur text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shadow">
                        ✓ Verified Provider
                      </span>
                    )}
                    <span className="bg-slate-900/90 backdrop-blur text-brandMint text-[10px] font-semibold px-2 py-0.5 rounded-md border border-brandMint/30">
                      {hire.state}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-white mb-1 group-hover:text-brandMint transition">
                    {hire.name}
                  </h2>
                  <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                    <span>📍</span> {hire.address || `${hire.lga}, ${hire.state}`}
                  </p>
                  <p className="text-slate-300 text-xs line-clamp-3 mb-4 leading-relaxed">
                    {hire.description}
                  </p>

                  {/* Fleet & Services Tags */}
                  {hire.fleet && typeof hire.fleet === 'object' && Object.keys(hire.fleet).length > 0 && (
                    <div className="mb-4">
                      <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2">Available Fleet:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(hire.fleet).slice(0, 3).map(([key, val]) => (
                          <span key={key} className="text-[11px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-1 rounded-md">
                            🚗 <strong className="text-slate-200">{key}:</strong> {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-5 pt-0 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Reg: {hire.registration_number || 'Available on request'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brandMint group-hover:text-emerald-300 group-hover:translate-x-1 transition-transform">
                    <span>View Details</span>
                    <span>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-10">
          <Pagination currentPage={page} totalPages={lastPage} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
      
      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Ogadriver.ng Enterprise Grid. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ExecutiveCarHires;
