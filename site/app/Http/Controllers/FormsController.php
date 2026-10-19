<?php

namespace App\Http\Controllers;

use App\Hbx\Outbox;
use App\Models\BookingRequest;
use App\Models\Lead;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * §4.1 règle n°4 : chaque écriture est stockée localement PUIS transmise
 * au Dashboard par la file sortante. Dashboard éteint = rien ne se perd.
 */
class FormsController extends Controller
{
    public function newsletter(Request $request)
    {
        $data = $request->validate(['email' => 'required|email']);

        $sub = NewsletterSubscriber::firstOrCreate(
            ['email' => $data['email']],
            ['locale' => app()->getLocale(), 'source' => 'site', 'token' => Str::random(48)]
        );

        Outbox::push('newsletter/subscribe', ['email' => $sub->email, 'locale' => $sub->locale], 'nl-'.$sub->token);

        return back()->with('ok', 'Inscription enregistrée — confirmez depuis l’e-mail qui arrive.');
    }

    public function contact(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email',
            'message' => 'required|string|max:5000',
        ]);

        $lead = Lead::create($data);
        Outbox::push('leads', [...$data, 'source' => 'site-contact'], 'lead-'.$lead->id);

        return back()->with('ok', 'Message bien reçu — réponse sous 24 h.');
    }

    public function booking(Request $request)
    {
        $data = $request->validate([
            'organizer_name' => 'required|string|max:120',
            'organization' => 'nullable|string|max:160',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:40',
            'event_type' => 'nullable|string|max:60',
            'event_date' => 'nullable|date',
            'city' => 'nullable|string|max:80',
            'country' => 'nullable|string|max:80',
            'expected_audience' => 'nullable|integer|min:0',
            'budget_amount' => 'nullable|integer|min:0',
            'message' => 'nullable|string|max:5000',
        ]);

        $booking = BookingRequest::create([
            ...$data,
            'uuid' => (string) Str::uuid(),
            'budget_currency' => 'USD',
            'idempotency_key' => (string) Str::uuid(),
        ]);

        Outbox::push('booking-requests', $booking->only([
            'uuid', 'organizer_name', 'organization', 'email', 'phone', 'event_type',
            'event_date', 'city', 'country', 'expected_audience', 'budget_amount',
            'budget_currency', 'message',
        ]), $booking->idempotency_key);

        return back()->with('ok', 'Demande transmise — réponse sous 24 h.');
    }
}
