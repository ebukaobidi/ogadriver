import { useState, useEffect } from 'react';
import { authService } from '../api/auth';
import { driverService } from '../api/drivers';
import api from '../api/axios';

export const useDriverProfile = (user, driver) => {
  
  useEffect(() => {
    if (user) {
      setFullName(user.name || driver?.full_name || '');
      setNickname(user.nickname || '');
      setEmail(user.email || '');
      setPhone(user.phone || user.phone_number || '');
      setGender(user.gender || '');
      setDateOfBirth(user.date_of_birth || '');
    }
    if (driver) {
      setResidenceStateId(driver.state_id || '');
      setResidenceCityId(driver.city_id || '');
      setAccommodationNeeded(Boolean(driver.accommodation_needed));
      setAccommodationNotes(driver.accommodation_notes || '');
      setDailyRate(driver.expected_daily_rate || '');
      setMonthlyRate(driver.expected_monthly_rate || '');
      setServiceMode(driver.service_mode || '');
      setVehicleMake(driver.vehicle_make || '');
      setVehicleModel(driver.vehicle_model || '');
      setVehicleYear(driver.vehicle_year || '');
      setVehicleColor(driver.vehicle_color || '');
      setLicensePlate(driver.license_plate || '');
      setEmergencyContactName(driver.emergency_contact_name || '');
      setEmergencyContactPhone(driver.emergency_contact_phone || '');
      setSkills(driver.skills || []);
      setEndorsements(driver.endorsements || []);
    }
  }, [user, driver]);

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [languages, setLanguages] = useState([]);
  const [residenceStateId, setResidenceStateId] = useState('');
  const [residenceCityId, setResidenceCityId] = useState('');
  const [prefStateId, setPrefStateId] = useState('');
  const [prefCityIds, setPrefCityIds] = useState([]);
  const [vehicleCerts, setVehicleCerts] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [accommodationNeeded, setAccommodationNeeded] = useState(false);
  const [accommodationNotes, setAccommodationNotes] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  
  // Vehicle & Service Mode Configuration
  const [serviceMode, setServiceMode] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  // Skills & Endorsements
  const [skills, setSkills] = useState([]);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [endorsements, setEndorsements] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);

  const handleSaveProfile = async (driver, setDriver) => {
    try {
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
          return false;
        }
      }
      
      if (!currentUser || !currentUser.driver_id) {
        alert('Driver ID not found. Please log out and log in again.');
        return false;
      }
      
      const payload = {
        name: fullName,
        nickname,
        email,
        phone,
        state_id: residenceStateId,
        city_id: residenceCityId,
        gender,
        date_of_birth: dateOfBirth,
        languages,
        service_mode: serviceMode,
        accommodation_needed: accommodationNeeded,
        accommodation_notes: accommodationNotes,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        skills,
        endorsements
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await driverService.updateProfile(currentUser.driver_id, payload);
      
      const updatedDriver = response.data;
      if (updatedDriver) {
        setDriver(prev => ({ ...prev, ...updatedDriver }));
        const updatedUser = { ...currentUser, ...updatedDriver.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      alert('Profile saved successfully');
      return true;
    } catch (e) {
      console.error('Profile save error:', e);
      alert('Failed to save profile: ' + (e.response?.data?.message || e.message));
      return false;
    }
  };

  const handleSavePreferences = async (setDriver) => {
    try {
      const currentUser = authService.getUser();
      if (!currentUser?.driver_id) {
        throw new Error('Driver profile is unavailable. Please sign in again.');
      }

      const profilePreferences = {
        preferred_locations: prefCityIds,
        vehicle_certifications: vehicleCerts,
        employment_types: employmentTypes,
        accommodation_needed: accommodationNeeded,
        accommodation_notes: accommodationNotes
      };
      if (residenceStateId) profilePreferences.state_id = residenceStateId;
      if (residenceCityId) profilePreferences.city_id = residenceCityId;
      if (serviceMode) profilePreferences.service_mode = serviceMode;

      const preferencesResponse = await driverService.updateProfile(currentUser.driver_id, profilePreferences);
      let savedDriver = preferencesResponse.data;

      if (serviceMode === 'driver_with_vehicle' || serviceMode === 'both') {
        const vehicleResponse = await driverService.updateVehicle({
          service_mode: serviceMode,
          make: vehicleMake || null,
          model: vehicleModel || null,
          year: vehicleYear || null,
          color: vehicleColor || null,
          plate_number: licensePlate || null,
          expected_daily_rate: dailyRate === '' ? null : Number(dailyRate),
          expected_monthly_rate: monthlyRate === '' ? null : Number(monthlyRate)
        });
        savedDriver = vehicleResponse.data;
      }

      if (savedDriver?.id && setDriver) {
        setDriver(current => ({ ...current, ...savedDriver }));
      }
      alert('Preferences saved successfully');
      return true;
    } catch (e) {
      console.error(e);
      alert('Failed to save preferences: ' + (e.response?.data?.message || e.message));
      return false;
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return false;
    }
    try {
      await api.post('/user/password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      alert('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      return true;
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update password');
      return false;
    }
  };

  const handleAddSkill = (skill) => {
    if (skill.trim()) {
      setSkills([...skills, skill.trim()]);
    }
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddEndorsement = (endorsement) => {
    if (endorsement.name && endorsement.skill) {
      setEndorsements([...endorsements, { ...endorsement, id: Date.now() }]);
    }
  };

  const handleRemoveEndorsement = (index) => {
    setEndorsements(endorsements.filter((_, i) => i !== index));
  };

  const handleAddPortfolioItem = (item) => {
    if (item.title) {
      setPortfolioItems([...portfolioItems, { ...item, id: Date.now() }]);
    }
  };

  const handleRemovePortfolioItem = (index) => {
    setPortfolioItems(portfolioItems.filter((_, i) => i !== index));
  };

  return {
    // State
    fullName, setFullName,
    nickname, setNickname,
    email, setEmail,
    phone, setPhone,
    gender, setGender,
    dateOfBirth, setDateOfBirth,
    languages, setLanguages,
    residenceStateId, setResidenceStateId,
    residenceCityId, setResidenceCityId,
    prefStateId, setPrefStateId,
    prefCityIds, setPrefCityIds,
    vehicleCerts, setVehicleCerts,
    employmentTypes, setEmploymentTypes,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    skills, setSkills,
    endorsements, setEndorsements,
    portfolioItems, setPortfolioItems,
    accommodationNeeded, setAccommodationNeeded,
    accommodationNotes, setAccommodationNotes,
    dailyRate, setDailyRate,
    monthlyRate, setMonthlyRate,
    serviceMode, setServiceMode,
    vehicleMake, setVehicleMake,
    vehicleModel, setVehicleModel,
    vehicleYear, setVehicleYear,
    vehicleColor, setVehicleColor,
    licensePlate, setLicensePlate,
    emergencyContactName, setEmergencyContactName,
    emergencyContactPhone, setEmergencyContactPhone,
    // Handlers
    handleSaveProfile,
    handleSavePreferences,
    handleChangePassword,
    handleAddSkill,
    handleRemoveSkill,
    handleAddEndorsement,
    handleRemoveEndorsement,
    handleAddPortfolioItem,
    handleRemovePortfolioItem
  };
};
