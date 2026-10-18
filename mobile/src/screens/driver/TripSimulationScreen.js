import React from 'react';
import DriverAssessmentScreen from './DriverAssessmentScreen';

/**
 * TripSimulationScreen
 * Delegates directly to DriverAssessmentScreen so all driver simulation routes
 * render the interactive Nigerian FRSC Road Signs & Highway Code Simulation Game.
 * Drivers are platform operators, not system admins, and should never be shown
 * admin telemetry sandboxes or developer dispatch test cards.
 */
export default function TripSimulationScreen(props) {
  return <DriverAssessmentScreen {...props} />;
}
