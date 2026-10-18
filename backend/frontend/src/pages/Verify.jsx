import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/auth';
import { ShieldCheck, Mail, ArrowRight } from 'lucide-react';

function Verify() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load verification data from sessionStorage
    const email = sessionStorage.getItem('verificationEmail');
    const phone = sessionStorage.getItem('verificationPhone');
    
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
    if (phone) {
      setFormData(prev => ({ ...prev, phone }));
    }
    
    // If no verification data, redirect to login
    if (!email && !phone) {
      navigate('/login');
    }
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const identity = formData.email || formData.phone;
      const response = await authService.verify(identity, verificationCode);
      
      if (response.success) {
        // Clear sessionStorage
        sessionStorage.removeItem('verificationEmail');
        sessionStorage.removeItem('verificationPhone');
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus('');
    setError('');
    setLoading(true);
    
    try {
      const identity = formData.email || formData.phone;
      const response = await authService.resendVerification(identity);
      
      if (response.success) {
        setResendStatus('A new verification code has been sent to your email and phone.');
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('verificationEmail');
    sessionStorage.removeItem('verificationPhone');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-corporateNavy flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brandMint/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-900/20 blur-[100px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[10%] w-[20%] h-[20%] rounded-full bg-brandMint/5 blur-[80px] mix-blend-screen" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-[0_0_30px_rgba(28,209,136,0.15)] relative">
            <div className="absolute inset-0 bg-brandMint/20 rounded-2xl animate-pulse"></div>
            <ShieldCheck className="w-8 h-8 text-brandMint relative z-10" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-black tracking-tight text-white uppercase">
          Verify Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-mono">
          Enter the 6-digit code sent to your email and phone
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-800 sm:rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {resendStatus && (
            <div className="mb-6 bg-brandMint/10 border border-brandMint/50 rounded-xl p-4">
              <p className="text-sm text-brandMint font-bold">{resendStatus}</p>
            </div>
          )}

          <div className="mb-6 space-y-2">
            {formData.email && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4" />
                <span>{formData.email}</span>
              </div>
            )}
            {formData.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="font-mono">{formData.phone}</span>
              </div>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleVerify}>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-4 text-white text-center text-2xl font-bold tracking-widest placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-lg transition-all font-mono"
                required
                maxLength="6"
                pattern="[0-9]{6}"
              />
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black uppercase tracking-widest text-corporateNavy bg-brandMint hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brandMint transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? 'Verifying...' : 'Verify & Activate'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleResendCode}
              type="button"
              disabled={loading}
              className="w-full text-center text-sm font-bold text-brandMint hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend Verification Code
            </button>
            
            <button
              onClick={handleBackToLogin}
              type="button"
              className="w-full text-center text-xs text-slate-500 hover:text-slate-400 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verify;
