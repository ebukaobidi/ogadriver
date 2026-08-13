import React, { useState } from 'react';
import { 
  User,
  Loader2,
  Eye,
  Camera,
  Upload,
  Lock,
  FileCheck,
  CheckCircle2,
  Save,
  X,
  Star,
  Award,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Code,
  Wrench
} from 'lucide-react';

const DriverProfileTab = ({
  user,
  processingId,
  setPreviewImage,
  handleAvatarUpload,
  nickname,
  setNickname,
  phone,
  setPhone,
  gender,
  setGender,
  dateOfBirth,
  setDateOfBirth,
  languages,
  setLanguages,
  residenceStateId,
  setResidenceStateId,
  dbStates,
  residenceCityId,
  setResidenceCityId,
  dbCitiesResidence,
  handleFileUpload,
  uploadedFiles,
  handleSaveProfile,
  prefStateId,
  setPrefStateId,
  prefCityIds,
  setPrefCityIds,
  dbCitiesPref,
  vehicleCerts,
  setVehicleCerts,
  employmentTypes,
  setEmploymentTypes,
  handleSavePreferences,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleChangePassword,
  skills,
  setSkills,
  endorsements,
  setEndorsements,
  portfolioItems,
  setPortfolioItems,
  handleAddSkill,
  handleRemoveSkill,
  handleAddEndorsement,
  handleRemoveEndorsement,
  handleAddPortfolioItem,
  handleRemovePortfolioItem
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [newEndorsement, setNewEndorsement] = useState({ name: '', skill: '', message: '' });
  const [newPortfolioItem, setNewPortfolioItem] = useState({ title: '', description: '', type: 'project', link: '' });
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddEndorsement, setShowAddEndorsement] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
       <div className="mb-6">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Identity Details</h3>
          <p className="text-slate-400">Update your operative profile, images, and contact information.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-lg hover:border-brandMint/30 transition-colors">
             <p className="font-bold text-slate-400 text-sm">Primary ID (Avatar)</p>
             <div className="w-24 h-24 rounded-full border-4 border-brandMint bg-slate-800 flex items-center justify-center relative overflow-hidden group">
                {user && user.avatar ? (
                   <img 
                     src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar}`} 
                     alt="Primary" 
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       e.target.style.display = 'none';
                       e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`;
                     }}
                   />
                ) : (
                   <User className="w-8 h-8 text-slate-500" />
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   {processingId === 'avatar_primary' ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                   ) : (
                      <div className="flex gap-2">
                         {user && user.avatar && (
                            <button onClick={() => setPreviewImage(user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar}`)} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer" title="Preview">
                               <Eye className="w-5 h-5 text-white" />
                            </button>
                         )}
                         <button onClick={() => handleAvatarUpload('primary')} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer" title="Upload">
                            <Camera className="w-5 h-5 text-white" />
                         </button>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-lg hover:border-brandMint/30 transition-colors">
             <p className="font-bold text-slate-400 text-sm">Secondary Image</p>
             <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800 flex items-center justify-center relative overflow-hidden group hover:border-brandMint transition-colors">
                {user && user.avatar_secondary ? (
                   <img 
                     src={user.avatar_secondary.startsWith('http') ? user.avatar_secondary : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar_secondary}`} 
                     alt="Secondary" 
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       e.target.style.display = 'none';
                       e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></div>`;
                     }}
                   />
                ) : (
                   <Upload className="w-6 h-6 text-slate-500 group-hover:text-brandMint transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   {processingId === 'avatar_secondary' ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                   ) : (
                      <div className="flex gap-2">
                         {user && user.avatar_secondary && (
                            <button onClick={() => setPreviewImage(user.avatar_secondary.startsWith('http') ? user.avatar_secondary : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar_secondary}`)} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer" title="Preview">
                               <Eye className="w-5 h-5 text-white" />
                            </button>
                         )}
                         <button onClick={() => handleAvatarUpload('secondary')} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer" title="Upload">
                            <Camera className="w-5 h-5 text-white" />
                         </button>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-lg hover:border-brandMint/30 transition-colors">
             <p className="font-bold text-slate-400 text-sm">Tertiary Image</p>
             <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-600 bg-slate-800 flex items-center justify-center relative overflow-hidden group hover:border-brandMint transition-colors">
                {user && user.avatar_tertiary ? (
                   <img 
                     src={user.avatar_tertiary.startsWith('http') ? user.avatar_tertiary : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar_tertiary}`} 
                     alt="Tertiary" 
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       e.target.style.display = 'none';
                       e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></div>`;
                     }}
                   />
                ) : (
                   <Upload className="w-6 h-6 text-slate-500 group-hover:text-brandMint transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   {processingId === 'avatar_tertiary' ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                   ) : (
                      <div className="flex gap-2">
                         {user && user.avatar_tertiary && (
                            <button onClick={() => setPreviewImage(user.avatar_tertiary.startsWith('http') ? user.avatar_tertiary : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar_tertiary}`)} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer" title="Preview">
                               <Eye className="w-5 h-5 text-white" />
                            </button>
                         )}
                         <button onClick={() => handleAvatarUpload('tertiary')} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer" title="Upload">
                            <Camera className="w-5 h-5 text-white" />
                         </button>
                      </div>
                   )}
                </div>
             </div>
          </div>
       </div>

       <div className="bg-corporateNavy border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <h4 className="font-black text-lg border-b border-slate-800 pb-2">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Full Name</label>
                <input type="text" readOnly defaultValue={user && user.name ? user.name : ''} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed outline-none" />
                <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1 mt-1">
                   <Lock className="w-3 h-3" /> Name cannot be changed and must exactly match your Driving License.
                </p>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Display Name (Nickname)</label>
                <input type="text" id="nickname_input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="What should we call you?" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all" />
                <p className="text-[10px] text-slate-500">This will be shown on your public profile instead of your legal name.</p>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Email Address</label>
                <input type="email" value={user && user.email ? user.email : ''} readOnly className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 outline-none cursor-not-allowed" />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all" />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all">
                   <option value="">Select Gender</option>
                   <option value="male">Male</option>
                   <option value="female">Female</option>
                   <option value="other">Other</option>
                </select>
                <p className="text-[10px] text-slate-500">We accept and welcome operatives of all genders.</p>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Date of Birth</label>
                <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all" />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Languages Spoken</label>
                <input 
                    type="text" 
                    placeholder="e.g. English, Hausa, Yoruba" 
                    value={Array.isArray(languages) ? languages.join(', ') : (languages || '')} 
                    onChange={e => {
                      const val = e.target.value;
                      setLanguages(val.split(',').map(s => s.trim()).filter(Boolean));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all" 
                />
                <p className="text-[10px] text-slate-500">Official language is English, other languages can be an added advantage.</p>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">State of Residence</label>
                <select 
                   value={residenceStateId} 
                   onChange={e => {
                      setResidenceStateId(e.target.value);
                      setResidenceCityId('');
                   }}
                   className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all"
                >
                   <option value="">Select State</option>
                   {dbStates.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                   ))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">City / LGA of Residence</label>
                <select 
                   value={residenceCityId} 
                   onChange={e => setResidenceCityId(e.target.value)}
                   className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all disabled:opacity-50"
                   disabled={!residenceStateId}
                >
                   <option value="">Select City/LGA</option>
                   {dbCitiesResidence.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                   ))}
                </select>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
             <h5 className="font-bold text-white mb-4">Police Clearance Document</h5>
             <div 
                onClick={() => handleFileUpload('policeClearance')}
                className={`w-full max-w-sm border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${uploadedFiles.policeClearance ? 'bg-brandMint/10 border-brandMint/50' : 'border-slate-600 bg-slate-900 hover:border-brandMint hover:shadow-[0_0_15px_rgba(28,209,136,0.1)]'}`}
             >
                {processingId === 'policeClearance' ? (
                   <Loader2 className="w-8 h-8 text-brandMint animate-spin mb-2" />
                ) : uploadedFiles.policeClearance ? (
                   <CheckCircle2 className="w-8 h-8 text-brandMint mb-2" />
                ) : (
                   <FileCheck className="w-8 h-8 text-slate-500 mb-2" />
                )}
                <h5 className={`font-bold text-sm ${uploadedFiles.policeClearance ? 'text-brandMint' : 'text-slate-300'}`}>
                   {uploadedFiles.policeClearance ? 'Clearance Uploaded' : 'Upload Police Clearance'}
                </h5>
             </div>
          </div>
          
          <div className="pt-6 border-t border-slate-800 flex justify-end">
             <button 
                onClick={handleSaveProfile}
                disabled={processingId === 'saveProfile'}
                className="bg-brandMint text-corporateNavy px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-emerald-400 transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(28,209,136,0.2)]"
             >
                {processingId === 'saveProfile' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Profile
             </button>
          </div>
       </div>

       {/* EMPLOYMENT PREFERENCES SECTION */}
       <div className="bg-corporateNavy border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <h4 className="font-black text-lg border-b border-slate-800 pb-2">Employment & Dispatch Preferences</h4>
          
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Preferred Geolocation / Routes (Multi-Select)</label>
                <div className="flex gap-4 mb-2">
                   <select 
                      value={prefStateId} 
                      onChange={e => {
                         setPrefStateId(e.target.value);
                         setPrefCityIds([]);
                      }}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint outline-none transition-all"
                   >
                      <option value="">Select State</option>
                      {dbStates.map(st => (
                         <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                   </select>
                   <select 
                      onChange={e => {
                         if (e.target.value && !prefCityIds.includes(e.target.value)) {
                            setPrefCityIds([...prefCityIds, e.target.value]);
                         }
                      }}
                      value=""
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint outline-none transition-all disabled:opacity-50"
                      disabled={!prefStateId}
                   >
                      <option value="">Add City/LGA...</option>
                      {dbCitiesPref.map(city => (
                         <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                   </select>
                </div>
                {prefCityIds.length > 0 && (
                   <div className="flex flex-wrap gap-2 mt-2">
                      {prefCityIds.map(id => (
                         <span key={id} className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs text-white flex items-center gap-2 animate-fade-in shadow-sm">
                            City ID: {id}
                            <button onClick={() => setPrefCityIds(prefCityIds.filter(c => c !== id))} className="text-slate-400 hover:text-red-400 transition-colors">
                               <X className="w-3 h-3" />
                            </button>
                         </span>
                      ))}
                   </div>
                )}
                <p className="text-[10px] text-slate-500">Employers will use this to match you with jobs in your preferred area.</p>
             </div>

             <div className="space-y-3">
                <label className="text-xs font-mono text-slate-400 uppercase">Vehicle Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {['Standard Sedan', 'Executive / Luxury', 'Heavy Duty Truck', 'Delivery Van'].map(cat => (
                      <label key={cat} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors group ${vehicleCerts.includes(cat) ? 'border-brandMint bg-brandMint/10' : 'border-slate-700 bg-slate-900 hover:border-brandMint/50'}`}>
                         <input 
                            type="checkbox" 
                            checked={vehicleCerts.includes(cat)}
                            onChange={(e) => {
                               if (e.target.checked) {
                                  setVehicleCerts([...vehicleCerts, cat]);
                               } else {
                                  setVehicleCerts(vehicleCerts.filter(c => c !== cat));
                               }
                            }}
                            className="w-4 h-4 rounded border-slate-600 text-brandMint focus:ring-brandMint focus:ring-offset-slate-900 bg-slate-800" 
                         />
                         <span className={`text-xs font-bold transition-colors ${vehicleCerts.includes(cat) ? 'text-brandMint' : 'text-slate-300 group-hover:text-white'}`}>{cat}</span>
                      </label>
                   ))}
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-xs font-mono text-slate-400 uppercase">Employment Availability Types</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {['Full-Time', 'Short-Term Contract', 'One-Off Trips', 'Part-Time'].map(type => (
                      <label key={type} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors group ${employmentTypes.includes(type) ? 'border-brandMint bg-brandMint/10' : 'border-slate-700 bg-slate-900 hover:border-brandMint/50'}`}>
                         <input 
                            type="checkbox" 
                            checked={employmentTypes.includes(type)}
                            onChange={(e) => {
                               if (e.target.checked) {
                                  setEmploymentTypes([...employmentTypes, type]);
                               } else {
                                  setEmploymentTypes(employmentTypes.filter(t => t !== type));
                               }
                            }}
                            className="w-4 h-4 rounded border-slate-600 text-brandMint focus:ring-brandMint focus:ring-offset-slate-900 bg-slate-800" 
                         />
                         <span className={`text-xs font-bold transition-colors ${employmentTypes.includes(type) ? 'text-brandMint' : 'text-slate-300 group-hover:text-white'}`}>{type}</span>
                      </label>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="pt-6 border-t border-slate-800 flex justify-end">
             <button 
                onClick={handleSavePreferences}
                disabled={processingId === 'savePrefs'}
                className="bg-brandMint text-corporateNavy px-8 py-3 rounded-xl font-black uppercase text-sm hover:bg-emerald-400 transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(28,209,136,0.2)]"
             >
                {processingId === 'savePrefs' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Preferences
             </button>
          </div>
       </div>

       {/* CHANGE PASSWORD SECTION */}
       <div className="bg-corporateNavy border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <h4 className="font-black text-lg border-b border-slate-800 pb-2">Change Password</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Current Password</label>
                <input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all" />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">New Password</label>
                <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all" />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 uppercase">Confirm New Password</label>
                <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none transition-all" />
             </div>
          </div>
          
          <div className="pt-6 border-t border-slate-800 flex justify-end">
             <button onClick={handleChangePassword} disabled={processingId === 'changePassword'} className="bg-slate-900 border border-slate-700 text-white px-8 py-3 rounded-xl font-bold uppercase text-sm hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50">
                {processingId === 'changePassword' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />} Update Password
             </button>
          </div>
       </div>

       {/* SKILLS & ENDORSEMENTS SECTION */}
       <div className="bg-corporateNavy border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
             <h4 className="font-black text-lg flex items-center gap-2">
                <Award className="text-brandMint" size={20} />
                Skills & Endorsements
             </h4>
             <button onClick={() => setShowAddSkill(!showAddSkill)} className="text-brandMint hover:text-emerald-400 text-sm font-bold flex items-center gap-1">
                <Plus size={16} /> Add Skill
             </button>
          </div>

          {/* Add Skill Form */}
          {showAddSkill && (
             <div className="bg-slate-900 rounded-xl p-4 space-y-4">
                <div className="flex gap-2">
                   <input
                      type="text"
                      placeholder="Enter skill (e.g., Defensive Driving)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brandMint outline-none"
                   />
                   <button
                      onClick={() => { handleAddSkill(newSkill); setNewSkill(''); setShowAddSkill(false); }}
                      className="px-4 py-2 bg-brandMint text-corporateNavy font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                   >
                      Add
                   </button>
                </div>
             </div>
          )}

          {/* Skills List */}
          <div className="flex flex-wrap gap-2">
             {(skills || []).map((skill, index) => (
                <div key={index} className="bg-brandMint/10 border border-brandMint/30 rounded-full px-4 py-2 flex items-center gap-2">
                   <span className="text-brandMint font-bold text-sm">{skill}</span>
                   <button onClick={() => handleRemoveSkill(index)} className="text-brandMint hover:text-red-400 transition-colors">
                      <X size={14} />
                   </button>
                </div>
             ))}
             {(!skills || skills.length === 0) && (
                <p className="text-slate-500 text-sm italic">No skills added yet</p>
             )}
          </div>

          {/* Endorsements */}
          <div className="border-t border-slate-800 pt-6">
             <div className="flex justify-between items-center mb-4">
                <h5 className="font-bold text-white">Endorsements</h5>
                <button onClick={() => setShowAddEndorsement(!showAddEndorsement)} className="text-brandMint hover:text-emerald-400 text-sm font-bold flex items-center gap-1">
                   <Plus size={16} /> Add Endorsement
                </button>
             </div>

             {showAddEndorsement && (
                <div className="bg-slate-900 rounded-xl p-4 space-y-4 mb-4">
                   <input
                      type="text"
                      placeholder="Endorser name"
                      value={newEndorsement.name}
                      onChange={(e) => setNewEndorsement({ ...newEndorsement, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brandMint outline-none"
                   />
                   <input
                      type="text"
                      placeholder="Skill being endorsed"
                      value={newEndorsement.skill}
                      onChange={(e) => setNewEndorsement({ ...newEndorsement, skill: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brandMint outline-none"
                   />
                   <textarea
                      placeholder="Endorsement message"
                      value={newEndorsement.message}
                      onChange={(e) => setNewEndorsement({ ...newEndorsement, message: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brandMint outline-none h-20 resize-none"
                   />
                   <button
                      onClick={() => { handleAddEndorsement(newEndorsement); setNewEndorsement({ name: '', skill: '', message: '' }); setShowAddEndorsement(false); }}
                      className="px-4 py-2 bg-brandMint text-corporateNavy font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                   >
                      Add Endorsement
                   </button>
                </div>
             )}

             <div className="space-y-3">
                {(endorsements || []).map((endorsement, index) => (
                   <div key={index} className="bg-slate-900 rounded-xl p-4 flex items-start justify-between">
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-2">
                            <Star className="text-amber-400" size={16} fill="currentColor" />
                            <span className="font-bold text-white">{endorsement.name}</span>
                            <span className="text-slate-500 text-sm">endorsed</span>
                            <span className="text-brandMint font-bold">{endorsement.skill}</span>
                         </div>
                         <p className="text-slate-400 text-sm">{endorsement.message}</p>
                      </div>
                      <button onClick={() => handleRemoveEndorsement(index)} className="text-slate-500 hover:text-red-400 transition-colors">
                         <Trash2 size={16} />
                      </button>
                   </div>
                ))}
                {(!endorsements || endorsements.length === 0) && (
                   <p className="text-slate-500 text-sm italic">No endorsements yet</p>
                )}
             </div>
          </div>
       </div>

       {/* PORTFOLIO SECTION */}
       <div className="bg-corporateNavy border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
             <h4 className="font-black text-lg flex items-center gap-2">
                <Briefcase className="text-brandMint" size={20} />
                Portfolio
             </h4>
             <button onClick={() => setShowAddPortfolio(!showAddPortfolio)} className="text-brandMint hover:text-emerald-400 text-sm font-bold flex items-center gap-1">
                <Plus size={16} /> Add Item
             </button>
          </div>

          {showAddPortfolio && (
             <div className="bg-slate-900 rounded-xl p-4 space-y-4">
                <input
                   type="text"
                   placeholder="Project/Experience title"
                   value={newPortfolioItem.title}
                   onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })}
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brandMint outline-none"
                />
                <textarea
                   placeholder="Description"
                   value={newPortfolioItem.description}
                   onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })}
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brandMint outline-none h-24 resize-none"
                />
                <select
                   value={newPortfolioItem.type}
                   onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, type: e.target.value })}
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brandMint outline-none"
                >
                   <option value="project">Project</option>
                   <option value="experience">Work Experience</option>
                   <option value="certification">Certification</option>
                   <option value="achievement">Achievement</option>
                </select>
                <input
                   type="url"
                   placeholder="Link (optional)"
                   value={newPortfolioItem.link}
                   onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, link: e.target.value })}
                   className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brandMint outline-none"
                />
                <button
                   onClick={() => { handleAddPortfolioItem(newPortfolioItem); setNewPortfolioItem({ title: '', description: '', type: 'project', link: '' }); setShowAddPortfolio(false); }}
                   className="px-4 py-2 bg-brandMint text-corporateNavy font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                >
                   Add to Portfolio
                </button>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {(portfolioItems || []).map((item, index) => (
                <div key={index} className="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-brandMint/30 transition-colors">
                   <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                         {item.type === 'project' && <Briefcase className="text-blue-400" size={18} />}
                         {item.type === 'experience' && <Briefcase className="text-purple-400" size={18} />}
                         {item.type === 'certification' && <GraduationCap className="text-amber-400" size={18} />}
                         {item.type === 'achievement' && <Award className="text-brandMint" size={18} />}
                         <span className="font-bold text-white">{item.title}</span>
                      </div>
                      <button onClick={() => handleRemovePortfolioItem(index)} className="text-slate-500 hover:text-red-400 transition-colors">
                         <Trash2 size={16} />
                      </button>
                   </div>
                   <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                   {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-brandMint text-sm hover:underline flex items-center gap-1">
                         View Link <span className="text-xs">↗</span>
                      </a>
                   )}
                </div>
             ))}
             {(!portfolioItems || portfolioItems.length === 0) && (
                <div className="col-span-full text-center py-8">
                   <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                   <p className="text-slate-500 font-mono text-sm">No portfolio items yet</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default DriverProfileTab;
