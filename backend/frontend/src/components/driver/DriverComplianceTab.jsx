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
  Circle,
  FileText,
  ArrowLeft,
  Car,
  Award,
  Sparkles,
  Info,
  Building2,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentCameraType, setCurrentCameraType] = useState(null); // 'guarantorA_selfie' or 'guarantorB_selfie'
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Determine Service Track
  const serviceMode = driver?.service_mode || (driver?.has_vehicle ? 'driver_with_vehicle' : 'driver_only');
  const isIndependent = serviceMode === 'driver_with_vehicle';
  const isFleet = serviceMode === 'driver_only';
  const isHybrid = serviceMode === 'both';

  // LASDRI: Strictly required only for Lagos State drivers
  const isLagos = Boolean(
    driver?.state?.name?.toLowerCase()?.includes('lagos') ||
    driver?.state_name?.toLowerCase()?.includes('lagos') ||
    driver?.residence_state?.toLowerCase()?.includes('lagos') ||
    driver?.state_id === 25 || driver?.state_id === '25' ||
    driver?.operating_state === 'Lagos'
  );
  const stateName = driver?.state?.name || driver?.state_name || (isLagos ? 'Lagos' : 'Outside Lagos');
  const isLasdriRequired = isLagos;

  // Years of Experience state
  const [yearsOfExp, setYearsOfExp] = useState(driver?.years_of_experience ?? '');
  const [savingExp, setSavingExp] = useState(false);

  const handleSaveExp = async (years) => {
    setYearsOfExp(years);
    if (!driver?.id) return;
    setSavingExp(true);
    try {
      await driverService.updateProfile(driver.id, { years_of_experience: Number(years) });
    } catch (e) {
      console.error('Failed to update experience:', e);
    } finally {
      setSavingExp(false);
    }
  };

  const guarantorAUnlocked = driver?.guarantor_a_status === 'verified';
  const guarantorAStatus = driver?.guarantor_a_status;
  const guarantorBUnlocked = driver?.guarantor_b_status === 'verified';
  const guarantorBStatus = driver?.guarantor_b_status;

  // Calculate overall progress based on selected track
  const calculateProgress = () => {
    let completed = 0;
    let total = 3;

    // Step 1: Personal Docs
    const hasLicense = uploadedFiles.licenseFront && uploadedFiles.licenseBack;
    const hasPoliceClearance = isIndependent ? true : Boolean(uploadedFiles.policeClearance);
    const hasLasdri = isLasdriRequired ? Boolean(uploadedFiles.lasdriCard) : true;
    if (hasLicense && hasPoliceClearance && hasLasdri) completed++;

    // Step 2:
    if (isIndependent) {
      if (uploadedFiles.vehicleLicense && uploadedFiles.comprehensiveInsurance && uploadedFiles.motCertificate) completed++;
    } else if (isHybrid) {
      if (uploadedFiles.vehicleLicense && (uploadedFiles.comprehensiveInsurance || uploadedFiles.motCertificate)) completed++;
    } else {
      if (guarantorAStatus === 'verified') completed++;
    }

    // Step 3:
    if (isIndependent) {
      if (uploadedFiles.vehicleExterior && uploadedFiles.vehicleInterior) completed++;
    } else if (isHybrid) {
      if (guarantorAStatus === 'verified') completed++;
    } else {
      if (guarantorBStatus === 'verified') completed++;
    }

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
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            let currentUser = authService.getUser();
            
            if (currentUser && currentUser.role === 'driver' && !currentUser.driver_id) {
              try {
                const res = await api.get('/auth/me');
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
            alert('Selfie verified and uploaded successfully!');
            closeCamera();
          }
        }, 'image/jpeg', 0.85);
      } catch (e) {
        console.error('Error capturing selfie:', e);
        alert('Could not process photo capture.');
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const isStep1Complete = uploadedFiles.licenseFront && uploadedFiles.licenseBack && 
    (isLasdriRequired ? uploadedFiles.lasdriCard : true) && 
    (isIndependent ? true : uploadedFiles.policeClearance);

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 lg:p-8 text-slate-100 max-w-7xl mx-auto pb-28">
      
      {/* Top Navigation & Track Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button 
          onClick={() => navigate('/driver/account')}
          className="flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold transition hover:bg-slate-800 shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#1cd188]" />
          <span>Back to Driver Hub</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Verification Track:</span>
          <span className="text-xs font-black text-[#1cd188] bg-[#1cd188]/15 border border-[#1cd188]/30 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            {isHybrid ? <><Sparkles className="w-3.5 h-3.5" /> Hybrid Operator</> : isIndependent ? <><Car className="w-3.5 h-3.5" /> Independent Operator</> : <><Shield className="w-3.5 h-3.5" /> Fleet Operative</>}
          </span>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <Camera className="text-[#1cd188]" />
                Live Guarantor Photo Capture
              </h4>
              <button onClick={closeCamera} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-4 border border-slate-700">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-red-500/20 border border-red-500/50 rounded-full px-4 py-1.5 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">LIVE SECURE FEED</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="flex-1 bg-[#1cd188] text-slate-950 py-3.5 rounded-xl font-black text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1cd188]/25"
              >
                {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <span>{isCapturing ? 'Processing…' : 'Capture & Verify'}</span>
              </button>
              <button
                onClick={closeCamera}
                className="px-6 py-3.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 border-b border-white/10 pb-4">
        <h3 className="text-2xl font-black text-white">Vetting & Compliance Portal</h3>
        <p className="text-slate-400 text-sm mt-1">
          Complete your background checks and document submissions to activate your universal OgaDriver badge.
        </p>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="font-bold text-white text-base">Overall Verification Progress</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {progress >= 100 
                ? 'All mandatory requirements fulfilled! Your verification badge is active.' 
                : 'Complete all steps below to unlock instant ride dispatch and premium hire listings.'}
            </p>
          </div>
          <span className="text-2xl font-black text-[#1cd188]">{progress}%</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-[#1cd188] to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-xs text-slate-400 font-semibold">
          <span>1. Identity & Experience</span>
          <span>2. {isIndependent ? 'Vehicle Papers' : isHybrid ? 'Vehicle Papers' : 'Guarantor A'}</span>
          <span>3. {isIndependent ? 'Vehicle Inspection' : isHybrid ? 'Guarantor Shield' : 'Guarantor B'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Vetting Forms */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Enhanced Progress Tracker Stepper */}
          <div className="mb-6 bg-slate-900/60 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1">
                <div 
                  onClick={() => setVettingStep(1)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all ${
                    vettingStep === 1 
                      ? 'bg-[#1cd188] text-slate-950 ring-4 ring-[#1cd188]/30 font-black' 
                      : isStep1Complete
                        ? 'bg-[#1cd188]/20 text-[#1cd188] border-2 border-[#1cd188]'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isStep1Complete ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold text-sm">1</span>}
                </div>
                <span className={`text-xs font-bold mt-2 text-center ${vettingStep === 1 ? 'text-[#1cd188]' : 'text-slate-400'}`}>
                  Personal Docs
                </span>
              </div>

              {/* Connector */}
              <div className={`flex-1 h-1 mx-2 rounded-full ${vettingStep >= 2 || isStep1Complete ? 'bg-[#1cd188]' : 'bg-slate-800'}`} />

              {/* Step 2 */}
              <div 
                onClick={() => isStep1Complete && setVettingStep(2)}
                className={`flex flex-col items-center flex-1 ${!isStep1Complete ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  vettingStep === 2 
                    ? 'bg-[#1cd188] text-slate-950 ring-4 ring-[#1cd188]/30 font-black' 
                    : (isIndependent || isHybrid) && uploadedFiles.vehicleLicense && (uploadedFiles.comprehensiveInsurance || uploadedFiles.motCertificate)
                      ? 'bg-[#1cd188]/20 text-[#1cd188] border-2 border-[#1cd188]'
                      : isFleet && guarantorAStatus === 'verified'
                        ? 'bg-[#1cd188]/20 text-[#1cd188] border-2 border-[#1cd188]'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <span className="font-bold text-sm">2</span>
                </div>
                <span className={`text-xs font-bold mt-2 text-center ${vettingStep === 2 ? 'text-[#1cd188]' : 'text-slate-400'}`}>
                  {isIndependent || isHybrid ? 'Vehicle Papers' : 'Guarantor A'}
                </span>
              </div>

              {/* Connector */}
              <div className={`flex-1 h-1 mx-2 rounded-full ${vettingStep >= 3 ? 'bg-[#1cd188]' : 'bg-slate-800'}`} />

              {/* Step 3 */}
              <div 
                onClick={() => isStep1Complete && setVettingStep(3)}
                className={`flex flex-col items-center flex-1 ${!isStep1Complete ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                  vettingStep === 3 
                    ? 'bg-[#1cd188] text-slate-950 ring-4 ring-[#1cd188]/30 font-black' 
                    : isIndependent && uploadedFiles.vehicleExterior && uploadedFiles.vehicleInterior
                      ? 'bg-[#1cd188]/20 text-[#1cd188] border-2 border-[#1cd188]'
                      : isHybrid && guarantorAStatus === 'verified'
                        ? 'bg-[#1cd188]/20 text-[#1cd188] border-2 border-[#1cd188]'
                        : isFleet && guarantorBStatus === 'verified'
                          ? 'bg-[#1cd188]/20 text-[#1cd188] border-2 border-[#1cd188]'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <span className="font-bold text-sm">3</span>
                </div>
                <span className={`text-xs font-bold mt-2 text-center ${vettingStep === 3 ? 'text-[#1cd188]' : 'text-slate-400'}`}>
                  {isIndependent ? 'Inspection Photos' : isHybrid ? 'Guarantor Shield' : 'Guarantor B'}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 1: Personal Docs & Driving Experience */}
          {vettingStep === 1 && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 lg:p-8 animate-slide-up space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-white flex items-center gap-2">
                    <UserCheck className="text-[#1cd188] w-5 h-5" /> Driver Identity & Experience Vetting
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Submit your government credentials and driving experience to establish your baseline security profile.
                  </p>
                </div>
                {isStep1Complete && (
                  <span className="bg-[#1cd188]/15 text-[#1cd188] px-3 py-1 rounded-full text-xs font-bold border border-[#1cd188]/30">
                    Step 1 Verified
                  </span>
                )}
              </div>

              {/* Years of Professional Driving Experience Selector */}
              <div className="bg-slate-950 border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-bold text-white">Years of Professional Driving Experience</span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full ml-1 hidden sm:inline-block">Self-Declared (Unverified)</span>
                  </div>
                  {savingExp && <Loader2 className="w-4 h-4 text-[#1cd188] animate-spin" />}
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Accurate experience ratings boost your ranking on the hire directory and qualify you for higher daily rates.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { value: 2, label: '1 – 2 Years', tier: 'Junior Pro' },
                    { value: 4, label: '3 – 5 Years', tier: 'Verified Pro' },
                    { value: 8, label: '6 – 9 Years', tier: 'Executive' },
                    { value: 12, label: '10+ Years', tier: 'Master Veteran' },
                  ].map((tierOpt) => {
                    const isSelected = Number(yearsOfExp) === tierOpt.value || (tierOpt.value === 12 && Number(yearsOfExp) >= 10);
                    return (
                      <button
                        key={tierOpt.value}
                        type="button"
                        onClick={() => handleSaveExp(tierOpt.value)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-[#1cd188] bg-[#1cd188]/20 text-[#1cd188] font-bold shadow-md ring-1 ring-[#1cd188]/40'
                            : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="block text-xs font-bold">{tierOpt.label}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">{tierOpt.tier}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* License Front */}
                <div 
                  onClick={() => handleFileUpload('licenseFront')}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${uploadedFiles.licenseFront ? 'bg-[#1cd188]/10 border-[#1cd188]/50' : 'border-slate-700 bg-slate-950 hover:border-[#1cd188]'}`}
                >
                  {processingId === 'licenseFront' ? (
                    <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin mb-2" />
                  ) : uploadedFiles.licenseFront ? (
                    <CheckCircle2 className="w-8 h-8 text-[#1cd188] mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  )}
                  <h5 className={`font-bold text-sm ${uploadedFiles.licenseFront ? 'text-[#1cd188]' : 'text-slate-300'}`}>
                    {uploadedFiles.licenseFront ? 'Front Uploaded & Scanned' : "Driver's License (Front)"}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">Photo showing clear ID and full legal name</p>
                </div>

                {/* License Back */}
                <div 
                  onClick={() => handleFileUpload('licenseBack')}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${uploadedFiles.licenseBack ? 'bg-[#1cd188]/10 border-[#1cd188]/50' : 'border-slate-700 bg-slate-950 hover:border-[#1cd188]'}`}
                >
                  {processingId === 'licenseBack' ? (
                    <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin mb-2" />
                  ) : uploadedFiles.licenseBack ? (
                    <CheckCircle2 className="w-8 h-8 text-[#1cd188] mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  )}
                  <h5 className={`font-bold text-sm ${uploadedFiles.licenseBack ? 'text-[#1cd188]' : 'text-slate-300'}`}>
                    {uploadedFiles.licenseBack ? 'Back Uploaded' : "Driver's License (Back)"}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">Showing barcode & license class</p>
                </div>

                {/* Police Character Clearance (For Fleet and Hybrid Drivers) */}
                {(!isIndependent) && (
                  <div 
                    onClick={() => handleFileUpload('policeClearance')}
                    className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${uploadedFiles.policeClearance ? 'bg-[#1cd188]/10 border-[#1cd188]/50' : 'border-slate-700 bg-slate-950 hover:border-[#1cd188]'}`}
                  >
                    {processingId === 'policeClearance' ? (
                      <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin mb-2" />
                    ) : uploadedFiles.policeClearance ? (
                      <CheckCircle2 className="w-8 h-8 text-[#1cd188] mb-2" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-slate-500 mb-2" />
                    )}
                    <h5 className="font-bold text-sm text-slate-300">
                      {uploadedFiles.policeClearance ? 'Clearance Verified' : 'Police Character Clearance'}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">Background check for passenger safety</p>
                  </div>
                )}

                {/* LASDRI Card (Strictly required only for Lagos drivers) */}
                <div 
                  onClick={() => handleFileUpload('lasdriCard')}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${(!isIndependent) ? '' : 'md:col-span-2'} ${uploadedFiles.lasdriCard ? 'bg-[#1cd188]/10 border-[#1cd188]/50' : 'border-slate-700 bg-slate-950 hover:border-[#1cd188]'}`}
                >
                  {processingId === 'lasdriCard' ? (
                    <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin mb-2" />
                  ) : uploadedFiles.lasdriCard ? (
                    <CheckCircle2 className="w-8 h-8 text-[#1cd188] mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  )}
                  <div className="flex items-center gap-1.5">
                    <h5 className={`font-bold text-sm ${uploadedFiles.lasdriCard ? 'text-[#1cd188]' : 'text-slate-300'}`}>
                      {uploadedFiles.lasdriCard ? 'LASDRI Card Uploaded' : 'LASDRI Driver Card'}
                    </h5>
                    {!isLasdriRequired && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Lagos Only
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isLasdriRequired 
                      ? 'Mandatory for commercial driving within Lagos State' 
                      : `Optional for ${stateName} drivers (Only required if operating in Lagos)`}
                  </p>
                </div>

              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setVettingStep(2)}
                  disabled={!uploadedFiles.licenseFront || !uploadedFiles.licenseBack}
                  className="bg-[#1cd188] text-slate-950 px-8 py-3.5 rounded-xl font-black text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1cd188]/25 flex items-center gap-2"
                >
                  <span>Proceed to Step 2</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 FOR INDEPENDENT OR HYBRID: Vehicle Documentation */}
          {(isIndependent || isHybrid) && vettingStep === 2 && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 lg:p-8 animate-slide-up space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-white flex items-center gap-2">
                    <FileText className="text-[#1cd188] w-5 h-5" /> Vehicle Compliance & Roadworthiness Papers
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload your vehicle license, comprehensive/third-party insurance, and inspection certificate.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'vehicleLicense', label: 'Vehicle License / Reg Papers', hint: 'Valid state registration certificate' },
                  { key: 'comprehensiveInsurance', label: 'Insurance Policy', hint: 'Comprehensive or 3rd party cover' },
                  { key: 'motCertificate', label: 'MOT / Roadworthiness', hint: 'Safety inspection certificate' }
                ].map(({ key, label, hint }) => (
                  <div 
                    key={key}
                    onClick={() => handleFileUpload(key)}
                    className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${uploadedFiles[key] ? 'bg-[#1cd188]/10 border-[#1cd188]/50' : 'border-slate-700 bg-slate-950 hover:border-[#1cd188]'}`}
                  >
                    {processingId === key ? (
                      <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin mb-2" />
                    ) : uploadedFiles[key] ? (
                      <CheckCircle2 className="w-8 h-8 text-[#1cd188] mb-2" />
                    ) : (
                      <FileCheck className="w-8 h-8 text-slate-500 mb-2" />
                    )}
                    <h5 className="font-bold text-sm text-slate-300">{label}</h5>
                    <p className="text-[10px] text-slate-500 mt-1">{uploadedFiles[key] ? 'Uploaded & Verified' : hint}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setVettingStep(1)} className="text-slate-400 hover:text-white px-4 py-3 font-bold text-sm transition-colors">
                  Back
                </button>
                <button 
                  onClick={() => setVettingStep(3)} 
                  disabled={!uploadedFiles.vehicleLicense}
                  className="bg-[#1cd188] text-slate-950 px-8 py-3.5 rounded-xl font-black text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#1cd188]/25"
                >
                  <span>Proceed to Step 3</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 FOR INDEPENDENT: Vehicle Exterior & Interior Photos */}
          {isIndependent && vettingStep === 3 && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 lg:p-8 animate-slide-up space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-white flex items-center gap-2">
                    <Camera className="text-[#1cd188] w-5 h-5" /> Vehicle Physical Inspection Photos
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Upload clear photos showing the vehicle plate, body condition, and interior cleanliness.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['vehicleExterior', 'vehicleInterior'].map(key => {
                  const label = key === 'vehicleExterior' ? 'Vehicle Exterior (Front & Plate)' : 'Vehicle Interior (Seats & Dashboard)';
                  return (
                    <div 
                      key={key}
                      onClick={() => handleFileUpload(key)}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${uploadedFiles[key] ? 'bg-[#1cd188]/10 border-[#1cd188]/50' : 'border-slate-700 bg-slate-950 hover:border-[#1cd188]'}`}
                    >
                      {processingId === key ? <Loader2 className="w-8 h-8 text-[#1cd188] animate-spin mb-3" /> : uploadedFiles[key] ? <CheckCircle2 className="w-8 h-8 text-[#1cd188] mb-3" /> : <Camera className="w-8 h-8 text-slate-500 mb-3" />}
                      <h5 className="font-bold text-sm text-slate-300">{label}</h5>
                      <p className="text-[10px] text-slate-500 mt-1">{uploadedFiles[key] ? 'Photo Uploaded' : 'Tap to Upload Photo'}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setVettingStep(2)} className="text-slate-400 hover:text-white px-4 py-3 font-bold text-sm transition-colors">
                  Back
                </button>
                <button 
                  onClick={() => {
                    alert('Vehicle verification documents submitted successfully! Your badge is now forging.');
                    navigate('/driver/account');
                  }} 
                  disabled={!uploadedFiles.vehicleExterior} 
                  className="bg-[#1cd188] text-slate-950 px-8 py-3.5 rounded-xl font-black text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#1cd188]/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Independent Verification</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 FOR FLEET OPERATIVE: Primary Guarantor Form A */}
          {isFleet && vettingStep === 2 && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 lg:p-8 animate-slide-up space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="text-[#1cd188] w-5 h-5" /> Primary Guarantor Data (Tier 1)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Provide information for your primary executive or reputable guarantor.</p>
                </div>
                {guarantorAStatus === 'verified' && (
                  <span className="bg-[#1cd188]/15 text-[#1cd188] px-3 py-1 rounded-full text-xs font-bold border border-[#1cd188]/30">Guarantor A Verified</span>
                )}
              </div>

              <div className="bg-slate-950 border border-white/10 rounded-xl p-5 mb-4">
                <button
                  onClick={() => handlePrintGuarantorForm('A')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold py-3 px-4 rounded-xl text-slate-300 border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <Printer size={16} /> Print / Download Official Form A PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Guarantor Full Legal Name</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorA_name} 
                    onChange={e => setKycData({...kycData, guarantorA_name: e.target.value})}
                    placeholder="e.g. Chief Emeka Adeleke"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#1cd188] outline-none text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase">Guarantor Phone Number</label>
                  <input 
                    type="tel" 
                    value={kycData.guarantorA_phone} 
                    onChange={e => setKycData({...kycData, guarantorA_phone: e.target.value})}
                    placeholder="08012345678"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#1cd188] outline-none text-sm" 
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Residential / Office Address</label>
                  <input 
                    type="text" 
                    value={kycData.guarantorA_address} 
                    onChange={e => setKycData({...kycData, guarantorA_address: e.target.value})}
                    placeholder="Street Address, City, State"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#1cd188] outline-none text-sm" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div 
                  onClick={() => handleFileUpload('guarantorA_id')}
                  className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guarantorA_id ? 'bg-[#1cd188]/10 border-[#1cd188]/50 text-[#1cd188]' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-[#1cd188]'}`}
                >
                  {processingId === 'guarantorA_id' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guarantorA_id ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  <span className="font-bold text-xs">Upload Guarantor Valid ID (NIN/Passport)</span>
                </div>
                <div 
                  onClick={() => handleFileUpload('guaAForm')}
                  className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guaAForm ? 'bg-[#1cd188]/10 border-[#1cd188]/50 text-[#1cd188]' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-[#1cd188]'}`}
                >
                  {processingId === 'guaAForm' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guaAForm ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  <span className="font-bold text-xs">Upload Signed Form A</span>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setVettingStep(1)} className="text-slate-400 hover:text-white px-4 py-3 font-bold text-sm transition-colors">
                  Back
                </button>
                <button 
                  onClick={() => handleSaveKyc('A')}
                  disabled={processingId === 'verifyingA' || !kycData.guarantorA_name}
                  className="bg-[#1cd188] text-slate-950 px-8 py-3.5 rounded-xl font-black text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#1cd188]/25"
                >
                  {processingId === 'verifyingA' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Guarantor A & Proceed</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 FOR FLEET OPERATIVE OR HYBRID: Guarantor Verification */}
          {((isFleet && vettingStep === 3) || (isHybrid && vettingStep === 3)) && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 lg:p-8 animate-slide-up space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="text-[#1cd188] w-5 h-5" /> 
                    {isHybrid ? 'Apex Trust Guarantor Safety Shield' : 'Secondary Guarantor Data (Tier 2)'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isHybrid 
                      ? 'To guarantee security for high-value VIP hires without friction, submit 1 verified guarantor reference.'
                      : 'Provide information for your secondary guarantor reference.'}
                  </p>
                </div>
              </div>

              {isHybrid ? (
                // Hybrid Guarantor Shield Form
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-white/10 rounded-xl p-5">
                    <button
                      onClick={() => handlePrintGuarantorForm('A')}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold py-3 px-4 rounded-xl text-slate-300 border border-slate-700 transition flex items-center justify-center gap-2"
                    >
                      <Printer size={16} /> Print / Download Hybrid Guarantor Shield Form
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase">Executive Guarantor Full Name</label>
                      <input 
                        type="text" 
                        value={kycData.guarantorA_name} 
                        onChange={e => setKycData({...kycData, guarantorA_name: e.target.value})}
                        placeholder="e.g. Engr. Babatunde Sanusi"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#1cd188] outline-none text-sm" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase">Guarantor Phone Number</label>
                      <input 
                        type="tel" 
                        value={kycData.guarantorA_phone} 
                        onChange={e => setKycData({...kycData, guarantorA_phone: e.target.value})}
                        placeholder="080..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#1cd188] outline-none text-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div 
                      onClick={() => handleFileUpload('guarantorA_id')}
                      className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guarantorA_id ? 'bg-[#1cd188]/10 border-[#1cd188]/50 text-[#1cd188]' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-[#1cd188]'}`}
                    >
                      {processingId === 'guarantorA_id' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guarantorA_id ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      <span className="font-bold text-xs">Upload Guarantor ID Card</span>
                    </div>
                    <div 
                      onClick={() => handleFileUpload('guaAForm')}
                      className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guaAForm ? 'bg-[#1cd188]/10 border-[#1cd188]/50 text-[#1cd188]' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-[#1cd188]'}`}
                    >
                      {processingId === 'guaAForm' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guaAForm ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      <span className="font-bold text-xs">Upload Signed Guarantor Form</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Fleet Operative Guarantor B Form
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-white/10 rounded-xl p-5 mb-4">
                    <button
                      onClick={() => handlePrintGuarantorForm('B')}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-xs font-bold py-3 px-4 rounded-xl text-slate-300 border border-slate-700 transition flex items-center justify-center gap-2"
                    >
                      <Printer size={16} /> Print / Download Official Form B PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase">Guarantor B Full Legal Name</label>
                      <input 
                        type="text" 
                        value={kycData.guarantorB_name} 
                        onChange={e => setKycData({...kycData, guarantorB_name: e.target.value})}
                        placeholder="e.g. Dr. Ngozi Okonjo"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#1cd188] outline-none text-sm" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase">Guarantor B Phone Number</label>
                      <input 
                        type="tel" 
                        value={kycData.guarantorB_phone} 
                        onChange={e => setKycData({...kycData, guarantorB_phone: e.target.value})}
                        placeholder="080..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-[#1cd188] outline-none text-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div 
                      onClick={() => handleFileUpload('guarantorB_id')}
                      className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guarantorB_id ? 'bg-[#1cd188]/10 border-[#1cd188]/50 text-[#1cd188]' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-[#1cd188]'}`}
                    >
                      {processingId === 'guarantorB_id' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guarantorB_id ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      <span className="font-bold text-xs">Upload Guarantor B ID</span>
                    </div>
                    <div 
                      onClick={() => handleFileUpload('guaBForm')}
                      className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-all ${uploadedFiles.guaBForm ? 'bg-[#1cd188]/10 border-[#1cd188]/50 text-[#1cd188]' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-[#1cd188]'}`}
                    >
                      {processingId === 'guaBForm' ? <Loader2 className="w-5 h-5 animate-spin" /> : uploadedFiles.guaBForm ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      <span className="font-bold text-xs">Upload Signed Form B</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button onClick={() => setVettingStep(2)} className="text-slate-400 hover:text-white px-4 py-3 font-bold text-sm transition-colors">
                  Back
                </button>
                <button 
                  onClick={() => {
                    if (isHybrid) {
                      handleSaveKyc('A');
                    } else {
                      handleSaveKyc('B');
                    }
                  }}
                  disabled={processingId === 'verifyingB' || processingId === 'verifyingA'}
                  className="bg-[#1cd188] text-slate-950 px-8 py-3.5 rounded-xl font-black text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#1cd188]/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Verification & Forge Badge</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Security Guidance & Badge Activation Card */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-[#1cd188]" />
              <h4 className="font-black text-white text-base">OgaDriver Security Guarantee</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our 3-stage protocol prevents fraud, vehicle hijacking, and identity theft. Verified drivers receive the verified checkmark badge, 10x higher booking inquiries, and access to corporate executive VIP hires.
            </p>

            <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-[#1cd188]/20 text-[#1cd188] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                <p className="text-xs text-slate-300">Fast digital document verification within 24 business hours.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-[#1cd188]/20 text-[#1cd188] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                <p className="text-xs text-slate-300">LASDRI required strictly for commercial drivers in Lagos.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-5 w-5 rounded-full bg-[#1cd188]/20 text-[#1cd188] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                <p className="text-xs text-slate-300">Enterprise insurance coverage on all verified active contracts.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-xs text-slate-500">Need assistance or physical office verification?</p>
            <p className="text-xs font-bold text-white mt-1">Visit an OgaDriver Verification Hub near you.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DriverComplianceTab;