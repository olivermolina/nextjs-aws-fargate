import { createContext } from 'react';

import type { Settings } from 'src/types/settings';

export const defaultSettings: Settings = {
  colorPreset: 'blue',  
  contrast: 'high',
  direction: 'ltr',
  layout: 'vertical',
  navColor: 'evident',
  paletteMode: 'light',
  responsiveFontSizes: true,
  stretch: true, // false
};

export interface State extends Settings {
  openDrawer: boolean;
  isInitialized: boolean;
}

export const initialState: State = {
  isInitialized: false,
  openDrawer: false,
};

export interface SettingsContextType extends State {
  handleDrawerClose: () => void;
  handleDrawerOpen: () => void;
  handleReset: () => void;
  handleUpdate: (settings: Settings) => void;
  isCustom: boolean;
}

export const SettingsContext = createContext<SettingsContextType>({
  ...defaultSettings,
  ...initialState,
  handleDrawerClose: () => {},
  handleDrawerOpen: () => {},
  handleReset: () => {},
  handleUpdate: () => {},
  isCustom: false,
});
