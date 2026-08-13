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
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\HirerController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\OnboardingController;
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
use App\Http\Controllers\Api\Admin\AdminDrivingSchoolController;
use App\Http\Controllers\Api\Admin\AdminCarHireController;
use App\Http\Controllers\Api\Admin\AdminManagementController;
use App\Http\Controllers\Api\DrivingSchoolController;
use App\Http\Controllers\Api\ExecutiveCarHireController;
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

// Site Content (Public)
Route::get('/site-content', [SiteContentController::class, 'index']);

// Authentication Routes (Public)
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/register/device', [RegisterController::class, 'registerWithDevice']);
    Route::post('/login', [LoginController::class, 'login']);
});

// Authenticated Routes (using custom API token middleware)
Route::middleware('api.token')->group(function () {
    Route::post('/auth/logout', [LoginController::class, 'logout']);
    Route::get('/auth/me', [LoginController::class, 'me']);
    Route::post('/user/password', [LoginController::class, 'changePassword']);
    Route::post('/auth/onboarding', [OnboardingController::class, 'completeOnboarding']);
    Route::post('/auth/avatar', [LoginController::class, 'uploadAvatar']);
});

// Public search endpoints (no auth required for basic search)
Route::prefix('search')->group(function () {
    Route::get('/drivers', [SearchController::class, 'searchDrivers']);
    Route::get('/jobs', [SearchController::class, 'searchJobs']);
    Route::get('/heatmap', [SearchController::class, 'getDriverHeatmap']);
    Route::get('/driver-count', [SearchController::class, 'getOnlineDriverCount']);
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
Route::middleware('api.token')->group(function () {

    // Driver management
    Route::apiResource('drivers', DriverController::class);

    // Job management
    Route::apiResource('jobs', JobController::class);

    // Booking management (direct driver hiring)
    Route::get('my-bookings', [BookingController::class, 'getMyBookings']);
    Route::apiResource('bookings', BookingController::class);
    Route::post('bookings/{booking}/accept', [BookingController::class, 'acceptBooking']);

    // Payment
    Route::post('payments/verification-fee', [PaymentController::class, 'initiateVerificationFee']);
    Route::post('bookings/{booking}/decline', [BookingController::class, 'declineBooking']);
    Route::post('bookings/{booking}/start', [BookingController::class, 'startBooking']);
    Route::post('bookings/{booking}/complete', [BookingController::class, 'completeBooking']);
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancelBooking']);
    Route::post('bookings/{booking}/generate-pin', [BookingController::class, 'generateSecurityPin']);
    Route::post('bookings/{booking}/verify-pin', [BookingController::class, 'verifySecurityPin']);
    Route::post('bookings/{booking}/share-tracking', [BookingController::class, 'generateTrackingShareLink']);

    // Driver search (authenticated only for security)
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
    Route::prefix('drivers')->group(function () {
        Route::post('{driver}/location', [DriverController::class, 'updateLocation']);
        Route::post('{driver}/toggle-online', [DriverController::class, 'toggleOnline']);
        Route::get('{driver}/documents', [DriverController::class, 'getDocuments']);
        Route::post('{driver}/documents', [DriverController::class, 'uploadDocument']);
        Route::get('{driver}/wallet', [DriverController::class, 'getWallet']);
        Route::get('verification-status', [DriverController::class, 'verificationStatus']);

        // Reviews
        Route::get('{driver}/reviews', [DriverController::class, 'getReviews']);

        // Simulator Training
        Route::post('simulator/result', [DriverController::class, 'saveSimulatorResult']);
        Route::get('simulator/leaderboard', [DriverController::class, 'getSimulatorLeaderboard']);
        Route::get('simulator/certificate', [DriverController::class, 'getSimulatorCertificate']);
    });

    // Reverse SOS / Extortion Shield
    Route::post('drivers/sos/reverse', [SosController::class, 'triggerReverseSos']);

    // Driver Telemetry Ingestion
    Route::post('telemetry/stream', [TelemetryController::class, 'store']);

    // Handover Endpoints
    Route::post('contracts/{contract}/handover', [HandoverController::class, 'submitChecklist']);
    Route::post('contracts/{contract}/handover/verify', [HandoverController::class, 'verifyChecklist']);

    // Job-specific endpoints
    Route::prefix('jobs')->group(function () {
        Route::post('{job}/apply', [JobController::class, 'apply']);
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
    });

    // Subscription endpoints
    Route::prefix('subscription')->group(function () {
        Route::get('/', [SubscriptionController::class, 'status']);
        Route::get('/plans', [SubscriptionController::class, 'plans']);
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
        Route::post('/renew', [SubscriptionController::class, 'renew']);
    });

    Route::post('/payments/verify', [PaymentController::class, 'verify']);

    // Hirer KYC
    Route::post('/hirer/kyc', [HirerController::class, 'updateKyc']);
});

// Telemetry endpoints (admin only)
Route::middleware(['api.token', 'admin'])->prefix('telemetry')->group(function () {
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
Route::middleware(['api.token', 'admin'])->prefix('admin')->group(function () {
    Route::post('/profile', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'update']);
    Route::post('/profile/avatar', [\App\Http\Controllers\Api\Admin\AdminProfileController::class, 'uploadAvatar']);

    Route::get('/dashboard/overview', [AdminDashboardController::class, 'overview']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::post('/users/{id}/suspend', [AdminUserController::class, 'suspend'])->middleware('role:super_admin,security_admin');
    Route::post('/users/{id}/permaban', [AdminUserController::class, 'permaban'])->middleware('role:super_admin,security_admin');
    Route::post('/users/{id}/reset-password', [AdminUserController::class, 'resetPassword']);

    Route::get('/hirers', [AdminHirerController::class, 'index']);
    Route::get('/hirers/{id}', [AdminHirerController::class, 'show']);
    Route::post('/hirers/{id}/suspend', [AdminHirerController::class, 'suspend'])->middleware('role:super_admin,security_admin');
    Route::post('/hirers/{id}/approve-kyc', [AdminHirerController::class, 'approveKyc']);
    Route::post('/hirers/{id}/reject-kyc', [AdminHirerController::class, 'rejectKyc']);
    Route::get('/admins', [AdminManagementController::class, 'index']);

    Route::get('/drivers', [AdminDriverController::class, 'index']);
    Route::get('/drivers/{id}', [AdminDriverController::class, 'show']);
    Route::put('/drivers/{id}', [AdminDriverController::class, 'update']);
    Route::get('/drivers-performance', [AdminDriverController::class, 'performance']);
    Route::get('/drivers-verifications', [AdminDriverController::class, 'verifications']);
    Route::post('/drivers/{id}/approve', [AdminDriverController::class, 'approveVerification']);
    Route::post('/drivers/{id}/reject', [AdminDriverController::class, 'rejectVerification']);
    Route::post('/drivers/{driverId}/documents/{documentId}/approve', [AdminDriverController::class, 'approveDocument']);
    Route::post('/drivers/{driverId}/documents/{documentId}/reject', [AdminDriverController::class, 'rejectDocument']);

    // Jobs & Escrow
    Route::get('/jobs', [AdminJobController::class, 'index']);
    Route::get('/jobs/active', [AdminJobController::class, 'activeJobs']);
    Route::get('/jobs/completed', [AdminJobController::class, 'completedJobs']);
    Route::get('/jobs/disputes', [AdminJobController::class, 'jobDisputes']);

    Route::get('/financials', [AdminFinancialController::class, 'index']);
    Route::get('/financials/transactions', [AdminFinancialController::class, 'transactions']);
    Route::get('/financials/revenue', [AdminFinancialController::class, 'revenueAnalytics']);

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
});

// Headless API endpoints (Enterprise Elite only)
Route::middleware(['api.token'])->prefix('headless')->group(function () {
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
