// src/components/modals/UpgradePrompt.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

/**
 * UpgradePrompt – shown when a driver tries to access a feature they don't have a tier for.
 * Props:
 *   currentTier   – the driver’s current tier string
 *   requiredTier  – the tier needed for the feature
 *   onUpgrade     – callback when the user clicks the upgrade button (navigate to subscription page)
 */
export default function UpgradePrompt({ currentTier, requiredTier, onUpgrade }) {
  return (
    <Dialog open={true} maxWidth="xs" fullWidth>
      <DialogTitle>Upgrade Required</DialogTitle>
      <DialogContent>
        <p>
          Your current subscription tier <strong>{currentTier}</strong> does not grant access to this feature.
        </p>
        <p>
          To unlock <strong>{requiredTier}</strong>-level capabilities, please upgrade your plan.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onUpgrade} color="primary" variant="contained">
          Upgrade Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}
