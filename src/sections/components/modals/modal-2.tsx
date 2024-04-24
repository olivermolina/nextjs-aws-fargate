import type { FC } from 'react';
import Box from '@mui/material/Box';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface LanguageOption {
  icon: string;
  label: string;
}

const languageOptions: LanguageOption[] = [
  {
    icon: '/assets/flags/flag-uk.svg',
    label: 'English',
  },
  {
    icon: '/assets/flags/flag-de.svg',
    label: 'German',
  },
  {
    icon: '/assets/flags/flag-es.svg',
    label: 'Spanish',
  },
];

export const Modal2: FC = () => (
  <Box
    sx={{
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100'),
      p: 3,
    }}
  >
    <Paper
      elevation={12}
      sx={{
        width: 240,
        mx: 'auto',
      }}
    >
      {languageOptions.map((option) => (
        <MenuItem key={option.label}>
          <ListItemIcon>
            <Box
              sx={{
                display: 'flex',
                height: 20,
                width: 20,
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
      ))}
    </Paper>
  </Box>
);
