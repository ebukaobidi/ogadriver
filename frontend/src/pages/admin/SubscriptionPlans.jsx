import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import {
  Menu,
  ShieldCheck,
  Plus,
  Check,
  Edit2,
  Trash2,
  Users,
  X,
  Loader2,
  Phone
} from 'lucide-react';
import { adminService } from '../../api/admin';

function SubscriptionPlans() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('employer');
  
  // Settings State
  const [generalSettings, setGeneralSettings] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [customerCareNumbers, setCustomerCareNumbers] = useState(['', '']);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: 'Monthly',
    limits: '',
    status: 'active',
    isPopular: false,
    features: ['']
  });

  useEffect(() => {
    loadPlans();
    loadSettings();
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      const response = await adminService.getGeneralSettings();
      if (response.status === 'success') {
        setGeneralSettings(response.data);
        if (response.data.customerCareNumbers) {
          setCustomerCareNumbers(response.data.customerCareNumbers);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSubscriptionPlans(activeTab);
      if (response.status === 'success') {
        setPlans(response.data);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        price: plan.price,
        period: plan.period,
        limits: plan.limits || '',
        status: plan.status,
        isPopular: plan.isPopular,
        features: plan.features && plan.features.length ? plan.features : ['']
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        price: '',
        period: 'Monthly',
        limits: '',
        status: 'active',
        isPopular: false,
        features: ['']
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeatureRow = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeatureRow = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Clean up empty features
      const cleanedData = {
        ...formData,
        target_role: activeTab,
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (editingPlan) {
        await adminService.updateSubscriptionPlan(editingPlan.id, cleanedData);
      } else {
        await adminService.createSubscriptionPlan(cleanedData);
      }
      await loadPlans();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('Failed to save plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      try {
        await adminService.deleteSubscriptionPlan(id);
        await loadPlans();
      } catch (error) {
        console.error('Failed to delete plan:', error);
        alert('Failed to delete plan.');
      }
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updateGeneralSettings({ customerCareNumbers: customerCareNumbers.filter(n => n.trim() !== '') });
      await loadSettings();
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
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
            <h1 className="text-xl font-bold text-white hidden sm:block">Tier Configuration</h1>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <ShieldCheck className="text-brandMint" /> Plan Configurations
              </h1>
              <p className="text-slate-400 mt-1">Configure pricing and access tiers for your platform users.</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 bg-brandMint text-corporateNavy hover:bg-emerald-400 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors shrink-0"
            >
              <Plus size={18} /> Add New Tier
            </button>
          </div>

          <div className="mb-8 bg-gradient-to-r from-corporateNavy to-slate-900 border border-brandMint/20 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-brandMint/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <Phone className="text-brandMint" size={20} />
                Global Customer Care Numbers
              </h3>
              <p className="text-slate-400 text-sm max-w-xl">
                These hotlines are actively displayed on the frontend widget for users seeking immediate assistance with their subscriptions or onboarding.
              </p>
              <div className="flex flex-wrap gap-4 mt-5">
                {(generalSettings?.customerCareNumbers || ['+234 (0) 800 000 0000', '+234 (0) 800 000 0001']).map((num, idx) => (
                  <div key={idx} className="bg-slate-950/80 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-slate-800 font-mono text-brandMint font-black shadow-inner flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brandMint animate-pulse"></span>
                    {num}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-10 shrink-0">
              <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:text-white hover:border-slate-500 shadow-md"
              >
                <Edit2 size={16} /> Manage Numbers
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b border-slate-800 mb-8 pb-2">
            <button 
              onClick={() => setActiveTab('employer')}
              className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'employer' ? 'border-brandMint text-brandMint' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Employer Tiers
            </button>
            <button 
              onClick={() => setActiveTab('operative')}
              className={`pb-2 px-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'operative' ? 'border-brandMint text-brandMint' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              Operative Tiers
            </button>
          </div>

          {plans.length === 0 && !loading && (
            <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
              <ShieldCheck className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Plans Configured</h3>
              <p className="text-slate-400">Click "Add New Tier" to create your first subscription plan.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className={`bg-slate-900 border rounded-2xl p-6 relative flex flex-col ${
                plan.isPopular ? 'border-brandMint shadow-[0_0_30px_rgba(28,209,136,0.1)]' : 'border-slate-800'
              }`}>
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-brandMint text-corporateNavy text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-brandMint">{plan.price}</span>
                    <span className="text-sm text-slate-500 font-bold uppercase">/{plan.period}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <Users className="text-blue-400" size={16} />
                    <span className="text-sm font-bold text-slate-300">Limit: {plan.limits || 'None'}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <ul className="space-y-3">
                    {plan.features && plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1 p-0.5 bg-brandMint/10 rounded-full">
                          <Check className="text-brandMint" size={12} />
                        </div>
                        <span className="text-sm text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2 py-1 rounded uppercase font-bold tracking-widest ${
                    plan.status === 'active' ? 'bg-brandMint/10 text-brandMint border border-brandMint/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {plan.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(plan)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 text-red-500 hover:text-white bg-red-500/10 border border-red-500/20 hover:bg-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </main>
      </div>

      {/* Subscription Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-black text-white">
                {editingPlan ? `Edit ${activeTab === 'employer' ? 'Employer' : 'Operative'} Tier` : `Create New ${activeTab === 'employer' ? 'Employer' : 'Operative'} Tier`}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="planForm" onSubmit={handleSave} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Plan Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors"
                      placeholder="e.g. Premium Access"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price Label</label>
                    <input 
                      type="text" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors"
                      placeholder="e.g. ₦25,000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Period</label>
                    <select 
                      value={formData.period}
                      onChange={(e) => setFormData({...formData, period: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                      <option value="One-Time">One-Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Operative Limits</label>
                    <input 
                      type="text" 
                      value={formData.limits}
                      onChange={(e) => setFormData({...formData, limits: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors"
                      placeholder="e.g. 5 Operatives or Unlimited"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={formData.isPopular}
                          onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                          className="sr-only"
                        />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${formData.isPopular ? 'bg-brandMint' : 'bg-slate-800'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.isPopular ? 'transform translate-x-6' : ''}`}></div>
                      </div>
                      <span className="text-sm font-bold text-white uppercase tracking-wider">Highlight as "Most Popular"</span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Features</label>
                    <button 
                      type="button"
                      onClick={addFeatureRow}
                      className="text-brandMint text-xs font-bold uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Feature
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="mt-1 p-1 bg-slate-800 rounded-full shrink-0">
                          <Check className="text-slate-400" size={14} />
                        </div>
                        <input 
                          type="text" 
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brandMint transition-colors"
                          placeholder="Enter feature description..."
                        />
                        {formData.features.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeFeatureRow(index)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4 shrink-0">
              <button 
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="planForm"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-brandMint text-corporateNavy hover:bg-emerald-400 transition-colors flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={18} />}
                {editingPlan ? 'Save Changes' : 'Create Tier'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Phone className="text-brandMint" size={20} /> Manage Contact Numbers
              </h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="settingsForm" onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Support Number</label>
                  <input 
                    type="text" 
                    value={customerCareNumbers[0] || ''}
                    onChange={(e) => {
                      const newNums = [...customerCareNumbers];
                      newNums[0] = e.target.value;
                      setCustomerCareNumbers(newNums);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors"
                    placeholder="+234 (0) 800 000 0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secondary Support Number</label>
                  <input 
                    type="text" 
                    value={customerCareNumbers[1] || ''}
                    onChange={(e) => {
                      const newNums = [...customerCareNumbers];
                      newNums[1] = e.target.value;
                      setCustomerCareNumbers(newNums);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors"
                    placeholder="+234 (0) 800 000 0001"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4 shrink-0">
              <button 
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="settingsForm"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-brandMint text-corporateNavy hover:bg-emerald-400 transition-colors flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={18} />}
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SubscriptionPlans;
