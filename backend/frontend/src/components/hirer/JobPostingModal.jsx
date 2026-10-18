import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Car, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const JobPostingModal = ({ isOpen, onClose, onSubmit, loading, userProfile }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pickup_address: '',
    pickup_latitude: '',
    pickup_longitude: '',
    dropoff_address: '',
    dropoff_latitude: '',
    dropoff_longitude: '',
    start_date: '',
    end_date: '',
    proposed_salary: '',
    employment_type: 'full_time',
    vehicle_type_required: 'standard',
    required_license_class: 'B',
    accommodation_provided: false,
    accommodation_details: '',
  });

  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.pickup_address.trim()) newErrors.pickup_address = 'Pickup address is required';
    if (!formData.dropoff_address.trim()) newErrors.dropoff_address = 'Dropoff address is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.proposed_salary) newErrors.proposed_salary = 'Salary is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setFormData(prev => ({
          ...prev,
          pickup_latitude: position.coords.latitude.toString(),
          pickup_longitude: position.coords.longitude.toString()
        }));
      }
    } catch (err) {
      console.error('Geolocation error:', err);
    } finally {
      setLocationLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Post Transport Job</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-brandMint text-sm uppercase tracking-wider">Job Details</h3>
            
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Job Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Personal Driver for Daily Commute"
                className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all ${errors.title ? 'border-red-500' : 'border-slate-700'}`}
              />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Job Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job requirements, schedule, and expectations..."
                rows={4}
                className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all resize-none ${errors.description ? 'border-red-500' : 'border-slate-700'}`}
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-brandMint text-sm uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location Details
            </h3>
            
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Pickup Address</label>
              <input
                type="text"
                name="pickup_address"
                value={formData.pickup_address}
                onChange={handleChange}
                placeholder="Enter pickup location"
                className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all ${errors.pickup_address ? 'border-red-500' : 'border-slate-700'}`}
              />
              {errors.pickup_address && <p className="text-xs text-red-400 mt-1">{errors.pickup_address}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                Use Current Location
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Dropoff Address</label>
              <input
                type="text"
                name="dropoff_address"
                value={formData.dropoff_address}
                onChange={handleChange}
                placeholder="Enter destination"
                className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all ${errors.dropoff_address ? 'border-red-500' : 'border-slate-700'}`}
              />
              {errors.dropoff_address && <p className="text-xs text-red-400 mt-1">{errors.dropoff_address}</p>}
            </div>
          </div>

          {/* Schedule & Compensation */}
          <div className="space-y-4">
            <h3 className="font-bold text-brandMint text-sm uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule & Compensation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all ${errors.start_date ? 'border-red-500' : 'border-slate-700'}`}
                />
                {errors.start_date && <p className="text-xs text-red-400 mt-1">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Proposed Monthly Salary (₦)</label>
              <input
                type="number"
                name="proposed_salary"
                value={formData.proposed_salary}
                onChange={handleChange}
                placeholder="e.g., 150000"
                className={`w-full px-4 py-3 bg-slate-950 border rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all ${errors.proposed_salary ? 'border-red-500' : 'border-slate-700'}`}
              />
              {errors.proposed_salary && <p className="text-xs text-red-400 mt-1">{errors.proposed_salary}</p>}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="font-bold text-brandMint text-sm uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Requirements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 p-4 border border-slate-700 rounded-xl cursor-pointer hover:border-brandMint transition-colors bg-slate-950">
                  <input
                    type="checkbox"
                    name="driver_must_provide_vehicle"
                    checked={formData.driver_must_provide_vehicle || false}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-700 text-brandMint focus:ring-brandMint focus:ring-offset-slate-900 bg-slate-800"
                  />
                  <div>
                    <span className="text-sm font-bold text-white block">Driver Must Provide Own Vehicle</span>
                    <span className="text-xs text-slate-400">Select this if you want to hire a driver who brings their own vehicle.</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Number of Drivers Required</label>
                <input
                  type="number"
                  name="required_operatives"
                  value={formData.required_operatives}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brandMint transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brandMint transition-all"
                >
                  <option value="direct_transfer">Direct Transfer (To Driver)</option>
                  <option value="cash">Cash Payment</option>
                  <option value="escrow">Secure Escrow (For Deliveries)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Employment Type</label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
                >
                  <option value="full_time">Full-Time</option>
                  <option value="part_time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Vehicle Type Required</label>
                <select
                  name="vehicle_type_required"
                  value={formData.vehicle_type_required}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
                >
                  <option value="standard">Standard Sedan</option>
                  <option value="executive">Executive/Luxury</option>
                  <option value="suv">SUV</option>
                  <option value="van">Delivery Van</option>
                  <option value="bus">Bus</option>
                  <option value="any">Any Vehicle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Required License Class</label>
                <select
                  name="required_license_class"
                  value={formData.required_license_class}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all"
                >
                  <option value="B">Class B (Car/Minibus)</option>
                  <option value="C">Class C (Commercial Van)</option>
                  <option value="D">Class D (Bus)</option>
                  <option value="E">Class E (Executive/VIP)</option>
                  <option value="G">Class G (Heavy Duty)</option>
                  <option value="any">Any Class</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <input
                type="checkbox"
                name="accommodation_provided"
                checked={formData.accommodation_provided}
                onChange={handleChange}
                className="mt-1 w-5 h-5 rounded border-slate-600 text-brandMint focus:ring-brandMint focus:ring-offset-slate-900 bg-slate-800"
              />
              <div className="flex-1">
                <label className="block text-sm font-bold text-white mb-1">Accommodation Provided</label>
                <p className="text-xs text-slate-400">Check if you can provide accommodation for the driver</p>
              </div>
            </div>

            {formData.accommodation_provided && (
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Accommodation Details</label>
                <textarea
                  name="accommodation_details"
                  value={formData.accommodation_details}
                  onChange={handleChange}
                  placeholder="Describe the accommodation (e.g., single room, shared accommodation, meals included, etc.)"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-brandMint focus:ring-1 focus:ring-brandMint transition-all resize-none"
                />
              </div>
            )}
          </div>

          {/* Subscription Warning */}
          {userProfile?.hirer?.subscription_tier && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-400 text-sm">Your Tier: {userProfile.hirer.subscription_tier}</p>
                  <p className="text-xs text-amber-400/80 mt-1">
                    {userProfile.hirer.subscription_tier === 'employer_hybrid' 
                      ? 'You can access Hybrid (premium) drivers only.'
                      : 'You can access standard drivers. Upgrade to Hybrid tier for premium drivers.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-slate-300 hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-brandMint text-corporateNavy rounded-xl font-black uppercase tracking-wider hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingModal;
