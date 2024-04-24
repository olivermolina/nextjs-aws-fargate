import type { FC, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

import type { Settings } from 'src/types/settings';

import type { State } from './settings-context';
import { defaultSettings, initialState, SettingsContext } from './settings-context';

interface SettingsProviderProps {
  children?: ReactNode;
  onReset?: () => void;
  onUpdate?: (settings: Settings) => void;
  settings?: Settings;
}

export const SettingsProvider: FC<SettingsProviderProps> = (props) => {
  const { children, onReset = () => {}, onUpdate = () => {}, settings: initialSettings } = props;
  const [state, setState] = useState<State>(initialState);

  const settings = useMemo(() => {
    return {
      ...defaultSettings,
      ...initialSettings,
    } as Settings;
  }, [initialSettings]);

  const handleUpdate = useCallback(
    (newSettings: Settings): void => {
      onUpdate({
        colorPreset: settings.colorPreset,
        contrast: settings.contrast,
        direction: settings.direction,
        layout: settings.layout,
        navColor: settings.navColor,
        paletteMode: settings.paletteMode,
        responsiveFontSizes: settings.responsiveFontSizes,
        stretch: settings.stretch,
        ...newSettings,
      });
    },
    [onUpdate, settings]
  );

  const handleDrawerOpen = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      openDrawer: true,
    }));
  }, []);

  const handleDrawerClose = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      openDrawer: false,
    }));
  }, []);

  const isCustom = useMemo(() => {
    return !isEqual(defaultSettings, {
      colorPreset: settings.colorPreset,
      contrast: settings.contrast,
      direction: settings.direction,
      layout: settings.layout,
      navColor: settings.navColor,
      paletteMode: settings.paletteMode,
      responsiveFontSizes: settings.responsiveFontSizes,
      stretch: settings.stretch,
    });
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        ...state,
        handleDrawerClose,
        handleDrawerOpen,
        handleReset: onReset,
        handleUpdate,
        isCustom,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
