export const EXCHANGE_RATES = {
  USD_TO_IDR: 16000,
  JPY_TO_IDR: 105,
  USD_PER_IDR: 1 / 16000, // 1 USD ≈ 16,000 IDR
  JPY_PER_IDR: 1 / 105,   // 1 JPY ≈ 105 IDR
};

export const translations = {
  id: {
    // Nav
    'nav.main_menu': 'MENU UTAMA',
    'nav.administration': 'ADMINISTRASI',
    'nav.dashboard': 'Dashboard',
    'nav.master_data': 'Master Data',
    'nav.master_accounts': 'Rekening Bank',
    'nav.master_categories': 'Kategori',
    'nav.transactions': 'Transaksi',
    'nav.cash_in': 'Cash In (Pemasukan)',
    'nav.cash_out': 'Cash Out (Pengeluaran)',
    'nav.history': 'History',
    'nav.team': 'Manage Team',
    'nav.logout': 'Keluar',

    // App header & subtitle
    'app.title': 'AUBE TERRA',
    'app.subtitle': 'Accounting System',
    'app.loading': 'Memuat sistem akuntansi AUBE TERRA...',

    // Screen meta
    'screen.dashboard.title': 'Dashboard Keuangan',
    'screen.dashboard.subtitle': 'Ringkasan posisi arus kas, rekening aktif, dan aktivitas terkini',
    'screen.master_accounts.title': 'Master Rekening Kas & Bank',
    'screen.master_accounts.subtitle': 'Manajemen akun bank dan kas operasional perusahaan',
    'screen.master_categories.title': 'Master Kategori Kas',
    'screen.master_categories.subtitle': 'Klasifikasi pos pemasukan dan pengeluaran kas',
    'screen.cash_in.title': 'Pencatatan Kas Masuk (Cash In)',
    'screen.cash_in.subtitle': 'Formulir entri penerimaan kas operasional dan pendapatan',
    'screen.cash_out.title': 'Pencatatan Kas Keluar (Cash Out)',
    'screen.cash_out.subtitle': 'Formulir entri beban biaya, pengeluaran vendor, dan operasional',
    'screen.history.title': 'Buku Besar & Riwayat Transaksi',
    'screen.history.subtitle': 'Laporan audit transaksi kas masuk dan kas keluar lengkap',
    'screen.team.title': 'Manajemen Tim & Pengguna',
    'screen.team.subtitle': 'Pengaturan akun staf akuntansi dan hak akses administrator',

    // Common actions & words
    'action.refresh': 'Segarkan',
    'action.refreshing': 'Memuat...',
    'action.save': 'Simpan',
    'action.cancel': 'Batal',
    'action.delete': 'Hapus',
    'action.edit': 'Ubah',
    'action.add': 'Tambah',
    'action.search': 'Cari...',
    'action.filter': 'Filter',
    'action.export': 'Ekspor Data',
    'action.close': 'Tutup',
    'action.confirm': 'Konfirmasi',
    'action.actions': 'Aksi',
    'common.status': 'Status',
    'common.date': 'Tanggal',
    'common.amount': 'Nominal',
    'common.category': 'Kategori',
    'common.account': 'Rekening',
    'common.notes': 'Keterangan',
    'common.all': 'Semua',
    'common.role': 'Peran',
    'common.admin': 'Administrator',
    'common.staff': 'Staff',
    'common.user': 'Pengguna',
    'common.active': 'Aktif',
    'common.inactive': 'Nonaktif',
    'common.rate_info': 'Kurs Acuan: 1 USD ≈ Rp 16.000 | 1 JPY ≈ Rp 105',

    // Payment methods
    'payment.transfer_bank': 'Transfer Bank',
    'payment.cash': 'Tunai',
    'payment.qris': 'QRIS',
    'payment.debit': 'Kartu Debit',
    'payment.giro': 'Giro / Cek',
    'payment.other': 'Lainnya',
    'common.payment_method': 'Metode Pembayaran',

    // Currency input
    'form.amount_locale': 'Nominal Kas Masuk / Keluar (Rp)',
    'form.idr_equivalent': 'Setara IDR:',
    'form.enter_amount_locale': 'Masukkan nominal rupiah',

    // Dashboard
    'dashboard.total_balance': 'Total Saldo Kas & Bank',
    'dashboard.total_cash_in': 'Total Kas Masuk (Bulan Ini)',
    'dashboard.total_cash_out': 'Total Kas Keluar (Bulan Ini)',
    'dashboard.net_flow': 'Arus Kas Bersih',
    'dashboard.active_accounts': 'Rekening Aktif',
    'dashboard.recent_transactions': 'Transaksi Kas Terkini',
    'dashboard.quick_actions': 'Aksi Cepat',
    'dashboard.no_transactions': 'Belum ada transaksi tercatat.',

    // Forms
    'form.entry_details': 'Rincian Transaksi',
    'form.enter_amount': 'Masukkan nominal (Rp)',
    'form.select_category': 'Pilih Kategori',
    'form.select_account': 'Pilih Rekening',
    'form.notes_placeholder': 'Tuliskan keterangan detail transaksi...',
    'form.submit_in': 'Simpan Kas Masuk',
    'form.submit_out': 'Simpan Kas Keluar',
    'form.success_in': 'Kas masuk berhasil disimpan!',
    'form.success_out': 'Kas keluar berhasil disimpan!',

    // Master screens
    'master.add_account': 'Tambah Rekening Baru',
    'master.edit_account': 'Ubah Rekening',
    'master.bank_name': 'Nama Bank / Kas',
    'master.account_no': 'Nomor Rekening',
    'master.init_balance': 'Saldo Awal (Rp)',
    'master.name_en': 'Nama Bahasa Inggris (Opsional)',
    'master.name_ja': 'Nama Bahasa Jepang (Opsional)',
    'master.add_category': 'Tambah Kategori',
    'master.edit_category': 'Ubah Kategori',
    'master.category_name': 'Nama Kategori',
    'master.category_type': 'Tipe Arus Kas',

    // History
    'history.search_placeholder': 'Cari berdasarkan keterangan, kategori, atau nominal...',
    'history.filter_all': 'Semua Tipe',
    'history.filter_in': 'Hanya Kas Masuk',
    'history.filter_out': 'Hanya Kas Keluar',
    'history.delete_confirm': 'Apakah Anda yakin ingin menghapus transaksi ini?',

    // AI Assistant
    'ai.fab_title': 'Asisten AI',
    'ai.header_title': 'AI Assistant',
    'ai.header_subtitle': 'Gemini AI Online',
    'ai.welcome_msg': 'Halo! Saya Asisten AI Keuangan AUBE TERRA. Saya dapat membantu menganalisis arus kas, memeriksa saldo rekening, maupun mencatat transaksi kas masuk dan keluar secara cerdas.',
    'ai.quick_expense': 'Berapa total pengeluaran bulan ini?',
    'ai.quick_income': 'Ringkas pemasukan bulan ini',
    'ai.quick_balance': 'Berapa saldo kas aktif saat ini?',
    'ai.input_placeholder': 'Tulis pesan atau instruksi akuntansi...',
    'ai.reset_msg': 'Riwayat percakapan telah dibersihkan. Ada yang bisa saya bantu terkait keuangan perusahaan?',
    'ai.thinking': 'AI sedang menganalisis...',
    'ai.draft_title': 'Draft Transaksi Disiapkan',
    'ai.draft_save_btn': 'Simpan ke Buku Kas',
    'ai.draft_cancel_btn': 'Batalkan Draft',
    'ai.draft_saved': '✓ Transaksi berhasil diverifikasi dan disimpan ke sistem pembukuan!',
    'ai.draft_cancelled': 'Draft transaksi dibatalkan.',
    'ai.save_failed': 'Gagal menyimpan transaksi dari draft AI.',
    'ai.error_generic': 'Maaf, terjadi kendala saat menghubungkan ke AI Backend. Silakan coba lagi.',
    'ai.analyzed': 'Data berhasil dianalisis.',
    'ai.disclaimer': 'AUBE TERRA AI Agent • Verifikasi draft sebelum disimpan',

    // Theme & Language
    'theme.toggle': 'Ganti Tema',
    'theme.light': 'Mode Terang',
    'theme.dark': 'Mode Gelap',
    'lang.select': 'Pilih Bahasa',
    'lang.id': 'Bahasa Indonesia',
    'lang.en': 'English',
    'lang.ja': '日本語',
  },

  en: {
    // Nav
    'nav.main_menu': 'MAIN MENU',
    'nav.administration': 'ADMINISTRATION',
    'nav.dashboard': 'Dashboard',
    'nav.master_data': 'Master Data',
    'nav.master_accounts': 'Bank Accounts',
    'nav.master_categories': 'Categories',
    'nav.transactions': 'Transactions',
    'nav.cash_in': 'Cash In (Revenue)',
    'nav.cash_out': 'Cash Out (Expense)',
    'nav.history': 'History',
    'nav.team': 'Manage Team',
    'nav.logout': 'Sign Out',

    // App header & subtitle
    'app.title': 'AUBE TERRA',
    'app.subtitle': 'Accounting System',
    'app.loading': 'Loading AUBE TERRA accounting system...',

    // Screen meta
    'screen.dashboard.title': 'Financial Dashboard',
    'screen.dashboard.subtitle': 'Summary of cash flow positions, active bank accounts, and recent activities',
    'screen.master_accounts.title': 'Cash & Bank Accounts Master',
    'screen.master_accounts.subtitle': 'Management of operational bank and cash accounts',
    'screen.master_categories.title': 'Cash Category Master',
    'screen.master_categories.subtitle': 'Classification of incoming revenue and expenditure accounts',
    'screen.cash_in.title': 'Record Cash In',
    'screen.cash_in.subtitle': 'Entry form for operational revenue, collections, and receipts',
    'screen.cash_out.title': 'Record Cash Out',
    'screen.cash_out.subtitle': 'Entry form for operational expenses, vendor disbursements, and costs',
    'screen.history.title': 'General Ledger & Transaction History',
    'screen.history.subtitle': 'Complete audit report of all cash in and cash out transactions',
    'screen.team.title': 'Team & User Management',
    'screen.team.subtitle': 'Configure accounting staff credentials and administrative access rights',

    // Common actions & words
    'action.refresh': 'Refresh',
    'action.refreshing': 'Refreshing...',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.add': 'Add New',
    'action.search': 'Search...',
    'action.filter': 'Filter',
    'action.export': 'Export Data',
    'action.close': 'Close',
    'action.confirm': 'Confirm',
    'action.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.amount': 'Amount',
    'common.category': 'Category',
    'common.account': 'Account',
    'common.notes': 'Notes',
    'common.all': 'All',
    'common.role': 'Role',
    'common.admin': 'Administrator',
    'common.staff': 'Staff',
    'common.user': 'User',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.rate_info': 'Ref Rate: 1 USD ≈ Rp 16,000 | 1 JPY ≈ Rp 105',

    // Payment methods
    'payment.transfer_bank': 'Bank Transfer',
    'payment.cash': 'Cash',
    'payment.qris': 'QRIS',
    'payment.debit': 'Debit Card',
    'payment.giro': 'Giro / Cheque',
    'payment.other': 'Other',
    'common.payment_method': 'Payment Method',

    // Currency input
    'form.amount_locale': 'Amount (USD $)',
    'form.idr_equivalent': 'IDR Equivalent:',
    'form.enter_amount_locale': 'Enter amount in USD',

    // Dashboard
    'dashboard.total_balance': 'Total Cash & Bank Balance',
    'dashboard.total_cash_in': 'Total Cash In (This Month)',
    'dashboard.total_cash_out': 'Total Cash Out (This Month)',
    'dashboard.net_flow': 'Net Cash Flow',
    'dashboard.active_accounts': 'Active Accounts',
    'dashboard.recent_transactions': 'Recent Cash Transactions',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.no_transactions': 'No transactions recorded yet.',

    // Forms
    'form.entry_details': 'Transaction Details',
    'form.enter_amount': 'Enter amount (IDR basis)',
    'form.select_category': 'Select Category',
    'form.select_account': 'Select Account',
    'form.notes_placeholder': 'Write detailed transaction notes...',
    'form.submit_in': 'Save Cash In',
    'form.submit_out': 'Save Cash Out',
    'form.success_in': 'Cash in recorded successfully!',
    'form.success_out': 'Cash out recorded successfully!',

    // Master screens
    'master.add_account': 'Add Bank Account',
    'master.edit_account': 'Edit Bank Account',
    'master.bank_name': 'Bank / Cash Name',
    'master.account_no': 'Account Number',
    'master.init_balance': 'Initial Balance (IDR)',
    'master.name_en': 'English Name (Optional)',
    'master.name_ja': 'Japanese Name (Optional)',
    'master.add_category': 'Add Category',
    'master.edit_category': 'Edit Category',
    'master.category_name': 'Category Name',
    'master.category_type': 'Cash Flow Type',

    // History
    'history.search_placeholder': 'Search by notes, category, or amount...',
    'history.filter_all': 'All Types',
    'history.filter_in': 'Cash In Only',
    'history.filter_out': 'Cash Out Only',
    'history.delete_confirm': 'Are you sure you want to delete this transaction?',

    // AI Assistant
    'ai.fab_title': 'AI Assistant',
    'ai.header_title': 'AI Assistant',
    'ai.header_subtitle': 'Gemini AI Online',
    'ai.welcome_msg': 'Hello! I am the AUBE TERRA Financial AI Assistant. I can help analyze cash flow, check bank balances, or intelligently record cash in and cash out transactions.',
    'ai.quick_expense': 'What are the total expenses this month?',
    'ai.quick_income': 'Summarize this month income',
    'ai.quick_balance': 'What is the current active cash balance?',
    'ai.input_placeholder': 'Type a message or accounting prompt...',
    'ai.reset_msg': 'Conversation history cleared. How can I help with company finances?',
    'ai.thinking': 'AI is analyzing...',
    'ai.draft_title': 'Transaction Draft Prepared',
    'ai.draft_save_btn': 'Save to Cash Book',
    'ai.draft_cancel_btn': 'Discard Draft',
    'ai.draft_saved': '✓ Transaction successfully verified and saved to ledger!',
    'ai.draft_cancelled': 'Transaction draft discarded.',
    'ai.save_failed': 'Failed to save transaction from AI draft.',
    'ai.error_generic': 'Sorry, unable to connect to AI Backend. Please try again.',
    'ai.analyzed': 'Data analyzed successfully.',
    'ai.disclaimer': 'AUBE TERRA AI Agent • Verify draft before saving',

    // Theme & Language
    'theme.toggle': 'Toggle Theme',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    'lang.select': 'Language',
    'lang.id': 'Bahasa Indonesia',
    'lang.en': 'English',
    'lang.ja': '日本語',
  },

  ja: {
    // Nav
    'nav.main_menu': 'メインメニュー',
    'nav.administration': '管理',
    'nav.dashboard': 'ダッシュボード',
    'nav.master_data': 'マスターデータ',
    'nav.master_accounts': '銀行口座',
    'nav.master_categories': 'カテゴリ',
    'nav.transactions': '取引',
    'nav.cash_in': '入金 (Cash In)',
    'nav.cash_out': '出金 (Cash Out)',
    'nav.history': '取引履歴',
    'nav.team': 'チーム管理',
    'nav.logout': 'ログアウト',

    // App header & subtitle
    'app.title': 'AUBE TERRA',
    'app.subtitle': '会計システム',
    'app.loading': 'AUBE TERRA 会計システムを読み込み中...',

    // Screen meta
    'screen.dashboard.title': '財務ダッシュボード',
    'screen.dashboard.subtitle': 'キャッシュフロー、有効な口座、直近の活動概要',
    'screen.master_accounts.title': '現金・銀行口座マスター',
    'screen.master_accounts.subtitle': '会社運営用銀行口座および現金口座の管理',
    'screen.master_categories.title': '勘定科目・カテゴリマスター',
    'screen.master_categories.subtitle': '入金および出金項目の分類・整理',
    'screen.cash_in.title': '入金登録 (Cash In)',
    'screen.cash_in.subtitle': '売上・受領現金の入力フォーム',
    'screen.cash_out.title': '出金登録 (Cash Out)',
    'screen.cash_out.subtitle': '運営経費・外注費・支払金の入力フォーム',
    'screen.history.title': '総勘定元帳・取引履歴',
    'screen.history.subtitle': 'すべての入出金取引の完全な監査レポート',
    'screen.team.title': 'ユーザー・権限管理',
    'screen.team.subtitle': '会計スタッフおよび管理者の権限設定',

    // Common actions & words
    'action.refresh': '更新',
    'action.refreshing': '更新中...',
    'action.save': '保存',
    'action.cancel': 'キャンセル',
    'action.delete': '削除',
    'action.edit': '編集',
    'action.add': '新規追加',
    'action.search': '検索...',
    'action.filter': '絞り込み',
    'action.export': 'データ出力',
    'action.close': '閉じる',
    'action.confirm': '確認',
    'action.actions': '操作',
    'common.status': '状態',
    'common.date': '日付',
    'common.amount': '金額',
    'common.category': 'カテゴリ',
    'common.account': '口座',
    'common.notes': '摘要・備考',
    'common.all': 'すべて',
    'common.role': '権限',
    'common.admin': '管理者',
    'common.staff': 'スタッフ',
    'common.user': 'ユーザー',
    'common.active': '有効',
    'common.inactive': '無効',
    'common.rate_info': '参考レート: 1 USD ≈ 16,000 Rp | 1 JPY ≈ 105 Rp',

    // Payment methods
    'payment.transfer_bank': '銀行振込',
    'payment.cash': '現金',
    'payment.qris': 'QRIS',
    'payment.debit': 'デビットカード',
    'payment.giro': '小切手 / 手形',
    'payment.other': 'その他',
    'common.payment_method': '支払方法',

    // Currency input
    'form.amount_locale': '金額 (日本円 ¥)',
    'form.idr_equivalent': 'IDR換算額:',
    'form.enter_amount_locale': '日本円で金額を入力',

    // Dashboard
    'dashboard.total_balance': '現金・口座合計残高',
    'dashboard.total_cash_in': '当月入金合計',
    'dashboard.total_cash_out': '当月出金合計',
    'dashboard.net_flow': '純キャッシュフロー',
    'dashboard.active_accounts': '有効な口座',
    'dashboard.recent_transactions': '直近の入出金取引',
    'dashboard.quick_actions': 'クイック操作',
    'dashboard.no_transactions': 'まだ記録された取引はありません。',

    // Forms
    'form.entry_details': '取引内容の入力',
    'form.enter_amount': '金額を入力 (ルピア基準)',
    'form.select_category': 'カテゴリを選択',
    'form.select_account': '口座を選択',
    'form.notes_placeholder': '取引の詳細や摘要を入力...',
    'form.submit_in': '入金を保存',
    'form.submit_out': '出金を保存',
    'form.success_in': '入金が正常に記録されました！',
    'form.success_out': '出金が正常に記録されました！',

    // Master screens
    'master.add_account': '新規口座を追加',
    'master.edit_account': '口座を編集',
    'master.bank_name': '銀行名 / 現金名',
    'master.account_no': '口座番号',
    'master.init_balance': '初期残高 (Rp)',
    'master.name_en': '英語名称（任意）',
    'master.name_ja': '日本語名称（任意）',
    'master.add_category': '新規カテゴリ追加',
    'master.edit_category': 'カテゴリ編集',
    'master.category_name': 'カテゴリ名',
    'master.category_type': '収支タイプ',

    // History
    'history.search_placeholder': '摘要、カテゴリ、金額で検索...',
    'history.filter_all': 'すべての種別',
    'history.filter_in': '入金のみ',
    'history.filter_out': '出金のみ',
    'history.delete_confirm': 'この取引を削除してもよろしいですか？',

    // AI Assistant
    'ai.fab_title': 'AIアシスタント',
    'ai.header_title': 'AIアシスタント',
    'ai.header_subtitle': 'Gemini AI オンライン',
    'ai.welcome_msg': 'こんにちは！AUBE TERRA専属のAI財務アシスタントです。キャッシュフローの分析、口座残高の確認、インテリジェントな入出金記録をサポートします。',
    'ai.quick_expense': '今月の支出合計はいくらですか？',
    'ai.quick_income': '今月の収入の概要を表示して',
    'ai.quick_balance': '現在の有効現金残高はいくらですか？',
    'ai.input_placeholder': 'メッセージまたは会計の指示を入力...',
    'ai.reset_msg': '会話履歴をリセットしました。会社財務について何かサポートできますか？',
    'ai.thinking': 'AIが分析中...',
    'ai.draft_title': '取引ドラフトが準備されました',
    'ai.draft_save_btn': '出納帳に保存',
    'ai.draft_cancel_btn': 'ドラフトを破棄',
    'ai.draft_saved': '✓ 取引が正常に確認され、出納帳に保存されました！',
    'ai.draft_cancelled': '取引ドラフトを破棄しました。',
    'ai.save_failed': 'AIドラフトからの取引保存に失敗しました。',
    'ai.error_generic': '申し訳ありません。AIバックエンドへの接続でエラーが発生しました。',
    'ai.analyzed': 'データを正常に分析しました。',
    'ai.disclaimer': 'AUBE TERRA AI Agent • 保存前にドラフトをご確認ください',

    // Theme & Language
    'theme.toggle': 'テーマ切替',
    'theme.light': 'ライトモード',
    'theme.dark': 'ダークモード',
    'lang.select': '言語切替',
    'lang.id': 'Bahasa Indonesia',
    'lang.en': 'English',
    'lang.ja': '日本語',
  },
};

/**
 * Translate key with fallback to English or the key itself
 */
export function t(key, lang = 'id') {
  const dict = translations[lang] || translations.id;
  if (dict && dict[key] !== undefined) {
    return dict[key];
  }
  // Fallback to English
  if (translations.en && translations.en[key] !== undefined) {
    return translations.en[key];
  }
  return key;
}

/**
 * Format currency dynamically based on active locale
 * - id: standard Indonesian Rupiah (Rp 16.000.000)
 * - en: converted to USD with benchmark rate 1 USD ≈ 16,000 IDR ($ 1,000.00)
 * - ja: converted to JPY with benchmark rate 1 JPY ≈ 105 IDR (¥ 152,381)
 */
export function formatCurrency(amount, lang = 'id') {
  const numericAmount = Number(amount) || 0;

  if (lang === 'en') {
    const usd = numericAmount * EXCHANGE_RATES.USD_PER_IDR;
    return `$ ${usd.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (lang === 'ja') {
    const jpy = Math.round(numericAmount * EXCHANGE_RATES.JPY_PER_IDR);
    return `¥ ${jpy.toLocaleString('ja-JP')}`;
  }

  // Default: id
  return `Rp ${Math.round(numericAmount).toLocaleString('id-ID')}`;
}

/**
 * Convert user input amount in active locale currency to IDR benchmark
 * - en: USD -> IDR (amount * 16,000)
 * - ja: JPY -> IDR (amount * 105)
 * - id: IDR -> IDR (amount)
 */
export function reverseCurrency(amount, lang = 'id') {
  const numeric = Number(amount) || 0;
  if (lang === 'en') {
    return Math.round(numeric * EXCHANGE_RATES.USD_TO_IDR);
  }
  if (lang === 'ja') {
    return Math.round(numeric * EXCHANGE_RATES.JPY_TO_IDR);
  }
  return Math.round(numeric);
}

/**
 * Get currency symbol for active locale
 */
export function localCurrencySymbol(lang = 'id') {
  if (lang === 'en') return '$';
  if (lang === 'ja') return '¥';
  return 'Rp';
}

/**
 * Get currency input placeholder for active locale
 */
export function localCurrencyPlaceholder(lang = 'id') {
  if (lang === 'en') return '0.00';
  if (lang === 'ja') return '0';
  return '0';
}

/**
 * Extract localized name from entity with fallback to default name
 */
export function getLocalizedName(item, lang = 'id') {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (lang === 'en' && item.name_en && item.name_en.trim()) {
    return item.name_en.trim();
  }
  if (lang === 'ja' && item.name_ja && item.name_ja.trim()) {
    return item.name_ja.trim();
  }
  return item.name || '';
}

/**
 * Format date according to active locale
 */
export function formatDate(date, lang = 'id', options = {}) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const defaultOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };

  const localeMap = {
    id: 'id-ID',
    en: 'en-US',
    ja: 'ja-JP',
  };

  const locale = localeMap[lang] || 'id-ID';
  return d.toLocaleDateString(locale, defaultOptions);
}
