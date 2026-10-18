import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/auth';
import { ShieldCheck, Mail, Lock, Phone, ArrowRight, Activity, Smartphone } from 'lucide-react';

function Login() {
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({
    email: '',
    phone: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get('error');
    const msgParam = params.get('msg');
    if (msgParam) {
      setError(decodeURIComponent(msgParam));
    } else if (errParam === 'google_not_configured') {
      setError('Google Sign-In is not currently configured in Admin API Settings. Please log in with your password or phone OTP.');
    } else if (errParam === 'auth_failed') {
      setError('Google Authentication failed. Please try again or log in with your email and password.');
    } else if (errParam === 'account_banned') {
      setError('This Google account has been permanently restricted.');
    } else if (errParam) {
      setError(`Authentication notice: ${errParam}`);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginMethod === 'password') {
        const response = await authService.login(formData.email, formData.password);
        if (response.data?.needs_verification) {
          setVerificationData({
            email: response.data.email,
            phone: response.data.phone,
          });
          setShowVerification(true);
          setError('');
          if (response.data.verification_sent) {
            setResendStatus('A new verification code has been sent to your email and phone.');
          }
          return;
        }
        window.location.href = '/dashboard';
      } else {
        // OTP Login Flow
        if (!otpSent) {
          const res = await authService.requestOtp(formData.phone);
          if (res.success) {
            setOtpSent(true);
            setResendStatus('A 6-digit login code was sent to your phone number.');
          } else {
            setError(res.message || 'Failed to request OTP code.');
          }
        } else {
          const res = await authService.loginWithOtp(formData.phone, otpCode);
          if (res.success) {
            window.location.href = '/dashboard';
          } else {
            setError(res.message || 'Invalid login OTP code.');
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Incorrect password or credentials. Please check your login details and try again.';
      
      if (err.response?.data?.needs_verification) {
        setVerificationData({
          email: err.response.data.email,
          phone: err.response.data.phone,
        });
        setShowVerification(true);
        setError('');
        if (err.response.data.verification_sent) {
          setResendStatus('A new verification code has been sent to your email and phone.');
        }
        return;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerificationError('');
    setVerificationLoading(true);

    try {
      const identity = verificationData.email || verificationData.phone;
      const response = await authService.verify(identity, verificationCode);
      if (response.success) {
        window.location.href = '/dashboard';
      } else {
        setVerificationError(response.message || 'Invalid verification code.');
      }
    } catch (err) {
      setVerificationError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendStatus('');
    setVerificationError('');
    setVerificationLoading(true);
    
    try {
      const identity = verificationData.email || verificationData.phone || formData.phone;
      const response = await authService.resendVerification(identity);
      if (response.success) {
        setResendStatus('A new verification code has been sent.');
      }
    } catch (err) {
      setVerificationError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setVerificationLoading(false);
    }
  };

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
          Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-mono">
          Access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-slate-800 sm:rounded-2xl sm:px-10">
          
          {/* Method Selection Tabs */}
          {!showVerification && (
            <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setLoginMethod('password'); setError(''); setResendStatus(''); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${loginMethod === 'password' ? 'bg-brandMint text-corporateNavy' : 'text-slate-400 hover:text-white'}`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('otp'); setError(''); setResendStatus(''); }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${loginMethod === 'otp' ? 'bg-brandMint text-corporateNavy' : 'text-slate-400 hover:text-white'}`}
              >
                Phone OTP Login
              </button>
            </div>
          )}

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

          {showVerification ? (
            <form className="space-y-6" onSubmit={handleVerify}>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-4 text-white text-center text-2xl font-bold tracking-widest placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-lg transition-all font-mono"
                  required
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={verificationLoading || verificationCode.length !== 6}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black uppercase tracking-widest text-corporateNavy bg-brandMint hover:bg-emerald-400 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {verificationLoading ? 'Verifying...' : 'Verify & Activate'}
                {!verificationLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {loginMethod === 'password' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter your email"
                        className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 08012345678"
                        disabled={otpSent}
                        className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        6-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-4 text-white text-center text-2xl font-bold tracking-widest placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-lg transition-all font-mono"
                        required
                        maxLength={6}
                      />
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black uppercase tracking-widest text-corporateNavy bg-brandMint hover:bg-emerald-400 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? 'Processing...' : (loginMethod === 'otp' ? (otpSent ? 'Sign In with OTP' : 'Request OTP Code') : 'Sign In')}
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

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={authService.googleLogin}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white hover:bg-slate-800 transition-all text-xs font-bold"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                        if (!window.PublicKeyCredential) {
                          setError('Biometric Face ID / Fingerprint login is not supported on this browser or device.');
                          return;
                        }
                        try {
                          const challenge = new Uint8Array(32);
                          window.crypto.getRandomValues(challenge);
                          await navigator.credentials.get({
                            publicKey: {
                              challenge: challenge,
                              timeout: 60000,
                              userVerification: "required"
                            }
                          });
                          window.location.href = '/dashboard';
                        } catch (err) {
                          console.error(err);
                          setError('Biometric authentication failed or was cancelled.');
                        }
                      }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white hover:bg-slate-800 transition-all text-xs font-bold"
                  >
                    <Smartphone className="w-4 h-4 text-brandMint" />
                    <span>Biometric / Passkey</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <span className="text-sm text-slate-400">Don't have an account? </span>
                <Link to="/register" className="font-bold text-brandMint hover:text-emerald-400 transition-colors">
                  Register Now
                </Link>
              </div>

              {/* App Download Banner — shows only in browser, not in installed PWA */}
              {!window.matchMedia('(display-mode: standalone)').matches && !window.navigator.standalone && (
                <div className="mt-6 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-brandMint/20 rounded-xl p-4">
                  <p className="text-white text-xs font-bold text-center mb-3 flex items-center justify-center gap-1.5"><Smartphone className="w-4 h-4 text-brandMint" /> Get the OgaDriver App</p>
                  <div className="flex gap-2">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.ogadriver.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 flex items-center justify-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg text-[10px] font-bold text-white hover:bg-slate-800 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" /></svg> Google Play
                      </a>
                    <a
                      href="https://apps.apple.com/app/ogadriver/id000000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 flex items-center justify-center gap-1.5 bg-slate-950 border border-slate-700 rounded-lg text-[10px] font-bold text-white hover:bg-slate-800 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C12.73,4.5 12.06,5.39 11.08,6.04C10.32,6.58 9.38,6.92 8.44,6.95C8.42,6.7 8.41,6.44 8.41,6.17C8.41,4.96 9.07,3.84 9.92,3.12C10.74,2.37 11.75,1.96 12.79,1.95C12.83,2.45 12.86,2.94 13,3.5Z" /></svg> App Store
                      </a>
                  </div>
                  <p className="text-slate-500 text-[9px] text-center mt-2">Or install directly from this browser — no store needed</p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
