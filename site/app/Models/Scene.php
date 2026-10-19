<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Scene extends Model
{
    protected $guarded = [];

    protected $casts = ['palette' => 'array', 'settings' => 'array'];
}
