<?php

use App\Http\Controllers\FormsController;
use App\Http\Controllers\HbxWebhookController;
use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('/musique', [SiteController::class, 'musique'])->name('musique');
Route::get('/musique/{release:slug}', [SiteController::class, 'release'])->name('release');
Route::redirect('/videos', '/musique#videos');
Route::redirect('/bibliotheque', '/musique');
Route::get('/agenda', [SiteController::class, 'agenda'])->name('agenda');

foreach (['ecrits', 'a-propos', 'pro', 'contact', 'boutique', 'soutenir',
          'actualites', 'mentions-legales', 'confidentialite'] as $slug) {
    Route::get("/$slug", fn () => app(SiteController::class)->page($slug))->name($slug);
}

Route::post('/newsletter', [FormsController::class, 'newsletter'])->name('newsletter');
Route::post('/contact', [FormsController::class, 'contact'])->name('contact.send');
Route::post('/booking', [FormsController::class, 'booking'])->name('booking.send');

// point d'entrée technique des webhooks, exclu du référencement (§7)
Route::post('/hbx/hooks', HbxWebhookController::class)->name('hbx.hooks');
