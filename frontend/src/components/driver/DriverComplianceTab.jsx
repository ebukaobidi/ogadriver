import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck,
  CheckCircle2,
  Lock,
  Loader2,
  Upload,
  UserCheck,
  ShieldCheck,
  User,
  Printer,
  Camera,
  X,
  Video,
  ChevronRight,
  Circle
} from 'lucide-react';
import { authService } from '../../api/auth';
import { driverService } from '../../api/drivers';
import api from '../../api/axios';

const DriverComplianceTab = ({ 
  driver,
  user, 
  vettingStep, 
  setVettingStep, 
  kycData, 
  setKycData, 
  uploadedFiles, 
  handleFileUpload, 
  handleSaveKyc, 
  processingId,
  handlePrintGuarantorForm
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentCameraType, setCurrentCameraType] = useState(null); // 'guarantorA_selfie' or 'guarantorB_selfie'
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const guarantorAUnlocked = driver?.guarantor_a_status === 'verified';
  const guarantorAStatus = driver?.guarantor_a_status;
  const guarantorBUnlocked = driver?.guarantor_b_status === 'verified';
  const guarantorBStatus = driver?.guarantor_b_status;

  // Calculate overall progress
  const calculateProgress = () => {
    let completed = 0;
    let total = 3;
    
    if (uploadedFiles.licenseFront && uploadedFiles.licenseBack && uploadedFiles.lasdriCard) completed++;
    if (guarantorAStatus === 'verified') completed++;
    if (guarantorBStatus === 'verified') completed++;
    
    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress();

  const openCamera = (type) => {
    setCurrentCameraType(type);
    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    setCurrentCameraType(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          streamRef.current = stream;
          videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error('Camera access denied:', err);
          alert('Unable to access camera. Please check permissions or use file upload instead.');
          closeCamera();
        });
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  const capturePhoto = async () => {
    if (videoRef.current) {
      setIsCapturing(true);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            // Create a file input element programmatically
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.jpg,.jpeg,.png';
            
            // Create a File object from the blob
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            
            // Create a DataTransfer to set the file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            
            // Manually trigger the file upload logic
            let currentUser = authService.getUser();
            
            if (currentUser && currentUser.role === 'driver' && !currentUser.driver_id) {
              try {
                const res = await api.get(`/auth/me`);
                if (res.data.user) {
                  currentUser = res.data.user;
                  localStorage.setItem('user', JSON.stringify(currentUser));
                }
              } catch(e) {
                console.error("Failed to refresh user data", e);
                alert('Failed to get your driver ID. Please log out and log in again.');
                setIsCapturing(false);
                return;
              }
            }
            
            if (!currentUser || !currentUser.driver_id) {
              alert('Driver ID not found. Please log out and log in again.');
              setIsCapturing(false);
              return;
            }
            
            const formData = new FormData();
            formData.append('file', file);
            const docMap = {
              'guarantorA_selfie': 'guarantor_form_a',
              'guarantorB_selfie': 'guarantor_form_b'
            };
            formData.append('document_type', docMap[currentCameraType] || 'guarantor_form_a');
            formData.append('expiry_date', new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]);
            
            await driverService.uploadDocument(currentUser.driver_id, formData);
            
            // Update the uploaded files state through the parent
            // We need to call the parent's setUploadedFiles
            // Since we don't have direct access, we'll rely on the parent to reload
            alert('Selfie captured and uploaded successfully!');
            closeCamera();
            
            // Trigger a page reload or data refresh
            window.location.reload();
          }
          setIsCapturing(false);
        }, 'image/jpeg');
      } catch (err) {
        console.error('Failed to capture photo:', err);
        alert('Failed to capture photo. Please try again or use file upload.');
        setIsCapturing(false);
      }
    }
  };
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Take Selfie</h3>
              <button 
                onClick={closeCamera}
                className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-red-500/20 border border-red-500/50 rounded-full px-4 py-2 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-bold">REC</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={capturePhoto}
                className="flex-1 bg-brandMint text-corporateNavy py-3 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture Photo
              </button>
              <button
                onClick={closeCamera}
                className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 border-b border-slate-800 pb-4">
        <h3 className="text-2xl font-black text-white">Vetting & Compliance Portal</h3>
        <p className="text-slate-400 text-sm">Complete your mandatory background checks to activate your system badge.</p>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="font-bold text-white">Overall Verification Progress</h4>
            <p className="text-xs text-slate-400">Complete all steps to unlock full platform access</p>
          </div>
          <span className="text-2xl font-black text-brandMint">{progress}%</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brandMint to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full w-full bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Primary Docs</span>
          <span>Guarantor A</span>
          <span>Guarantor B</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Vetting Forms */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Enhanced Progress Tracker */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1">
                <div 
                  onClick={() => setVettingStep(1)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    vettingStep === 1 
                      ? 'bg-brandMint text-corporateNavy ring-4 ring-brandMint/30' 
                      : (uploadedFiles.licenseFront && uploadedFiles.licenseBack && uploadedFiles.lasdriCard)
                        ? 'bg-brandMint/20 text-brandMint border-2 border-brandMint'
                        : 'bg-slate-800 text-slate-500 border-2 border-slate-700'
                  }`}
                >
                  {uploadedFiles.licenseFront && uploadedFiles.licenseBack && uploadedFiles.lasdriCard ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span className="font-bold text-sm">1</span>
                  )}
                </div>
                <span className={`text-xs font-bold mt-2 ${vettingStep === 1 ? 'text-brandMint' : 'text-slate-400'}`}>Primary Docs</span>
              </div>

              {/* Connector */}
              <div className={`flex-1 h-1 mx-2 rounded-full ${guarantorAStatus === 'verified' ? 'bg-brandMint' : 'bg-slate-700'}`} />

              {/* Step 2 */}
              <div 
                onClick={() => uploadedFiles.licenseFront && uploadedFiles.licenseBack && setVettingStep(2)}
                className={`flex flex-col items-center flex-1 ${!uploadedFiles.licenseFront || !uploadedFiles.licenseBack ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  vettingStep === 2 
                    ? 'bg-brandMint text-corporateNavy ring-4 ring-brandMint/30' 
                    : guarantorAStatus === 'verified'
                      ? 'bg-brandMint/20 text-brandMint border-2 border-brandMint'
                      : guarantorAStatus === 'pending'
                        ? 'bg-amber-500/20 text-amber-500 border-2 border-amber-500 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border-2 border-slate-700'
                }`}>
                  {guarantorAStatus === 'verified' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : guarantorAStatus === 'pending' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="font-bold text-sm">2</span>
                  )}
                </div>
                <span className={`text-xs font-bold mt-2 ${vettingStep === 2 ? 'text-brandMint' : 'text-slate-400'}`}>Guarantor A</span>
              </div>

              {/* Connector */}
              <div className={`flex-1 h-1 mx-2 rounded-full ${guarantorBStatus === 'verified' ? 'bg-brandMint' : 'bg-slate-700'}`} />

              {/* Step 3 */}
              <div 
                onClick={() => guarantorAUnlocked && setVettingStep(3)}
                className={`flex flex-col items-center flex-1 ${!guarantorAUnlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  vettingStep === 3 
                    ? 'bg-brandMint text-corporateNavy ring-4 ring-brandMint/30' 
                    : guarantorBStatus === 'verified'
                      ? 'bg-brandMint/20 text-brandMint border-2 border-brandMint'
                      : guarantorBStatus === 'pending'
                        ? 'bg-amber-500/20 text-amber-500 border-2 border-amber-500 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border-2 border-slate-700'
                }`}>
                  {guarantorBStatus === 'verified' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : guarantorBStatus === 'pending' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="font-bold text-sm">3</span>
                  )}
                </div>
                <span className={`text-xs font-bold mt-2 ${vettingStep === 3 ? 'text-brandMint' : 'text-slate-400'}`}>Guarantor B</span>
              </div>
            </div>
          </div>

          {/* STEP 1: Personal Docs */}
          {vettingStep === 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-lg text-white flex items-center gap-2">
                    <UserCheck className="text-brandMint w-5 h-5" /> Mandatory Documents
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Upload your identification documents to proceed</p>
                </div>
                {uploadedFiles.licenseFront && uploadedFiles.licenseBack && uploadedFiles.lasdriCard && (
                  <span className="bg-brandMint/10 text-brandMint px-3 py-1 rounded-full text-xs font-bold border border-brandMint/30">Validated</span>
                )}
              </div>

              {/* Step 1 Progress */}
              <div className="mb-6 bg-slate-950 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400">Document Upload Progress</span>
                  <span className="text-xs font-bold text-brandMint">
                    {[uploadedFiles.licenseFront, uploadedFiles.licenseBack, uploadedFiles.lasdriCard].filter(Boolean).length}/3
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="h-full bg-brandMint rounded-full transition-all duration-300"
                    style={{ width: `${([uploadedFiles.licenseFront, uploadedFiles.licenseBack, uploadedFiles.lasdriCard].filter(Boolean).length / 3) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* License Front */}
                <div 
                  onClick={() => handleFileUpload('licenseFront')}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${uploadedFiles.licenseFront ? 'bg-brandMint/10 border-brandMint/50' : 'border-slate-700 bg-slate-950 hover:border-brandMint'}`}
                >
                  {processingId === 'licenseFront' ? (
                    <Loader2 className="w-8 h-8 text-brandMint animate-spin mb-3" />
                  ) : uploadedFiles.licenseFront ? (
                    <CheckCircle2 className="w-8 h-8 text-brandMint mb-3" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-500 mb-3 group-hover:text-brandMint transition-colors" />
                  )}
                  <h5 className={`font-bold text-sm ${uploadedFiles.licenseFront ? 'text-brandMint' : 'text-slate-300'}`}>
                    {uploadedFiles.licenseFront ? 'Front Uploaded' : 'Driver\'s License (Front)'}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">Clear photo showing ID number</p>
                </div>

                {/* License Back */}
                <div 
                  onClick={() => handleFileUpload('licenseBack')}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${uploadedFiles.licenseBack ? 'bg-brandMint/10 border-brandMint/50' : 'border-slate-700 bg-slate-950 hover:border-brandMint'}`}
                >
                  {processingId === 'licenseBack' ? (
                    <Loader2 className="w-8 h-8 text-brandMint animate-spin mb-3" />
                  ) : uploadedFiles.licenseBack ? (
                    <CheckCircle2 className="w-8 h-8 text-brandMint mb-3" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-500 mb-3 group-hover:text-brandMint transition-colors" />
                  )}
                  <h5 className={`font-bold text-sm ${uploadedFiles.licenseBack ? 'text-brandMint' : 'text-slate-300'}`}>
                    {uploadedFiles.licenseBack ? 'Back Uploaded' : 'Driver\'s License (Back)'}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">Must show barcode clearly</p>
                </div>

                {/* LASDRI Card */}
                <div 
                  onClick={() => handleFileUpload('lasdriCard')}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all md:col-span-2 ${uploadedFiles.lasdriCard ? 'bg-brandMint/10 border-brandMint/50' : 'border-slate-700 bg-slate-950 hover:border-brandMint'}`}
                >
                  {processingId === 'lasdriCard' ? (
                    <Loader2 className="w-8 h-8 text-brandMint animate-spin mb-3" />
                  ) : uploadedFiles.lasdriCard ? (
                    <CheckCircle2 className="w-8 h-8 text-brandMint mb-3" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-500 mb-3 group-hover:text-brandMint transition-colors" />
                  )}
                  <h5 className={`font-bold text-sm ${uploadedFiles.lasdriCard ? 'text-brandMint' : 'text-slate-300'}`}>
                    {uploadedFiles.lasdriCard ? 'LASDRI Uploaded' : 'LASDRI Card (Lagos only)'}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">Required for commercial driving in Lagos State</p>
                </div>

              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setVettingStep(2)}
                  disabled={!uploadedFiles.licenseFront || !uploadedFiles.licenseBack}
                  className="bg-white text-corporateNavy px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Guarantor A
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Guarantor A */}
          {vettingStep === 2 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="text-brandMint w-5 h-5" /> Primary Guarantor Data
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Complete guarantor information and verification</p>
                </div>
                {guarantorAStatus === 'verified' && (
                  <span className="bg-brandMint/10 text-brandMint px-3 py-1 rounded-full text-xs font-bold border border-brandMint/30">Verified</span>
                )}
              </div>

              {/* Step 2 Progress */}
              <div className="mb-6 bg-slate-950 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400">Guarantor A Progress</span>
                  <span className="text-xs font-bold text-brandMint">
                    {[uploadedFiles.guaAForm, uploadedFiles.guarantorA_id, uploadedFiles.guarantorA_passport, uploadedFiles.guarantorA_selfie].filter(Boolean).length}/4
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="h-full bg-brandMint rounded-full transition-all duration-300"
                    style={{ width: `${([uploadedFiles.guaAForm, uploadedFiles.guarantorA_id, uploadedFiles.guarantorA_passport, uploadedFiles.guarantorA_selfie].filter(Boolean).length / 4) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs text-slate-400 uppercase font-bold tracking-widest">Guarantor Form Download & Verification</span>
                  {guarantorAStatus === 'verified' ? (
                    <span className="text-[10px] bg-brandMint/10 text-brandMint px-2 py-0.5 rounded uppercase font-bold border border-brandMint/30">Verified</span>
                  ) : guarantorAStatus === 'pending' ? (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase font-bold border border-amber-500/30 animate-pulse">Pending Admin Review</span>
                  ) : guarantorAStatus === 'failed' ? (
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded uppercase font-bold border border-red-500/30">Rejected - Resubmit</span>
                  ) : (
                    <span className="text-[10px] bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded uppercase font-bold border border-slate-500/30">Action Required</span>
                  )}
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => handlePrintGuarantorForm('A')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold py-3 px-4 rounded-xl text-slate-300 border border-slate-700 transition flex items-center justify-center gap-2"
                  >
                    <Printer size={16} /> Print/Download Physical Form A
                  </button>
                  
                  <div className="flex flex-col md:flex-row gap-4 border-t border-slate-800 pt-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-2">Upload Scanned Guarantor Form A</label>
                      <button
                        onClick={() => handleFileUpload('guaAForm')}
                        className={`w-full py-2 px-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all ${uploadedFiles.guaAForm ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-brandMint hover:text-brandMint'}`}
                      >
                        {processingId === 'guaAForm' ? <Loader2 className="w-4 h-4 animate-spin" /> : uploadedFiles.guaAForm ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        {uploadedFiles.guaAForm ? 'Form Uploaded' : 'Upload Form A'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Guarantor Name</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorA_name} 
                    onChange={e => setKycData({...kycData, guarantorA_name: e.target.value})}
                    placeholder="Full Legal Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Phone Number</label>
                  <input 
                    type="tel" 
                    value={kycData.guarantorA_phone} 
                    onChange={e => setKycData({...kycData, guarantorA_phone: e.target.value})}
                    placeholder="080..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Full Residential Address</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorA_address} 
                    onChange={e => setKycData({...kycData, guarantorA_address: e.target.value})}
                    placeholder="Street Address, City, State"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Occupation</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorA_occupation} 
                    onChange={e => setKycData({...kycData, guarantorA_occupation: e.target.value})}
                    placeholder="Job Title / Business"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Company / Office Name</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorA_company} 
                    onChange={e => setKycData({...kycData, guarantorA_company: e.target.value})}
                    placeholder="Employer or Business Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <h5 className="font-bold text-white mb-4">Guarantor Identity Verification</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => handleFileUpload('guarantorA_id')}
                    className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guarantorA_id ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-brandMint hover:text-brandMint'}`}
                  >
                    {processingId === 'guarantorA_id' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guarantorA_id ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                    <span className="font-bold text-sm">Upload Valid ID (NIN/Passport)</span>
                  </div>
                  <div 
                    onClick={() => handleFileUpload('guarantorA_passport')}
                    className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guarantorA_passport ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-brandMint hover:text-brandMint'}`}
                  >
                    {processingId === 'guarantorA_passport' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guarantorA_passport ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    <span className="font-bold text-sm">Upload Passport Photo</span>
                  </div>
                  <div className="border-2 border-dashed rounded-xl p-4 md:col-span-2">
                    <p className="font-bold text-sm text-white mb-3">Upload Selfie Holding Document</p>
                    <p className="text-xs text-slate-500 mb-3">Live selfie of guarantor holding the signed form</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openCamera('guarantorA_selfie')}
                        disabled={isCapturing || processingId === 'guarantorA_selfie'}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all ${uploadedFiles.guarantorA_selfie ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-brandMint hover:text-brandMint'} disabled:opacity-50`}
                      >
                        {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : uploadedFiles.guarantorA_selfie ? <CheckCircle2 className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        {uploadedFiles.guarantorA_selfie ? 'Selfie Captured' : 'Use Camera'}
                      </button>
                      <button
                        onClick={() => handleFileUpload('guarantorA_selfie')}
                        disabled={isCapturing || processingId === 'guarantorA_selfie'}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all ${uploadedFiles.guarantorA_selfie ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-brandMint hover:text-brandMint'} disabled:opacity-50`}
                      >
                        {processingId === 'guarantorA_selfie' ? <Loader2 className="w-4 h-4 animate-spin" /> : uploadedFiles.guarantorA_selfie ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        {uploadedFiles.guarantorA_selfie ? 'Selfie Uploaded' : 'Upload File'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button 
                  onClick={() => setVettingStep(1)}
                  className="text-slate-400 hover:text-white px-4 py-3 font-bold text-sm transition-colors"
                >
                  Back
                </button>
                  <button 
                  onClick={() => handleSaveKyc('A')}
                  disabled={processingId === 'verifyingA' || !kycData.guarantorA_name || !uploadedFiles.guarantorA_id}
                  className="bg-brandMint text-corporateNavy px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {processingId === 'verifyingA' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save & Proceed
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Guarantor B */}
          {vettingStep === 3 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="text-blue-500 w-5 h-5" /> Secondary Guarantor Data
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Complete secondary guarantor information and verification</p>
                </div>
                {guarantorBStatus === 'verified' && (
                  <span className="bg-brandMint/10 text-brandMint px-3 py-1 rounded-full text-xs font-bold border border-brandMint/30">Verified</span>
                )}
              </div>

              {/* Step 3 Progress */}
              <div className="mb-6 bg-slate-950 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400">Guarantor B Progress</span>
                  <span className="text-xs font-bold text-brandMint">
                    {[uploadedFiles.guaBForm, uploadedFiles.guarantorB_id, uploadedFiles.guarantorB_passport, uploadedFiles.guarantorB_selfie].filter(Boolean).length}/4
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="h-full bg-brandMint rounded-full transition-all duration-300"
                    style={{ width: `${([uploadedFiles.guaBForm, uploadedFiles.guarantorB_id, uploadedFiles.guarantorB_passport, uploadedFiles.guarantorB_selfie].filter(Boolean).length / 4) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs text-slate-400 uppercase font-bold tracking-widest">Guarantor Form Download & Verification</span>
                  {guarantorBStatus === 'verified' ? (
                    <span className="text-[10px] bg-brandMint/10 text-brandMint px-2 py-0.5 rounded uppercase font-bold border border-brandMint/30">Verified</span>
                  ) : guarantorBStatus === 'pending' ? (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded uppercase font-bold border border-amber-500/30 animate-pulse">Pending Admin Review</span>
                  ) : guarantorBStatus === 'failed' ? (
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded uppercase font-bold border border-red-500/30">Rejected - Resubmit</span>
                  ) : (
                    <span className="text-[10px] bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded uppercase font-bold border border-slate-500/30">Action Required</span>
                  )}
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => handlePrintGuarantorForm('B')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold py-3 px-4 rounded-xl text-slate-300 border border-slate-700 transition flex items-center justify-center gap-2"
                  >
                    <Printer size={16} /> Print/Download Physical Form B
                  </button>
                  
                  <div className="flex flex-col md:flex-row gap-4 border-t border-slate-800 pt-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-2">Upload Scanned Guarantor Form B</label>
                      <button
                        onClick={() => handleFileUpload('guaBForm')}
                        className={`w-full py-2 px-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all ${uploadedFiles.guaBForm ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-brandMint hover:text-brandMint'}`}
                      >
                        {processingId === 'guaBForm' ? <Loader2 className="w-4 h-4 animate-spin" /> : uploadedFiles.guaBForm ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        {uploadedFiles.guaBForm ? 'Form Uploaded' : 'Upload Form B'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Guarantor Name</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorB_name} 
                    onChange={e => setKycData({...kycData, guarantorB_name: e.target.value})}
                    placeholder="Full Legal Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Phone Number</label>
                  <input 
                    type="tel" 
                    value={kycData.guarantorB_phone} 
                    onChange={e => setKycData({...kycData, guarantorB_phone: e.target.value})}
                    placeholder="080..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Full Residential Address</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorB_address} 
                    onChange={e => setKycData({...kycData, guarantorB_address: e.target.value})}
                    placeholder="Street Address, City, State"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Occupation</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorB_occupation} 
                    onChange={e => setKycData({...kycData, guarantorB_occupation: e.target.value})}
                    placeholder="Job Title / Business"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 uppercase">Company / Office Name</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorB_company} 
                    onChange={e => setKycData({...kycData, guarantorB_company: e.target.value})}
                    placeholder="Employer or Business Name"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-brandMint focus:ring-1 focus:ring-brandMint outline-none" 
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <h5 className="font-bold text-white mb-4">Guarantor Identity Verification</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => handleFileUpload('guarantorB_id')}
                    className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guarantorB_id ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-brandMint hover:text-brandMint'}`}
                  >
                    {processingId === 'guarantorB_id' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guarantorB_id ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                    <span className="font-bold text-sm">Upload Valid ID (NIN/Passport)</span>
                  </div>
                  <div 
                    onClick={() => handleFileUpload('guarantorB_passport')}
                    className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guarantorB_passport ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-brandMint hover:text-brandMint'}`}
                  >
                    {processingId === 'guarantorB_passport' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guarantorB_passport ? <CheckCircle2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    <span className="font-bold text-sm">Upload Passport Photo</span>
                  </div>
                  <div className="border-2 border-dashed rounded-xl p-4 md:col-span-2">
                    <p className="font-bold text-sm text-white mb-3">Upload Selfie Holding Document</p>
                    <p className="text-xs text-slate-500 mb-3">Live selfie of guarantor holding the signed form</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openCamera('guarantorB_selfie')}
                        disabled={isCapturing || processingId === 'guarantorB_selfie'}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all ${uploadedFiles.guarantorB_selfie ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-brandMint hover:text-brandMint'} disabled:opacity-50`}
                      >
                        {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : uploadedFiles.guarantorB_selfie ? <CheckCircle2 className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        {uploadedFiles.guarantorB_selfie ? 'Selfie Captured' : 'Use Camera'}
                      </button>
                      <button
                        onClick={() => handleFileUpload('guarantorB_selfie')}
                        disabled={isCapturing || processingId === 'guarantorB_selfie'}
                        className={`flex-1 py-2 px-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all ${uploadedFiles.guarantorB_selfie ? 'bg-brandMint/10 border-brandMint/50 text-brandMint' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-brandMint hover:text-brandMint'} disabled:opacity-50`}
                      >
                        {processingId === 'guarantorB_selfie' ? <Loader2 className="w-4 h-4 animate-spin" /> : uploadedFiles.guarantorB_selfie ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        {uploadedFiles.guarantorB_selfie ? 'Selfie Uploaded' : 'Upload File'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button 
                  onClick={() => setVettingStep(2)}
                  className="text-slate-400 hover:text-white px-4 py-3 font-bold text-sm transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={() => handleSaveKyc('B')}
                  disabled={processingId === 'verifyingB' || !kycData.guarantorB_name || !uploadedFiles.guarantorB_id}
                  className="bg-brandMint text-corporateNavy px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {processingId === 'verifyingB' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save & Complete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Digital ID Panel Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-6">
            <div>
              <h4 className="font-bold text-sm text-slate-400 uppercase tracking-widest font-mono">Universal Identity Badge</h4>
              <p className="text-[11px] text-slate-500 mt-1">Generated instantly upon verification completion.</p>
            </div>

            {/* Locked State vs Active State */}
            {guarantorAUnlocked && guarantorBUnlocked && uploadedFiles.licenseFront && uploadedFiles.policeClearance ? (
              
              /* UNLOCKED BADGE PREVIEW */
              <div className="w-full bg-slate-950 border-2 border-brandMint/30 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-[0_0_30px_rgba(28,209,136,0.1)] animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-b from-brandMint/5 to-transparent pointer-events-none" />
                
                <div className="flex justify-between items-start relative z-10">
                  <div className="text-left">
                    <h5 className="font-mono text-xs font-black text-brandMint tracking-wider">OGADRIVER</h5>
                    <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">NIGERIA DIVISION</span>
                  </div>
                  <div className="bg-brandMint/20 border border-brandMint/50 text-brandMint rounded-full p-1 text-[10px]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                {/* Driver Face Shot */}
                <div className="w-24 h-24 mx-auto rounded-xl border-2 border-brandMint overflow-hidden bg-slate-800 relative z-10">
                  {user && user.avatar ? (
                    <img 
                      src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${user.avatar}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-slate-600 font-black text-3xl">${user?.name?.charAt(0) || 'O'}</div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 font-black text-3xl">
                      {user?.name?.charAt(0) || 'O'}
                    </div>
                  )}
                </div>

                <div className="space-y-1 relative z-10">
                  <h6 className="font-bold text-lg text-slate-100">{user?.name || 'Operative Driver'}</h6>
                  <p className="font-mono text-xs text-slate-400 uppercase tracking-wider">{user?.nickname || 'ACTIVE PATROL'}</p>
                </div>

                {/* FIXED IDENTICAL SYSTEM ID PATTERN */}
                <div className="bg-slate-900 border border-slate-850 rounded-lg py-2.5 px-2 font-mono text-xs text-brandMint tracking-widest font-black relative z-10 text-center">
                  {user?.driver_id || (user?.id ? `OGD-NG-LA-${user.id.toString(16).toUpperCase().padStart(4, '0')}` : 'OGD-NG-LA-TEMP')}
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono relative z-10 border-t border-slate-900 pt-3">
                  <span>STATE: LAGOS (LA)</span>
                  <span>REG: {new Date().getFullYear()}</span>
                </div>

              </div>

            ) : (

              /* LOCKED BADGE PREVIEW */
              <div className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-8 py-14 flex flex-col items-center justify-center space-y-4 border-dashed relative">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-slate-600">
                  <Lock className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-400 text-sm">System ID Locked</p>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-[180px] mx-auto">
                    Complete all 3 compliance components and Police Clearance to forge your system badge.
                  </p>
                </div>
              </div>

            )}

            <div className="text-xs text-slate-500 leading-relaxed text-left border-t border-slate-850 pt-4 w-full">
              <span className="font-bold text-slate-400">Audit Protocol:</span> Background verifications can be refreshed at any time by central systems. If any document expires, active status will suspend.
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default DriverComplianceTab;
