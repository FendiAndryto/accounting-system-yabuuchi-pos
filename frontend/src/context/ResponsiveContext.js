import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

const ResponsiveContext = createContext({
  width: 1200,
  height: 800,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  sidebarOpen: false,
  setSidebarOpen: () => {},
  toggleSidebar: () => {},
});

export function ResponsiveProvider({ children }) {
  const [dimensions, setDimensions] = useState(() => {
    const windowDim = Dimensions.get('window');
    return {
      width: windowDim?.width || 1200,
      height: windowDim?.height || 800,
    };
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const windowDim = Dimensions.get('window');
      setDimensions({
        width: windowDim?.width || (typeof window !== 'undefined' ? window.innerWidth : 1200),
        height: windowDim?.height || (typeof window !== 'undefined' ? window.innerHeight : 800),
      });
    };

    const sub = Dimensions.addEventListener('change', handleResize);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      sub?.remove();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const width = dimensions.width;
  const height = dimensions.height;

  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;
  const isDesktop = width > 1024;

  // Auto-close sidebar drawer when resizing back to desktop
  useEffect(() => {
    if (isDesktop && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <ResponsiveContext.Provider
      value={{
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </ResponsiveContext.Provider>
  );
}

export function useResponsive() {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
}
