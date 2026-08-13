<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DriverFavorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'hirer_id',
        'driver_id',
        'notes',
        'is_pinned',
    ];

    public function hirer()
    {
        return $this->belongsTo(Hirer::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function pin(): void
    {
        $this->update(['is_pinned' => true]);
    }

    public function unpin(): void
    {
        $this->update(['is_pinned' => false]);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }
}
