'use client';

import type { FC, ReactNode } from 'react';
import Head from 'next/head';
import { Provider as ReduxProvider } from 'react-redux';
import { NextAppDirEmotionCacheProvider } from 'tss-react/next/appDir';
import Cookies from 'js-cookie';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Remove if locales are not used
import 'src/locales/i18n';

import { RTL } from 'src/components/rtl';
import { SplashScreen } from 'src/components/splash-screen';
//import { SettingsButton } from 'src/components/settings/settings-button';
//import { SettingsDrawer } from 'src/components/settings/settings-drawer';
import { Toaster } from 'src/components/toaster';
import { gtmConfig } from 'src/config';
import { AuthConsumer, AuthProvider } from 'src/contexts/auth/jwt';
import { SettingsConsumer, SettingsProvider } from 'src/contexts/settings';
import { useAnalytics } from 'src/hooks/use-analytics';
import { persistor, store } from 'src/store';
import { createTheme } from 'src/theme';
import type { Settings } from 'src/types/settings';
import StytchProvider from 'src/contexts/auth/stytch/stytch-provider';
import { PersistGate } from 'redux-persist/integration/react';

const SETTINGS_STORAGE_KEY = 'app.settings';

const resetSettings = (): void => {
  try {
    Cookies.remove(SETTINGS_STORAGE_KEY);
    window.location.reload();
  } catch (err) {
    console.error(err);
  }
};

const updateSettings = (settings: Settings): void => {
  try {
    Cookies.set(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.location.reload();
  } catch (err) {
    console.error(err);
  }
};

interface LayoutProps {
  children: ReactNode;
  settings?: Settings;
}

export const Layout: FC<LayoutProps> = (props: LayoutProps) => {
  const { children, settings } = props;
  useAnalytics(gtmConfig);

  return (
    <StytchProvider>
      <NextAppDirEmotionCacheProvider options={{ key: 'css' }}>
        <ReduxProvider store={store}>
          <PersistGate
            loading={null}
            persistor={persistor}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <AuthProvider>
                <AuthConsumer>
                  {(auth) => (
                    <SettingsProvider
                      onReset={resetSettings}
                      onUpdate={updateSettings}
                      settings={settings}
                    >
                      <SettingsConsumer>
                        {(settings) => {
                          const theme = createTheme({
                            colorPreset: settings.colorPreset,
                            contrast: settings.contrast,
                            direction: settings.direction,
                            paletteMode: settings.paletteMode,
                            responsiveFontSizes: settings.responsiveFontSizes,
                          });

                          // Prevent guards from redirecting
                          const showSlashScreen = !auth.isInitialized;

                          return (
                            <ThemeProvider theme={theme}>
                              <Head>
                                <meta
                                  name="color-scheme"
                                  content={settings.paletteMode}
                                />
                                <meta
                                  name="theme-color"
                                  content={theme.palette.neutral[900]}
                                />
                              </Head>
                              <RTL direction={settings.direction}>
                                <CssBaseline />
                                {showSlashScreen ? <SplashScreen /> : <>{children}</>}
                                <Toaster />
                              </RTL>
                            </ThemeProvider>
                          );
                        }}
                      </SettingsConsumer>
                    </SettingsProvider>
                  )}
                </AuthConsumer>
              </AuthProvider>
            </LocalizationProvider>
          </PersistGate>
        </ReduxProvider>
      </NextAppDirEmotionCacheProvider>
    </StytchProvider>
  );
};
