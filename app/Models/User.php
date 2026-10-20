<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role_id',
        'name',
        'nickname',
        'email',
        'password',
        'phone',
        'avatar',
        'avatar_secondary',
        'avatar_tertiary',
        'referral_code',
        'referred_by_user_id',
        'referral_balance',
        'referral_pending_balance',
        'referral_rewarded',
        'gender',
        'date_of_birth',
        'is_active',
        'last_login_at',
        'google_id',
        'google_token',
        'google_refresh_token',
        'device_imei',
        'device_fingerprint',
        'google_account_id',
        'last_device_verified_at',
        'mock_location_detected',
        'root_jailbreak_detected',
        'gps_spoofing_detected',
        'last_security_scan_at',
        'security_notes',
        'api_token',
        'country_id',
        'terms_accepted',
        'profile_completed',
        'phone_verified_at',
        'email_verified_at',
        'verification_code',
        'verification_expires_at',
        'fcm_token',
        'state_id',
        'city_id',
        'admin_department',
        'admin_country_id',
        'admin_state_id',
        'admin_city_id',
        'subscription_tier',
        'subscription_expires_at',
        'shield_addon_active',
        'promoter_id',
        'territory_id',
        'promoter_tier',
        'promoter_commission_rate',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'api_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'verification_expires_at' => 'datetime',
        'last_login_at' => 'datetime',
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
        'is_vip_subscriber' => 'boolean',
        'mock_location_detected' => 'boolean',
        'root_jailbreak_detected' => 'boolean',
        'gps_spoofing_detected' => 'boolean',
        'last_device_verified_at' => 'datetime',
        'last_security_scan_at' => 'datetime',
        'password' => 'hashed',
        'terms_accepted' => 'boolean',
        'profile_completed' => 'boolean',
    ];

    public function getAvatarAttribute($value)
    {
        if (!$value) return null;
        return str_starts_with($value, 'http') ? $value : asset('storage/' . $value);
    }

    public function getAvatarSecondaryAttribute($value)
    {
        if (!$value) return null;
        return str_starts_with($value, 'http') ? $value : asset('storage/' . $value);
    }

    public function getAvatarTertiaryAttribute($value)
    {
        if (!$value) return null;
        return str_starts_with($value, 'http') ? $value : asset('storage/' . $value);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function driver()
    {
        return $this->hasOne(Driver::class);
    }

    public function hirer()
    {
        return $this->hasOne(Hirer::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function routeNotificationForWebPush()
    {
        return $this->pushSubscriptions;
    }

    /**
     * Route notifications for the FCM channel.
     *
     * @return string|array|null
     */
    public function routeNotificationForFcm()
    {
        return $this->fcm_token;
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->where('ends_at', '>', now());
    }

    public function loyaltyPoint()
    {
        return $this->hasOne(LoyaltyPoint::class);
    }

    public function referralsGiven()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referralReceived()
    {
        return $this->hasOne(Referral::class, 'referred_id');
    }

    public function isDriver(): bool
    {
        return $this->role && $this->role->slug === 'driver';
    }

    public function isHirer(): bool
    {
        return $this->role && in_array($this->role->slug, ['hirer', 'employer'], true);
    }

    public function isCreator(): bool
    {
        return $this->role && in_array($this->role->slug, ['creator', 'affiliate', 'promoter'], true);
    }

    public function isAdmin(): bool
    {
        return $this->role && $this->role->slug === 'admin';
    }

    public function isSuperAdmin(): bool
    {
        return ($this->role && $this->role->slug === 'super_admin') || $this->admin_department === 'super';
    }

    public function isAnyAdmin(): bool
    {
        return $this->isAdmin() || $this->isSuperAdmin();
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function adminCountry()
    {
        return $this->belongsTo(Country::class, 'admin_country_id');
    }

    public function adminState()
    {
        return $this->belongsTo(State::class, 'admin_state_id');
    }

    public function adminCity()
    {
        return $this->belongsTo(City::class, 'admin_city_id');
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function isTreasury(): bool
    {
        return $this->admin_department === 'super' || $this->admin_department === 'treasury';
    }

    public function isCountryManager(): bool
    {
        return $this->admin_department === 'super' || $this->admin_department === 'country' || !empty($this->admin_country_id);
    }

    public function isRegionalManager(): bool
    {
        return $this->admin_department === 'super' || $this->admin_department === 'regional' || !empty($this->admin_state_id);
    }

    public function isLocalManager(): bool
    {
        return $this->admin_department === 'super' || $this->admin_department === 'local' || !empty($this->admin_city_id);
    }

    public function isSupportAgent(): bool
    {
        return $this->admin_department === 'super' || $this->admin_department === 'support';
    }

    public function getManagedStateId()
    {
        if ($this->admin_department === 'super' || $this->admin_department === 'treasury') {
            return null; // Global access
        }
        return $this->admin_state_id;
    }
}
