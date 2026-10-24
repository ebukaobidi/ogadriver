<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SprintLeaderboard extends Model
{
    use HasFactory;

    protected $fillable = [
        'sprint_id',
        'driver_id',
        'completed_jobs',
        'rating_score',
        'points',
        'rank',
        'prize_earned',
        'prize_claimed',
    ];

    protected function casts(): array
    {
        return [
            'rating_score' => 'decimal:2',
            'prize_earned' => 'decimal:2',
            'prize_claimed' => 'boolean',
        ];
    }

    public function sprint()
    {
        return $this->belongsTo(WeeklySprint::class, 'sprint_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
