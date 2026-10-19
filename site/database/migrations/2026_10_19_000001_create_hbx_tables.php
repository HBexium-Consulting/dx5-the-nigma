<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tables locales du site DX-5 — copies synchronisées depuis le Dashboard
 * HBEXIUM (plan projet §3.4 et §4). Le site ne sert JAMAIS une page en
 * interrogeant le Dashboard : tout est lu ici (§4.1, règle n°1).
 * `uuid` est la clé de correspondance avec le Dashboard — jamais l'id local.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('releases', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();
            $t->string('slug')->unique();
            $t->string('type')->default('album'); // album|ep|single|mixtape
            $t->string('title');
            $t->string('subtitle')->nullable();
            $t->text('description')->nullable();
            $t->string('cover_path')->nullable();
            $t->date('release_date')->nullable();
            $t->timestamp('published_at')->nullable();
            $t->string('status')->default('draft'); // draft|scheduled|published
            $t->json('credits')->nullable();
            $t->uuid('product_uuid')->nullable();
            $t->timestamps();
            $t->softDeletes();
        });

        Schema::create('tracks', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();
            $t->foreignId('release_id')->constrained()->cascadeOnDelete();
            $t->unsignedSmallInteger('position')->default(1);
            $t->string('title');
            $t->string('slug');
            $t->unsignedSmallInteger('duration_seconds')->nullable();
            $t->string('isrc')->nullable();
            $t->boolean('explicit')->default(false);
            $t->string('featuring')->nullable();
            $t->text('lyrics')->nullable();
            $t->string('preview_path')->nullable();   // extrait 30 s, servi localement
            $t->string('youtube_id')->nullable();     // écoute intégrale (lecteur docké)
            $t->timestamp('unlock_at')->nullable();   // déverrouillage individuel (§6.3)
            $t->timestamps();
            $t->softDeletes();
        });

        Schema::create('streaming_links', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();
            $t->morphs('linkable');
            $t->string('platform');
            $t->string('url');
            $t->unsignedSmallInteger('position')->default(1);
            $t->boolean('visible')->default(true);
            $t->timestamps();
        });

        Schema::create('events', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();
            $t->string('slug')->unique();
            $t->string('title');
            $t->text('description')->nullable();
            $t->timestamp('starts_at');
            $t->timestamp('ends_at')->nullable();
            $t->string('timezone')->default('UTC');
            $t->string('venue_name')->nullable();
            $t->string('city')->nullable();
            $t->string('country')->nullable();
            $t->string('status')->default('scheduled'); // scheduled|cancelled|postponed|past
            $t->string('ticket_mode')->default('none'); // none|external|internal
            $t->string('ticket_url')->nullable();
            $t->string('cover_path')->nullable();
            $t->timestamp('published_at')->nullable();
            $t->timestamps();
            $t->softDeletes();
        });

        Schema::create('scenes', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();
            $t->string('key')->unique(); // home|release|tour|about…
            $t->json('palette')->nullable();
            $t->string('intensity')->default('medium');
            $t->string('hero_path')->nullable();
            $t->string('ambient_path')->nullable();
            $t->string('headline')->nullable();
            $t->json('settings')->nullable();
            $t->timestamps();
        });

        Schema::create('newsletter_subscribers', function (Blueprint $t) {
            $t->id();
            $t->string('email')->unique();
            $t->string('locale', 8)->nullable();
            $t->string('source')->nullable();
            $t->timestamp('confirmed_at')->nullable();
            $t->timestamp('unsubscribed_at')->nullable();
            $t->string('token', 64);
            $t->timestamps();
        });

        Schema::create('booking_requests', function (Blueprint $t) {
            $t->id();
            $t->uuid('uuid')->unique();
            $t->string('organizer_name');
            $t->string('organization')->nullable();
            $t->string('email');
            $t->string('phone')->nullable();
            $t->string('event_type')->nullable();
            $t->date('event_date')->nullable();
            $t->string('city')->nullable();
            $t->string('country')->nullable();
            $t->unsignedInteger('expected_audience')->nullable();
            $t->unsignedInteger('budget_amount')->nullable();
            $t->string('budget_currency', 8)->nullable();
            $t->text('message')->nullable();
            $t->string('status')->default('pending');
            $t->string('idempotency_key')->unique();
            $t->timestamps();
        });

        Schema::create('leads', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email');
            $t->text('message');
            $t->timestamps();
        });

        // ── plomberie de connexion (§4.1, règles 2-4) ──
        Schema::create('hbx_webhook_deliveries', function (Blueprint $t) {
            $t->id();
            $t->string('delivery_id')->unique(); // X-HBX-Delivery → idempotence
            $t->string('event');
            $t->json('payload');
            $t->timestamp('processed_at')->nullable();
            $t->timestamps();
        });

        Schema::create('hbx_outbox', function (Blueprint $t) {
            $t->id();
            $t->string('endpoint');              // ex. leads, booking-requests
            $t->json('payload');
            $t->string('idempotency_key')->unique();
            $t->unsignedTinyInteger('attempts')->default(0);
            $t->text('last_error')->nullable();
            $t->timestamp('sent_at')->nullable();
            $t->timestamps();
        });

        Schema::create('hbx_sync_state', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique();         // since|cursor
            $t->text('value')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['hbx_sync_state', 'hbx_outbox', 'hbx_webhook_deliveries', 'leads',
                  'booking_requests', 'newsletter_subscribers', 'scenes', 'events',
                  'streaming_links', 'tracks', 'releases'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
