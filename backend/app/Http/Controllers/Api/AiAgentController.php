<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AI\AiToolRegistry;
use App\Services\AI\GeminiAgentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiAgentController extends Controller
{
    public function __construct(
        protected GeminiAgentService $geminiService
    ) {}

    /**
     * AI Agent Interactive Chat with Tool Calling Loop
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array',
        ]);

        $message = $validated['message'];
        $history = $validated['history'] ?? [];

        $response = $this->geminiService->chat($message, $history);

        return response()->json([
            'status' => 'success',
            'reply' => $response['reply'],
            'executed_tools' => $response['executed_tools'],
            'draft_card' => $response['draft_card'],
            'provider' => $response['provider'],
        ]);
    }

    /**
     * Get list of all available AI tools & schema
     */
    public function tools(): JsonResponse
    {
        return response()->json([
            'tools' => AiToolRegistry::getToolDefinitions(),
        ]);
    }

    /**
     * Directly trigger a specific tool
     */
    public function executeTool(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tool_name' => 'required|string',
            'args' => 'nullable|array',
        ]);

        $result = AiToolRegistry::executeTool($validated['tool_name'], $validated['args'] ?? []);

        return response()->json([
            'tool' => $validated['tool_name'],
            'result' => $result,
        ]);
    }
}
