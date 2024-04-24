import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Fade } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';

type Props = {
  label: string;
  handleOpen?: () => void;
  isLoading?: boolean;
  alertVisibility?: boolean;
  setAlertVisibility?: (value: boolean) => void;
  titleVariant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

export default function ChartCardItemTitle({
                                             label,
                                             handleOpen,
                                             isLoading,
                                             alertVisibility,
                                             setAlertVisibility,
                                             titleVariant,
                                           }: Props) {
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      sx={{
        height: 52,
      }}
    >
      <Tooltip title={handleOpen ? 'Click to edit' : null}>
        <Typography
          variant={titleVariant || 'subtitle1'}
          sx={{
            mr: 1,
            ...(handleOpen && {
              '&:hover': {
                cursor: 'text',
              },
            }),
          }}
          onClick={handleOpen}
        >
          {label}
        </Typography>
      </Tooltip>
      {isLoading ? (
        <>
          <CircularProgress
            sx={{ mr: 1 }}
            size={10}
          />
          <Typography variant={'caption'}>
            <em>Saving...</em>
          </Typography>
        </>
      ) : (
        <Fade
          in={!isLoading && alertVisibility}
          timeout={{ enter: 1000, exit: 1000 }}
          addEndListener={() => {
            setTimeout(() => {
              setAlertVisibility?.(false);
            }, 3000);
          }}
        >
          <Stack
            alignItems={'center'}
            direction={'row'}
            justifyContent={'center'}
          >
            <CheckIcon fontSize="small" />
            <Typography variant={'caption'}>
              <em>Changes Saved</em>
            </Typography>
          </Stack>
        </Fade>
      )}
    </Stack>
  );
}
