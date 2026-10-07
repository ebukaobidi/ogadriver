import { useState, useRef } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { Menu, User, Mail, Shield, Camera, Save, Loader2, Key } from 'lucide-react';
import { authService } from '../../api/auth';
import api from '../../api/axios';

function AdminProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = authService.getUser() || { name: '', email: '' };
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);
      
      const res = await api.post('/admin/profile/avatar', formDataUpload);
      
      const data = res.data;

      if (data.status === 'success') {
        const updatedUser = { ...user, avatar: data.data.avatar_url };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccessMsg('Avatar updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data?.message || data?.errors?.avatar?.[0] || 'Avatar upload failed');
      }
    } catch (err) {
      console.error("Avatar Upload Error:", err);
      setErrorMsg(err.response?.data?.message || 'Avatar upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setErrorMsg('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/admin/profile', {
        name: formData.name,
        email: formData.email,
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword
      });
      
      const data = res.data;

      if (data.status === 'success') {
        const updatedUser = { ...user, name: formData.name, email: formData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccessMsg('Profile updated successfully!');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error("Profile Update Error:", err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-0 h-screen overflow-hidden">
        
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white hidden sm:block flex items-center gap-2">
              <User className="text-brandMint" size={20} /> My Profile
            </h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            
            <div className="mb-8">
              <h1 className="text-2xl font-black text-white">Profile Settings</h1>
              <p className="text-slate-400 mt-1">Manage your administrator account details and security.</p>
            </div>

            {successMsg && (
              <div className="mb-6 p-4 bg-brandMint/10 border border-brandMint/30 text-brandMint rounded-xl font-bold">
                {successMsg}
              </div>
            )}
            
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl font-bold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
                  <div className="relative inline-block mb-4 group">
                    <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden mx-auto shadow-2xl">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-slate-500" />
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-brandMint text-corporateNavy rounded-full hover:bg-emerald-400 transition-colors shadow-lg border-2 border-slate-900 group-hover:scale-110"
                    >
                      <Camera size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                  <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
                  <p className="text-sm font-mono text-brandMint uppercase tracking-widest mt-1">Super Admin</p>
                  <p className="text-xs text-slate-500 mt-4 px-4">Upload a new avatar. Recommended size: 256x256px.</p>
                </div>
              </div>

              {/* Form Section */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={16} /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brandMint transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brandMint transition-colors"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 my-6"></div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield size={16} /> Security & Password
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Current Password</label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                          <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brandMint transition-colors"
                            placeholder="Leave blank if not changing"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brandMint transition-colors"
                            placeholder="Min. 8 characters"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-brandMint transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-brandMint text-corporateNavy hover:bg-emerald-400 px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminProfile;
