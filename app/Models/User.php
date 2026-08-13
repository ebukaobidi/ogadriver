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
        'last_login_at' => 'datetime',
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
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

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->where('ends_at', '>', now());
    }

    public function isDriver(): bool
    {
        return $this->role && $this->role->slug === 'driver';
    }

    public function isHirer(): bool
    {
        return $this->role && $this->role->slug === 'hirer';
    }

    public function isAdmin(): bool
    {
        return $this->role && $this->role->slug === 'admin';
    }

    public function isSuperAdmin(): bool
    {
        return $this->role && $this->role->slug === 'super_admin';
    }

    public function isAnyAdmin(): bool
    {
        return $this->isAdmin() || $this->isSuperAdmin();
    }
}
