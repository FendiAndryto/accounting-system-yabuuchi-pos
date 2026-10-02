<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAgentService
{
    protected ?string $apiKey;
    protected string $model;
    protected array $candidateModels = [];
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
        $configured = env('GEMINI_MODEL', 'gemini-3.5-flash-lite');
        $this->candidateModels = array_values(array_unique(array_filter([
            $configured,
            'gemini-3.5-flash-lite',
            'gemini-3.8-flash',
        ])));
        $this->model = $this->candidateModels[0];
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    /**
     * Process user prompt with tool calling loop
     */
    public function chat(string $userMessage, array $conversationHistory = []): array
    {
        // If no Gemini API key is configured yet, use smart local dispatcher for all 10 tools!
        if (empty($this->apiKey)) {
            return $this->smartLocalFallback($userMessage);
        }

        try {
            $contents = $this->buildContents($conversationHistory, $userMessage);
            $tools = [
                [
                    'function_declarations' => AiToolRegistry::getToolDefinitions(),
                ],
            ];

            $todayStr = \Carbon\Carbon::now()->format('Y-m-d');
            $systemInstruction = [
                'parts' => [
                    [
                        'text' => "Anda adalah AI Asisten Akuntansi & Keuangan KHUSUS untuk sistem pencatatan Cash In & Cash Out perusahaan AUBE TERRA INDONESIA.\n" .
                            "Hari ini adalah tanggal: {$todayStr}. Gunakan tanggal ini sebagai acuan waktu ('hari ini', 'bulan ini', 'tahun ini').\n\n" .
                            "BATASAN KETAT CAKUPAN TUGAS (STRICT SCOPE BOUNDARY):\n" .
                            "1. Anda HANYA diperbolehkan menjawab pertanyaan dan instruksi yang berkaitan langsung dengan sistem akuntansi dan keuangan perusahaan, yaitu: pencatatan kas masuk & keluar, pemeriksaan saldo kas/rekening, riwayat transaksi, laporan arus kas (cash flow), analisa tren keuangan/burn rate, dan proyeksi kas (forecasting).\n" .
                            "2. JIKA pengguna mengajukan pertanyaan di luar konteks akuntansi dan keuangan perusahaan (misalnya: pengetahuan umum, sains, politik, hiburan, resep masakan, obrolan santai di luar keuangan, coding umum, dll.), Anda HARUS MENOLAK dengan sopan dan menjelaskan bahwa Anda hanya melayani topik akuntansi dan keuangan perusahaan AUBE TERRA.\n" .
                            "Contoh format penolakan: 'Maaf, saya adalah AI Asisten Keuangan khusus sistem akuntansi AUBE TERRA. Saya hanya dapat membantu pencatatan transaksi kas masuk & keluar, pengecekan saldo, ringkasan cash flow, analisis tren, dan proyeksi kas perusahaan. Apakah ada data transaksi atau laporan keuangan yang ingin Anda periksa?'\n\n" .
                            "PANDUAN TRANSAKSI:\n" .
                            "- Bila user ingin mencatat pemasukan atau pengeluaran, gunakan tool create_draft agar kartu draft transaksi muncul di chatbox dan user dapat memverifikasi atau mengedit datanya sebelum disimpan.\n" .
                            "- Selalu gunakan format mata uang Rupiah (Rp) dan sajikan jawaban secara rapi, akurat, dan profesional."
                    ]
                ]
            ];

            // Loop up to 5 turns for tool calling
            $executedTools = [];
            $draftCard = null;

            for ($iteration = 0; $iteration < 5; $iteration++) {
                $data = $this->postGenerateContent([
                    'contents' => $contents,
                    'tools' => $tools,
                    'systemInstruction' => $systemInstruction,
                ]);

                if (!$data) {
                    return $this->smartLocalFallback($userMessage);
                }

                $candidate = $data['candidates'][0]['content'] ?? null;
                if (!$candidate) {
                    break;
                }

                $parts = $candidate['parts'] ?? [];
                $hasFunctionCall = false;

                // Check for function calls
                foreach ($parts as $part) {
                    if (isset($part['functionCall'])) {
                        $hasFunctionCall = true;
                        $functionName = $part['functionCall']['name'];
                        $functionArgs = $part['functionCall']['args'] ?? [];

                        // Execute the tool locally in Laravel
                        $toolResult = AiToolRegistry::executeTool($functionName, $functionArgs);
                        $executedTools[] = [
                            'tool' => $functionName,
                            'args' => $functionArgs,
                            'result' => $toolResult,
                        ];

                        if ($functionName === 'create_draft' && isset($toolResult['draft'])) {
                            $draftCard = $toolResult['draft'];
                        }

                        // In Gemini REST API: args must be an object, not empty array
                        if (empty($functionArgs)) {
                            $part['functionCall']['args'] = (object)[];
                        }

                        // Append assistant's functionCall to contents
                        $contents[] = [
                            'role' => 'model',
                            'parts' => [$part],
                        ];

                        // Append tool result as functionResponse with role 'user'
                        $contents[] = [
                            'role' => 'user',
                            'parts' => [
                                [
                                    'functionResponse' => [
                                        'name' => $functionName,
                                        'response' => [
                                            'name' => $functionName,
                                            'content' => $toolResult,
                                        ],
                                    ],
                                ],
                            ],
                        ];
                        break; // Process one function call at a time in loop
                    }
                }

                if (!$hasFunctionCall) {
                    // Gemini provided the final text message
                    $textParts = array_filter($parts, fn($p) => isset($p['text']));
                    $replyText = implode("\n", array_column($textParts, 'text'));

                    return [
                        'reply' => $replyText,
                        'executed_tools' => $executedTools,
                        'draft_card' => $draftCard,
                        'provider' => 'gemini-api (' . $this->model . ')',
                    ];
                }
            }

            return [
                'reply' => 'Selesai memproses data keuangan Anda.',
                'executed_tools' => $executedTools,
                'draft_card' => $draftCard,
                'provider' => 'gemini-api (' . $this->model . ')',
            ];
        } catch (\Throwable $e) {
            Log::error('Gemini Service Exception: ' . $e->getMessage());
            return $this->smartLocalFallback($userMessage);
        }
    }

    /**
     * Send generateContent request with multi-model failover
     */
    private function postGenerateContent(array $payload, int $timeout = 20): ?array
    {
        foreach ($this->candidateModels as $model) {
            try {
                $response = Http::withOptions([
                    'force_ip_resolve' => 'v4',
                ])->timeout($timeout)->post("{$this->baseUrl}/{$model}:generateContent?key={$this->apiKey}", $payload);

                if ($response->successful()) {
                    $this->model = $model;
                    return $response->json();
                }

                Log::warning("Gemini model {$model} returned status {$response->status()}: " . substr($response->body(), 0, 150));
            } catch (\Throwable $e) {
                Log::warning("Gemini model {$model} exception: " . $e->getMessage());
            }
        }

        return null;
    }

    /**
     * Smart local fallback if GEMINI_API_KEY is not yet filled in .env or API error occurs
     */
    private function smartLocalFallback(string $userMessage): array
    {
        $lower = strtolower($userMessage);

        // 1. Check if user asks for expense summary (e.g. "berapa total pengeluaran bulan ini?")
        if (preg_match('/(pengeluaran|beban|biaya operasional|belanja)/i', $lower) && !preg_match('/(catat|tambah|input|buat)/i', $lower)) {
            $expense = AiToolRegistry::executeTool('expense_summary', []);
            $msg = "Berikut ringkasan pengeluaran untuk periode saat ini:\n\n";
            $msg .= "💸 **Total Pengeluaran:** {$expense['total_expense_formatted']}\n\n";
            if (!empty($expense['breakdown_by_category'])) {
                $msg .= "**Rincian per Kategori:**\n";
                foreach ($expense['breakdown_by_category'] as $item) {
                    $msg .= "• **{$item['category']}**: {$item['amount_formatted']} ({$item['percentage']})\n";
                }
            }
            return [
                'reply' => $msg,
                'executed_tools' => [['tool' => 'expense_summary', 'result' => $expense]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 2. Check if user asks for income summary
        if (preg_match('/(pemasukan|pendapatan|omzet|omset|penjualan)/i', $lower) && !preg_match('/(catat|tambah|input|buat)/i', $lower)) {
            $income = AiToolRegistry::executeTool('income_summary', []);
            $msg = "Berikut ringkasan pemasukan untuk periode saat ini:\n\n";
            $msg .= "💵 **Total Pemasukan:** {$income['total_income_formatted']}\n\n";
            if (!empty($income['breakdown_by_category'])) {
                $msg .= "**Rincian per Kategori:**\n";
                foreach ($income['breakdown_by_category'] as $item) {
                    $msg .= "• **{$item['category']}**: {$item['amount_formatted']} ({$item['percentage']})\n";
                }
            }
            return [
                'reply' => $msg,
                'executed_tools' => [['tool' => 'income_summary', 'result' => $income]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 3. Check if user wants to create transaction / draft
        if (preg_match('/(catat|tambah|masuk|keluar|beli|bayar|transfer|terima|gaji|sewa)/i', $lower)) {
            // Extract nominal
            preg_match('/(\d+[\.\d]*)/', str_replace(['rp', 'rp.', ' ', ','], '', $lower), $amountMatches);
            $amount = isset($amountMatches[1]) ? (float) $amountMatches[1] : 500000;

            $type = (preg_match('/(masuk|terima|jual|omset|pendapatan|invoice)/i', $lower)) ? 'cash_in' : 'cash_out';

            $draftResult = AiToolRegistry::executeTool('create_draft', [
                'type' => $type,
                'amount' => $amount,
                'description' => $userMessage,
            ]);

            return [
                'reply' => "Saya telah menyiapkan draft transaksi untuk Anda. Silakan periksa kembali rinciannya di bawah ini sebelum disimpan ke sistem:",
                'executed_tools' => [
                    ['tool' => 'create_draft', 'result' => $draftResult],
                ],
                'draft_card' => $draftResult['draft'] ?? null,
                'provider' => 'local-engine',
            ];
        }

        // 4. Check for balance summary
        if (preg_match('/(saldo|rekening|uang|kas saat ini|total kas)/i', $lower)) {
            $balance = AiToolRegistry::executeTool('balance_summary', []);
            $msg = "Berikut ringkasan saldo kas perusahaan Anda saat ini:\n\n";
            $msg .= "💰 **Total Kas Likuid:** {$balance['total_liquid_cash_formatted']}\n\n";
            foreach ($balance['accounts'] as $acc) {
                $msg .= "• **{$acc['name']}**: {$acc['current_balance_formatted']}\n";
            }
            return [
                'reply' => $msg,
                'executed_tools' => [['tool' => 'balance_summary', 'result' => $balance]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 5. Check for cash flow
        if (preg_match('/(cash flow|arus kas|aliran kas)/i', $lower)) {
            $cf = AiToolRegistry::executeTool('cash_flow', []);
            $msg = "📊 **Laporan Arus Kas Periode Ini:**\n\n";
            $msg .= "• Total Cash In: **{$cf['total_cash_in_formatted']}**\n";
            $msg .= "• Total Cash Out: **{$cf['total_cash_out_formatted']}**\n";
            $msg .= "• Net Cash Flow: **{$cf['net_cash_flow_formatted']}** ({$cf['status']})";
            return [
                'reply' => $msg,
                'executed_tools' => [['tool' => 'cash_flow', 'result' => $cf]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 6. Check for trend analysis
        if (preg_match('/(tren|trend|analisis|burn rate|pertumbuhan)/i', $lower)) {
            $trend = AiToolRegistry::executeTool('trend_analysis', ['days' => 30]);
            $msg = "📈 **Analisis Tren Keuangan (30 Hari Terakhir):**\n\n";
            $msg .= "• Rata-rata Pemasukan Harian: **{$trend['avg_daily_income_formatted']}**\n";
            $msg .= "• Rata-rata Pengeluaran Harian (*Burn Rate*): **{$trend['avg_daily_burn_rate_formatted']}**\n";
            $msg .= "• Pertumbuhan Periode Terakhir: **{$trend['recent_vs_previous_growth']}**\n";
            $msg .= "• Status Kesehatan Finansial: **{$trend['health_score']}**";
            return [
                'reply' => $msg,
                'executed_tools' => [['tool' => 'trend_analysis', 'result' => $trend]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 7. Check for forecasting
        if (preg_match('/(prediksi|forecast|proyeksi|masa depan|30 hari ke depan)/i', $lower)) {
            $forecast = AiToolRegistry::executeTool('forecasting', ['days_ahead' => 30]);
            $msg = "🔮 **Proyeksi Kas ({$forecast['projection_horizon']}):**\n\n";
            $msg .= "• Saldo Saat Ini: **{$forecast['current_balance_formatted']}**\n";
            $msg .= "• Proyeksi Saldo Akhir: **{$forecast['projected_cash_position_formatted']}**\n";
            $msg .= "• Estimasi Runway Kas: **{$forecast['cash_runway']}**\n\n";
            $msg .= "💡 Rekomendasi: " . implode(', ', $forecast['recommended_actions']);
            return [
                'reply' => $msg,
                'executed_tools' => [['tool' => 'forecasting', 'result' => $forecast]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 8. Check for greetings or help
        if (preg_match('/^(halo|hai|hi|hey|assalamu|pagi|siang|sore|malam|bantuan|menu|info)/i', trim($lower))) {
            $balance = AiToolRegistry::executeTool('balance_summary', []);
            return [
                'reply' => "Halo! Saya adalah AI Asisten Keuangan AUBE TERRA INDONESIA. Anda dapat meminta saya untuk:\n\n" .
                    "1. Mencatat transaksi: *\"Catat pengeluaran beli bensin 150rb dari Kas Toko\"*\n" .
                    "2. Cek saldo kas: *\"Berapa total saldo kas saat ini?\"*\n" .
                    "3. Lihat arus kas: *\"Tampilkan ringkasan cash flow bulan ini\"*\n" .
                    "4. Analisis tren: *\"Bagaimana tren pengeluaran dan burn rate?\"*\n" .
                    "5. Proyeksi kas: *\"Prediksi posisi kas 30 hari ke depan\"*\n\n" .
                    "Saldo kas aktif saat ini: **{$balance['total_liquid_cash_formatted']}**.",
                'executed_tools' => [],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // Out-of-context refusal
        return [
            'reply' => "Maaf, saya adalah AI Asisten Keuangan khusus sistem akuntansi AUBE TERRA. Saya hanya dapat melayani pertanyaan dan instruksi seputar pencatatan kas masuk & keluar, pemeriksaan saldo kas/rekening, laporan cash flow, analisa tren pengeluaran, dan proyeksi keuangan perusahaan. Apakah ada data transaksi atau keuangan yang dapat saya bantu?",
            'executed_tools' => [],
            'draft_card' => null,
            'provider' => 'local-engine',
        ];
    }

    private function buildContents(array $history, string $newMessage): array
    {
        $contents = [];
        foreach ($history as $msg) {
            $role = ($msg['role'] ?? 'user') === 'assistant' ? 'model' : 'user';
            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $msg['content'] ?? '']],
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $newMessage]],
        ];

        return $contents;
    }
}
