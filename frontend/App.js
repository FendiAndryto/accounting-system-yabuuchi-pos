import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { ResponsiveProvider, useResponsive } from './src/context/ResponsiveContext';
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
  const { isDark, colors } = useTheme();
  const { t } = useLanguage();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Synchronize browser tab title and favicon when on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Aube Terra Indonesia';
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = '/assets/assets/favicon.png';
    }
  }, []);

  // If still checking local storage session
  if (authChecking) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.splashLogoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.splashLogoImage}
            resizeMode="contain"
          />
        </View>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.splashText, { color: colors.textSecondary }]}>{t('app.loading')}</Text>
      </View>
    );
  }

  // If not logged in
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Screen header configuration using dynamic translation
  const getScreenMeta = () => {
    switch (activeScreen) {
      case 'dashboard':
        return {
          title: t('screen.dashboard.title'),
          subtitle: t('screen.dashboard.subtitle'),
        };
      case 'master_accounts':
        return {
          title: t('screen.master_accounts.title'),
          subtitle: t('screen.master_accounts.subtitle'),
        };
      case 'master_categories':
        return {
          title: t('screen.master_categories.title'),
          subtitle: t('screen.master_categories.subtitle'),
        };
      case 'cash_in':
        return {
          title: t('screen.cash_in.title'),
          subtitle: t('screen.cash_in.subtitle'),
        };
      case 'cash_out':
        return {
          title: t('screen.cash_out.title'),
          subtitle: t('screen.cash_out.subtitle'),
        };
      case 'history':
        return {
          title: t('screen.history.title'),
          subtitle: t('screen.history.subtitle'),
        };
      case 'team':
        return {
          title: t('screen.team.title'),
          subtitle: t('screen.team.subtitle'),
        };
      default:
        return { title: t('app.title'), subtitle: t('app.subtitle') };
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
    <SafeAreaView style={[styles.appContainer, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      <View style={styles.workspaceRow}>
        {/* Left Sidebar */}
        <Sidebar activeScreen={activeScreen} onSelectScreen={setActiveScreen} />

        {/* Right Main Content Workspace */}
        <View style={[styles.mainWorkspace, { backgroundColor: colors.background }]}>
          <Header
            title={currentMeta.title}
            subtitle={currentMeta.subtitle}
            onRefresh={handleManualRefresh}
            refreshing={refreshing}
          />

          <View style={[styles.screenContentArea, { backgroundColor: colors.background }]}>
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
      <ThemeProvider>
        <LanguageProvider>
          <ResponsiveProvider>
            <AuthProvider>
              <MainAppLayout />
            </AuthProvider>
          </ResponsiveProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  workspaceRow: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  mainWorkspace: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    minWidth: 0,
  },
  screenContentArea: {
    flex: 1,
    width: '100%',
    minWidth: 0,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  splashLogoBox: {
    width: 76,
    height: 76,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  splashLogoImage: {
    width: 58,
    height: 58,
  },
  splashText: {
    marginTop: 14,
    fontSize: 14,
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
    backgroundColor: '#2563eb',
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
