<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverPerk extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'partner_name',
        'partner_logo',
        'category',
        'discount_percentage',
        'location_scope',
        'is_active',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'discount_percentage' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function redemptions()
    {
        return $this->hasMany(PerkRedemption::class, 'perk_id');
    }
}
