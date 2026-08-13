import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, UserPlus, CheckCircle, ChevronRight, Loader2, AlertTriangle, FileCheck } from 'lucide-react';

function DriverOnboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: '',
    lastName: '',
    dob: '',
    address: '',
    avatar: null,
    // Step 2: Documents
    licenseNumber: '',
    licenseExpiry: '',
    licenseFront: null,
    licenseBack: null,
    policeClearance: null,
    // Step 3: Guarantors
    g1Name: '',
    g1Phone: '',
    g1Relationship: '',
    g1ID: null,
    g2Name: '',
    g2Phone: '',
    g2Relationship: '',
    g2ID: null,
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call & sending automated SMS/Email to guarantors
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-brandMint/30 p-8 rounded-2xl">
          <div className="w-20 h-20 bg-brandMint/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-brandMint" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Clearance Submitted</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Your application is under review. We have dispatched automated SMS and email verification requests to both of your guarantors. 
          </p>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl mb-6 flex gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              You will not appear in the employer directory until your guarantors confirm your identity and our Admin team verifies your FRSC license.
            </p>
          </div>
          <button 
            onClick={() => navigate('/driver')}
            className="w-full bg-brandMint text-corporateNavy font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      {/* Header */}
      <div className="max-w-3xl w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brandMint rounded flex items-center justify-center">
            <ShieldCheck className="text-corporateNavy w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-none">OgaDriver<br/><span className="text-brandMint text-[10px] font-mono uppercase tracking-widest">Operative Vetting</span></h1>
        </div>
        
        {/* Progress Tracker */}
        <div className="flex items-center gap-2 text-xs font-bold font-mono">
          <span className={`px-2 py-1 rounded ${step >= 1 ? 'bg-brandMint text-corporateNavy' : 'bg-slate-800 text-slate-500'}`}>1. IDENTITY</span>
          <div className={`w-4 h-[1px] ${step >= 2 ? 'bg-brandMint' : 'bg-slate-800'}`}></div>
          <span className={`px-2 py-1 rounded ${step >= 2 ? 'bg-brandMint text-corporateNavy' : 'bg-slate-800 text-slate-500'}`}>2. CLEARANCE</span>
          <div className={`w-4 h-[1px] ${step >= 3 ? 'bg-brandMint' : 'bg-slate-800'}`}></div>
          <span className={`px-2 py-1 rounded ${step >= 3 ? 'bg-brandMint text-corporateNavy' : 'bg-slate-800 text-slate-500'}`}>3. GUARANTORS</span>
        </div>
      </div>

      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="p-8">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-xl font-bold text-white">Personal Identity</h2>
                <p className="text-sm text-slate-400">Provide your basic information and a clear headshot.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">First Name</label>
                  <input type="text" required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors" placeholder="Enter your first name" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Last Name</label>
                  <input type="text" required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors" placeholder="Enter your last name" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Date of Birth</label>
                  <input type="date" required name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Clear Headshot</label>
                  <div className="relative">
                    <input type="file" required accept="image/*" name="avatar" onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-full bg-slate-950 border border-slate-800 border-dashed rounded-xl px-4 py-3 text-slate-400 flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" /> {formData.avatar ? formData.avatar.name : 'Upload Photo'}
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Residential Address</label>
                  <input type="text" required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors" placeholder="Enter your residential address" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-xl font-bold text-white">Licensing & Security Clearance</h2>
                <p className="text-sm text-slate-400">Upload your valid FRSC Driver's License and optional Police Clearance.</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">FRSC License Number</label>
                  <input type="text" required name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors" placeholder="Enter your FRSC license number" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Expiry Date</label>
                  <input type="date" required name="licenseExpiry" value={formData.licenseExpiry} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brandMint transition-colors" />
                </div>
                
                <div className="col-span-2 p-6 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brandMint mb-2">License (Front)</label>
                      <div className="relative">
                        <input type="file" required accept="image/*,.pdf" name="licenseFront" onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="w-full bg-slate-900 border border-slate-700 border-dashed rounded-xl h-24 flex flex-col items-center justify-center text-slate-400 gap-1 hover:border-brandMint hover:text-brandMint transition-colors">
                          <FileCheck className="w-6 h-6" />
                          <span className="text-xs">{formData.licenseFront ? formData.licenseFront.name : 'Upload Front'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-brandMint mb-2">License (Back)</label>
                      <div className="relative">
                        <input type="file" required accept="image/*,.pdf" name="licenseBack" onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="w-full bg-slate-900 border border-slate-700 border-dashed rounded-xl h-24 flex flex-col items-center justify-center text-slate-400 gap-1 hover:border-brandMint hover:text-brandMint transition-colors">
                          <FileCheck className="w-6 h-6" />
                          <span className="text-xs">{formData.licenseBack ? formData.licenseBack.name : 'Upload Back'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Police Clearance Certificate (Optional)</label>
                  <div className="relative">
                    <input type="file" accept="image/*,.pdf" name="policeClearance" onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-full bg-slate-950 border border-slate-800 border-dashed rounded-xl px-4 py-3 text-slate-400 flex items-center justify-center gap-2 hover:border-brandMint">
                      <Upload className="w-4 h-4" /> {formData.policeClearance ? formData.policeClearance.name : 'Upload Certificate (Boosts Ranking)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><UserPlus className="text-brandMint w-6 h-6" /> Guarantor Sign-off</h2>
                <p className="text-sm text-slate-400 mt-1">To activate your profile, we require 2 guarantors. We will automatically contact them via SMS to verify their relationship with you.</p>
              </div>

              {/* Guarantor 1 */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl relative">
                <span className="absolute -top-3 left-4 bg-brandMint text-corporateNavy px-2 py-0.5 text-xs font-black uppercase tracking-wider rounded">Guarantor #1</span>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <input type="text" required placeholder="Enter guarantor's full name" name="g1Name" value={formData.g1Name} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brandMint outline-none" />
                  </div>
                  <div>
                    <input type="tel" required placeholder="Enter phone number" name="g1Phone" value={formData.g1Phone} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brandMint outline-none" />
                  </div>
                  <div>
                    <input type="text" required placeholder="Enter relationship" name="g1Relationship" value={formData.g1Relationship} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brandMint outline-none" />
                  </div>
                  <div className="relative">
                    <input type="file" required accept="image/*,.pdf" name="g1ID" onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-full bg-slate-900 border border-slate-700 border-dashed rounded-lg px-3 py-2 text-sm text-slate-400 text-center truncate">
                      {formData.g1ID ? formData.g1ID.name : 'Upload Guarantor ID'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantor 2 */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl relative">
                <span className="absolute -top-3 left-4 bg-brandMint text-corporateNavy px-2 py-0.5 text-xs font-black uppercase tracking-wider rounded">Guarantor #2</span>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <input type="text" required placeholder="Enter guarantor's full name" name="g2Name" value={formData.g2Name} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brandMint outline-none" />
                  </div>
                  <div>
                    <input type="tel" required placeholder="Enter phone number" name="g2Phone" value={formData.g2Phone} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brandMint outline-none" />
                  </div>
                  <div>
                    <input type="text" required placeholder="Enter relationship" name="g2Relationship" value={formData.g2Relationship} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brandMint outline-none" />
                  </div>
                  <div className="relative">
                    <input type="file" required accept="image/*,.pdf" name="g2ID" onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-full bg-slate-900 border border-slate-700 border-dashed rounded-lg px-3 py-2 text-sm text-slate-400 text-center truncate">
                      {formData.g2ID ? formData.g2ID.name : 'Upload Guarantor ID'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors">
                Back
              </button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button type="submit" className="flex items-center gap-2 bg-brandMint text-corporateNavy px-6 py-3 rounded-xl font-black uppercase tracking-wider hover:bg-emerald-400 transition-colors">
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-brandMint text-corporateNavy px-8 py-3 rounded-xl font-black uppercase tracking-wider hover:bg-emerald-400 transition-colors disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit for Verification'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default DriverOnboarding;
