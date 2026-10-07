import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../api/admin';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { 
    ArrowLeft, 
    Save, 
    ShieldCheck, 
    AlertTriangle,
    Loader2
} from 'lucide-react';

const DriverEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        license_number: '',
        license_class: '',
        license_expiry: '',
        years_of_experience: 0,
        preferred_route_type: 'both',
        gender: '',
        date_of_birth: '',
        guarantor_a_status: 'pending',
        guarantor_b_status: 'pending'
    });
    
    const [userName, setUserName] = useState('');

    useEffect(() => {
        adminService.getDriverDetails(id)
        .then(response => {
            const d = response.data;
            setUserName(d.user?.name || 'Driver');
            
            // Format date to YYYY-MM-DD for input[type="date"]
            const formattedDate = d.license_expiry ? new Date(d.license_expiry).toISOString().split('T')[0] : '';
            
            setFormData({
                license_number: d.license_number || '',
                license_class: d.license_class || '',
                license_expiry: formattedDate,
                years_of_experience: d.years_of_experience || 0,
                preferred_route_type: d.preferred_route_type || 'both',
                gender: d.user?.gender || '',
                date_of_birth: d.user?.date_of_birth || '',
                guarantor_a_status: d.guarantor_a_status || 'pending',
                guarantor_b_status: d.guarantor_b_status || 'pending'
            });
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setError('Failed to load driver details.');
            setLoading(false);
        });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        adminService.updateDriver(id, formData)
        .then(response => {
            setSuccess(true);
            setSaving(false);
            setTimeout(() => navigate(`/admin/drivers/${id}`), 1500);
        })
        .catch(err => {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save changes.');
            setSaving(false);
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-brandMint animate-spin" />
                <div className="text-brandMint font-mono text-sm tracking-widest animate-pulse">INITIALIZING EDIT PROTOCOL...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col lg:ml-0">
                <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 bg-slate-950 text-white font-sans p-6 lg:p-12 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-8">
                        
                        {/* Header Actions */}
                        <div className="flex items-center justify-between">
                            <Link to={`/admin/drivers/${id}`} className="flex items-center gap-2 text-slate-400 hover:text-brandMint transition-colors font-mono text-sm">
                                <ArrowLeft className="w-4 h-4" /> BACK TO PROFILE
                            </Link>
                        </div>

                        {/* Edit Form Card */}
                        <div className="bg-corporateNavy border border-slate-800 rounded-2xl p-8 relative shadow-2xl">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brandMint via-emerald-400 to-brandMint"></div>
                            
                            <div className="mb-8 border-b border-slate-800 pb-6">
                                <h1 className="text-2xl font-black tracking-tight text-white uppercase">
                                    Edit Clearance: <span className="text-brandMint">{userName}</span>
                                </h1>
                                <p className="text-sm text-slate-400 mt-2">Modify the driver's federal licensing parameters and active operational routes.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-500">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="text-sm font-semibold">{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg flex items-center gap-3 text-emerald-400">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="text-sm font-semibold">Changes synced successfully to the sovereign grid! Redirecting...</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-slate-400 uppercase">FRSC License Number</label>
                                        <input 
                                            type="text" 
                                            name="license_number" 
                                            value={formData.license_number}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-slate-400 uppercase">License Class</label>
                                        <select 
                                            name="license_class" 
                                            value={formData.license_class}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors appearance-none"
                                        >
                                            <option value="">Select Class</option>
                                            <option value="A">Class A (Motorcycles)</option>
                                            <option value="B">Class B (Vehicles up to 3 tonnes)</option>
                                            <option value="C">Class C (Vehicles above 3 tonnes)</option>
                                            <option value="D">Class D (Articulated Vehicles)</option>
                                            <option value="E">Class E (Commercial Vehicles)</option>
                                            <option value="G">Class G (Heavy Duty/Special)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-slate-400 uppercase">License Expiry Date</label>
                                        <input 
                                            type="date" 
                                            name="license_expiry" 
                                            value={formData.license_expiry}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-slate-400 uppercase">Years of Experience</label>
                                        <input 
                                            type="number" 
                                            name="years_of_experience" 
                                            min="0"
                                            value={formData.years_of_experience}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-mono text-slate-400 uppercase">Preferred Route Type</label>
                                        <select 
                                            name="preferred_route_type" 
                                            value={formData.preferred_route_type}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors appearance-none"
                                        >
                                            <option value="short_haul">Short Haul (Intra-city)</option>
                                            <option value="long_haul">Long Haul (Inter-city)</option>
                                            <option value="both">Both (Flexible)</option>
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-slate-400 uppercase">Gender</label>
                                        <select 
                                            name="gender" 
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors appearance-none"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-slate-400 uppercase">Date of Birth</label>
                                        <input 
                                            type="date" 
                                            name="date_of_birth" 
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-slate-400 uppercase">Guarantor A Verification</label>
                                        <select 
                                            name="guarantor_a_status" 
                                            value={formData.guarantor_a_status}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors appearance-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="verified">Verified</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono text-slate-400 uppercase">Guarantor B Verification</label>
                                        <select 
                                            name="guarantor_b_status" 
                                            value={formData.guarantor_b_status}
                                            onChange={handleChange}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-colors appearance-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="verified">Verified</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>

                                </div>

                                <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
                                    <Link to={`/admin/drivers/${id}`} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-colors">
                                        Cancel
                                    </Link>
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="flex items-center gap-2 px-8 py-3 bg-brandMint hover:bg-emerald-400 text-corporateNavy rounded-lg font-black text-sm transition-all shadow-lg shadow-brandMint/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        SAVE CHANGES
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default DriverEdit;
