<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BusinessAdviceController extends Controller
{
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['sometimes', 'array', 'max:10'],
            'history.*' => ['array:role,content'],
            'history.*.role' => ['required', 'in:user,assistant'],
            'history.*.content' => ['required', 'string', 'max:2000'],
        ]);

        $apiKey = config('services.gemini.key');
        if (! is_string($apiKey) || trim($apiKey) === '') {
            return response()->json([
                'message' => 'The AI advisor is not configured. Add GEMINI_API_KEY to the backend .env and restart the backend.',
            ], 503);
        }

        $contents = array_map(
            fn (array $message): array => [
                'role' => $message['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $message['content']]],
            ],
            $validated['history'] ?? [],
        );
        $contents[] = ['role' => 'user', 'parts' => [['text' => $validated['message']]]];
        $model = rawurlencode(config('services.gemini.model'));

        try {
            $response = Http::withHeaders(['x-goog-api-key' => $apiKey])
                ->acceptJson()
                ->timeout(20)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                    'systemInstruction' => [
                        'parts' => [[
                            'text' => 'You are a practical small-business growth coach. Give concise, actionable advice and ask a clarifying question when needed. Do not claim access to business information the user has not provided. Do not promise results or provide legal, tax, or investment advice; suggest a qualified professional for those topics.',
                        ]],
                    ],
                    'contents' => $contents,
                    'generationConfig' => ['maxOutputTokens' => 500],
                ]);
        } catch (ConnectionException $exception) {
            Log::warning('Business advice provider connection failed.', ['exception' => $exception::class]);

            return response()->json([
                'message' => 'The business advisor is temporarily unavailable. Please try again shortly.',
            ], 502);
        }

        if (! $response->successful()) {
            $providerCode = $response->json('error.status');
            $context = [
                'status' => $response->status(),
                'model' => config('services.gemini.model'),
            ];
            if (is_string($providerCode)) {
                $context['code'] = $providerCode;
            }
            Log::warning('Business advice provider returned an error.', $context);

            if ($response->status() === 429) {
                return response()->json([
                    'message' => 'The Gemini quota or rate limit was reached. Check your Google AI Studio usage limits.',
                ], 503);
            }

            if ($response->status() === 404) {
                return response()->json([
                    'message' => 'The configured Gemini model is unavailable. Set GEMINI_MODEL to a current model enabled for your project.',
                ], 502);
            }

            return response()->json([
                'message' => 'The business advisor is temporarily unavailable. Please try again shortly.',
            ], 502);
        }

        $parts = $response->json('candidates.0.content.parts');
        $advice = is_array($parts)
            ? implode("\n", array_filter(array_column($parts, 'text'), 'is_string'))
            : '';
        if (trim($advice) === '') {
            Log::warning('Business advice provider returned an empty response.');

            return response()->json([
                'message' => 'The business advisor could not prepare a response. Please try again.',
            ], 502);
        }

        return response()->json(['advice' => trim($advice)]);
    }
}
