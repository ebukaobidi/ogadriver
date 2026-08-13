import { useState } from 'react';
import { authService } from '../api/auth';
import { driverService } from '../api/drivers';
import api from '../api/axios';

export const useDriverProfile = () => {
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [languages, setLanguages] = useState(['English']);
  const [residenceStateId, setResidenceStateId] = useState('');
  const [residenceCityId, setResidenceCityId] = useState('');
  const [prefStateId, setPrefStateId] = useState('');
  const [prefCityIds, setPrefCityIds] = useState([]);
  const [vehicleCerts, setVehicleCerts] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Skills & Endorsements
  const [skills, setSkills] = useState([]);
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
          return;
        }
      }
      
      if (!currentUser || !currentUser.driver_id) {
        alert('Driver ID not found. Please log out and log in again.');
        return;
      }
      
      const payload = {
        nickname,
        phone,
        state_id: residenceStateId,
        city_id: residenceCityId,
        gender,
        date_of_birth: dateOfBirth,
        languages
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await driverService.updateProfile(currentUser.driver_id, payload);
      
      if (response.data) {
        setDriver(prev => ({ ...prev, ...response.data }));
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      alert('Profile saved successfully');
    } catch (e) {
      console.error('Profile save error:', e);
      alert('Failed to save profile: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleSavePreferences = async () => {
    try {
      const currentUser = authService.getUser();
      await driverService.updateProfile(currentUser.driver_id, {
        preferred_locations: prefCityIds,
        vehicle_certifications: vehicleCerts,
        employment_types: employmentTypes
      });
      alert('Preferences saved successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to save preferences');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
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
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update password');
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
    nickname, setNickname,
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
