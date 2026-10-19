<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Track extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'explicit' => 'boolean',
        'unlock_at' => 'datetime',
    ];

    public function release()
    {
        return $this->belongsTo(Release::class);
    }

    /** Déverrouillage titre par titre (§6.3) : verrouillé tant qu'unlock_at est futur. */
    public function isUnlocked(): bool
    {
        return $this->unlock_at === null || $this->unlock_at->isPast();
    }
}
