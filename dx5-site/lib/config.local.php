<?php

declare(strict_types=1);

/*
 * Secrets LOCAUX — NON versionnés (voir .gitignore). Ne jamais commiter.
 * C'est ici que vit la clé API du site DX-5 (côté serveur uniquement).
 */

return [
    'api_base' => 'https://dashboard.hbexium.com/api',
    'api_key' => 'hbx_9y1YE2DOq9LToe0IX3EQdsbM6bi07sgxngcYu8rcbRmR68I2',
    // Secret du webhook : à remplacer par celui généré dans le Dashboard quand
    // on déclare l'endpoint (fiche client → Webhooks sortants). Valeur de test.
    'webhook_secret' => 'whsec_demo_test_secret_dx5',
];
