import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  t as translate,
  formatCurrency as fmtCurrency,
  formatDate as fmtDate,
  reverseCurrency as revCurrency,
  localCurrencySymbol as getCurrencySymbol,
  localCurrencyPlaceholder as getCurrencyPlaceholder,
  getLocalizedName as getLocName,
} from '../i18n';

const LanguageContext = createContext({
  language: 'id',
  setLanguage: () => {},
  t: (key) => key,
  formatCurrency: (amount) => String(amount),
  formatDate: (date) => String(date),
  reverseCurrency: (amount) => Number(amount) || 0,
  localCurrencySymbol: () => 'Rp',
  localCurrencyPlaceholder: () => '0',
  getLocalizedName: (item) => (item ? item.name || '' : ''),
});

const LANGUAGE_STORAGE_KEY = 'app_language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('id');

  useEffect(() => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && (saved === 'id' || saved === 'en' || saved === 'ja')) {
          setLanguageState(saved);
        }
      }
    } catch (e) {
      console.warn('Could not read saved language preference:', e);
    }
  }, []);

  const setLanguage = (lang) => {
    if (lang !== 'id' && lang !== 'en' && lang !== 'ja') return;
    setLanguageState(lang);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      }
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  };

  const t = (key) => translate(key, language);
  const formatCurrency = (amount) => fmtCurrency(amount, language);
  const formatDate = (date, options) => fmtDate(date, language, options);
  const reverseCurrency = (amount) => revCurrency(amount, language);
  const localCurrencySymbol = () => getCurrencySymbol(language);
  const localCurrencyPlaceholder = () => getCurrencyPlaceholder(language);
  const getLocalizedName = (item) => getLocName(item, language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        formatDate,
        reverseCurrency,
        localCurrencySymbol,
        localCurrencyPlaceholder,
        getLocalizedName,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
