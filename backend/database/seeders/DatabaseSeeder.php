<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@accounting.local'],
            [
                'name' => 'Owner / Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        $staff = User::firstOrCreate(
            ['email' => 'staff@accounting.local'],
            [
                'name' => 'Staff Keuangan',
                'password' => Hash::make('password123'),
                'role' => 'staff',
            ]
        );

        // 2. Accounts
        $kasTunai = Account::firstOrCreate(
            ['name' => 'Kas Tunai / Toko'],
            [
                'account_number' => 'CASH-001',
                'initial_balance' => 5000000,
                'description' => 'Kas fisik di brankas toko',
                'is_active' => true,
            ]
        );

        $bankBca = Account::firstOrCreate(
            ['name' => 'Bank BCA Operasional'],
            [
                'account_number' => '8820192831',
                'initial_balance' => 35000000,
                'description' => 'Rekening utama penampung transfer & operasional',
                'is_active' => true,
            ]
        );

        $bankMandiri = Account::firstOrCreate(
            ['name' => 'Bank Mandiri'],
            [
                'account_number' => '137001928371',
                'initial_balance' => 15000000,
                'description' => 'Rekening cadangan & payroll',
                'is_active' => true,
            ]
        );

        // 3. Categories Cash In
        $catPenjualan = Category::firstOrCreate(['name' => 'Penjualan Produk', 'type' => 'cash_in']);
        $catJasa = Category::firstOrCreate(['name' => 'Pendapatan Jasa', 'type' => 'cash_in']);
        $catLain = Category::firstOrCreate(['name' => 'Pendapatan Lain-lain', 'type' => 'cash_in']);

        // Categories Cash Out
        $catGaji = Category::firstOrCreate(['name' => 'Beban Gaji Karyawan', 'type' => 'cash_out']);
        $catSewa = Category::firstOrCreate(['name' => 'Beban Sewa & Utilitas', 'type' => 'cash_out']);
        $catOperasional = Category::firstOrCreate(['name' => 'Beban Operasional', 'type' => 'cash_out']);
        $catIklan = Category::firstOrCreate(['name' => 'Beban Marketing & Iklan', 'type' => 'cash_out']);
        $catHpp = Category::firstOrCreate(['name' => 'Bahan Baku & HPP', 'type' => 'cash_out']);

        // 4. Sample Transactions over the past 30 days
        $today = Carbon::today();

        $sampleData = [
            // Week 1
            ['days_ago' => 28, 'type' => 'cash_in', 'amount' => 4500000, 'cat' => $catPenjualan, 'acc' => $bankBca, 'method' => 'Transfer Bank', 'desc' => 'Pembayaran pesanan PO #1021'],
            ['days_ago' => 27, 'type' => 'cash_in', 'amount' => 1200000, 'cat' => $catPenjualan, 'acc' => $kasTunai, 'method' => 'Cash', 'desc' => 'Penjualan offline toko kasir 1'],
            ['days_ago' => 25, 'type' => 'cash_out', 'amount' => 2000000, 'cat' => $catHpp, 'acc' => $bankBca, 'method' => 'Transfer Bank', 'desc' => 'Restock bahan kemasan & packaging'],
            ['days_ago' => 24, 'type' => 'cash_out', 'amount' => 750000, 'cat' => $catIklan, 'acc' => $bankBca, 'method' => 'Kartu Debit', 'desc' => 'Topup saldo Meta Ads & TikTok Ads'],

            // Week 2
            ['days_ago' => 20, 'type' => 'cash_in', 'amount' => 7800000, 'cat' => $catJasa, 'acc' => $bankBca, 'method' => 'Transfer Bank', 'desc' => 'Pelunasan invoice konsultasi proyek Alpha'],
            ['days_ago' => 18, 'type' => 'cash_out', 'amount' => 650000, 'cat' => $catOperasional, 'acc' => $kasTunai, 'method' => 'Cash', 'desc' => 'Beli persediaan ATK & konsumsi rapat'],
            ['days_ago' => 15, 'type' => 'cash_out', 'amount' => 12000000, 'cat' => $catGaji, 'acc' => $bankMandiri, 'method' => 'Transfer Bank', 'desc' => 'Gaji bulanan staf operasional'],
            ['days_ago' => 14, 'type' => 'cash_in', 'amount' => 3200000, 'cat' => $catPenjualan, 'acc' => $bankBca, 'method' => 'QRIS', 'desc' => 'Settlement QRIS transaksi weekend'],

            // Week 3
            ['days_ago' => 10, 'type' => 'cash_in', 'amount' => 5400000, 'cat' => $catPenjualan, 'acc' => $bankBca, 'method' => 'Transfer Bank', 'desc' => 'Penjualan batch 2 reseller Surabaya'],
            ['days_ago' => 8, 'type' => 'cash_out', 'amount' => 1850000, 'cat' => $catSewa, 'acc' => $bankBca, 'method' => 'Transfer Bank', 'desc' => 'Tagihan listrik, internet kantor & air'],
            ['days_ago' => 6, 'type' => 'cash_out', 'amount' => 1200000, 'cat' => $catIklan, 'acc' => $bankBca, 'method' => 'Transfer Bank', 'desc' => 'Jasa endorse influencer Instagram'],

            // Recent days
            ['days_ago' => 4, 'type' => 'cash_in', 'amount' => 6100000, 'cat' => $catPenjualan, 'acc' => $bankBca, 'method' => 'Transfer Bank', 'desc' => 'Invoice #1089 pengadaan seragam kantor'],
            ['days_ago' => 2, 'type' => 'cash_in', 'amount' => 1850000, 'cat' => $catPenjualan, 'acc' => $kasTunai, 'method' => 'Cash', 'desc' => 'Penjualan retail akhir pekan'],
            ['days_ago' => 1, 'type' => 'cash_out', 'amount' => 420000, 'cat' => $catOperasional, 'acc' => $kasTunai, 'method' => 'Cash', 'desc' => 'Bensin operasional delivery & kurir'],
        ];

        foreach ($sampleData as $item) {
            Transaction::create([
                'date' => $today->copy()->subDays($item['days_ago'])->format('Y-m-d'),
                'type' => $item['type'],
                'amount' => $item['amount'],
                'category_id' => $item['cat']->id,
                'account_id' => $item['acc']->id,
                'payment_method' => $item['method'],
                'description' => $item['desc'],
                'created_by' => $staff->id,
            ]);
        }
    }
}
