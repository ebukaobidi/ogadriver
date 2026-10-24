<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function hirer()
    {
        return $this->belongsTo(Hirer::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
