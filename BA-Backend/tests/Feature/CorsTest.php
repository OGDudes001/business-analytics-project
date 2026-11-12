<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_preflight_allows_a_configured_frontend_origin(): void
    {
        config(['cors.allowed_origins' => ['https://business-analytics.vercel.app']]);

        $this->withHeaders([
            'Origin' => 'https://business-analytics.vercel.app',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'authorization,content-type',
        ])->options('/api/login')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'https://business-analytics.vercel.app');
    }

    public function test_preflight_does_not_allow_an_unconfigured_origin(): void
    {
        config(['cors.allowed_origins' => ['https://business-analytics.vercel.app']]);

        $this->withHeaders([
            'Origin' => 'https://untrusted.example',
            'Access-Control-Request-Method' => 'POST',
        ])->options('/api/login')
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'https://business-analytics.vercel.app')
            ->assertDontSee('https://untrusted.example');
    }
}
