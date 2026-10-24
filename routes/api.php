<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\TelemetryController;
use App\Http\Controllers\Api\DisputeController;
use App\Http\Controllers\Api\HeadlessApiController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\HandoverController;
use App\Http\Controllers\Api\SosController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\InfractionController;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\HirerController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\BlacklistController;
use App\Http\Controllers\HirerDashboardController;
use App\Http\Controllers\EnterpriseSlaController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminDriverController;
use App\Http\Controllers\Api\Admin\AdminJobController;
use App\Http\Controllers\Api\Admin\AdminFinancialController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminTelemetryController;
use App\Http\Controllers\Api\Admin\AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\Admin\AdminContentController;
use App\Http\Controllers\Api\Admin\AdminSecurityController;
use App\Http\Controllers\Api\Admin\AdminHirerController;
use App\Http\Controllers\Api\Admin\AdminDisputeController;
use App\Http\Controllers\Api\Admin\AdminDrivingSchoolController;
use App\Http\Controllers\Api\Admin\AdminCarHireController;
use App\Http\Controllers\Api\Admin\AdminManagementController;
use App\Http\Controllers\Api\Admin\AiVerificationController;
use App\Http\Controllers\Api\Admin\SubscriptionDunningController;
use App\Http\Controllers\Api\Admin\DocumentVerificationController;
use App\Http\Controllers\Api\DrivingSchoolController;
use App\Http\Controllers\Api\ExecutiveCarHireController;
use App\Http\Controllers\Api\Driver\VerificationFeeController;
use App\Http\Controllers\Api\Driver\DriverQualificationController;
use App\Http\Controllers\Api\Driver\InsuranceController;
use App\Http\Controllers\Api\LaunchZoneController;
use App\Http\Controllers\Api\DriverVerificationController;
use App\Http\Controllers\Api\SupportChatController;
/*
|--------------------------------------------------------------------------
| Ogadriver.ng API Routes
|--------------------------------------------------------------------------
|
| Enterprise-grade driver marketplace API endpoints
|
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'platform' => 'Ogadriver.ng',
        'status' => 'active',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// App Config (Mobile Force Update & Maintenance)
Route::prefix('v1')->group(function () {
// Bank Account Resolution & Bank List (Available for Hirer and Driver Payments)
Route::get('/bank/banks', [\App\Http\Controllers\Api\DriverPayoutController::class, 'getBanks']);
Route::post('/bank/resolve', [\App\Http\Controllers\Api\DriverPayoutController::class, 'resolveAccount']);
Route::get('/banks', [\App\Http\Controllers\Api\DriverPayoutController::class, 'getBanks']);

    Route::get('/app-config', [\App\Http\Controllers\Api\AppConfigController::class, 'index']);
});

// Site Content (Public)
Route::get('/site-content', [SiteContentController::class, 'index']);
Route::get('/settings/public', [\App\Http\Controllers\Api\Admin\AdminSettingsController::class, 'getPublicSettings']);

// Google OAuth is handled via web.php routes (session-based, required for OAuth redirects)

Route::prefix('auth')->middleware('throttle:6,1')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/register/device', [RegisterController::class, 'registerWithDevice']);
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/request-otp', [LoginController::class, 'requestOtp']);
    Route::post('/login-otp', [LoginController::class, 'loginWithOtp']);
    Route::post('/google', [GoogleAuthController::class, 'tokenLogin']);
    Route::post('/google-token', [GoogleAuthController::class, 'tokenLogin']);
    Route::post('/verify', [RegisterController::class, 'verify']);
    Route::post('/resend-verification', [RegisterController::class, 'resendVerification']);
    Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetCode']);
    Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);
});

Route::post('/corporate/vip-register', [\App\Http\Controllers\Api\CorporateFleetController::class, 'registerVipFleet']);

// Authenticated Routes (using Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [LoginController::class, 'logout']);
    Route::get('/auth/me', [LoginController::class, 'me']);
    Route::get('/user', [LoginController::class, 'me']);
    Route::post('/user/password', [LoginController::class, 'changePassword']);
    Route::put('/user/profile', [LoginController::class, 'updateProfile']);
    Route::post('/user/profile', [LoginController::class, 'updateProfile']);
    Route::post('/auth/onboarding', [OnboardingController::class, 'completeOnboarding']);
    Route::post('/auth/avatar', [LoginController::class, 'uploadAvatar']);
    Route::post('/referral/withdraw', [ReferralController::class, 'withdraw']);
    Route::get('/referral', [ReferralController::class, 'getReferral']);
    Route::post('/referral/claim', [ReferralController::class, 'claimBonus']);
    Route::delete('/user/account', [LoginController::class, 'deleteAccount']);
});

// Public search endpoints (no auth required for basic search)
Route::prefix('search')->group(function () {
    Route::get('/drivers', [SearchController::class, 'searchDrivers']);
    Route::get('/jobs', [SearchController::class, 'searchJobs']);
    Route::get('/heatmap', [SearchController::class, 'getDriverHeatmap']);
    Route::get('/driver-count', [SearchController::class, 'getOnlineDriverCount']);
});

// Launch Zone endpoints (public for registration & active city lookup)
Route::prefix('launch-zone')->group(function () {
    Route::get('/active-locations', [LaunchZoneController::class, 'getActiveLocations']);
    Route::get('/config', [LaunchZoneController::class, 'getConfig']);
    Route::get('/states', [LaunchZoneController::class, 'getAllowedStates']);
    Route::get('/cities', [LaunchZoneController::class, 'getAllowedCities']);
    Route::post('/check', [LaunchZoneController::class, 'checkLocation']);
});

Route::get('/countries', [\App\Http\Controllers\LocationController::class, 'countries']);
Route::get('/states/{country_id}', [\App\Http\Controllers\LocationController::class, 'states']);
Route::get('/cities/{state_id}', [\App\Http\Controllers\LocationController::class, 'cities']);

// Webhooks for Payment Providers (OPay/Moniepoint)
Route::post('/webhooks/payment', [WebhookController::class, 'handlePaymentNotification']);
Route::get('/payments/callback', [PaymentController::class, 'callback']);
Route::get('/payments/opay/callback', [PaymentController::class, 'callback']);

// Public tracking endpoint (with secure token)
Route::get('/driving-schools', [\App\Http\Controllers\Api\DrivingSchoolController::class, 'index']);
Route::get('/driving-schools/{slug}', [\App\Http\Controllers\Api\DrivingSchoolController::class, 'show']);
Route::get('/executive-car-hires', [\App\Http\Controllers\Api\ExecutiveCarHireController::class, 'index']);
Route::get('/executive-car-hires/{slug}', [\App\Http\Controllers\Api\ExecutiveCarHireController::class, 'show']);
Route::get('/tracking/{booking}/{token}', [BookingController::class, 'getLiveTracking']);

// NOTE: Public driver marketplace endpoints removed for security
// All driver browsing now requires authentication to prevent kidnapping risks

// Protected API routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {

    // Driver management
    Route::apiResource('drivers', DriverController::class);

    // Ruthless Driver Portal API Endpoints
    Route::get('/drivers/payout/banks', [\App\Http\Controllers\Api\DriverPayoutController::class, 'getBanks']);
    Route::post('/drivers/payout/resolve', [\App\Http\Controllers\Api\DriverPayoutController::class, 'resolveAccount']);
    Route::post('/drivers/payout/request', [\App\Http\Controllers\Api\DriverPayoutController::class, 'requestPayout'])->middleware('throttle:financial');
    Route::get('/drivers/payout/history', [\App\Http\Controllers\Api\DriverPayoutController::class, 'getHistory']);

    Route::post('/drivers/sos/trigger', [\App\Http\Controllers\Api\EmergencySosController::class, 'triggerSos'])->middleware('throttle:financial');
    Route::post('/sos/trigger', [\App\Http\Controllers\Api\EmergencySosController::class, 'triggerSos'])->middleware('throttle:financial');
    Route::post('/drivers/sos/reverse', [\App\Http\Controllers\Api\EmergencySosController::class, 'triggerSos'])->middleware('throttle:financial');
    
    // Apex Protocol Routes
    Route::post('/security/verify-driver-identity', [\App\Http\Controllers\Api\SecurityController::class, 'verifyIdentity']);
    Route::post('/emergency/covert-alert', [\App\Http\Controllers\Api\EmergencySosController::class, 'covertAlert']);
    
    Route::get('/drivers/copilot/demand-radar', [\App\Http\Controllers\Api\OgaCopilotController::class, 'getDemandRadar']);
    Route::get('/drivers/nearby-activities', [\App\Http\Controllers\Api\DriverActivitiesController::class, 'getActivities']);
    Route::get('/driver/nearby-activities', [\App\Http\Controllers\Api\DriverActivitiesController::class, 'getActivities']);

    Route::get('/drivers/sprints/active', [\App\Http\Controllers\Api\WeeklySprintController::class, 'getActiveSprint']);
    Route::post('/drivers/sprints/claim', [\App\Http\Controllers\Api\WeeklySprintController::class, 'claimPrize']);

    Route::get('/drivers/perks', [\App\Http\Controllers\Api\DriverPerksController::class, 'getPerks']);
    Route::post('/drivers/perks/qr', [\App\Http\Controllers\Api\DriverPerksController::class, 'generateQr']);

    Route::get('/drivers/documents/butler', [\App\Http\Controllers\Api\DocumentButlerController::class, 'getStatus']);
    Route::post('/drivers/documents/auto-renew', [\App\Http\Controllers\Api\DocumentButlerController::class, 'requestRenewal']);

    // Oga Radio Walkie-Talkie & Half-Duplex Floor Arbitration
    Route::get('/drivers/radio/channels', [\App\Http\Controllers\Api\OgaRadioController::class, 'getChannels']);
    Route::get('/drivers/radio/status', [\App\Http\Controllers\Api\OgaRadioController::class, 'getStatus']);
    Route::post('/drivers/radio/floor/request', [\App\Http\Controllers\Api\OgaRadioController::class, 'requestFloor']);
    Route::post('/drivers/radio/floor/release', [\App\Http\Controllers\Api\OgaRadioController::class, 'releaseFloor']);

    // Corporate VIP Fleet Accounts (Lorenzo Emilio Fleet & Access Control)
    Route::get('/corporate/vip-fleet', [\App\Http\Controllers\Api\CorporateFleetController::class, 'getVipFleet']);
    Route::get('/corporate/vip-status', [\App\Http\Controllers\Api\CorporateFleetController::class, 'checkVipStatus']);
    Route::post('/corporate/vip-subscribe', [\App\Http\Controllers\Api\CorporateFleetController::class, 'subscribeVipFleet']);
    Route::post('/corporate/vip-book', [\App\Http\Controllers\Api\CorporateFleetController::class, 'bookVipFleet']);

    Route::apiResource('jobs', JobController::class);
    Route::post('/jobs/{job}/sign-nda', [JobController::class, 'signNda']);

    // Booking management (direct driver hiring + open ride bids)
    Route::get('my-bookings', [BookingController::class, 'getMyBookings']);
    Route::get('bookings/my', [BookingController::class, 'getMyBookings']);
    Route::match(['get', 'post'], 'bookings/search-drivers', [BookingController::class, 'searchDrivers']);
    Route::get('marketplace/open-rides', [BookingController::class, 'openRideBids']);
    Route::post('bookings/calculate-fare', [BookingController::class, 'calculateFare']);
    Route::post('bookings/sync-offline', [BookingController::class, 'syncOfflineBookings']);
    Route::apiResource('bookings', BookingController::class);
    Route::post('bookings/{booking}/accept', [BookingController::class, 'acceptBooking']);

    // Rides Alias Endpoints (Ride Schedules & Bidding)
    Route::get('rides/scheduled', [BookingController::class, 'getScheduledRides']);
    Route::get('rides/recurring-subscriptions', [BookingController::class, 'getRecurringSubscriptions']);
    Route::post('rides/recurring-subscriptions/{booking}/toggle', [BookingController::class, 'toggleRecurringSubscription']);
    Route::get('rides/active', [BookingController::class, 'getActiveRide']);
    Route::get('rides/history', [BookingController::class, 'getRideHistory']);
    Route::post('rides/request', [BookingController::class, 'store']);
    Route::get('driver/proposals', [BookingController::class, 'getDriverProposals']);
    Route::get('drivers/{driver}/proposals', [BookingController::class, 'getDriverProposals']);
    Route::get('driver/contracts', [BookingController::class, 'getDriverContracts']);
    Route::get('drivers/{driver}/contracts', [BookingController::class, 'getDriverContracts']);
    Route::get('driver/ratings', [BookingController::class, 'getRideHistory']);
    Route::post('rides/{booking}/bid', [BookingController::class, 'submitBid']);
    Route::post('rides/{booking}/accept-bid/{bid?}', [BookingController::class, 'acceptBid']);
    Route::post('rides/{booking}/cancel', [BookingController::class, 'cancelBooking']);

    // Payment
    Route::post('payments/verification-fee', [PaymentController::class, 'initiateVerificationFee']);
    Route::post('bookings/{booking}/decline', [BookingController::class, 'declineBooking']);
    Route::post('bookings/{booking}/start', [BookingController::class, 'startBooking']);
    Route::post('bookings/{booking}/complete', [BookingController::class, 'completeBooking']);
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancelBooking']);
    Route::post('bookings/{booking}/review', [BookingController::class, 'submitReview']);
    Route::post('bookings/{booking}/generate-pin', [BookingController::class, 'generateSecurityPin']);
    Route::post('bookings/{booking}/verify-pin', [BookingController::class, 'verifySecurityPin'])->middleware('throttle:pin-verify');
    Route::post('bookings/{booking}/extend-destination', [BookingController::class, 'extendDestination']);
    Route::post('bookings/sync-offline-waypoints', [BookingController::class, 'syncOfflineWaypoints']);
    Route::post('bookings/{booking}/share-tracking', [BookingController::class, 'generateTrackingShareLink']);

    // Driver search (authenticated only for security)
    Route::get('directory/drivers', [BookingController::class, 'searchDrivers']);
    Route::get('marketplace/drivers', [BookingController::class, 'searchDrivers']);
    Route::get('marketplace/drivers/{driver}', [BookingController::class, 'getDriverProfile']);

    // Driver Availability Calendar
    Route::get('driver/availability', [AvailabilityController::class, 'index']);
    Route::post('driver/availability', [AvailabilityController::class, 'store']);
    Route::get('hirer/drivers/{id}/availability', [AvailabilityController::class, 'getForEmployer']);

    // Dispute management
    Route::get('disputes/statistics', [DisputeController::class, 'statistics']);
    Route::apiResource('disputes', DisputeController::class);
    Route::post('disputes/{dispute}/assign', [DisputeController::class, 'assign']);
    Route::post('disputes/{dispute}/resolve', [DisputeController::class, 'resolve']);
    Route::post('disputes/{dispute}/escalate', [DisputeController::class, 'escalate']);
    Route::post('disputes/{dispute}/close', [DisputeController::class, 'close']);

    // Driver-specific endpoints
    Route::prefix('drivers')->middleware(['role:driver'])->group(function () {
        Route::get('{driver}/referral', [\App\Http\Controllers\Api\ReferralController::class, 'getReferral']);
        Route::post('{driver}/referral/claim', [\App\Http\Controllers\Api\ReferralController::class, 'claimBonus']);
        Route::post('{driver}/location', [DriverController::class, 'updateLocation']);
        Route::post('{driver}/toggle-online', [DriverController::class, 'toggleOnline']);
        Route::get('{driver}/earnings-summary', [DriverController::class, 'getEarningsSummary']);
        Route::get('{driver}/destination-mode', [DriverController::class, 'getDestinationMode']);
        Route::post('{driver}/destination-mode', [DriverController::class, 'updateDestinationMode']);
        Route::get('{driver}/documents', [DriverController::class, 'getDocuments']);
        Route::post('{driver}/documents', [DriverController::class, 'uploadDocument']);
        Route::post('pay-relisting-fee', [DriverController::class, 'payRelistingFee']);
        Route::get('{driver}/documents/missing', [DriverController::class, 'getMissingDocuments']);
        Route::get('{driver}/documents/expiring', [DriverController::class, 'getExpiringDocuments']);
        Route::post('{driver}/documents/{documentId}/validate', [DriverController::class, 'validateDocument']);
        Route::post('documents/real-time-validate', [DriverController::class, 'realTimeValidateDocument']);
        Route::get('{driver}/wallet', [DriverController::class, 'getWallet']);
        Route::get('{driver}/earnings', [DriverController::class, 'getEarnings']);
        Route::post('guarantors/submit', [\App\Http\Controllers\Api\GuarantorVerificationController::class, 'store']);
        Route::post('guarantors/{id}/voice-call', [\App\Http\Controllers\Api\GuarantorVerificationController::class, 'triggerAiVoiceCall']);
        Route::get('guarantors/verify/{token}', [\App\Http\Controllers\Api\GuarantorVerificationController::class, 'verifyToken']);
        Route::get('verification-status', [DriverController::class, 'getVerificationStatus']);
        Route::get('verification/progress', [DriverController::class, 'getVerificationStatus']);
        Route::post('update-vehicle', [DriverController::class, 'updateVehicleProfile']);
        Route::get('boost-status', [DriverController::class, 'getBoostStatus']);
        Route::post('boost', [DriverController::class, 'activateBoost']);

        // Reviews
        Route::get('{driver}/reviews', [DriverController::class, 'getReviews']);

        // Simulator Training
        Route::get('simulator/modules', [DriverController::class, 'getSimulatorModules']);
        Route::get('simulator/questions', [DriverController::class, 'getSimulatorQuestions']);
        Route::post('simulator/submit', [DriverController::class, 'saveSimulatorResult']);
        Route::post('simulator/result', [DriverController::class, 'saveSimulatorResult']);
        Route::get('simulator/leaderboard', [DriverController::class, 'getSimulatorLeaderboard']);
        Route::get('simulator/certificate', [DriverController::class, 'getSimulatorCertificate']);
    });

    // Driver alias endpoints (supporting singular /driver/ path from mobile clients)
    Route::prefix('driver')->middleware(['role:driver'])->group(function () {
        Route::get('simulator/modules', [DriverController::class, 'getSimulatorModules']);
        Route::get('simulator/questions', [DriverController::class, 'getSimulatorQuestions']);
        Route::post('simulator/submit', [DriverController::class, 'saveSimulatorResult']);
        Route::post('simulator/result', [DriverController::class, 'saveSimulatorResult']);
        Route::get('simulator/leaderboard', [DriverController::class, 'getSimulatorLeaderboard']);
        Route::get('simulator/certificate', [DriverController::class, 'getSimulatorCertificate']);
    });

    // Verification Fee endpoints
    Route::prefix('verification-fee')->group(function () {
        Route::get('/info', [VerificationFeeController::class, 'getFeeInfo']);
        Route::get('/status', [VerificationFeeController::class, 'getVerificationStatus']);
        Route::post('/initiate', [VerificationFeeController::class, 'initiatePayment']);
        Route::post('/webhook', [VerificationFeeController::class, 'handlePaymentWebhook']);
        Route::get('/trial-status', [VerificationFeeController::class, 'getTrialStatus']);
    });

    // Driver Qualification endpoints
    Route::prefix('qualification')->group(function () {
        Route::get('/check', [DriverQualificationController::class, 'checkQualification']);
        Route::get('/metrics', [DriverQualificationController::class, 'getQualificationMetrics']);
        Route::post('/upgrade', [DriverQualificationController::class, 'requestUpgrade']);
        Route::get('/approaching', [DriverQualificationController::class, 'getApproachingQualification']);
    });

    // Insurance endpoints
    Route::prefix('insurance')->group(function () {
        Route::get('/status', [InsuranceController::class, 'getInsuranceStatus']);
        Route::get('/documents', [InsuranceController::class, 'getInsuranceDocuments']);
        Route::get('/hybrid-recommendations', [InsuranceController::class, 'checkHybridRecommendations']);
        Route::post('/validate/{documentId}', [InsuranceController::class, 'validateDocument']);
        Route::get('/expiry-warnings', [InsuranceController::class, 'getExpiryWarnings']);
        Route::get('/partnership-recommendations', [InsuranceController::class, 'getPartnershipRecommendations']);
    });

    // Reverse SOS / Extortion Shield
    Route::post('drivers/sos/reverse', [SosController::class, 'triggerReverseSos']);

    // Reverse Geocoding via LocationIQ
    Route::get('location/reverse', function (\Illuminate\Http\Request $request, \App\Services\LocationIqService $service) {
        $lat = (float) $request->query('lat');
        $lng = (float) $request->query('lng');
        if (!$lat || !$lng) {
            return response()->json(['status' => 'error', 'message' => 'Latitude and longitude required'], 422);
        }
        $res = $service->reverseGeocode($lat, $lng);
        return response()->json([
            'status' => 'success',
            'display_name' => $res['display_name'] ?? null,
            'address' => $res['address'] ?? [],
        ]);
    });

    // Driver Telemetry Ingestion
    Route::post('telemetry/stream', [TelemetryController::class, 'store']);

    // Handover Endpoints
    Route::post('contracts/{contract}/handover', [HandoverController::class, 'submitChecklist']);
    Route::post('contracts/{contract}/handover/verify', [HandoverController::class, 'verifyChecklist']);

    // Asset Care & Compliance
    Route::post('hirer/infractions', [InfractionController::class, 'store']);
    Route::post('driver/inspections', [InspectionController::class, 'store']);
    Route::get('hirer/analytics/overview', [AnalyticsController::class, 'getOverview']);
    Route::get('hirer/analytics/export', [AnalyticsController::class, 'exportPayroll']);

    // Job-specific endpoints
    Route::prefix('jobs')->group(function () {
        Route::get('heatmap', [JobController::class, 'getJobHeatmap']);
        Route::get('nearby', [JobController::class, 'getNearbyJobs']);
        Route::post('{job}/apply', [JobController::class, 'apply']);
        Route::post('{job}/invite', [JobController::class, 'inviteDriver']);
        Route::post('{job}/assign', [JobController::class, 'assignDriver']);
        Route::post('{job}/start', [JobController::class, 'startJob']);
        Route::post('{job}/complete', [JobController::class, 'completeJob']);
        Route::post('{job}/cancel', [JobController::class, 'cancelJob']);
        Route::get('{job}/applications', [JobController::class, 'getApplications']);
    });

    // Favorite drivers (for hirers)
    Route::get('/favorites', [SearchController::class, 'searchFavoriteDrivers']);
    Route::post('/favorites/{driver_id}', [SearchController::class, 'addFavorite']);
    Route::delete('/favorites/{driver_id}', [SearchController::class, 'removeFavorite']);

    // Wallet endpoints
    Route::prefix('wallet')->group(function () {
        Route::get('/', [WalletController::class, 'index']);
        Route::post('/topup', [WalletController::class, 'topUp']);
        Route::post('/credit', [WalletController::class, 'topUp']);
        Route::post('/deposit', [WalletController::class, 'topUp']);
        Route::post('/withdraw', [WalletController::class, 'requestPayout']);
        Route::post('/payout', [WalletController::class, 'requestPayout']);
        Route::get('/lookup', [WalletController::class, 'lookupRecipient']);
        Route::post('/transfer', [WalletController::class, 'transfer']);
        Route::post('/gift', [WalletController::class, 'transfer']);
        Route::get('/hire-points', [WalletController::class, 'getHirePointsStatus']);
        Route::post('/hire-points/buy', [WalletController::class, 'purchaseHirePoints']);
    });

    // System Health
    Route::get('/system/health', [\App\Http\Controllers\Api\Admin\SystemHealthController::class, 'index']);

    // Subscription endpoints
    Route::prefix('subscription')->group(function () {
        Route::get('/', [SubscriptionController::class, 'status']);
        Route::get('/plans', [SubscriptionController::class, 'plans']);
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
        Route::post('/renew', [SubscriptionController::class, 'renew']);
        // New routes for Shield addâ€‘on and checkout
        Route::post('/shield', [SubscriptionController::class, 'toggleShield']);
        Route::post('/recurring-charge', [SubscriptionController::class, 'chargeRecurringSubscription']);
    });

    Route::post('/payments/verify', [PaymentController::class, 'verify']);

    // Loyalty Points
    Route::prefix('loyalty')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\LoyaltyController::class, 'index']);
        Route::post('/redeem', [\App\Http\Controllers\Api\LoyaltyController::class, 'redeem']);
    });

    // Hirer KYC & Monetization
    Route::post('/hirer/kyc', [HirerController::class, 'updateKyc']);
    Route::post('/hirer/unlock-driver', [HirerController::class, 'unlockDriver']);
    Route::get('/hirer/fleet-telemetry', [HirerController::class, 'getFleetTelemetry']);

    // Messaging
    Route::get('/messages/conversations', [\App\Http\Controllers\Api\MessageController::class, 'index']);
    Route::get('/messages/conversations/{id}', [\App\Http\Controllers\Api\MessageController::class, 'getMessages']);
    Route::post('/messages/conversations/{id}', [\App\Http\Controllers\Api\MessageController::class, 'store']);
    Route::post('/messages/start', [\App\Http\Controllers\Api\MessageController::class, 'start']);

    // Support Tickets
    Route::get('/tickets', [\App\Http\Controllers\Api\TicketController::class, 'index']);
    Route::post('/tickets', [\App\Http\Controllers\Api\TicketController::class, 'store']);
    Route::post('/tickets/{id}/reply', [\App\Http\Controllers\Api\TicketController::class, 'reply']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/fcm-token', [\App\Http\Controllers\Api\NotificationController::class, 'updateFcmToken']);
    Route::get('/notifications/document-alerts', [\App\Http\Controllers\Api\NotificationController::class, 'getDocumentAlerts']);

    // Mobile Convenience & Sync Aliases
    Route::post('/wallet/convert-points', [\App\Http\Controllers\Api\LoyaltyController::class, 'redeem']);
    Route::post('/user/push-token', [\App\Http\Controllers\Api\NotificationController::class, 'updateFcmToken']);
    Route::post('bookings/{booking}/security-pin', [BookingController::class, 'generateSecurityPin']);
    Route::get('/my-applications', [BookingController::class, 'getDriverProposals']);

    // User Saved Places Sync
    Route::post('/v1/user/saved-places', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        if ($user && $user->driver) {
            $user->driver->update(['saved_places' => $request->all()]);
        }
        return response()->json(['success' => true, 'message' => 'Saved places synced successfully']);
    });
    Route::get('/v1/user/saved-places', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $places = $user && $user->driver ? ($user->driver->saved_places ?? []) : [];
        return response()->json(['success' => true, 'data' => $places]);
    });

    // Client Identity / KYC Verification Sync
    Route::post('/v1/user/verify-identity', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        if ($user && $user->hirer) {
            $user->hirer->update(['verification_status' => 'verified']);
        }
        return response()->json(['success' => true, 'message' => 'Identity verified successfully']);
    });
});

// Telemetry endpoints (admin only)
Route::middleware(['auth:sanctum', 'admin'])->prefix('telemetry')->group(function () {
    Route::get('/', [TelemetryController::class, 'index']);
    Route::get('/realtime', [TelemetryController::class, 'realtime']);
    Route::get('/historical', [TelemetryController::class, 'historical']);
    Route::get('/drivers', [TelemetryController::class, 'drivers']);
    Route::get('/jobs', [TelemetryController::class, 'jobs']);
    Route::get('/financials', [TelemetryController::class, 'financials']);

    // Site Content Update (Admin)
    Route::put('/site-content', [SiteContentController::class, 'update']);
});

// Admin Dashboard Endpoints
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/profile', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'update']);
    Route::post('/profile/avatar', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'uploadAvatar']);

    Route::get('/dashboard/overview', [AdminDashboardController::class, 'overview']);
    Route::get('/dashboard/regional', [AdminDashboardController::class, 'regionalOverview']);
    Route::get('/analytics/advanced', [AdminDashboardController::class, 'advancedAnalytics']);

    Route::get('/search', [AdminDashboardController::class, 'smartSearch']);

    // Super Admin High-Impact API Endpoints
    Route::get('/fleet/live-map', [\App\Http\Controllers\Api\Admin\AdminFleetRadarController::class, 'getLiveMapData']);
    Route::get('/payouts/pending', [\App\Http\Controllers\Api\Admin\BatchPayoutController::class, 'getPendingPayouts']);
    Route::post('/payouts/batch-approve', [\App\Http\Controllers\Api\Admin\BatchPayoutController::class, 'batchApprove']);

    Route::get('/ai/guarantor-calls', [\App\Http\Controllers\Api\Admin\AiGuarantorMonitorController::class, 'getCallLogs']);
    Route::get('/server/diagnostics', [\App\Http\Controllers\Api\Admin\ServerMaintenanceController::class, 'getDiagnostics']);
    Route::post('/server/clear-cache', [\App\Http\Controllers\Api\Admin\ServerMaintenanceController::class, 'clearCache']);
    Route::get('/launch-zones/report', [LaunchZoneController::class, 'getAdminReport']);
    Route::post('/launch-zones/toggle', [LaunchZoneController::class, 'toggleActivation']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::post('/users/{id}/suspend', [AdminUserController::class, 'suspend'])->middleware('role:super_admin,security_admin');
    Route::post('/users/{id}/permaban', [AdminUserController::class, 'permaban'])->middleware('role:super_admin,security_admin');
    Route::post('/users/{id}/reset-password', [AdminUserController::class, 'resetPassword']);
    Route::post('/users/{id}/credit', [AdminUserController::class, 'creditWallet'])->middleware('role:super_admin');
    Route::post('/users/{id}/role', [AdminUserController::class, 'updateRole'])->middleware('role:super_admin');
    Route::post('/users/{id}/message', [AdminUserController::class, 'sendMessage']);
    Route::post('/users/{id}/manual-verify', [AdminUserController::class, 'manualVerifyRegistration']);
    Route::post('/users/{id}/resend-code', [AdminUserController::class, 'resendVerificationCode']);


    Route::get('/hirers', [AdminHirerController::class, 'index']);
    Route::get('/hirers/{id}', [AdminHirerController::class, 'show']);
    Route::post('/hirers/{id}/suspend', [AdminHirerController::class, 'suspend'])->middleware('role:super_admin,security_admin');
    Route::post('/hirers/{id}/approve-kyc', [AdminHirerController::class, 'approveKyc']);
    Route::post('/hirers/{id}/reject-kyc', [AdminHirerController::class, 'rejectKyc']);
    Route::get('/admins', [AdminManagementController::class, 'index']);
    Route::post('/admins', [AdminManagementController::class, 'store']);
    Route::put('/admins/{id}', [AdminManagementController::class, 'update']);
    Route::delete('/admins/{id}', [AdminManagementController::class, 'destroy']);

    Route::get('/drivers', [AdminDriverController::class, 'index']);
    Route::get('/drivers/{id}', [AdminDriverController::class, 'show']);
    Route::put('/drivers/{id}', [AdminDriverController::class, 'update']);
    Route::get('/drivers/{driver_id}/location-history', [AdminDriverController::class, 'locationHistory']);
    Route::get('/drivers-performance', [AdminDriverController::class, 'performance']);
    Route::get('/drivers-verifications', [AdminDriverController::class, 'verifications']);
    Route::post('/drivers/{id}/approve', [AdminDriverController::class, 'approveVerification']);
    Route::post('/drivers/{id}/reject', [AdminDriverController::class, 'rejectVerification']);
    Route::post('/drivers/{id}/remind', [AdminDriverController::class, 'remindMissingDocuments']);
    Route::post('/drivers/{driverId}/documents/{documentId}/approve', [AdminDriverController::class, 'approveDocument']);
    Route::post('/drivers/{driverId}/documents/{documentId}/reject', [AdminDriverController::class, 'rejectDocument']);

    // Jobs & Escrow
    Route::get('/jobs', [AdminJobController::class, 'index']);
    Route::get('/jobs/active', [AdminJobController::class, 'activeJobs']);
    Route::get('/jobs/completed', [AdminJobController::class, 'completedJobs']);
    Route::get('/jobs/disputes', [AdminJobController::class, 'jobDisputes']);
    Route::get('/jobs/disputes/{id}/dashboard', [\App\Http\Controllers\Api\Admin\DisputeDashboardController::class, 'show']);
    
    // Dispute Management
    Route::get('/disputes', [AdminDisputeController::class, 'index']);
    Route::post('/disputes/{id}/resolve', [AdminDisputeController::class, 'resolve']);
    Route::post('/disputes/{id}/escalate', [AdminDisputeController::class, 'escalate']);

    Route::get('/financials', [AdminFinancialController::class, 'index']);
    Route::get('/financials/transactions', [AdminFinancialController::class, 'transactions']);
    Route::get('/financials/revenue', [AdminFinancialController::class, 'revenueAnalytics']);

    // Protect Treasury and Forecast routes using RBAC middleware
    Route::middleware('admin.dept:treasury,super')->group(function () {
        Route::get('/financials/treasury', [AdminFinancialController::class, 'getTreasuryStats']);
        Route::get('/financials/forecast', [AdminFinancialController::class, 'getForecast']);
    });

    Route::get('/subscriptions/payments', [AdminFinancialController::class, 'subscriptionPayments']);
    Route::get('/subscriptions/plans', [AdminFinancialController::class, 'subscriptionPlans']);
    Route::post('/subscriptions/plans', [AdminFinancialController::class, 'storeSubscriptionPlan']);
    Route::put('/subscriptions/plans/{id}', [AdminFinancialController::class, 'updateSubscriptionPlan']);
    Route::delete('/subscriptions/plans/{id}', [AdminFinancialController::class, 'deleteSubscriptionPlan']);



    Route::get('/telemetry', [AdminTelemetryController::class, 'index']);
    Route::get('/telemetry/incidents', [AdminTelemetryController::class, 'incidents']);

    Route::get('/subscriptions', [AdminSubscriptionController::class, 'index']);
    Route::get('/subscriptions/payments', [AdminFinancialController::class, 'subscriptionPayments']);
    Route::get('/subscriptions/plans', [AdminFinancialController::class, 'subscriptionPlans']);
    Route::post('/subscriptions/plans', [AdminFinancialController::class, 'storeSubscriptionPlan']);
    Route::put('/subscriptions/plans/{id}', [AdminFinancialController::class, 'updateSubscriptionPlan']);
    Route::delete('/subscriptions/plans/{id}', [AdminFinancialController::class, 'deleteSubscriptionPlan']);

    // Settings (General, API, Notifications)
    Route::get('/settings/general', [AdminSettingsController::class, 'index']);
    Route::put('/settings/general', [AdminSettingsController::class, 'update']);
    Route::get('/settings/api', [AdminSettingsController::class, 'getApiSettings']);
    Route::put('/settings/api', [AdminSettingsController::class, 'updateApiSettings']);
    Route::get('/settings/notifications', [AdminSettingsController::class, 'getNotificationSettings']);
    Route::put('/settings/notifications', [AdminSettingsController::class, 'updateNotificationSettings']);
    // Rate limit management endpoints
    Route::get('/settings/rate-limits', [\App\Http\Controllers\Api\Admin\RateLimitController::class, 'index']);
    Route::put('/settings/rate-limits', [\App\Http\Controllers\Api\Admin\RateLimitController::class, 'update']);
    
    // Cache Management
    Route::post('/settings/cache/clear', [AdminSettingsController::class, 'clearCache']);
    Route::post('/system/trigger-ota', [AdminSettingsController::class, 'triggerOta']);
    Route::get('/settings/cache/status', [AdminSettingsController::class, 'getCacheStatus']);

    // Content Management
    Route::get('/content/blog', [AdminContentController::class, 'getBlogPosts']);
    Route::put('/content/blog', [AdminContentController::class, 'updateBlogPosts']);
    Route::get('/content/site', [AdminContentController::class, 'getSiteContent']);
    Route::put('/content/site', [AdminContentController::class, 'updateSiteContent']);
    Route::post('/content/site/image', [AdminContentController::class, 'uploadContentImage']);

    // Directories Management
    Route::post('/driving-schools/{id}', [AdminDrivingSchoolController::class, 'update']);
    Route::post('/car-hires/{id}', [AdminCarHireController::class, 'update']);
    Route::apiResource('/driving-schools', AdminDrivingSchoolController::class);
    Route::apiResource('/car-hires', AdminCarHireController::class);

    // Security & Audit
    Route::get('/security/logs', [AdminSecurityController::class, 'getAuditLogs']);
    Route::get('/security/settings', [AdminSecurityController::class, 'getSecuritySettings']);
    Route::put('/security/settings', [AdminSecurityController::class, 'updateSecuritySettings']);
    Route::get('/security/blacklist', [AdminSecurityController::class, 'getBlacklist']);
    Route::post('/security/blacklist', [AdminSecurityController::class, 'addToBlacklist']);
    Route::delete('/security/blacklist/{id}', [AdminSecurityController::class, 'removeFromBlacklist']);

    // Communications
    Route::get('/communications/broadcasts', [\App\Http\Controllers\Api\Admin\AdminCommunicationController::class, 'getBroadcasts']);
    Route::post('/communications/broadcasts', [\App\Http\Controllers\Api\Admin\AdminCommunicationController::class, 'storeBroadcast']);
    Route::get('/communications/tickets', [\App\Http\Controllers\Api\Admin\AdminCommunicationController::class, 'getTickets']);
    Route::put('/communications/tickets/{id}', [\App\Http\Controllers\Api\Admin\AdminCommunicationController::class, 'updateTicketStatus']);
    Route::post('/communications/tickets/{id}/reply', [\App\Http\Controllers\Api\Admin\AdminCommunicationController::class, 'replyToTicket']);

    // AI Verification
    Route::prefix('ai')->group(function () {
        Route::post('guarantor-call', [AiVerificationController::class, 'initiateGuarantorCall']);
        Route::post('analyze-guarantor-call', [AiVerificationController::class, 'analyzeGuarantorCall']);
        Route::post('location-certification', [AiVerificationController::class, 'locationCertification']);
    });

    // Launch Zone Management (Admin)
    Route::prefix('launch-zone')->group(function () {
        Route::get('/config', [LaunchZoneController::class, 'getConfig']);
        Route::put('/config', [LaunchZoneController::class, 'updateConfig']);
        Route::post('/clear-cache', [LaunchZoneController::class, 'clearCache']);
    });

    // Subscription Dunning Management (Admin)
    Route::prefix('dunning')->group(function () {
        Route::post('/run-check', [SubscriptionDunningController::class, 'runDunningCheck']);
        Route::get('/churn-risk', [SubscriptionDunningController::class, 'getChurnRisk']);
        Route::post('/send-offer', [SubscriptionDunningController::class, 'sendChurnOffer']);
        Route::post('/reactivate/{subscriptionId}', [SubscriptionDunningController::class, 'reactivateSubscription']);
    });

    // Document Verification Management (Admin)
    Route::prefix('document-verification')->group(function () {
        Route::post('/verify/{documentId}', [DocumentVerificationController::class, 'verifyDocument']);
        Route::post('/batch-verify', [DocumentVerificationController::class, 'batchVerify']);
        Route::get('/review-queue', [DocumentVerificationController::class, 'getReviewQueue']);
        Route::post('/approve/{documentId}', [DocumentVerificationController::class, 'manualApprove']);
        Route::post('/reject/{documentId}', [DocumentVerificationController::class, 'manualReject']);
        Route::get('/statistics', [DocumentVerificationController::class, 'getStatistics']);
    });

    // Mobile App Management (Force Update, FCM Tokens, Logs)
    Route::prefix('mobile')->group(function () {
        Route::get('/config', [\App\Http\Controllers\Api\Admin\AdminMobileConfigController::class, 'getConfig']);
        Route::put('/config', [\App\Http\Controllers\Api\Admin\AdminMobileConfigController::class, 'updateConfig']);
        Route::get('/tokens', [\App\Http\Controllers\Api\Admin\AdminMobileConfigController::class, 'getFcmTokens']);
        Route::get('/logs', [\App\Http\Controllers\Api\Admin\AdminMobileConfigController::class, 'getMobileLogs']);
    });

    // Super Admin High-Impact Upgrades Endpoints
    Route::get('/fleet/live-map', [\App\Http\Controllers\Api\Admin\AdminFleetRadarController::class, 'getLiveMapData']);
    Route::get('/payouts/pending', [\App\Http\Controllers\Api\Admin\BatchPayoutController::class, 'getPendingPayouts']);
    Route::post('/payouts/batch-approve', [\App\Http\Controllers\Api\Admin\BatchPayoutController::class, 'batchApprove']);
    Route::get('/financials/forecast', [\App\Http\Controllers\Api\Admin\FinancialForecastController::class, 'getForecast']);
    Route::get('/ai/guarantor-calls', [\App\Http\Controllers\Api\Admin\AiGuarantorMonitorController::class, 'getCallLogs']);
    Route::get('/server/diagnostics', [\App\Http\Controllers\Api\Admin\ServerMaintenanceController::class, 'getDiagnostics']);
    Route::post('/server/clear-cache', [\App\Http\Controllers\Api\Admin\ServerMaintenanceController::class, 'clearCache']);
});

// Headless API endpoints (Enterprise Elite only)
Route::middleware(['auth:sanctum'])->prefix('headless')->group(function () {
    Route::post('/jobs', [HeadlessApiController::class, 'createJob']);
    Route::post('/jobs/bulk', [HeadlessApiController::class, 'bulkCreateJobs']);
    Route::get('/jobs', [HeadlessApiController::class, 'getJobs']);
    Route::get('/jobs/reference/{reference}', [HeadlessApiController::class, 'getJobByReference']);
    Route::put('/jobs/{id}', [HeadlessApiController::class, 'updateJob']);
    Route::get('/drivers', [HeadlessApiController::class, 'getDrivers']);
    Route::get('/drivers/{id}', [HeadlessApiController::class, 'getDriver']);
    Route::get('/telemetry', [HeadlessApiController::class, 'getTelemetry']);
    Route::post('/webhook', [HeadlessApiController::class, 'webhook']);
});

// Verification APIs (NIN / NIMC & NUBAN Bank Account Resolution)
Route::prefix('v1')->group(function () {
// Bank Account Resolution & Bank List (Available for Hirer and Driver Payments)
Route::get('/bank/banks', [\App\Http\Controllers\Api\DriverPayoutController::class, 'getBanks']);
Route::post('/bank/resolve', [\App\Http\Controllers\Api\DriverPayoutController::class, 'resolveAccount']);
Route::get('/banks', [\App\Http\Controllers\Api\DriverPayoutController::class, 'getBanks']);

    Route::post('/verify/nin', [DriverVerificationController::class, 'verifyNIN']);
    Route::post('/verify/bank-account', [DriverVerificationController::class, 'verifyBankAccount']);
});

// Authenticated Driver Verification Endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/driver/verify-license', [DriverVerificationController::class, 'verifyLicense']);
    Route::post('/driver/verify-nin', [DriverVerificationController::class, 'verifyNIN']);
    Route::post('/driver/verify-bank-account', [DriverVerificationController::class, 'verifyBankAccount']);
    Route::get('/support/chat/stream', [SupportChatController::class, 'streamChat']);
});






Route::post('/webhooks/termii/sms', [\App\Http\Controllers\Api\SmsWebhookController::class, 'handleIncoming']);


// Bank Account Resolution & Bank List (Available for Hirer and Driver Payments)
Route::get('/bank/banks', [\App\Http\Controllers\Api\DriverPayoutController::class, 'getBanks']);
Route::post('/bank/resolve', [\App\Http\Controllers\Api\DriverPayoutController::class, 'resolveAccount']);
Route::get('/banks', [\App\Http\Controllers\Api\DriverPayoutController::class, 'getBanks']);
