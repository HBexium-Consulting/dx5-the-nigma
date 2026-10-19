<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OutboxFormsTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_message_de_contact_est_stocke_puis_mis_en_file_sortante(): void
    {
        $this->post('/contact', ['name' => 'Fan', 'email' => 'fan@exemple.ht', 'message' => 'Bonjou !'])
            ->assertRedirect();

        $this->assertDatabaseCount('leads', 1);
        $this->assertDatabaseHas('hbx_outbox', ['endpoint' => 'leads', 'sent_at' => null]);
    }

    public function test_une_demande_de_booking_part_avec_une_cle_d_idempotence(): void
    {
        $this->post('/booking', ['organizer_name' => 'Orga', 'email' => 'orga@festival.fr'])
            ->assertRedirect();

        $this->assertDatabaseCount('booking_requests', 1);
        $this->assertDatabaseHas('hbx_outbox', ['endpoint' => 'booking-requests']);
    }

    public function test_une_inscription_newsletter_est_idempotente(): void
    {
        $this->post('/newsletter', ['email' => 'fan@exemple.ht'])->assertRedirect();
        $this->post('/newsletter', ['email' => 'fan@exemple.ht'])->assertRedirect();

        $this->assertDatabaseCount('newsletter_subscribers', 1);
        $this->assertDatabaseCount('hbx_outbox', 1); // même clé → une seule entrée
    }
}
