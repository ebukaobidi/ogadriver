import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import api from '../api/axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'driver',
    country_id: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/countries')
      .then(res => setCountries(res.data))
      .catch(err => console.error("Could not load countries", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedListing, setAgreedListing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedTerms || !agreedListing) {
      setError('You must agree to the Terms and Conditions and Job Listing rules to register.');
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      if (formData.role === 'driver') {
        navigate('/driver');
      } else if (formData.role === 'hirer') {
        navigate('/hirer');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-corporateNavy flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-slate-950 border border-brandMint/30 rounded-2xl shadow-[0_0_40px_rgba(28,209,136,0.1)] p-8">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.svg" alt="OgaDriver" className="h-16 w-auto mb-4" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Create your account</h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">I am registering as a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
              required
            >
              <option value="driver">Driver / Operative</option>
              <option value="hirer">Hirer / Employer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Country of Operation</label>
            <select
              name="country_id"
              value={formData.country_id}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
              required
            >
              <option value="">Select your Country</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">Your account will be strictly bound to this country for all operational activities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
                required
                minLength="8"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Confirm Password</label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
                required
                minLength="8"
              />
            </div>
          </div>

          {/* TERMS AND CONDITIONS */}
          <div className="mt-8 border border-slate-800 rounded-xl overflow-hidden">
             <div className="bg-slate-900 px-4 py-3 border-b border-slate-800">
                <h4 className="font-bold text-white text-sm">Terms & Conditions</h4>
             </div>
             <div className="h-40 overflow-y-auto p-4 text-xs text-slate-400 space-y-3 bg-slate-950 custom-scrollbar">
                <p><strong>1. Acceptance of Terms:</strong> By registering on OgaDriver, you agree to abide by our strict code of conduct, security protocols, and operational guidelines.</p>
                <p><strong>2. Vetting & Verification:</strong> All operatives must undergo physical assessment, biometric registration, and background checks. Falsifying information will result in a permanent ban and potential legal action.</p>
                <p><strong>3. Geolocation & Telemetry:</strong> While actively employed or engaged on the platform, your vehicle's telematics and GPS location may be tracked by the employer for security purposes.</p>
                <p><strong>4. Public Directory Listing:</strong> By registering as an operative, you explicitly consent to having your name, rating, profile photos, and employment preferences publicly listed on the OgaDriver Employer Directory.</p>
                <p><strong>5. Zero Tolerance Policy:</strong> Any forms of extortion, assault, driving under the influence, or hijacking will trigger an immediate SOS protocol to local authorities.</p>
             </div>
          </div>

          <div className="space-y-3 mt-4">
             <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                   type="checkbox" 
                   checked={agreedTerms}
                   onChange={(e) => setAgreedTerms(e.target.checked)}
                   className="mt-1 w-4 h-4 rounded border-slate-700 text-brandMint focus:ring-brandMint focus:ring-offset-slate-950 bg-slate-900"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                   I have read and agree to the OgaDriver Terms and Conditions, Rules, and Security Protocols.
                </span>
             </label>
             
             {formData.role === 'driver' && (
                <label className="flex items-start gap-3 cursor-pointer group">
                   <input 
                      type="checkbox" 
                      checked={agreedListing}
                      onChange={(e) => setAgreedListing(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 text-brandMint focus:ring-brandMint focus:ring-offset-slate-950 bg-slate-900"
                   />
                   <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      I consent to having my operative profile, avatars, and employment preferences displayed on the public Job Listing Directory for employers.
                   </span>
                </label>
             )}
          </div>

          <button
            type="submit"
            disabled={loading || !agreedTerms || (formData.role === 'driver' && !agreedListing)}
            className="w-full mt-6 bg-brandMint text-corporateNavy py-4 px-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-400 focus:outline-none transition-all disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Initializing Protocol...' : 'Register Securely'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-400">
            Already registered?{' '}
            <a href="/login" className="text-brandMint hover:text-emerald-300 font-bold transition-colors">
              Access Terminal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
