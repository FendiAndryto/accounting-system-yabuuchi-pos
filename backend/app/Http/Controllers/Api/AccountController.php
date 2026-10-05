<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\StoreAccountRequest;
use App\Http\Requests\Account\UpdateAccountRequest;
use App\Models\Account;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    /**
     * Display a listing of accounts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Account::query();

        // If 'all' is true, return both active and inactive (for Master Data view)
        if (!$request->boolean('all')) {
            $query->where('is_active', true);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('account_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $accounts = $query->withCount('transactions')->get()->map(function ($acc) {
            $in = (float) $acc->transactions()->where('type', 'cash_in')->sum('amount');
            $out = (float) $acc->transactions()->where('type', 'cash_out')->sum('amount');
            $balance = (float) ($acc->initial_balance + $in - $out);

            return [
                'id' => $acc->id,
                'name' => $acc->name,
                'name_en' => $acc->name_en,
                'name_ja' => $acc->name_ja,
                'account_number' => $acc->account_number,
                'initial_balance' => (float) $acc->initial_balance,
                'initial_balance_formatted' => 'Rp ' . number_format($acc->initial_balance, 0, ',', '.'),
                'total_in' => $in,
                'total_out' => $out,
                'current_balance' => $balance,
                'current_balance_formatted' => 'Rp ' . number_format($balance, 0, ',', '.'),
                'description' => $acc->description,
                'is_active' => (bool) $acc->is_active,
                'transactions_count' => $acc->transactions_count,
            ];
        });

        // Total balance of active accounts
        $totalBalance = $accounts->where('is_active', true)->sum('current_balance');

        return response()->json([
            'total_balance' => $totalBalance,
            'total_balance_formatted' => 'Rp ' . number_format($totalBalance, 0, ',', '.'),
            'accounts' => $accounts,
        ]);
    }

    /**
     * Store a newly created account.
     */
    public function store(StoreAccountRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $account = Account::create([
            'name' => $validated['name'],
            'name_en' => $validated['name_en'] ?? null,
            'name_ja' => $validated['name_ja'] ?? null,
            'account_number' => $validated['account_number'] ?? null,
            'initial_balance' => $validated['initial_balance'] ?? 0,
            'description' => $validated['description'] ?? null,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Akun kas/bank berhasil ditambahkan',
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'name_en' => $account->name_en,
                'name_ja' => $account->name_ja,
                'account_number' => $account->account_number,
                'initial_balance' => (float) $account->initial_balance,
                'current_balance' => (float) $account->initial_balance,
                'description' => $account->description,
                'is_active' => (bool) $account->is_active,
                'transactions_count' => 0,
            ],
        ], 201);
    }

    /**
     * Update the specified account.
     */
    public function update(UpdateAccountRequest $request, int $id): JsonResponse
    {
        $account = Account::withCount('transactions')->findOrFail($id);

        $validated = $request->validated();

        // Accounting Integrity Check:
        // Initial balance cannot be modified once transactions have been recorded.
        if (array_key_exists('initial_balance', $validated)) {
            $newInitial = (float) $validated['initial_balance'];
            $currentInitial = (float) $account->initial_balance;

            if ($account->transactions_count > 0 && abs($newInitial - $currentInitial) > 0.001) {
                return response()->json([
                    'message' => "Saldo awal tidak dapat diubah karena rekening '{$account->name}' sudah memiliki {$account->transactions_count} transaksi tercatat. Saldo awal dikunci untuk menjaga integritas pembukuan.",
                ], 422);
            }

            $account->initial_balance = $newInitial;
        }

        $account->name = $validated['name'];
        if (array_key_exists('name_en', $validated)) {
            $account->name_en = $validated['name_en'];
        }
        if (array_key_exists('name_ja', $validated)) {
            $account->name_ja = $validated['name_ja'];
        }
        $account->account_number = $validated['account_number'] ?? null;
        $account->description = $validated['description'] ?? null;
        $account->save();

        $balance = $account->current_balance;

        return response()->json([
            'message' => 'Akun kas/bank berhasil diperbarui',
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'name_en' => $account->name_en,
                'name_ja' => $account->name_ja,
                'account_number' => $account->account_number,
                'initial_balance' => (float) $account->initial_balance,
                'current_balance' => $balance,
                'description' => $account->description,
                'is_active' => (bool) $account->is_active,
                'transactions_count' => $account->transactions_count,
            ],
        ]);
    }

    /**
     * Toggle active/inactive status of an account.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $account = Account::withCount('transactions')->findOrFail($id);
        $account->is_active = !$account->is_active;
        $account->save();

        $statusText = $account->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "Akun '{$account->name}' berhasil {$statusText}.",
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'is_active' => (bool) $account->is_active,
                'transactions_count' => $account->transactions_count,
            ],
        ]);
    }

    /**
     * Remove the specified account if it has no transactions.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $account = Account::withCount('transactions')->findOrFail($id);

        // Financial Audit Protection:
        if ($account->transactions_count > 0) {
            return response()->json([
                'message' => "Rekening '{$account->name}' tidak dapat dihapus karena memiliki {$account->transactions_count} riwayat transaksi tercatat. Silakan gunakan fitur Nonaktifkan Rekening untuk mengarsipkan rekening ini tanpa merusak data historis.",
            ], 422);
        }

        $account->delete();

        return response()->json([
            'message' => "Rekening '{$account->name}' berhasil dihapus permanen.",
        ]);
    }
}
