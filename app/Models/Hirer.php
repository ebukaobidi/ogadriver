<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Hirer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'company_registration_number',
        'company_address',
        'industry',
        'subscription_tier',
        'max_concurrent_contracts',
        'can_view_direct_contacts',
        'can_bulk_broadcast',
        'has_api_access',
        'api_key',
        'subscription_expires_at',
        'identity_type',
        'identity_number',
        'identity_image',
        'emergency_contact_name',
        'emergency_contact_phone',
        'verification_status',
    ];

    protected function casts(): array
    {
        return [
            'subscription_expires_at' => 'datetime',
        ];
    }

    public function getIdentityImageAttribute($value)
    {
        if (!$value) return null;
        return str_starts_with($value, 'http') ? $value : asset('storage/' . $value);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jobs()
    {
        return $this->hasMany(TransportJob::class, 'hirer_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function favoriteDrivers()
    {
        return $this->hasMany(DriverFavorite::class);
    }

    public function disputes()
    {
        return $this->hasMany(Dispute::class, 'raised_by');
    }

    public function isCorporate(): bool
    {
        return in_array($this->subscription_tier, ['corporate', 'enterprise']);
    }

    public function isEnterprise(): bool
    {
        return $this->subscription_tier === 'enterprise';
    }

    public function canPostJob(): bool
    {
        if ($this->isEnterprise()) return true;
        
        $activeJobs = $this->jobs()->whereIn('status', ['published', 'assigned', 'in_progress'])->count();
        return $activeJobs < $this->max_concurrent_contracts;
    }

    public function generateApiKey(): string
    {
        $key = 'oga_' . bin2hex(random_bytes(16));
        $this->update(['api_key' => $key]);
        return $key;
    }
}
