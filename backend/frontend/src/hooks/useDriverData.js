import { useState, useEffect } from 'react';
import { authService } from '../api/auth';
import { driverService } from '../api/drivers';
import api from '../api/axios';

const toArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
};

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
      try {
        const driverRes = await driverService.getDriver(currentUser.driver_id);
        setDriver(driverRes.data?.data || driverRes.data || null);
      } catch (e) {
        console.error("Failed to load driver profile", e);
      }

      // Load proposals
      try {
        const proposalsRes = await api.get('/driver/proposals');
        setProposals(toArray(proposalsRes.data));
      } catch (e) {
        console.error("Failed to load proposals", e);
        setProposals([]);
      }

      // Load active contracts
      try {
        const contractsRes = await api.get('/driver/contracts');
        setActiveContracts(toArray(contractsRes.data));
      } catch (e) {
        console.error("Failed to load contracts", e);
        setActiveContracts([]);
      }

      // Load ratings
      try {
        const ratingsRes = await api.get('/driver/ratings');
        setRatings(toArray(ratingsRes.data));
      } catch (e) {
        console.error("Failed to load ratings", e);
        setRatings([]);
      }

      // Load verification progress
      try {
        const verificationRes = await api.get('/drivers/verification-status');
        const verData = verificationRes.data?.data?.verification || verificationRes.data?.verification || verificationRes.data?.data || verificationRes.data;
        const progressVal = verData?.progress_percentage ?? verData?.progress ?? 0;
        setVerificationProgress(typeof progressVal === 'number' ? progressVal : (parseInt(progressVal) || 0));
      } catch (e) {
        console.log('Verification progress not available');
        setVerificationProgress(0);
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
