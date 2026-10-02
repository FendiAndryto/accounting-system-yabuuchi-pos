<?php

namespace App\Services\AI;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AiToolRegistry
{
    /**
     * Get function definitions formatted for Google Gemini API
     */
    public static function getToolDefinitions(): array
    {
        return [
            [
                'name' => 'get_transaction',
                'description' => 'Mengambil detail lengkap satu transaksi berdasarkan ID transaksi.',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'transaction_id' => [
                            'type' => 'INTEGER',
                            'description' => 'ID numerik transaksi yang ingin dilihat',
                        ],
                    ],
                    'required' => ['transaction_id'],
                ],
            ],
            [
                'name' => 'search_transaction',
                'description' => 'Mencari transaksi kas masuk atau kas keluar berdasarkan kata kunci, tanggal, kategori, atau tipe.',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'keyword' => [
                            'type' => 'STRING',
                            'description' => 'Kata kunci pencarian di deskripsi transaksi',
                        ],
                        'type' => [
                            'type' => 'STRING',
                            'description' => 'Tipe transaksi: cash_in atau cash_out',
                            'enum' => ['cash_in', 'cash_out'],
                        ],
                        'start_date' => [
                            'type' => 'STRING',
                            'description' => 'Tanggal awal filter (format YYYY-MM-DD)',
                        ],
                        'end_date' => [
                            'type' => 'STRING',
                            'description' => 'Tanggal akhir filter (format YYYY-MM-DD)',
                        ],
                        'limit' => [
                            'type' => 'INTEGER',
                            'description' => 'Jumlah maksimal transaksi yang ditampilkan (default 10)',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'create_draft',
                'description' => 'Membuat draft transaksi kas masuk atau keluar untuk diverifikasi dan dikonfirmasi user sebelum disimpan.',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'type' => [
                            'type' => 'STRING',
                            'description' => 'Tipe transaksi: cash_in (kas masuk) atau cash_out (kas keluar)',
                            'enum' => ['cash_in', 'cash_out'],
                        ],
                        'amount' => [
                            'type' => 'NUMBER',
                            'description' => 'Nominal uang transaksi dalam Rupiah (angka tanpa titik/koma)',
                        ],
                        'category_name' => [
                            'type' => 'STRING',
                            'description' => 'Nama kategori (contoh: Penjualan Produk, Gaji, Operasional, Sewa)',
                        ],
                        'account_name' => [
                            'type' => 'STRING',
                            'description' => 'Nama akun / dompet / bank (contoh: Kas Tunai, Bank BCA, Bank Mandiri)',
                        ],
                        'payment_method' => [
                            'type' => 'STRING',
                            'description' => 'Metode pembayaran (Transfer Bank, Cash, QRIS, Kartu Debit)',
                        ],
                        'description' => [
                            'type' => 'STRING',
                            'description' => 'Deskripsi atau keterangan transaksi',
                        ],
                        'date' => [
                            'type' => 'STRING',
                            'description' => 'Tanggal transaksi (format YYYY-MM-DD, default hari ini jika tidak disebut)',
                        ],
                    ],
                    'required' => ['type', 'amount', 'description'],
                ],
            ],
            [
                'name' => 'category_transaction',
                'description' => 'Menganalisis deskripsi transaksi dan merekomendasikan kategori cash_in / cash_out yang paling tepat.',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'description' => [
                            'type' => 'STRING',
                            'description' => 'Deskripsi atau catatan pengeluaran/pemasukan',
                        ],
                    ],
                    'required' => ['description'],
                ],
            ],
            [
                'name' => 'cash_flow',
                'description' => 'Menghitung laporan arus kas (Total Cash In, Total Cash Out, dan Net Cash Flow) dalam rentang tanggal tertentu.',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'start_date' => [
                            'type' => 'STRING',
                            'description' => 'Tanggal awal (YYYY-MM-DD)',
                        ],
                        'end_date' => [
                            'type' => 'STRING',
                            'description' => 'Tanggal akhir (YYYY-MM-DD)',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'income_summary',
                'description' => 'Menghasilkan ringkasan total pemasukan (Cash In) dikelompokkan berdasarkan kategori atau akun/bank.',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'start_date' => ['type' => 'STRING', 'description' => 'Tanggal awal (YYYY-MM-DD)'],
                        'end_date' => ['type' => 'STRING', 'description' => 'Tanggal akhir (YYYY-MM-DD)'],
                    ],
                ],
            ],
            [
                'name' => 'expense_summary',
                'description' => 'Menghasilkan ringkasan total pengeluaran (Cash Out) dikelompokkan berdasarkan kategori atau akun/bank.',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'start_date' => ['type' => 'STRING', 'description' => 'Tanggal awal (YYYY-MM-DD)'],
                        'end_date' => ['type' => 'STRING', 'description' => 'Tanggal akhir (YYYY-MM-DD)'],
                    ],
                ],
            ],
            [
                'name' => 'balance_summary',
                'description' => 'Melihat saldo riil saat ini untuk semua akun (Kas Tunai, Rekening Bank, dll) serta total kas keseluruhan.',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'account_id' => [
                            'type' => 'INTEGER',
                            'description' => 'Opsional: ID akun spesifik jika hanya ingin cek saldo satu akun',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'trend_analysis',
                'description' => 'Menghitung statistik tren keuangan: rata-rata pengeluaran & pemasukan harian, rasio efisiensi, dan tren pertumbuhan.',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'days' => [
                            'type' => 'INTEGER',
                            'description' => 'Jumlah hari ke belakang untuk dianalisis (default 30 hari)',
                        ],
                    ],
                ],
            ],
            [
                'name' => 'forecasting',
                'description' => 'Menghitung estimasi proyeksi saldo kas X hari ke depan berdasarkan rata-rata arus kas harian (burn rate / run rate).',
                'parameters' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'days_ahead' => [
                            'type' => 'INTEGER',
                            'description' => 'Jumlah hari ke depan yang ingin diproyeksikan (default 30 hari)',
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Execute a tool by name with arguments
     */
    public static function executeTool(string $name, array $args = []): array
    {
        return match ($name) {
            'get_transaction' => self::getTransaction($args),
            'search_transaction' => self::searchTransaction($args),
            'create_draft' => self::createDraft($args),
            'category_transaction' => self::categoryTransaction($args),
            'cash_flow' => self::cashFlow($args),
            'income_summary' => self::incomeSummary($args),
            'expense_summary' => self::expenseSummary($args),
            'balance_summary' => self::balanceSummary($args),
            'trend_analysis' => self::trendAnalysis($args),
            'forecasting' => self::forecasting($args),
            default => ['error' => "Unknown tool {$name}"],
        };
    }

    // 1. Transaction Tools
    private static function getTransaction(array $args): array
    {
        $id = $args['transaction_id'] ?? null;
        if (!$id) return ['error' => 'transaction_id is required'];

        $tx = Transaction::with(['category', 'account', 'creator'])->find($id);
        if (!$tx) return ['error' => "Transaksi ID #{$id} tidak ditemukan."];

        return [
            'id' => $tx->id,
            'date' => $tx->date->format('Y-m-d'),
            'type' => $tx->type,
            'amount' => (float) $tx->amount,
            'amount_formatted' => 'Rp ' . number_format($tx->amount, 0, ',', '.'),
            'category' => $tx->category?->name ?? 'Tanpa Kategori',
            'account' => $tx->account?->name ?? 'Kas Utama',
            'payment_method' => $tx->payment_method,
            'description' => $tx->description,
            'created_by' => $tx->creator?->name ?? 'System',
            'created_at' => $tx->created_at->format('Y-m-d H:i:s'),
        ];
    }

    private static function searchTransaction(array $args): array
    {
        $query = Transaction::with(['category', 'account'])->latest('date');

        if (!empty($args['keyword'])) {
            $query->where('description', 'like', '%' . $args['keyword'] . '%');
        }

        if (!empty($args['type'])) {
            $query->where('type', $args['type']);
        }

        if (!empty($args['start_date'])) {
            $query->where('date', '>=', $args['start_date']);
        }

        if (!empty($args['end_date'])) {
            $query->where('date', '<=', $args['end_date']);
        }

        $limit = min($args['limit'] ?? 10, 50);
        $results = $query->take($limit)->get()->map(function ($tx) {
            return [
                'id' => $tx->id,
                'date' => $tx->date->format('Y-m-d'),
                'type' => $tx->type,
                'amount' => (float) $tx->amount,
                'amount_formatted' => 'Rp ' . number_format($tx->amount, 0, ',', '.'),
                'category' => $tx->category?->name,
                'account' => $tx->account?->name,
                'payment_method' => $tx->payment_method,
                'description' => $tx->description,
            ];
        });

        return [
            'total_found' => $results->count(),
            'transactions' => $results->toArray(),
        ];
    }

    private static function createDraft(array $args): array
    {
        $type = $args['type'] ?? 'cash_out';
        $amount = (float) ($args['amount'] ?? 0);
        $desc = $args['description'] ?? 'Transaksi baru';
        $date = $args['date'] ?? Carbon::today()->format('Y-m-d');
        $paymentMethod = $args['payment_method'] ?? 'Transfer Bank';

        // Find or suggest Category
        $categoryName = $args['category_name'] ?? null;
        $category = null;
        if ($categoryName) {
            $category = Category::where('name', 'like', "%{$categoryName}%")->first();
        }
        if (!$category) {
            // Pick default based on type
            $category = Category::where('type', $type)->first();
        }

        // Find or suggest Account
        $accountName = $args['account_name'] ?? null;
        $account = null;
        if ($accountName) {
            $account = Account::where('name', 'like', "%{$accountName}%")->first();
        }
        if (!$account) {
            $account = Account::first();
        }

        return [
            'status' => 'draft_created',
            'action_required' => 'confirm_or_edit',
            'draft' => [
                'date' => $date,
                'type' => $type,
                'amount' => $amount,
                'amount_formatted' => 'Rp ' . number_format($amount, 0, ',', '.'),
                'category_id' => $category?->id,
                'category_name' => $category?->name ?? 'Umum',
                'account_id' => $account?->id,
                'account_name' => $account?->name ?? 'Kas Utama',
                'payment_method' => $paymentMethod,
                'description' => $desc,
            ],
            'available_accounts' => Account::where('is_active', true)->get(['id', 'name'])->toArray(),
            'available_categories' => Category::where('type', $type)->get(['id', 'name'])->toArray(),
        ];
    }

    private static function categoryTransaction(array $args): array
    {
        $desc = strtolower($args['description'] ?? '');
        $categories = Category::all();

        $recommended = null;
        $detectedType = 'cash_out';

        // Heuristic detection
        if (preg_match('/(jual|terima|masuk|pelunasan|invoice|pendapatan|fee|omset)/', $desc)) {
            $detectedType = 'cash_in';
        }

        foreach ($categories as $cat) {
            if (str_contains($desc, strtolower($cat->name))) {
                $recommended = $cat;
                break;
            }
        }

        if (!$recommended) {
            if ($detectedType === 'cash_in') {
                $recommended = $categories->firstWhere('type', 'cash_in');
            } else {
                $recommended = $categories->firstWhere('type', 'cash_out');
            }
        }

        return [
            'detected_type' => $detectedType,
            'recommended_category' => [
                'id' => $recommended?->id,
                'name' => $recommended?->name,
                'type' => $recommended?->type,
            ],
            'all_matching_categories' => $categories->where('type', $detectedType)->values()->toArray(),
        ];
    }

    // 2. Financial Tools
    private static function cashFlow(array $args): array
    {
        $startDate = $args['start_date'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $endDate = $args['end_date'] ?? Carbon::now()->format('Y-m-d');

        $cashIn = (float) Transaction::where('type', 'cash_in')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        $cashOut = (float) Transaction::where('type', 'cash_out')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        $netFlow = $cashIn - $cashOut;

        return [
            'period' => ['start_date' => $startDate, 'end_date' => $endDate],
            'total_cash_in' => $cashIn,
            'total_cash_in_formatted' => 'Rp ' . number_format($cashIn, 0, ',', '.'),
            'total_cash_out' => $cashOut,
            'total_cash_out_formatted' => 'Rp ' . number_format($cashOut, 0, ',', '.'),
            'net_cash_flow' => $netFlow,
            'net_cash_flow_formatted' => ($netFlow >= 0 ? '+' : '-') . 'Rp ' . number_format(abs($netFlow), 0, ',', '.'),
            'status' => $netFlow >= 0 ? 'Surplus (Positif)' : 'Defisit (Negatif)',
        ];
    }

    private static function incomeSummary(array $args): array
    {
        $startDate = $args['start_date'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $endDate = $args['end_date'] ?? Carbon::now()->format('Y-m-d');

        $byCategory = Transaction::where('transactions.type', 'cash_in')
            ->whereBetween('transactions.date', [$startDate, $endDate])
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name as category_name', DB::raw('SUM(transactions.amount) as total_amount'), DB::raw('COUNT(transactions.id) as total_count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_amount')
            ->get();

        $totalIncome = $byCategory->sum('total_amount');

        return [
            'period' => ['start_date' => $startDate, 'end_date' => $endDate],
            'total_income' => (float) $totalIncome,
            'total_income_formatted' => 'Rp ' . number_format($totalIncome, 0, ',', '.'),
            'breakdown_by_category' => $byCategory->map(fn($item) => [
                'category' => $item->category_name,
                'amount' => (float) $item->total_amount,
                'amount_formatted' => 'Rp ' . number_format($item->total_amount, 0, ',', '.'),
                'percentage' => $totalIncome > 0 ? round(($item->total_amount / $totalIncome) * 100, 1) . '%' : '0%',
                'count' => $item->total_count,
            ])->toArray(),
        ];
    }

    private static function expenseSummary(array $args): array
    {
        $startDate = $args['start_date'] ?? Carbon::now()->startOfMonth()->format('Y-m-d');
        $endDate = $args['end_date'] ?? Carbon::now()->format('Y-m-d');

        $byCategory = Transaction::where('transactions.type', 'cash_out')
            ->whereBetween('transactions.date', [$startDate, $endDate])
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->select('categories.name as category_name', DB::raw('SUM(transactions.amount) as total_amount'), DB::raw('COUNT(transactions.id) as total_count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_amount')
            ->get();

        $totalExpense = $byCategory->sum('total_amount');

        return [
            'period' => ['start_date' => $startDate, 'end_date' => $endDate],
            'total_expense' => (float) $totalExpense,
            'total_expense_formatted' => 'Rp ' . number_format($totalExpense, 0, ',', '.'),
            'breakdown_by_category' => $byCategory->map(fn($item) => [
                'category' => $item->category_name,
                'amount' => (float) $item->total_amount,
                'amount_formatted' => 'Rp ' . number_format($item->total_amount, 0, ',', '.'),
                'percentage' => $totalExpense > 0 ? round(($item->total_amount / $totalExpense) * 100, 1) . '%' : '0%',
                'count' => $item->total_count,
            ])->toArray(),
        ];
    }

    private static function balanceSummary(array $args): array
    {
        $accountId = $args['account_id'] ?? null;
        $accountsQuery = Account::where('is_active', true);

        if ($accountId) {
            $accountsQuery->where('id', $accountId);
        }

        $accounts = $accountsQuery->get()->map(function ($acc) {
            $in = (float) $acc->transactions()->where('type', 'cash_in')->sum('amount');
            $out = (float) $acc->transactions()->where('type', 'cash_out')->sum('amount');
            $currentBalance = (float) ($acc->initial_balance + $in - $out);

            return [
                'id' => $acc->id,
                'name' => $acc->name,
                'account_number' => $acc->account_number,
                'initial_balance' => (float) $acc->initial_balance,
                'total_in' => $in,
                'total_out' => $out,
                'current_balance' => $currentBalance,
                'current_balance_formatted' => 'Rp ' . number_format($currentBalance, 0, ',', '.'),
            ];
        });

        $totalCashInAll = $accounts->sum('current_balance');

        return [
            'total_liquid_cash' => (float) $totalCashInAll,
            'total_liquid_cash_formatted' => 'Rp ' . number_format($totalCashInAll, 0, ',', '.'),
            'accounts' => $accounts->toArray(),
        ];
    }

    // 3. Analysis Tools
    private static function trendAnalysis(array $args): array
    {
        $days = $args['days'] ?? 30;
        $startDate = Carbon::today()->subDays($days)->format('Y-m-d');
        $endDate = Carbon::today()->format('Y-m-d');

        $in = (float) Transaction::where('type', 'cash_in')->whereBetween('date', [$startDate, $endDate])->sum('amount');
        $out = (float) Transaction::where('type', 'cash_out')->whereBetween('date', [$startDate, $endDate])->sum('amount');

        $avgDailyIn = $days > 0 ? $in / $days : 0;
        $avgDailyOut = $days > 0 ? $out / $days : 0;
        $netDaily = $avgDailyIn - $avgDailyOut;

        // Group by 7-day windows for trend comparison
        $halfPeriod = (int) ($days / 2);
        $midDate = Carbon::today()->subDays($halfPeriod)->format('Y-m-d');

        $recentIn = (float) Transaction::where('type', 'cash_in')->whereBetween('date', [$midDate, $endDate])->sum('amount');
        $prevIn = (float) Transaction::where('type', 'cash_in')->whereBetween('date', [$startDate, $midDate])->sum('amount');

        $growthRate = $prevIn > 0 ? round((($recentIn - $prevIn) / $prevIn) * 100, 2) : 0;

        return [
            'period_analyzed' => "{$days} hari terakhir ({$startDate} s/d {$endDate})",
            'avg_daily_income' => round($avgDailyIn, 2),
            'avg_daily_income_formatted' => 'Rp ' . number_format($avgDailyIn, 0, ',', '.'),
            'avg_daily_burn_rate' => round($avgDailyOut, 2),
            'avg_daily_burn_rate_formatted' => 'Rp ' . number_format($avgDailyOut, 0, ',', '.'),
            'net_daily_flow' => round($netDaily, 2),
            'recent_vs_previous_growth' => "{$growthRate}%",
            'health_score' => $in > $out ? 'SEHAT (Arus Kas Surplus)' : 'PERHATIAN (Burn rate melebihi pemasukan)',
        ];
    }

    private static function forecasting(array $args): array
    {
        $daysAhead = $args['days_ahead'] ?? 30;

        // Balance now
        $balanceData = self::balanceSummary([]);
        $currentBalance = $balanceData['total_liquid_cash'];

        // Historical 30 days burn rate & run rate
        $trends = self::trendAnalysis(['days' => 30]);
        $netDaily = $trends['net_daily_flow'];

        $projectedNetChange = $netDaily * $daysAhead;
        $projectedBalance = $currentBalance + $projectedNetChange;

        $runwayDays = null;
        if ($trends['avg_daily_burn_rate'] > 0) {
            $runwayDays = round($currentBalance / $trends['avg_daily_burn_rate']);
        }

        return [
            'current_balance' => $currentBalance,
            'current_balance_formatted' => 'Rp ' . number_format($currentBalance, 0, ',', '.'),
            'projection_horizon' => "{$daysAhead} hari ke depan",
            'daily_net_velocity' => $netDaily,
            'daily_net_velocity_formatted' => ($netDaily >= 0 ? '+' : '-') . 'Rp ' . number_format(abs($netDaily), 0, ',', '.'),
            'projected_cash_position' => $projectedBalance,
            'projected_cash_position_formatted' => 'Rp ' . number_format($projectedBalance, 0, ',', '.'),
            'cash_runway' => $runwayDays ? "Estimasi {$runwayDays} hari jika tanpa pemasukan tambahan" : 'Tidak terbatas',
            'recommended_actions' => $projectedBalance < $currentBalance
                ? ['Kendalikan pos pengeluaran terbesar', 'Optimalkan penagihan piutang pelanggan']
                : ['Arus kas positif, pertimbangkan ekspansi modal atau dana cadangan'],
        ];
    }
}
