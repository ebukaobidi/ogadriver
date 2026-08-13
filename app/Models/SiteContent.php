<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_key',
        'key_name',
        'value',
        'type'
    ];

    public function getValueAttribute($value)
    {
        if ($this->type === 'image' && $value && !str_starts_with($value, 'http')) {
            return asset(str_starts_with($value, '/') ? substr($value, 1) : $value);
        }
        return $value;
    }
}
