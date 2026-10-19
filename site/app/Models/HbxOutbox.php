<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HbxOutbox extends Model
{
    protected $table = 'hbx_outbox';

    protected $guarded = [];

    protected $casts = ['payload' => 'array', 'sent_at' => 'datetime'];
}
