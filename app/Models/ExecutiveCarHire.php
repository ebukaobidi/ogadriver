<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ExecutiveCarHire extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'state',
        'lga',
        'address',
        'registration_number',
        'contact_email',
        'contact_phone',
        'logo_path',
        'fleet',
        'services',
        'is_active',
        'is_verified',
        'images',
        'videos',
    ];

    protected $casts = [
        'fleet' => 'array',
        'services' => 'array',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'images' => 'array',
        'videos' => 'array',
    ];

    public function getLogoPathAttribute($value)
    {
        if (!$value) return null;
        return str_starts_with($value, 'http') ? $value : asset('storage/' . $value);
    }

    public function getImagesAttribute($value)
    {
        $images = is_string($value) ? json_decode($value, true) : $value;
        if (!$images || !is_array($images)) return [];
        
        return array_map(function($path) {
            if (str_starts_with($path, 'http')) return $path;
            // Handle /storage/ prefix that might be in DB
            $cleanPath = str_replace('/storage/', '', $path);
            return asset('storage/' . $cleanPath);
        }, $images);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    protected static function booted()
    {
        static::creating(function ($hire) {
            if (empty($hire->slug)) {
                $hire->slug = Str::slug($hire->name);
            }
        });
    }
}
