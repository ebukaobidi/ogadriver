import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import { authService } from '../api/auth';
import { driverService } from '../api/drivers';
import api from '../api/axios';
import {
  ShieldCheck,
  LogOut,
  Briefcase,
  AlertTriangle,
  Loader2,
  Inbox,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  FileCheck,
  Star,
  Activity,
  MapPin,
  Clock,
  Car,
  Camera,
  EyeOff,
  CreditCard,
  Gamepad2,
  User,
  Save,
  Calendar,
  Eye
} from 'lucide-react';
import RoadSimulator from '../components/RoadSimulator';
import AvailabilityCalendar from '../components/Calendar/AvailabilityCalendar';
import DriverSidebar from '../components/driver/DriverSidebar';
import DriverDashboardTab from '../components/driver/DriverDashboardTab';
import DriverProposalsTab from '../components/driver/DriverProposalsTab';
import DriverContractsTab from '../components/driver/DriverContractsTab';
import DriverComplianceTab from '../components/driver/DriverComplianceTab';
import DriverBillingTab from '../components/driver/DriverBillingTab';
import DriverRatingsTab from '../components/driver/DriverRatingsTab';
import DriverProfileTab from '../components/driver/DriverProfileTab';
import { useDriverData } from '../hooks/useDriverData';
import { useDriverProfile } from '../hooks/useDriverProfile';

function DriverPortal() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Use custom hooks for data management
  const {
    driver,
    proposals,
    activeContracts,
    ratings,
    loading,
    verificationProgress,
    dispatchStatus,
    trialStatus,
    setDriver,
    setProposals,
    setActiveContracts,
    loadDriverData
  } = useDriverData();

  const profileHook = useDriverProfile();

  const [loadingMessage, setLoadingMessage] = useState('Establishing Secure Uplink...');
  const [user, setUser] = useState(authService.getUser() || null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previewImage, setPreviewImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState('loading');
  const [activePlan, setActivePlan] = useState(null);

  // Vetting specific state
  const [vettingStep, setVettingStep] = useState(1);
  const [kycData, setKycData] = useState({ nin: '', bvn: '', address: '' });

  // Location States
  const [dbStates, setDbStates] = useState([]);
  const [dbCitiesResidence, setDbCitiesResidence] = useState([]);
  const [dbCitiesPref, setDbCitiesPref] = useState([]);

  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // File Upload States
  const [uploadedFiles, setUploadedFiles] = useState({
     licenseFront: false,
     licenseBack: false,
     lasdriCard: false,
     policeClearance: false,
     guaAForm: false,
     guarantorA_id: false,
     guarantorA_passport: false,
     guarantorA_selfie: false,
     guaBForm: false,
     guarantorB_id: false,
     guarantorB_passport: false,
     guarantorB_selfie: false
  });

  const handleFileUpload = (fileKey, documentType) => {
     // Create a file input element dynamically
     const input = document.createElement('input');
     input.type = 'file';
     input.accept = '.pdf,.jpg,.jpeg,.png';

     input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProcessingId(fileKey);
        try {
           let currentUser = authService.getUser();

           // Refresh user data if driver_id is missing
           if (currentUser && currentUser.role === 'driver' && !currentUser.driver_id) {
             try {
                 const res = await api.get(`/auth/me`);
                 if (res.data.user) {
                     currentUser = res.data.user;
                     localStorage.setItem('user', JSON.stringify(currentUser));
                     setUser(currentUser);
                 }
             } catch(e) {
                 console.error("Failed to refresh user data", e);
                 alert('Failed to get your driver ID. Please log out and log in again.');
                 return;
             }
           }

           if (!currentUser || !currentUser.driver_id) {
             alert('Driver ID not found. Please log out and log in again.');
             return;
           }

           const formData = new FormData();
           formData.append('file', file);
           // Maps fileKey to expected document_type
           const docMap = {
              'licenseFront': 'drivers_license',
              'licenseBack': 'drivers_license',
              'lasdriCard': 'lasdri_card',
              'policeClearance': 'police_clearance',
              'guaAForm': 'guarantor_form_a',
              'guaBForm': 'guarantor_form_b',
              'guarantorA_id': 'guarantor_form_a',
              'guarantorA_passport': 'guarantor_form_a',
              'guarantorA_selfie': 'guarantor_form_a',
              'guarantorB_id': 'guarantor_form_b',
              'guarantorB_passport': 'guarantor_form_b',
              'guarantorB_selfie': 'guarantor_form_b'
           };
           formData.append('document_type', docMap[fileKey] || documentType || 'other');

           // Set expiry date to 1 year from now (can be updated by admin)
           formData.append('expiry_date', new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]);

           console.log('Uploading file for driver ID:', currentUser.driver_id);
           await driverService.uploadDocument(currentUser.driver_id, formData);

           setUploadedFiles(prev => ({ ...prev, [fileKey]: true }));
           alert('File uploaded successfully!');
           // Reload verification status after upload
           loadVerificationStatus();
        } catch (err) {
           console.error('File upload failed:', err);
           alert('Failed to upload file: ' + (err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message));
        } finally {
           setProcessingId(null);
        }
     };

     input.click();
  };

  const loadVerificationStatus = async () => {
    try {
      const res = await api.get('/drivers/verification-status');
      if (res.data.success) {
        setVerificationProgress(res.data.data.verification);
        setDispatchStatus(res.data.data.dispatch);
        setTrialStatus(res.data.data.trial);
      }
    } catch (err) {
      console.error('Failed to load verification status:', err);
    }
  };

  const handleAvatarUpload = (type = 'primary') => {
     const input = document.createElement('input');
     input.type = 'file';
     input.accept = '.jpg,.jpeg,.png';

     input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProcessingId(`avatar_${type}`);
        try {
           const formData = new FormData();
           formData.append('avatar', file);
           formData.append('type', type);

           await authService.uploadAvatar(formData);

           // Reload driver data
           loadDriverDataLocal();

           alert('Avatar updated successfully!');
        } catch (err) {
           console.error('Avatar upload failed:', err);
           alert('Failed to upload avatar. Please try again.');
        } finally {
           setProcessingId(null);
        }
     };

     input.click();
  };

  useEffect(() => {
    loadDriverData();
  }, []);

  useEffect(() => {
    const loadStates = async () => {
      try {
        const res = await api.get('/states');
        setDbStates(res.data || []);
      } catch (e) {
        console.error('Failed to load states:', e);
      }
    };
    loadStates();
  }, []);

  useEffect(() => {
    if (profileHook.residenceStateId) {
      const loadCities = async () => {
        try {
          const res = await api.get(`/states/${profileHook.residenceStateId}/cities`);
          setDbCitiesResidence(res.data || []);
        } catch (e) {
          console.error('Failed to load cities:', e);
        }
      };
      loadCities();
    }
  }, [profileHook.residenceStateId]);

  useEffect(() => {
    if (profileHook.prefStateId) {
      const loadCities = async () => {
        try {
          const res = await api.get(`/states/${profileHook.prefStateId}/cities`);
          setDbCitiesPref(res.data || []);
        } catch (e) {
          console.error('Failed to load cities:', e);
        }
      };
      loadCities();
    }
  }, [profileHook.prefStateId]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }

    const payment = searchParams.get('payment');
    const reference = searchParams.get('reference');

    if (payment === 'success') {
      setActiveTab('billing');
      const verifyPayment = async () => {
        try {
          if (reference) {
            await api.post('/payments/verify', { reference });
          }
          const subRes = await api.get('/subscription');
          if (subRes.data.success) {
            setSubscriptionStatus(subRes.data.status);
            setSubscriptionEndsAt(subRes.data.expires_at);
            setActivePlan(subRes.data.active_plan);
          }
          const walletRes = await api.get('/wallet');
          if (walletRes.data.success) {
            setTransactions(walletRes.data.transactions || []);
            setDriver((prev) => prev ? { ...prev, wallet: walletRes.data.wallet } : prev);
          }
        } catch (err) {
          console.error('Payment verification failed', err);
        } finally {
          setSearchParams({}, { replace: true });
        }
      };
      verifyPayment();
    } else if (payment === 'failed') {
      setActiveTab('billing');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Cycle through loading messages
  useEffect(() => {
    if (loading) {
      let messageIndex = 0;
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 1500); // Change message every 1.5 seconds

      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    if (profileHook.residenceStateId) {
      // Check cache first
      const cacheKey = `cities_${profileHook.residenceStateId}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const isCacheValid = cacheTime && (Date.now() - parseInt(cacheTime)) < 3600000; // 1 hour cache

      if (cachedData && isCacheValid) {
        setDbCitiesResidence(JSON.parse(cachedData));
      } else {
        api.get(`/cities/${profileHook.residenceStateId}`)
          .then(res => {
            setDbCitiesResidence(res.data);
            localStorage.setItem(cacheKey, JSON.stringify(res.data));
            localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
          })
          .catch(err => console.error(err));
      }
    } else {
      setDbCitiesResidence([]);
    }
  }, [profileHook.residenceStateId]);

  useEffect(() => {
    if (profileHook.prefStateId) {
      // Check cache first
      const cacheKey = `cities_${profileHook.prefStateId}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const isCacheValid = cacheTime && (Date.now() - parseInt(cacheTime)) < 3600000; // 1 hour cache

      if (cachedData && isCacheValid) {
        setDbCitiesPref(JSON.parse(cachedData));
      } else {
        api.get(`/cities/${profileHook.prefStateId}`)
          .then(res => {
            setDbCitiesPref(res.data);
            localStorage.setItem(cacheKey, JSON.stringify(res.data));
            localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
          })
          .catch(err => console.error(err));
      }
    } else {
      setDbCitiesPref([]);
    }
  }, [profileHook.prefStateId]);

  const loadDriverDataLocal = async () => {
    try {
      setLoading(true);
      let currentUser = authService.getUser();

      // Self-heal if missing driver_id (from older logins)
      if (currentUser && currentUser.role === 'driver' && !currentUser.driver_id) {
         try {
             const res = await api.get(`/auth/me`);
             if (res.data.user) {
                 currentUser = res.data.user;
                 localStorage.setItem('user', JSON.stringify(currentUser));
                 setUser(currentUser);
             }
         } catch(e) {
             console.error("Failed to refresh user data", e);
         }
      }

      if (currentUser && currentUser.driver_id) {
        // Load all critical data in parallel for fastest initial load
        const [driverData, bookingsRes, verificationRes] = await Promise.all([
          driverService.getDriver(currentUser.driver_id),
          driverService.getActiveContracts(currentUser.driver_id),
          api.get('/drivers/verification-status').catch(() => null)
        ]);

        const d = driverData.data || driverData;
        const allBookings = bookingsRes.data && bookingsRes.data.data ? bookingsRes.data.data : bookingsRes.data ? bookingsRes.data : [];

        setProposals(allBookings.filter(b => b.status === 'pending'));
        setActiveContracts(allBookings.filter(b => b.status === 'accepted' || b.status === 'in_progress'));
        setDriver({
          ...d,
          is_engaged: allBookings.some(b => b.status === 'accepted' || b.status === 'in_progress'),
        });
        setUser(d.user || currentUser);

        // Set verification status immediately
        if (verificationRes && verificationRes.data.success) {
          setVerificationProgress(verificationRes.data.data.verification);
          setDispatchStatus(verificationRes.data.data.dispatch);
          setTrialStatus(verificationRes.data.data.trial);
        }

        // Initialize state variables for profile editing
        if (d.state_id) profileHook.setResidenceStateId(d.state_id);
        if (d.city_id) setResidenceCityId(d.city_id);
        if (d.preferred_locations && Array.isArray(d.preferred_locations)) {
           setPrefCityIds(d.preferred_locations);
        }
        if (d.user && d.user.gender) setGender(d.user.gender);
        if (d.user && d.user.date_of_birth) setDateOfBirth(d.user.date_of_birth);
        if (d.user && d.user.phone) setPhone(d.user.phone);
        if (d.user && d.user.nickname) setNickname(d.user.nickname);
        if (d.vehicle_certifications) setVehicleCerts(d.vehicle_certifications);
        if (d.employment_types) setEmploymentTypes(d.employment_types);
        if (d.languages) setLanguages(d.languages);

        // Initialize KYC and Guarantor States
        setKycData({
            nin: d.nin || '',
            bvn: d.bvn || '',
            address: d.residence_address || '',
            guarantorA_name: d.guarantor_a_name || '',
            guarantorA_phone: d.guarantor_a_phone || '',
            guarantorA_address: d.guarantor_a_address || '',
            guarantorA_occupation: d.guarantor_a_occupation || '',
            guarantorA_company: d.guarantor_a_company || '',
            guarantorB_name: d.guarantor_b_name || '',
            guarantorB_phone: d.guarantor_b_phone || '',
            guarantorB_address: d.guarantor_b_address || '',
            guarantorB_occupation: d.guarantor_b_occupation || '',
            guarantorB_company: d.guarantor_b_company || '',
        });

        // Load states with caching
        const countryId = d && d.user && d.user.country_id ? d.user.country_id : 1;
        const statesCacheKey = `states_${countryId}`;
        const cachedStates = localStorage.getItem(statesCacheKey);
        const statesCacheTime = localStorage.getItem(`${statesCacheKey}_time`);
        const isStatesCacheValid = statesCacheTime && (Date.now() - parseInt(statesCacheTime)) < 86400000; // 24 hour cache for states

        if (cachedStates && isStatesCacheValid) {
          setDbStates(JSON.parse(cachedStates));
        } else {
          api.get(`/states/${countryId}`)
            .then(res => {
              setDbStates(res.data);
              localStorage.setItem(statesCacheKey, JSON.stringify(res.data));
              localStorage.setItem(`${statesCacheKey}_time`, Date.now().toString());
            })
            .catch(err => console.error(err));
        }

        // Load non-critical data in parallel after critical data is shown
        Promise.all([
          driverService.getReviews(currentUser.driver_id).then(reviewsRes => {
            setRatings(reviewsRes.data && reviewsRes.data.data ? reviewsRes.data.data : reviewsRes.data ? reviewsRes.data : []);
          }),
          api.get('/subscription').then(subRes => {
            if (subRes.data.success) {
              setSubscriptionStatus(subRes.data.status);
              setSubscriptionEndsAt(subRes.data.expires_at);
              setActivePlan(subRes.data.active_plan);
            }
          }),
          api.get('/wallet').then(walletRes => {
            if (walletRes.data.success) {
              d.wallet = walletRes.data.wallet;
              setTransactions(walletRes.data.transactions || []);
            }
          })
        ]).catch(err => {
          console.warn('Non-critical data fetch failed', err);
        });
      }
    } catch (err) {
      console.error('Failed to load driver data:', err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/login';
  };

  const handleSubscriptionUpdated = ({ status, expires_at, active_plan }) => {
    if (status) setSubscriptionStatus(status);
    if (expires_at !== undefined) setSubscriptionEndsAt(expires_at);
    if (active_plan !== undefined) setActivePlan(active_plan);
  };

  const handleAcceptProposal = async (proposal) => {
    setProcessingId(proposal.id);
    try {
      await api.post(`/bookings/${proposal.id}/accept`);

      // Remove from proposals
      setProposals(proposals.filter(p => p.id !== proposal.id));
      // Add to active contracts
      setActiveContracts([...activeContracts, {
        ...proposal,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      }]);
      // Update driver state to ENGAGED
      setDriver(prev => ({ ...prev, is_engaged: true }));
      setProcessingId(null);
      setActiveTab('active');
    } catch (err) {
      console.error('Failed to accept proposal:', err);
      alert('Failed to accept booking. Please try again.');
      setProcessingId(null);
    }
  };

  const handleRejectProposal = async (proposalId) => {
    setProcessingId(proposalId);
    try {
      await api.post(`/bookings/${proposalId}/decline`, { reason: 'Driver declined' });
      setProposals(proposals.filter(p => p.id !== proposalId));
      setProcessingId(null);
    } catch (err) {
      console.error('Failed to reject proposal:', err);
      alert('Failed to decline booking. Please try again.');
      setProcessingId(null);
    }
  };

  // Helper for countdown timer display
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (expiresAtStr) => {
    const diff = new Date(expiresAtStr).getTime() - now;
    if (diff <= 0) return '00:00:00';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePrintGuarantorForm = (type) => {
    try {
      const currentUser = authService.getUser();
      const driverNameEncoded = encodeURIComponent(currentUser?.name || "");
      window.open(
        `/guarantor-form/${type}/${currentUser?.formatted_driver_id || 'DRV-TEMP'}?name=${driverNameEncoded}&autoprint=true`,
        '_blank'
      );
    } catch (e) {
       console.error("Failed to generate guarantor code", e);
    }
  };

  const handleSaveKyc = async (type) => {
    try {
      setProcessingId(`verifying${type}`);
      const currentUser = authService.getUser();

      let kycPayload = {
        nin: kycData.nin,
        bvn: kycData.bvn,
        residence_address: kycData.address,
      };

      if (type === 'A') {
         kycPayload = {
             ...kycPayload,
             guarantor_a_name: kycData.guarantorA_name,
             guarantor_a_phone: kycData.guarantorA_phone,
             guarantor_a_address: kycData.guarantorA_address,
             guarantor_a_occupation: kycData.guarantorA_occupation,
             guarantor_a_company: kycData.guarantorA_company,
         };
      } else if (type === 'B') {
         kycPayload = {
             ...kycPayload,
             guarantor_b_name: kycData.guarantorB_name,
             guarantor_b_phone: kycData.guarantorB_phone,
             guarantor_b_address: kycData.guarantorB_address,
             guarantor_b_occupation: kycData.guarantorB_occupation,
             guarantor_b_company: kycData.guarantorB_company,
         };
      }

      await driverService.updateProfile(currentUser.driver_id, kycPayload);
      await loadDriverDataLocal();
      alert('Details saved successfully');
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save details: ' + (e.response?.data?.message || e.message));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex overflow-hidden">

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg text-white"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Component */}
      <DriverSidebar
        user={user}
        driver={driver}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        proposals={proposals}
        activeContracts={activeContracts}
        subscriptionStatus={subscriptionStatus}
        handleLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 w-full h-screen overflow-y-auto custom-scrollbar">
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 lg:p-6 flex justify-end lg:justify-between items-center">
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold capitalize">
              {activeTab === 'dashboard' && 'Command Dashboard'}
              {activeTab === 'proposals' && 'Review Employment Offers'}
              {activeTab === 'active' && 'Current Deployments'}
              {activeTab === 'compliance' && 'Vetting & Compliance'}
              {activeTab === 'billing' && 'Subscriptions & Billing'}
              {activeTab === 'availability' && 'Availability Calendar'}
              {activeTab === 'simulator' && 'Simulator Training'}
              {activeTab === 'ratings' && 'Ratings & Feedback'}
              {activeTab === 'profile' && 'Profile'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-400">
              STATUS:
            </span>
            <div className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              driver && driver.is_engaged
              ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-400'
              : 'bg-brandMint text-corporateNavy shadow-[0_0_15px_rgba(28,209,136,0.3)] border border-brandMint/50'
            }`}>
              {driver && driver.is_engaged ? 'ENGAGED - PROFILE HIDDEN' : 'AVAILABLE FOR DISPATCH'}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">

          {activeTab === 'dashboard' && (
            <DriverDashboardTab
              driver={driver}
              proposals={proposals}
              activeContracts={activeContracts}
              subscriptionStatus={subscriptionStatus}
              setActiveTab={setActiveTab}
              verificationProgress={verificationProgress}
              dispatchStatus={dispatchStatus}
              trialStatus={trialStatus}
            />
          )}

          {activeTab === 'proposals' && (
            <DriverProposalsTab
              proposals={proposals}
              handleAcceptProposal={handleAcceptProposal}
            />
          )}

          {activeTab === 'active' && (
            <DriverContractsTab
              activeContracts={activeContracts}
            />
          )}

          {activeTab === 'compliance' && (
              <DriverComplianceTab
                driver={driver}
                vettingStep={vettingStep}
                setVettingStep={setVettingStep}
                user={user}
                kycData={kycData}
                setKycData={setKycData}
                uploadedFiles={uploadedFiles}
                handleFileUpload={handleFileUpload}
                handleSaveKyc={handleSaveKyc}
                processingId={processingId}
                handlePrintGuarantorForm={handlePrintGuarantorForm}
              />
          )}

          {activeTab === 'billing' && (
            <DriverBillingTab
              subscriptionStatus={subscriptionStatus}
              subscriptionEndsAt={subscriptionEndsAt}
              activePlan={activePlan}
              user={user}
              onSubscriptionUpdated={handleSubscriptionUpdated}
              verificationProgress={verificationProgress}
            />
          )}

          {activeTab === 'ratings' && (
            <DriverRatingsTab
              driver={driver}
              ratings={ratings}
            />
          )}

          {activeTab === 'availability' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Manage Your Availability</h3>
                <p className="text-slate-400">Employers check your availability before sending hiring proposals. Block out days when you are off-duty or unavailable.</p>
              </div>
              <AvailabilityCalendar driverId={driver && driver.id ? driver.id : null} isEmployerMode={false} />
            </div>
          )}

          {activeTab === 'simulator' && (
            <RoadSimulator />
          )}

          {activeTab === 'profile' && (
            <DriverProfileTab
              user={user}
              processingId={processingId}
              setPreviewImage={setPreviewImage}
              handleAvatarUpload={handleAvatarUpload}
              nickname={profileHook.nickname}
              setNickname={profileHook.setNickname}
              phone={profileHook.phone}
              setPhone={profileHook.setPhone}
              gender={profileHook.gender}
              setGender={profileHook.setGender}
              dateOfBirth={profileHook.dateOfBirth}
              setDateOfBirth={profileHook.setDateOfBirth}
              languages={profileHook.languages}
              setLanguages={profileHook.setLanguages}
              residenceStateId={profileHook.residenceStateId}
              setResidenceStateId={profileHook.setResidenceStateId}
              dbStates={dbStates}
              residenceCityId={profileHook.residenceCityId}
              setResidenceCityId={profileHook.setResidenceCityId}
              dbCitiesResidence={dbCitiesResidence}
              handleFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              handleSaveProfile={() => profileHook.handleSaveProfile(driver, setDriver)}
              prefStateId={profileHook.prefStateId}
              setPrefStateId={profileHook.setPrefStateId}
              prefCityIds={profileHook.prefCityIds}
              setPrefCityIds={profileHook.setPrefCityIds}
              dbCitiesPref={dbCitiesPref}
              vehicleCerts={profileHook.vehicleCerts}
              setVehicleCerts={profileHook.setVehicleCerts}
              employmentTypes={profileHook.employmentTypes}
              setEmploymentTypes={profileHook.setEmploymentTypes}
              handleSavePreferences={profileHook.handleSavePreferences}
              currentPassword={profileHook.currentPassword}
              setCurrentPassword={profileHook.setCurrentPassword}
              newPassword={profileHook.newPassword}
              setNewPassword={profileHook.setNewPassword}
              confirmPassword={profileHook.confirmPassword}
              setConfirmPassword={profileHook.setConfirmPassword}
              handleChangePassword={profileHook.handleChangePassword}
              skills={profileHook.skills}
              setSkills={profileHook.setSkills}
              endorsements={profileHook.endorsements}
              setEndorsements={profileHook.setEndorsements}
              portfolioItems={profileHook.portfolioItems}
              setPortfolioItems={profileHook.setPortfolioItems}
              handleAddSkill={profileHook.handleAddSkill}
              handleRemoveSkill={profileHook.handleRemoveSkill}
              handleAddEndorsement={profileHook.handleAddEndorsement}
              handleRemoveEndorsement={profileHook.handleRemoveEndorsement}
              handleAddPortfolioItem={profileHook.handleAddPortfolioItem}
              handleRemovePortfolioItem={profileHook.handleRemovePortfolioItem}
            />
          )}

        </div>
      </main>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}


export default function DriverPortalWrapper() {
  return (
    <ErrorBoundary>
      <DriverPortal />
    </ErrorBoundary>
  );
}
