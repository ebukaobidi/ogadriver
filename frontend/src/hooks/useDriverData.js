import { useState, useEffect } from 'react';
import { authService } from '../api/auth';
import { driverService } from '../api/drivers';
import api from '../api/axios';

export const useDriverData = () => {
  const [driver, setDriver] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [activeContracts, setActiveContracts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationProgress, setVerificationProgress] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [trialStatus, setTrialStatus] = useState(null);

  const loadDriverData = async () => {
    try {
      const currentUser = authService.getUser();
      if (!currentUser || !currentUser.driver_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Load driver profile
      const driverRes = await driverService.getProfile(currentUser.driver_id);
      setDriver(driverRes.data);

      // Load proposals
      const proposalsRes = await api.get('/driver/proposals');
      setProposals(proposalsRes.data || []);

      // Load active contracts
      const contractsRes = await api.get('/driver/contracts');
      setActiveContracts(contractsRes.data || []);

      // Load ratings
      const ratingsRes = await api.get('/driver/ratings');
      setRatings(ratingsRes.data || []);

      // Load verification progress
      try {
        const verificationRes = await api.get('/driver/verification/progress');
        setVerificationProgress(verificationRes.data);
      } catch (e) {
        console.log('Verification progress not available');
      }

      // Load dispatch status
      try {
        const dispatchRes = await api.get('/driver/dispatch-status');
        setDispatchStatus(dispatchRes.data);
      } catch (e) {
        console.log('Dispatch status not available');
      }

      // Load trial status
      try {
        const trialRes = await api.get('/driver/trial-status');
        setTrialStatus(trialRes.data);
      } catch (e) {
        console.log('Trial status not available');
      }

    } catch (error) {
      console.error('Failed to load driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverData();
  }, []);

  return {
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
    setRatings,
    loadDriverData
  };
};
