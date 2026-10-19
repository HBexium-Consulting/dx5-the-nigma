<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StreamingLink extends Model
{
    protected $guarded = [];

    protected $casts = ['visible' => 'boolean'];

    public function linkable()
    {
        return $this->morphTo();
    }
}
