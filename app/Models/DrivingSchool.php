<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DrivingSchool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'state',
        'lga',
        'address',
        'accreditation_number',
        'accreditation_body',
        'contact_email',
        'contact_phone',
        'logo_path',
        'is_active',
        'facilities',
        'is_verified',
        'images',
        'videos',
    ];

    protected $casts = [
        'facilities' => 'array',
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

    // Ensure slug is generated from name if not provided
    protected static function booted()
    {
        static::creating(function ($school) {
            if (empty($school->slug)) {
                $school->slug = \Str::slug($school->name);
            }
        });
    }
}
?>
