import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme';
import { Sidebar } from './src/components/Sidebar';
import { Header } from './src/components/Header';
import { FloatingAiAssistant } from './src/components/FloatingAiAssistant';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MasterBankAccountsScreen } from './src/screens/MasterBankAccountsScreen';
import { MasterCategoriesScreen } from './src/screens/MasterCategoriesScreen';
import { CashInScreen } from './src/screens/CashInScreen';
import { CashOutScreen } from './src/screens/CashOutScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { TeamScreen } from './src/screens/TeamScreen';

function MainAppLayout() {
  const { isAuthenticated, authChecking, isAdmin } = useAuth();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // If still checking local storage session
  if (authChecking) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashLogoBox}>
          <Text style={styles.splashLogoText}>AT</Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.splashText}>Memuat sistem akuntansi AUBE TERRA...</Text>
      </View>
    );
  }

  // If not logged in
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Screen header configuration
  const getScreenMeta = () => {
    switch (activeScreen) {
      case 'dashboard':
        return {
          title: 'Dashboard Keuangan',
          subtitle: 'Ringkasan posisi arus kas, rekening aktif, dan aktivitas terkini',
        };
      case 'master_accounts':
        return {
          title: 'Master Rekening Kas & Bank',
          subtitle: 'Manajemen akun bank dan kas operasional perusahaan',
        };
      case 'master_categories':
        return {
          title: 'Master Kategori Kas',
          subtitle: 'Klasifikasi pos pemasukan dan pengeluaran kas',
        };
      case 'cash_in':
        return {
          title: 'Pencatatan Kas Masuk (Cash In)',
          subtitle: 'Formulir entri penerimaan kas operasional dan pendapatan',
        };
      case 'cash_out':
        return {
          title: 'Pencatatan Kas Keluar (Cash Out)',
          subtitle: 'Formulir entri beban biaya, pengeluaran vendor, dan operasional',
        };
      case 'history':
        return {
          title: 'Buku Besar & Riwayat Transaksi',
          subtitle: 'Laporan audit transaksi kas masuk dan kas keluar lengkap',
        };
      case 'team':
        return {
          title: 'Manajemen Tim & Pengguna',
          subtitle: 'Pengaturan akun staf akuntansi dan hak akses administrator',
        };
      default:
        return { title: 'AUBE TERRA', subtitle: 'Sistem Informasi Akuntansi' };
    }
  };

  const currentMeta = getScreenMeta();

  const handleManualRefresh = () => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 500);
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen key={refreshKey} onNavigate={setActiveScreen} />;
      case 'master_accounts':
        return <MasterBankAccountsScreen key={refreshKey} />;
      case 'master_categories':
        return <MasterCategoriesScreen key={refreshKey} />;
      case 'cash_in':
        return (
          <CashInScreen
            key={refreshKey}
            onTransactionAdded={() => setRefreshKey((k) => k + 1)}
          />
        );
      case 'cash_out':
        return (
          <CashOutScreen
            key={refreshKey}
            onTransactionAdded={() => setRefreshKey((k) => k + 1)}
          />
        );
      case 'history':
        return <HistoryScreen key={refreshKey} />;
      case 'team':
        return isAdmin ? (
          <TeamScreen key={refreshKey} />
        ) : (
          <DashboardScreen key={refreshKey} onNavigate={setActiveScreen} />
        );
      default:
        return <DashboardScreen key={refreshKey} onNavigate={setActiveScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.workspaceRow}>
        {/* Left Sidebar */}
        <Sidebar activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

        {/* Right Main Content Workspace */}
        <View style={styles.mainWorkspace}>
          <Header
            title={currentMeta.title}
            subtitle={currentMeta.subtitle}
            onRefresh={handleManualRefresh}
            refreshing={refreshing}
          />

          <View style={styles.screenContentArea}>
            {renderActiveScreen()}
          </View>

          {/* Floating AI Assistant at bottom-right */}
          <FloatingAiAssistant onDataChanged={() => setRefreshKey((k) => k + 1)} />
        </View>
      </View>
    </SafeAreaView>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorBoundaryContainer}>
          <Text style={styles.errorBoundaryTitle}>⚠️ Terjadi Kendala Tampilan</Text>
          <Text style={styles.errorBoundaryText}>
            {this.state.error?.message || 'Aplikasi mengalami kesalahan tak terduga.'}
          </Text>
          <TouchableOpacity
            style={styles.errorBoundaryBtn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorBoundaryBtnText}>Muat Ulang Halaman</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainAppLayout />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  workspaceRow: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  mainWorkspace: {
    flex: 1,
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
  },
  screenContentArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  splashLogoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  splashLogoText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  splashText: {
    marginTop: 14,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorBoundaryContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorBoundaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorBoundaryText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 500,
  },
  errorBoundaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorBoundaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
