<?php

declare(strict_types=1);

/*
 * ─────────────────────────────────────────────────────────────────────────
 * Client API HBEXIUM — minimal, robuste, CÔTÉ SERVEUR uniquement.
 * ─────────────────────────────────────────────────────────────────────────
 * - La clé `hbx_` voyage dans l'en-tête X-API-Key (jamais dans le navigateur).
 * - Les lectures (GET) sont mises en CACHE FICHIER (cache_ttl) : le visiteur
 *   n'attend jamais l'API et le Dashboard n'est pas sollicité à chaque visite
 *   (plan §4.1). Si l'API est injoignable, on sert le dernier cache, puis un
 *   repli vide — le site ne casse JAMAIS (plan §4.8, mode dégradé).
 */

final class Hbx
{
    /** @var array<string,mixed> */
    private array $config;

    private string $cacheDir;

    /** @param array<string,mixed> $config */
    public function __construct(array $config)
    {
        $this->config = $config;
        $this->cacheDir = __DIR__.'/../cache';
        if (! is_dir($this->cacheDir)) {
            @mkdir($this->cacheDir, 0775, true);
        }
    }

    /**
     * GET d'un endpoint de lecture, avec cache fichier et repli silencieux.
     *
     * @return array<string,mixed>
     */
    public function get(string $path): array
    {
        $cacheFile = $this->cacheDir.'/'.md5($path).'.json';
        $ttl = (int) ($this->config['cache_ttl'] ?? 300);

        // Cache frais : on sert sans toucher à l'API.
        if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
            $cached = json_decode((string) file_get_contents($cacheFile), true);
            if (is_array($cached)) {
                return $cached;
            }
        }

        $response = $this->request('GET', $path);

        if ($response !== null) {
            @file_put_contents($cacheFile, json_encode($response));

            return $response;
        }

        // API injoignable : dernier cache connu, même périmé (mieux que rien).
        if (is_file($cacheFile)) {
            $stale = json_decode((string) file_get_contents($cacheFile), true);
            if (is_array($stale)) {
                return $stale;
            }
        }

        return []; // repli ultime : le site reste debout.
    }

    /**
     * POST (écriture : newsletter, booking…). Pas de cache. Renvoie le corps
     * décodé + le code HTTP pour que l'appelant gère le message au visiteur.
     *
     * @param  array<string,mixed>  $body
     * @return array{status:int, body:array<string,mixed>}
     */
    public function post(string $path, array $body): array
    {
        [$raw, $status] = $this->exec('POST', $path, $body);
        $decoded = json_decode((string) $raw, true);

        return ['status' => $status, 'body' => is_array($decoded) ? $decoded : []];
    }

    /**
     * Raccourci : liste `data` d'un endpoint (toujours un tableau).
     *
     * @return array<int,array<string,mixed>>
     */
    public function data(string $path): array
    {
        $res = $this->get($path);

        return is_array($res['data'] ?? null) ? $res['data'] : [];
    }

    /** @return array<string,mixed>|null null si échec réseau/HTTP. */
    private function request(string $method, string $path): ?array
    {
        [$raw, $status] = $this->exec($method, $path);
        if ($raw === null || $status < 200 || $status >= 300) {
            return null;
        }
        $decoded = json_decode($raw, true);

        return is_array($decoded) ? $decoded : null;
    }

    /**
     * @param  array<string,mixed>|null  $body
     * @return array{0:?string,1:int}  [corps brut, code HTTP]
     */
    private function exec(string $method, string $path, ?array $body = null): array
    {
        $url = rtrim((string) $this->config['api_base'], '/').'/'.ltrim($path, '/');
        $headers = [
            'X-API-Key: '.(string) $this->config['api_key'],
            'Accept: application/json',
        ];
        $payload = null;
        if ($body !== null) {
            $payload = json_encode($body);
            $headers[] = 'Content-Type: application/json';
        }

        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CUSTOMREQUEST => $method,
                CURLOPT_HTTPHEADER => $headers,
                CURLOPT_TIMEOUT => 8,
                CURLOPT_CONNECTTIMEOUT => 4,
                CURLOPT_SSL_VERIFYPEER => true, // refuse un certificat invalide (plan §4.4)
                CURLOPT_POSTFIELDS => $payload,
            ]);
            $raw = curl_exec($ch);
            $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return [$raw === false ? null : (string) $raw, $status];
        }

        // Repli sans cURL (file_get_contents).
        $context = stream_context_create(['http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'content' => $payload,
            'timeout' => 8,
            'ignore_errors' => true,
        ]]);
        $raw = @file_get_contents($url, false, $context);
        $status = 0;
        foreach ($http_response_header ?? [] as $h) {
            if (preg_match('#HTTP/\S+\s+(\d+)#', $h, $m)) {
                $status = (int) $m[1];
            }
        }

        return [$raw === false ? null : (string) $raw, $status];
    }
}
