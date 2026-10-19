<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingRequest extends Model
{
    protected $guarded = [];

    protected $casts = ['event_date' => 'date'];
}
