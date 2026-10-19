<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Release extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'credits' => 'array',
        'release_date' => 'date',
        'published_at' => 'datetime',
    ];

    /** Règle d'embargo (§4.6) : rien dont published_at est futur. */
    public function scopePublished(Builder $q): Builder
    {
        return $q->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function tracks()
    {
        return $this->hasMany(Track::class)->orderBy('position');
    }

    public function streamingLinks()
    {
        return $this->morphMany(StreamingLink::class, 'linkable')->where('visible', true)->orderBy('position');
    }
}
