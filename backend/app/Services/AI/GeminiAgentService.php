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
        $configured = env('GEMINI_MODEL', 'gemini-2.5-flash');
        $this->candidateModels = array_values(array_unique(array_filter([
            $configured,
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
        ])));
        $this->model = $this->candidateModels[0];
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    /**
     * Process user prompt with tool calling loop
     */
    public function chat(string $userMessage, array $conversationHistory = [], string $language = 'id'): array
    {
        // If no Gemini API key is configured yet, use smart local dispatcher for all 10 tools!
        if (empty($this->apiKey)) {
            return $this->smartLocalFallback($userMessage, $language);
        }

        try {
            $contents = $this->buildContents($conversationHistory, $userMessage);
            $tools = [
                [
                    'function_declarations' => AiToolRegistry::getToolDefinitions(),
                ],
            ];

            $todayStr = \Carbon\Carbon::now()->format('Y-m-d');
            $systemInstruction = $this->getSystemInstruction($language, $todayStr);

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
                            'name' => $functionName,
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
            return $this->smartLocalFallback($userMessage, $language);
        }
    }

    /**
     * Get system prompt for Gemini based on selected locale (ID, EN, JA)
     */
    protected function getSystemInstruction(string $language, string $todayStr): array
    {
        if ($language === 'en') {
            $prompt = "You are a dedicated AI Accounting & Financial Assistant for the Cash In & Cash Out accounting system of AUBE TERRA INDONESIA.\n" .
                "Today's date is: {$todayStr}. Use this date as reference for time periods ('today', 'this month', 'this year').\n\n" .
                "STRICT SCOPE BOUNDARY:\n" .
                "1. You are ONLY allowed to answer questions and instructions directly related to the company's accounting and financial system: recording cash in & cash out, checking cash/bank account balances, transaction history, cash flow reports, financial trend analysis/burn rate, and cash forecasting.\n" .
                "2. IF the user asks questions outside the context of company accounting and finance (e.g., general knowledge, science, politics, entertainment, cooking recipes, casual non-financial chat, general programming, etc.), you MUST politely REFUSE and explain that you only handle AUBE TERRA's accounting and financial topics.\n" .
                "Example refusal: 'I apologize, but I am a dedicated Financial AI Assistant for the AUBE TERRA accounting system. I can only assist with recording cash in & cash out transactions, checking account balances, cash flow summaries, trend analyses, and company cash forecasts. Is there any financial data or report you would like to review?'\n\n" .
                "TRANSACTION GUIDANCE:\n" .
                "- When the user wants to record an income or expense, use the create_draft tool so that a transaction draft card appears in the chatbox for the user to review or edit before saving.\n" .
                "- Provide clear, professional, and well-structured answers in English.";
        } elseif ($language === 'ja') {
            $prompt = "あなたはAUBE TERRA INDONESIAの入出金（Cash In & Cash Out）会計システム専属のAI財務アシスタントです。\n" .
                "本日の日付は: {$todayStr} です。この日付を「本日」「今月」「今年」などの期間の基準として使用してください。\n\n" .
                "厳格な対応範囲制限 (STRICT SCOPE BOUNDARY):\n" .
                "1. 会社の会計および財務システムに直接関連する質問および指示のみに回答することが許可されています。具体的には、入出金の記録、現金・銀行口座残高の確認、取引履歴、キャッシュフロー報告、財務トレンド・バーンレート分析、資金繰り予測（フォーキャスティング）です。\n" .
                "2. ユーザーが会社の会計・財務の文脈から外れた質問（一般的な知識、科学、政治、エンターテインメント、料理のレシピ、日常会話、一般的なプログラミングなど）をした場合は、丁寧に辞退し、AUBE TERRAの会計・財務トピックのみに対応していることを説明しなければなりません。\n" .
                "辞退の例: 「申し訳ありませんが、私はAUBE TERRA会計システムの専属財務AIアシスタントです。入出金取引の記録、残高確認、キャッシュフロー概要、トレンド分析、資金繰り予測のみをサポートしております。ご確認になりたい取引データや財務レポートはございますか？」\n\n" .
                "取引記録のガイドライン:\n" .
                "- ユーザーが入金または出金を記録したい場合は、create_draft ツールを使用して、チャットボックスに下書きカード（ドラフト）を表示し、保存前にユーザーが確認または編集できるようにしてください。\n" .
                "- 丁寧で正確、プロフェッショナルな日本語で回答を提示してください。";
        } else {
            $prompt = "Anda adalah AI Asisten Akuntansi & Keuangan KHUSUS untuk sistem pencatatan Cash In & Cash Out perusahaan AUBE TERRA INDONESIA.\n" .
                "Hari ini adalah tanggal: {$todayStr}. Gunakan tanggal ini sebagai acuan waktu ('hari ini', 'bulan ini', 'tahun ini').\n\n" .
                "BATASAN KETAT CAKUPAN TUGAS (STRICT SCOPE BOUNDARY):\n" .
                "1. Anda HANYA diperbolehkan menjawab pertanyaan dan instruksi yang berkaitan langsung dengan sistem akuntansi dan keuangan perusahaan, yaitu: pencatatan kas masuk & keluar, pemeriksaan saldo kas/rekening, riwayat transaksi, laporan arus kas (cash flow), analisa tren keuangan/burn rate, dan proyeksi kas (forecasting).\n" .
                "2. JIKA pengguna mengajukan pertanyaan di luar konteks akuntansi dan keuangan perusahaan (misalnya: pengetahuan umum, sains, politik, hiburan, resep masakan, obrolan santai di luar keuangan, coding umum, dll.), Anda HARUS MENOLAK dengan sopan dan menjelaskan bahwa Anda hanya melayani topik akuntansi dan keuangan perusahaan AUBE TERRA.\n" .
                "Contoh format penolakan: 'Maaf, saya adalah AI Asisten Keuangan khusus sistem akuntansi AUBE TERRA. Saya hanya dapat membantu pencatatan transaksi kas masuk & keluar, pengecekan saldo, ringkasan cash flow, analisis tren, dan proyeksi kas perusahaan. Apakah ada data transaksi atau laporan keuangan yang ingin Anda periksa?'\n\n" .
                "PANDUAN TRANSAKSI:\n" .
                "- Bila user ingin mencatat pemasukan atau pengeluaran, gunakan tool create_draft agar kartu draft transaksi muncul di chatbox dan user dapat memverifikasi atau mengedit datanya sebelum disimpan.\n" .
                "- Selalu gunakan format mata uang Rupiah (Rp) dan sajikan jawaban secara rapi, akurat, dan profesional.";
        }

        return [
            'parts' => [
                ['text' => $prompt]
            ]
        ];
    }

    /**
     * Smart local fallback if GEMINI_API_KEY is not yet filled in .env or API error occurs
     */
    private function smartLocalFallback(string $userMessage, string $language = 'id'): array
    {
        $lower = mb_strtolower($userMessage, 'UTF-8');

        // 1. Check if user asks for expense summary
        if (preg_match('/(pengeluaran|beban|biaya operasional|belanja|expense|spending|cost|spend|fee|経費|支出|費用)/iu', $lower)
            && !preg_match('/(catat|tambah|input|buat|record|add|enter|create|buy|pay|beli|bayar|記録|追加|入力|作成|支払い)/iu', $lower)) {
            $expense = AiToolRegistry::executeTool('expense_summary', []);
            
            if ($language === 'en') {
                $msg = "Here is the expense summary for the current period:\n\n";
                $msg .= "💸 **Total Expenses:** {$expense['total_expense_formatted']}\n\n";
                if (!empty($expense['breakdown_by_category'])) {
                    $msg .= "**Breakdown by Category:**\n";
                    foreach ($expense['breakdown_by_category'] as $item) {
                        $catName = !empty($item['category_en']) ? $item['category_en'] : $item['category'];
                        $msg .= "• **{$catName}**: {$item['amount_formatted']} ({$item['percentage']})\n";
                    }
                }
            } elseif ($language === 'ja') {
                $msg = "現在の期間の支出概要は以下の通りです：\n\n";
                $msg .= "💸 **支出合計:** {$expense['total_expense_formatted']}\n\n";
                if (!empty($expense['breakdown_by_category'])) {
                    $msg .= "**カテゴリー別内訳:**\n";
                    foreach ($expense['breakdown_by_category'] as $item) {
                        $catName = !empty($item['category_ja']) ? $item['category_ja'] : $item['category'];
                        $msg .= "• **{$catName}**: {$item['amount_formatted']} ({$item['percentage']})\n";
                    }
                }
            } else {
                $msg = "Berikut ringkasan pengeluaran untuk periode saat ini:\n\n";
                $msg .= "💸 **Total Pengeluaran:** {$expense['total_expense_formatted']}\n\n";
                if (!empty($expense['breakdown_by_category'])) {
                    $msg .= "**Rincian per Kategori:**\n";
                    foreach ($expense['breakdown_by_category'] as $item) {
                        $msg .= "• **{$item['category']}**: {$item['amount_formatted']} ({$item['percentage']})\n";
                    }
                }
            }

            return [
                'reply' => $msg,
                'executed_tools' => [['name' => 'expense_summary', 'tool' => 'expense_summary', 'result' => $expense]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 2. Check if user asks for income summary
        if (preg_match('/(pemasukan|pendapatan|omzet|omset|penjualan|income|revenue|sales|turnover|earning|収入|売上|入金)/iu', $lower)
            && !preg_match('/(catat|tambah|input|buat|record|add|enter|create|buy|pay|beli|bayar|記録|追加|入力|作成|支払い)/iu', $lower)) {
            $income = AiToolRegistry::executeTool('income_summary', []);
            
            if ($language === 'en') {
                $msg = "Here is the income summary for the current period:\n\n";
                $msg .= "💵 **Total Income:** {$income['total_income_formatted']}\n\n";
                if (!empty($income['breakdown_by_category'])) {
                    $msg .= "**Breakdown by Category:**\n";
                    foreach ($income['breakdown_by_category'] as $item) {
                        $catName = !empty($item['category_en']) ? $item['category_en'] : $item['category'];
                        $msg .= "• **{$catName}**: {$item['amount_formatted']} ({$item['percentage']})\n";
                    }
                }
            } elseif ($language === 'ja') {
                $msg = "現在の期間の収入概要は以下の通りです：\n\n";
                $msg .= "💵 **収入合計:** {$income['total_income_formatted']}\n\n";
                if (!empty($income['breakdown_by_category'])) {
                    $msg .= "**カテゴリー別内訳:**\n";
                    foreach ($income['breakdown_by_category'] as $item) {
                        $catName = !empty($item['category_ja']) ? $item['category_ja'] : $item['category'];
                        $msg .= "• **{$catName}**: {$item['amount_formatted']} ({$item['percentage']})\n";
                    }
                }
            } else {
                $msg = "Berikut ringkasan pemasukan untuk periode saat ini:\n\n";
                $msg .= "💵 **Total Pemasukan:** {$income['total_income_formatted']}\n\n";
                if (!empty($income['breakdown_by_category'])) {
                    $msg .= "**Rincian per Kategori:**\n";
                    foreach ($income['breakdown_by_category'] as $item) {
                        $msg .= "• **{$item['category']}**: {$item['amount_formatted']} ({$item['percentage']})\n";
                    }
                }
            }

            return [
                'reply' => $msg,
                'executed_tools' => [['name' => 'income_summary', 'tool' => 'income_summary', 'result' => $income]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 3. Check if user wants to create transaction / draft
        if (preg_match('/(catat|tambah|masuk|keluar|beli|bayar|transfer|terima|gaji|sewa|record|add|enter|create|income|expense|deposit|withdraw|salary|rent|記録|追加|入力|作成|入金|出金|購入|支払|受取|給与|家賃)/iu', $lower)) {
            // Extract nominal
            preg_match('/(\d+[\.\d]*)/', str_replace(['rp', 'rp.', '$', '¥', ' ', ','], '', $lower), $amountMatches);
            $amount = isset($amountMatches[1]) ? (float) $amountMatches[1] : 500000;

            // If user typed in USD or JPY based on active language, convert benchmark if needed or pass as is
            if ($language === 'en' && $amount < 10000) {
                $amount = $amount * 15500; // Benchmark rate
            } elseif ($language === 'ja' && $amount < 10000) {
                $amount = $amount * 105; // Benchmark rate
            }

            $type = (preg_match('/(masuk|terima|jual|omset|pendapatan|invoice|income|deposit|receive|sale|入金|収入|売上|受取)/iu', $lower)) ? 'cash_in' : 'cash_out';

            $draftResult = AiToolRegistry::executeTool('create_draft', [
                'type' => $type,
                'amount' => $amount,
                'description' => $userMessage,
            ]);

            $draftReply = match ($language) {
                'en' => "I have prepared a transaction draft for you. Please review the details below before saving to the system:",
                'ja' => "取引の下書き（ドラフト）を作成しました。システムに保存する前に、以下の内容をご確認ください：",
                default => "Saya telah menyiapkan draft transaksi untuk Anda. Silakan periksa kembali rinciannya di bawah ini sebelum disimpan ke sistem:",
            };

            return [
                'reply' => $draftReply,
                'executed_tools' => [
                    ['name' => 'create_draft', 'tool' => 'create_draft', 'result' => $draftResult],
                ],
                'draft_card' => $draftResult['draft'] ?? null,
                'provider' => 'local-engine',
            ];
        }

        // 4. Check for balance summary
        if (preg_match('/(saldo|rekening|uang|kas saat ini|total kas|balance|account|current cash|liquid cash|how much cash|残高|口座|現金|現預金)/iu', $lower)) {
            $balance = AiToolRegistry::executeTool('balance_summary', []);

            if ($language === 'en') {
                $msg = "Here is the current liquid cash balance summary for your company:\n\n";
                $msg .= "💰 **Total Liquid Cash:** {$balance['total_liquid_cash_formatted']}\n\n";
                foreach ($balance['accounts'] as $acc) {
                    $accName = !empty($acc['name_en']) ? $acc['name_en'] : $acc['name'];
                    $msg .= "• **{$accName}**: {$acc['current_balance_formatted']}\n";
                }
            } elseif ($language === 'ja') {
                $msg = "会社の現在の現金・口座残高の概要は以下の通りです：\n\n";
                $msg .= "💰 **流動資産合計:** {$balance['total_liquid_cash_formatted']}\n\n";
                foreach ($balance['accounts'] as $acc) {
                    $accName = !empty($acc['name_ja']) ? $acc['name_ja'] : $acc['name'];
                    $msg .= "• **{$accName}**: {$acc['current_balance_formatted']}\n";
                }
            } else {
                $msg = "Berikut ringkasan saldo kas perusahaan Anda saat ini:\n\n";
                $msg .= "💰 **Total Kas Likuid:** {$balance['total_liquid_cash_formatted']}\n\n";
                foreach ($balance['accounts'] as $acc) {
                    $msg .= "• **{$acc['name']}**: {$acc['current_balance_formatted']}\n";
                }
            }

            return [
                'reply' => $msg,
                'executed_tools' => [['name' => 'balance_summary', 'tool' => 'balance_summary', 'result' => $balance]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 5. Check for cash flow
        if (preg_match('/(cash flow|arus kas|aliran kas|キャッシュフロー)/iu', $lower)) {
            $cf = AiToolRegistry::executeTool('cash_flow', []);

            if ($language === 'en') {
                $msg = "📊 **Cash Flow Report for this Period:**\n\n";
                $msg .= "• Total Cash In: **{$cf['total_cash_in_formatted']}**\n";
                $msg .= "• Total Cash Out: **{$cf['total_cash_out_formatted']}**\n";
                $msg .= "• Net Cash Flow: **{$cf['net_cash_flow_formatted']}** ({$cf['status']})";
            } elseif ($language === 'ja') {
                $msg = "📊 **今期のキャッシュフロー報告:**\n\n";
                $msg .= "• 入金合計 (Cash In): **{$cf['total_cash_in_formatted']}**\n";
                $msg .= "• 出金合計 (Cash Out): **{$cf['total_cash_out_formatted']}**\n";
                $msg .= "• 純キャッシュフロー: **{$cf['net_cash_flow_formatted']}** ({$cf['status']})";
            } else {
                $msg = "📊 **Laporan Arus Kas Periode Ini:**\n\n";
                $msg .= "• Total Cash In: **{$cf['total_cash_in_formatted']}**\n";
                $msg .= "• Total Cash Out: **{$cf['total_cash_out_formatted']}**\n";
                $msg .= "• Net Cash Flow: **{$cf['net_cash_flow_formatted']}** ({$cf['status']})";
            }

            return [
                'reply' => $msg,
                'executed_tools' => [['name' => 'cash_flow', 'tool' => 'cash_flow', 'result' => $cf]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 6. Check for trend analysis
        if (preg_match('/(tren|trend|analisis|analysis|burn rate|pertumbuhan|growth|トレンド|バーンレート|分析)/iu', $lower)) {
            $trend = AiToolRegistry::executeTool('trend_analysis', ['days' => 30]);

            if ($language === 'en') {
                $msg = "📈 **Financial Trend Analysis (Last 30 Days):**\n\n";
                $msg .= "• Avg Daily Income: **{$trend['avg_daily_income_formatted']}**\n";
                $msg .= "• Avg Daily Burn Rate: **{$trend['avg_daily_burn_rate_formatted']}**\n";
                $msg .= "• Recent Period Growth: **{$trend['recent_vs_previous_growth']}**\n";
                $msg .= "• Financial Health Score: **{$trend['health_score']}**";
            } elseif ($language === 'ja') {
                $msg = "📈 **財務トレンド分析 (過去30日間):**\n\n";
                $msg .= "• 1日平均収入: **{$trend['avg_daily_income_formatted']}**\n";
                $msg .= "• 1日平均支出 (バーンレート): **{$trend['avg_daily_burn_rate_formatted']}**\n";
                $msg .= "• 直近成長率: **{$trend['recent_vs_previous_growth']}**\n";
                $msg .= "• 財務健全性スコア: **{$trend['health_score']}**";
            } else {
                $msg = "📈 **Analisis Tren Keuangan (30 Hari Terakhir):**\n\n";
                $msg .= "• Rata-rata Pemasukan Harian: **{$trend['avg_daily_income_formatted']}**\n";
                $msg .= "• Rata-rata Pengeluaran Harian (*Burn Rate*): **{$trend['avg_daily_burn_rate_formatted']}**\n";
                $msg .= "• Pertumbuhan Periode Terakhir: **{$trend['recent_vs_previous_growth']}**\n";
                $msg .= "• Status Kesehatan Finansial: **{$trend['health_score']}**";
            }

            return [
                'reply' => $msg,
                'executed_tools' => [['name' => 'trend_analysis', 'tool' => 'trend_analysis', 'result' => $trend]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 7. Check for forecasting
        if (preg_match('/(prediksi|forecast|proyeksi|projection|masa depan|future|30 hari|30 days|予測|見通し)/iu', $lower)) {
            $forecast = AiToolRegistry::executeTool('forecasting', ['days_ahead' => 30]);

            if ($language === 'en') {
                $msg = "🔮 **Cash Projection ({$forecast['projection_horizon']}):**\n\n";
                $msg .= "• Current Balance: **{$forecast['current_balance_formatted']}**\n";
                $msg .= "• Projected Ending Balance: **{$forecast['projected_cash_position_formatted']}**\n";
                $msg .= "• Estimated Cash Runway: **{$forecast['cash_runway']}**\n\n";
                $msg .= "💡 Recommendations: " . implode(', ', $forecast['recommended_actions']);
            } elseif ($language === 'ja') {
                $msg = "🔮 **資金繰り予測 ({$forecast['projection_horizon']}):**\n\n";
                $msg .= "• 現在残高: **{$forecast['current_balance_formatted']}**\n";
                $msg .= "• 予測期末残高: **{$forecast['projected_cash_position_formatted']}**\n";
                $msg .= "• 推定ランウェイ: **{$forecast['cash_runway']}**\n\n";
                $msg .= "💡 推奨アクション: " . implode(', ', $forecast['recommended_actions']);
            } else {
                $msg = "🔮 **Proyeksi Kas ({$forecast['projection_horizon']}):**\n\n";
                $msg .= "• Saldo Saat Ini: **{$forecast['current_balance_formatted']}**\n";
                $msg .= "• Proyeksi Saldo Akhir: **{$forecast['projected_cash_position_formatted']}**\n";
                $msg .= "• Estimasi Runway Kas: **{$forecast['cash_runway']}**\n\n";
                $msg .= "💡 Rekomendasi: " . implode(', ', $forecast['recommended_actions']);
            }

            return [
                'reply' => $msg,
                'executed_tools' => [['name' => 'forecasting', 'tool' => 'forecasting', 'result' => $forecast]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 8. Check for greetings or help
        if (preg_match('/^(halo|hai|hi|hey|hello|good|assalamu|pagi|siang|sore|malam|bantuan|menu|info|help|こんにちは|おはよう|こんばんは|ヘルプ|メニュー)/iu', trim($lower))) {
            $balance = AiToolRegistry::executeTool('balance_summary', []);

            if ($language === 'en') {
                $reply = "Hello! I am the Financial AI Assistant for AUBE TERRA INDONESIA. You can ask me to:\n\n" .
                    "1. Record transactions: *\"Record $50 office supplies expense from Store Cash\"*\n" .
                    "2. Check cash balance: *\"What is our current total cash balance?\"*\n" .
                    "3. View cash flow: *\"Show me this month's cash flow summary\"*\n" .
                    "4. Analyze trends: *\"How is our spending trend and burn rate?\"*\n" .
                    "5. Forecast cash: *\"Predict our cash position for the next 30 days\"*\n\n" .
                    "Current active liquid cash: **{$balance['total_liquid_cash_formatted']}**.";
            } elseif ($language === 'ja') {
                $reply = "こんにちは！AUBE TERRA INDONESIA専属のAI財務アシスタントです。以下のような操作をご指示いただけます：\n\n" .
                    "1. 取引の記録: *「店舗小口現金から事務用品費5,000円の支出を記録して」*\n" .
                    "2. 残高確認: *「現在の現預金残高の合計はいくらですか？」*\n" .
                    "3. キャッシュフロー確認: *「今月のキャッシュフロー概要を表示して」*\n" .
                    "4. トレンド分析: *「支出トレンドとバーンレートの分析を見せて」*\n" .
                    "5. 資金繰り予測: *「今後30日間の資金予測はどうですか？」*\n\n" .
                    "現在の有効現金残高: **{$balance['total_liquid_cash_formatted']}**.";
            } else {
                $reply = "Halo! Saya adalah AI Asisten Keuangan AUBE TERRA INDONESIA. Anda dapat meminta saya untuk:\n\n" .
                    "1. Mencatat transaksi: *\"Catat pengeluaran beli bensin 150rb dari Kas Toko\"*\n" .
                    "2. Cek saldo kas: *\"Berapa total saldo kas saat ini?\"*\n" .
                    "3. Lihat arus kas: *\"Tampilkan ringkasan cash flow bulan ini\"*\n" .
                    "4. Analisis tren: *\"Bagaimana tren pengeluaran dan burn rate?\"*\n" .
                    "5. Proyeksi kas: *\"Prediksi posisi kas 30 hari ke depan\"*\n\n" .
                    "Saldo kas aktif saat ini: **{$balance['total_liquid_cash_formatted']}**.";
            }

            return [
                'reply' => $reply,
                'executed_tools' => [],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // 9. Check for highest/largest transaction query
        if (preg_match('/(transaksi|pengeluaran|pemasukan).*(tertinggi|terbesar|maksimal|paling tinggi|paling besar)/iu', $lower) ||
            preg_match('/(tertinggi|terbesar|paling besar|paling tinggi).*(transaksi|pengeluaran|pemasukan)/iu', $lower)) {
            $isIncome = preg_match('/(pemasukan|masuk|income)/iu', $lower);
            $query = \App\Models\Transaction::with(['category', 'account'])->orderByDesc('amount');
            if ($isIncome) {
                $query->where('type', 'cash_in');
            } elseif (preg_match('/(pengeluaran|keluar|expense)/iu', $lower)) {
                $query->where('type', 'cash_out');
            }
            $highest = $query->first();
            if ($highest) {
                $tType = $highest->type === 'cash_in' ? 'Pemasukan' : 'Pengeluaran';
                $tDate = $highest->date->format('d M Y');
                $tAmount = 'Rp ' . number_format($highest->amount, 0, ',', '.');
                $tCat = $highest->category?->name ?? 'Tanpa Kategori';
                $tDesc = $highest->description ?: '-';
                $reply = "Transaksi dengan nominal tertinggi di sistem:\n\n" .
                    "📅 **Tanggal:** {$tDate}\n" .
                    "💰 **Nominal:** **{$tAmount}** ({$tType})\n" .
                    "🏷️ **Kategori:** {$tCat}\n" .
                    "📝 **Keterangan:** {$tDesc}";
            } else {
                $reply = "Belum ada data transaksi yang tercatat di sistem saat ini.";
            }
            return [
                'reply' => $reply,
                'executed_tools' => [['name' => 'search_transaction', 'tool' => 'search_transaction', 'result' => $highest]],
                'draft_card' => null,
                'provider' => 'local-engine',
            ];
        }

        // Out-of-context refusal
        $refusal = match ($language) {
            'en' => "I apologize, but I am a dedicated Financial AI Assistant for the AUBE TERRA accounting system. I can only assist with recording cash in & cash out transactions, checking account balances, cash flow summaries, trend analyses, and company cash forecasts. Is there any financial data or report you would like to review?",
            'ja' => "申し訳ありませんが、私はAUBE TERRA会計システムの専属財務AIアシスタントです。入出金取引の記録、口座残高の確認、キャッシュフロー報告、支出トレンド分析、資金繰り予測のみに対応しております。ご確認になりたい取引や財務データはございますか？",
            default => "Maaf, saya adalah AI Asisten Keuangan khusus sistem akuntansi AUBE TERRA. Saya hanya dapat melayani pertanyaan dan instruksi seputar pencatatan kas masuk & keluar, pemeriksaan saldo kas/rekening, laporan cash flow, analisa tren pengeluaran, dan proyeksi keuangan perusahaan. Apakah ada data transaksi atau keuangan yang dapat saya bantu?",
        };

        return [
            'reply' => $refusal,
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

    /**
     * Send generateContent request with multi-model failover
     */
    private function postGenerateContent(array $payload, int $timeout = 20): ?array
    {
        foreach ($this->candidateModels as $model) {
            try {
                $response = Http::timeout($timeout)->post(
                    "{$this->baseUrl}/{$model}:generateContent?key={$this->apiKey}",
                    $payload
                );

                if ($response->successful()) {
                    $this->model = $model;
                    return $response->json();
                }

                Log::warning("Gemini model {$model} failed with status {$response->status()}: " . $response->body());
            } catch (\Throwable $e) {
                Log::warning("Gemini model {$model} error: " . $e->getMessage());
            }
        }

        return null;
    }
}
