// src/components/common/SubscriptionGate.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import UpgradePrompt from '../modals/UpgradePrompt';

/**
 * SubscriptionGate – renders children only if the logged‑in driver meets the required tier.
 * Required tier hierarchy: basic < executive < enterprise.
 * If the driver does not meet the tier, an UpgradePrompt modal is displayed.
 */
const tierOrder = {
  basic: 0,
  executive: 1,
  enterprise: 2,
};

export default function SubscriptionGate({ requiredTier = 'basic', children }) {
  const { subscription } = useDriverProfile();
  const navigate = useNavigate();

  const userTier = subscription?.tier || 'basic';
  const hasAccess = tierOrder[userTier] >= tierOrder[requiredTier];

  if (!hasAccess) {
    return (
      <UpgradePrompt
        currentTier={userTier}
        requiredTier={requiredTier}
        onUpgrade={() => navigate('/settings/subscription')}
      />
    );
  }

  return <>{children}</>;
}
