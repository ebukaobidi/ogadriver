import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/auth';
import { User, Mail, Phone, Tag, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
      countryCode: '+234',
    referral_code: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    // Format phone with country code
    const formattedPhone = formData.countryCode + formData.phone.replace(/^0+/, '');
    const submissionData = { ...formData, phone: formattedPhone };
    e.preventDefault();
    setError('');

    if (!agreedTerms) {
      setError('You must agree to the Terms and Conditions to register.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(submissionData);
      if (response.success) {
        setShowVerification(true);
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const identity = formData.phone || formData.email;
      const response = await authService.verify(identity, verificationCode);
      if (response.success) {
        window.location.href = '/dashboard';
      } else {
        setError(response.message || 'Invalid verification code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus('');
    setError('');
    try {
      const identity = formData.phone || formData.email;
      const response = await authService.resendVerification(identity);
      if (response.success) {
        setResendStatus('A new 6-digit verification code has been dispatched.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-corporateNavy flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brandMint/10 blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-900/20 blur-[100px] mix-blend-screen" />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-[0_0_30px_rgba(28,209,136,0.15)] relative">
              <ShieldCheck className="w-8 h-8 text-brandMint relative z-10" />
            </div>
          </div>
          <h2 className="mt-2 text-center text-3xl font-black tracking-tight text-white uppercase">
            Verify Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400 font-mono">
            Enter the 6-digit code sent to <strong className="text-white">{formData.phone || formData.email}</strong>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-800 sm:rounded-2xl sm:px-10">
            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
                <Activity className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {resendStatus && (
              <div className="mb-6 bg-brandMint/10 border border-brandMint/50 rounded-xl p-4">
                <p className="text-sm text-brandMint font-bold">{resendStatus}</p>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-4 text-white text-center text-2xl font-bold tracking-widest focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-lg transition-all font-mono"
                  required
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black uppercase tracking-widest text-corporateNavy bg-brandMint hover:bg-emerald-400 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? 'Verifying...' : 'Verify & Activate'}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleResendCode}
                  type="button"
                  disabled={loading}
                  className="w-full text-center text-sm font-bold text-brandMint hover:text-emerald-400 transition-colors"
                >
                  Resend Verification Code
                </button>
                <button
                  onClick={() => setShowVerification(false)}
                  type="button"
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-400 transition-colors"
                >
                  Back to Registration Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-corporateNavy flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brandMint/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-900/20 blur-[100px] mix-blend-screen" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <img src="/logo.svg" alt="OgaDriver" className="h-16 w-auto" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-black tracking-tight text-white uppercase">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-mono">
          Quick 1-step registration with instant OTP verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-800 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <Activity className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative flex">
                    <div className="relative flex items-center border border-r-0 border-slate-800 bg-slate-900 rounded-l-xl focus-within:border-brandMint transition-colors">
                      <select
                        value={formData.countryCode}
                        onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                        className="appearance-none bg-transparent text-slate-300 font-bold sm:text-sm pl-3 pr-8 py-3 focus:outline-none cursor-pointer"
                      >
                        <option value="+234">🇳🇬 +234</option>
                        <option value="+233">🇬🇭 +233</option>
                        <option value="+254">🇰🇪 +254</option>
                        <option value="+27">🇿🇦 +27</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="801 234 5678"
                    className="flex-1 block w-full bg-slate-950 border border-slate-800 rounded-r-xl py-3.5 px-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"
                    required
                  />
                </div>
              </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Tag className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="referral_code"
                  value={formData.referral_code}
                  onChange={handleChange}
                  placeholder="Enter referral code"
                  className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 text-brandMint focus:ring-brandMint focus:ring-offset-slate-950 bg-slate-950"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                  I agree to the <a href="/terms" className="text-brandMint underline">Terms & Conditions</a> and consent to profile visibility for driver/hirer matching.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreedTerms}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black uppercase tracking-widest text-corporateNavy bg-brandMint hover:bg-emerald-400 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
            >
              {loading ? 'Processing...' : 'Register Now'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={authService.googleLogin}
                className="mt-4 w-full flex items-center justify-center gap-3 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white hover:bg-slate-800 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-bold">Google</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <span className="text-sm text-slate-400">Already registered? </span>
              <Link to="/login" className="font-bold text-brandMint hover:text-emerald-400 transition-colors">
                Sign In Here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
