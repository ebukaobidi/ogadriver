<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeeklySprint extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'start_date',
        'end_date',
        'total_prize_pool',
        'min_trips_required',
        'min_rating_required',
        'status',
        'prizes_breakdown',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'total_prize_pool' => 'decimal:2',
            'min_rating_required' => 'decimal:2',
        ];
    }

    public function leaderboards()
    {
        return $this->hasMany(SprintLeaderboard::class, 'sprint_id')->orderBy('rank', 'asc');
    }
}
