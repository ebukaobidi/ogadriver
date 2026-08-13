import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../api/auth';
import { ShieldCheck, Mail, Lock, ArrowRight, Activity } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      console.log('Login successful:', response);
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Authentication failed. Please verify your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
          Access Terminal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 font-mono">
          Secure Authorization Required
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 bg-slate-950 border border-slate-800 rounded-xl py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Secure Password
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 bg-slate-950 border border-slate-800 rounded-xl py-3 text-white placeholder-slate-600 focus:ring-1 focus:ring-brandMint focus:border-brandMint sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-slate-950 border-slate-800 rounded text-brandMint focus:ring-brandMint"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                  Remember terminal
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-brandMint hover:text-emerald-400 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black uppercase tracking-widest text-corporateNavy bg-brandMint hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-brandMint transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? 'Authenticating...' : 'Initialize Session'}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => authService.googleLogin()}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-700 rounded-xl shadow-sm bg-slate-800 text-sm font-bold text-white hover:bg-slate-700 hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Don't have an operative clearance?{' '}
            <Link to="/register" className="font-bold text-brandMint hover:text-emerald-400 transition-colors">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
