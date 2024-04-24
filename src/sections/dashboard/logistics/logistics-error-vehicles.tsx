import type { FC } from 'react';
import PropTypes from 'prop-types';
import AlertTriangleIcon from '@untitled-ui/icons-react/build/esm/AlertTriangle';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

interface LogisticsErrorVehiclesProps {
  amount: number;
}

export const LogisticsErrorVehicles: FC<LogisticsErrorVehiclesProps> = (props) => {
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
          <Avatar
            variant="rounded"
            sx={{
              backgroundColor: 'error.alpha12',
              color: 'error.main',
            }}
          >
            <SvgIcon>
              <AlertTriangleIcon />
            </SvgIcon>
          </Avatar>
          <Typography variant="h5">{amount}</Typography>
        </Stack>
        <Typography
          color="text.secondary"
          variant="body2"
        >
          Vehicles with errors
        </Typography>
      </Stack>
    </Card>
  );
};

LogisticsErrorVehicles.propTypes = {
  amount: PropTypes.number.isRequired,
};
