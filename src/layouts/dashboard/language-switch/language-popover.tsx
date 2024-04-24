import type { FC } from 'react';
import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import { tokens } from 'src/locales/tokens';
import { trpc } from '../../../app/_trpc/client';

type Language = 'en' | 'es';

type LanguageOptions = {
  [key in Language]: {
    icon: string;
    label: string;
  };
};

const languageOptions: LanguageOptions = {
  en: {
    icon: '/assets/flags/flag-ca.svg',
    label: 'English',
  },
  es: {
    icon: '/assets/flags/flag-mx.svg',
    label: 'Spanish',
  },
};

interface LanguagePopoverProps {
  anchorEl: null | Element;
  onClose?: () => void;
  open?: boolean;
}

export const LanguagePopover: FC<LanguagePopoverProps> = (props) => {
  const mutation = trpc.user.saveLanguage.useMutation();
  const { anchorEl, onClose, open = false, ...other } = props;
  const { i18n, t } = useTranslation();

  const handleChange = useCallback(
    async (language: Language): Promise<void> => {
      try {
        onClose?.();
        await i18n.changeLanguage(language);
        await mutation.mutateAsync({ language });
        const message = t(tokens.common.languageChanged) as string;
        toast.success(message);
      } catch (e) {
        toast.error(e.message);
      }
    },
    [onClose, i18n, t]
  );

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'bottom',
      }}
      disableScrollLock
      transformOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 220 } }}
      {...other}
    >
      {(Object.keys(languageOptions) as Language[]).map((language) => {
        const option = languageOptions[language];

        return (
          <MenuItem
            onClick={() => handleChange(language)}
            key={language}
          >
            <ListItemIcon>
              <Box
                sx={{
                  width: 28,
                  '& img': {
                    width: '100%',
                  },
                }}
              >
                <img
                  alt={option.label}
                  src={option.icon}
                />
              </Box>
            </ListItemIcon>
            <ListItemText primary={<Typography variant="subtitle2">{option.label}</Typography>} />
          </MenuItem>
        );
      })}
    </Popover>
  );
};

LanguagePopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
