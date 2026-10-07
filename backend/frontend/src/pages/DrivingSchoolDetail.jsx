import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const DrivingSchoolDetail = () => {
  const { slug } = useParams();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await fetch(`${API_URL}/driving-schools/${slug}`);
        const data = await res.json();
        setSchool(data.data);
      } catch (e) {
        console.error('Failed to load school', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSchool();
  }, [slug]);

  useEffect(() => {
    if (school) {
      document.title = `${school.name} – Accredited Driving School`;
    }
  }, [school]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-brandMint mb-3"></div>
          <p className="text-sm font-medium">Loading school profile...</p>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-4">
        <p className="text-xl font-bold text-red-400 mb-4">Driving School Not Found</p>
        <Link to="/driving-schools" className="bg-brandMint text-slate-950 font-bold px-4 py-2 rounded-xl text-sm">
          ← Return to Driving Schools
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link to="/driving-schools" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brandMint transition mb-6">
          <span>←</span> Back to All Driving Schools
        </Link>

        {/* Hero Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl mb-8">
          {/* Facility Banner Image */}
          <div className="w-full h-64 md:h-80 bg-slate-950 relative overflow-hidden">
            {school.logo_url ? (
              <img
                src={school.logo_url}
                alt={school.name}
                onError={(e) => {
                  e.target.onerror = null;
                  if (school.logo_path) {
                    e.target.src = 'http://127.0.0.1:8000/storage/' + school.logo_path;
                  }
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-600 font-mono text-sm">
                [Accredited Training Facility]
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {school.is_verified && (
                    <span className="bg-emerald-500 text-slate-950 text-xs uppercase font-extrabold px-2.5 py-1 rounded-md">
                      ✓ FRSC Accredited & Verified
                    </span>
                  )}
                  <span className="bg-slate-800/80 backdrop-blur text-brandMint text-xs font-semibold px-2.5 py-1 rounded-md border border-brandMint/30">
                    {school.state} State
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {school.name}
                </h1>
              </div>
            </div>
          </div>

          {/* School Details & Info Body */}
          <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-brandMint mb-2">About Academy</h2>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {school.description}
                </p>
              </div>

              {/* Facilities & Features Section */}
              {school.facilities && typeof school.facilities === 'object' && Object.keys(school.facilities).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-brandMint mb-3">Training Facilities & Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(school.facilities).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
                        <span className="text-brandMint text-base mt-0.5">✓</span>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{key.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {typeof value === 'boolean' ? (value ? 'Included / Available' : 'Not Available') : value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Gallery */}
              {school.images && Array.isArray(school.images) && school.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-brandMint mb-3">Facility Gallery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {school.images.map((img, idx) => (
                      <img key={idx} src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${img}`} alt={`Facility ${idx+1}`} className="w-full h-48 object-cover rounded-xl border border-slate-800" />
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Section */}
              {school.videos && Array.isArray(school.videos) && school.videos.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-brandMint mb-3">Videos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {school.videos.map((vid, idx) => {
                       // Extract YouTube ID for embed
                       let videoId = '';
                       try {
                         const url = new URL(vid);
                         if (url.hostname.includes('youtube.com')) {
                           videoId = url.searchParams.get('v');
                         } else if (url.hostname.includes('youtu.be')) {
                           videoId = url.pathname.slice(1);
                         }
                       } catch(e) {}
                       return videoId ? (
                         <iframe key={idx} className="w-full h-48 rounded-xl" src={`https://www.youtube.com/embed/${videoId}`} title={`Video ${idx+1}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                       ) : (
                         <a key={idx} href={vid} target="_blank" rel="noreferrer" className="flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl h-48 text-brandMint hover:underline">Watch Video {idx+1}</a>
                       );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Contact Info */}
            <div className="space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800 h-fit">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-3">
                Academy Information
              </h3>

              <div>
                <span className="text-xs text-slate-500 block">Accreditation Body</span>
                <span className="text-sm font-semibold text-slate-200">{school.accreditation_body || 'FRSC'}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Accreditation Number</span>
                <span className="text-xs font-mono text-brandMint font-bold">{school.accreditation_number}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Location</span>
                <span className="text-sm text-slate-200">{school.address || `${school.lga}, ${school.state}`}</span>
              </div>

              {school.contact_email && (
                <div>
                  <span className="text-xs text-slate-500 block">Email</span>
                  <a href={`mailto:${school.contact_email}`} className="text-xs text-brandMint hover:underline break-all">
                    {school.contact_email}
                  </a>
                </div>
              )}

              {school.contact_phone && (
                <div>
                  <span className="text-xs text-slate-500 block">Phone</span>
                  <a href={`tel:${school.contact_phone}`} className="text-xs text-slate-200 hover:text-brandMint">
                    {school.contact_phone}
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
                {school.contact_email && (
                  <a
                    href={`mailto:${school.contact_email}`}
                    className="w-full text-center bg-brandMint hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition"
                  >
                    Email School
                  </a>
                )}
                {school.contact_phone && (
                  <a
                    href={`tel:${school.contact_phone}`}
                    className="w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition"
                  >
                    Call {school.contact_phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrivingSchoolDetail;

