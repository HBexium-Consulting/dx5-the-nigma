<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HbxWebhookDelivery extends Model
{
    protected $table = 'hbx_webhook_deliveries';

    protected $guarded = [];

    protected $casts = ['payload' => 'array', 'processed_at' => 'datetime'];
}
