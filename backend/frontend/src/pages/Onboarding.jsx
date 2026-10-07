import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import api from '../api/axios';
import { Globe, Briefcase, Car, AlertCircle, ArrowRight, User, Phone } from 'lucide-react';

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([
    { id: 1, name: 'Nigeria' },
    { id: 2, name: 'Ghana' },
    { id: 3, name: 'Kenya' },
  ]);
  
  const [formData, setFormData] = useState({
    role: '',
    country_id: '',
    phone: '',
    nickname: '',
    gender: ''
  });

  useEffect(() => {
    api.get('/countries')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
        if (list.length) setCountries(list);
      })
      .catch(() => {});
  }, []);

  const handleRoleSelect = (role, serviceMode = null) => {
    setFormData({ ...formData, role, service_mode: serviceMode });
    setStep(2);
  };

  const handleCountrySelect = (id) => {
    setFormData({ ...formData, country_id: id });
    setStep(3);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone) {
      setError("Phone number is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authService.completeOnboarding(formData);
      const role = result.user?.role;
      if (['driver', 'operator'].includes(role)) {
        navigate('/driver');
      } else if (['hirer', 'employee'].includes(role)) {
        navigate('/hirer');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-300 font-sans">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Welcome to OgaDriver</h1>
          <p className="text-slate-400">Let's set up your profile to get started.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-8 px-4">
           {[1, 2, 3].map((s) => (
             <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  step >= s ? 'bg-brandMint text-corporateNavy' : 'bg-slate-800 text-slate-500'
                }`}>
                  {s}
                </div>
                <div className="mt-2 text-xs font-mono uppercase tracking-wider text-slate-500">
                  {s === 1 ? 'Role' : s === 2 ? 'Region' : 'Profile'}
                </div>
             </div>
           ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-bold uppercase tracking-wider">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6">
              What brings you to OgaDriver?
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect('driver', 'driver_with_vehicle')}
                className="w-full p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-brandMint hover:bg-slate-800 transition-all text-left flex gap-4 group"
              >
                <div className="bg-brandMint/10 p-3 rounded-xl shrink-0 group-hover:bg-brandMint/20 transition-colors">
                  <Car className="text-brandMint" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base mb-1 group-hover:text-brandMint transition-colors">🚖 On-Demand Ride Hailing Driver</h3>
                  <p className="text-xs text-slate-400">Drive on the OgaDriver dispatch network — accept instant rides & open bids.</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('driver', 'driver_only')}
                className="w-full p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500 hover:bg-slate-800 transition-all text-left flex gap-4 group"
              >
                <div className="bg-amber-500/10 p-3 rounded-xl shrink-0 group-hover:bg-amber-500/20 transition-colors">
                  <Briefcase className="text-amber-500" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base mb-1 group-hover:text-amber-500 transition-colors">👔 Private & Corporate Employer Driver</h3>
                  <p className="text-xs text-slate-400">Apply for monthly, full-time, part-time & live-in driver jobs with top employers.</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('driver', 'both')}
                className="w-full p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-400 hover:bg-slate-800 transition-all text-left flex gap-4 group"
              >
                <div className="bg-emerald-500/10 p-3 rounded-xl shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                  <Car className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base mb-1 group-hover:text-emerald-400 transition-colors">⚡ Hybrid Operative (Both Active)</h3>
                  <p className="text-xs text-slate-400">Active on Live Radar for rides AND listed on Hire Directory for contracts.</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('hirer')}
                className="w-full p-5 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 hover:bg-slate-800 transition-all text-left flex gap-4 group"
              >
                <div className="bg-blue-500/10 p-3 rounded-xl shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <User className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base mb-1 group-hover:text-blue-500 transition-colors">💼 Employer / Hirer</h3>
                  <p className="text-xs text-slate-400">Hire verified certified drivers for your car or book instant rides.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <button 
              onClick={() => setStep(1)} 
              className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-white mb-4 block transition-colors"
            >
              ← Back
            </button>
            
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Globe className="text-brandMint" size={20} /> Select Your Country
            </h2>
            
            <div className="space-y-3">
              {countries.map(country => (
                <button
                  key={country.id}
                  onClick={() => handleCountrySelect(country.id)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center hover:border-brandMint hover:bg-slate-800 transition-colors group text-left"
                >
                  <span className="font-bold text-white group-hover:text-brandMint transition-colors">{country.name}</span>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-700 group-hover:border-brandMint"></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in">
            <button 
              onClick={() => setStep(2)} 
              className="text-xs font-mono uppercase tracking-widest text-slate-500 hover:text-white mb-4 block transition-colors"
            >
              ← Back
            </button>
            
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <User className="text-brandMint" size={20} /> Final Details
            </h2>
            <p className="text-xs text-slate-500 mb-6">Since you signed in with Google, we need a few more details to complete your profile.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full pl-10 bg-slate-950 border border-slate-800 rounded-xl py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint transition-all"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name (Nickname)</label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className="block w-full px-4 bg-slate-950 border border-slate-800 rounded-xl py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint transition-all"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="block w-full px-4 bg-slate-950 border border-slate-800 rounded-xl py-3 text-white focus:ring-1 focus:ring-brandMint focus:border-brandMint transition-all appearance-none"
                >
                  <option value="" className="bg-slate-900">Prefer not to say</option>
                  <option value="male" className="bg-slate-900">Male</option>
                  <option value="female" className="bg-slate-900">Female</option>
                  <option value="other" className="bg-slate-900">Other</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-black uppercase tracking-widest text-corporateNavy bg-brandMint hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brandMint transition-all disabled:opacity-50 group"
                >
                  {loading ? 'Processing...' : 'Complete Setup'}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default Onboarding;
