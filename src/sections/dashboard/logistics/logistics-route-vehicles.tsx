import type { FC } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/system/colorManipulator';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface LogisticsRouteVehiclesProps {
  amount: number;
}

export const LogisticsRouteVehicles: FC<LogisticsRouteVehiclesProps> = (props) => {
  const { amount } = props;

  return (
    <Card>
      <Stack
        spacing={1}
        sx={{ p: 3 }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          <Avatar sx={{ backgroundColor: 'transparent' }}>
            <Box
              sx={{
                animation: 'pulse ease 750ms infinite',
                borderRadius: '50%',
                p: 0.5,
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: 'none',
                  },
                  '100%': {
                    boxShadow: (theme) => `0px 0px 0px 6px ${alpha(theme.palette.error.main, 0.1)}`,
                  },
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'error.main',
                  borderRadius: '50%',
                  height: 18,
                  width: 18,
                }}
              />
            </Box>
          </Avatar>
          <Typography variant="h5">{amount}</Typography>
        </Stack>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          On route vehicles
        </Typography>
      </Stack>
    </Card>
  );
};

LogisticsRouteVehicles.propTypes = {
  amount: PropTypes.number.isRequired,
};
