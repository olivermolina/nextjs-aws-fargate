import type { FC } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SeverityPill } from 'src/components/severity-pill';
import numeral from 'numeral';
import { formatNumberWithSign } from '../../../utils/format-number-with-sign';

type Props = {
  currencySymbol: string;
  income: number;
  pending: number;
  appointments: number;
  newPatients: number;
  incomeChange: number;
  pendingChange: number;
  appointmentsChange: number;
};

export const OverViewQuickStats: FC<Props> = (props) => (
  <Card>
    <Grid
      container
      sx={{
        '& > *:not(:last-of-type)': {
          borderRight: (theme) => ({
            md: `1px solid ${theme.palette.divider}`,
          }),
          borderBottom: (theme) => ({
            xs: `1px solid ${theme.palette.divider}`,
            md: 'none',
          }),
        },
      }}
    >
      <Grid
        xs={12}
        sm={6}
        md={3}
      >
        <Stack
          alignItems="center"
          spacing={1}
          sx={{ p: 3 }}
        >
          <Typography
            color="text.secondary"
            component="h2"
            variant="overline"
          >
            Income
          </Typography>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
          >
            <Typography variant="h5">
              {numeral(props.income).format(`${props.currencySymbol}00.00`)}
            </Typography>
            <SeverityPill
              color={props.incomeChange >= 0 ? 'success' : 'error'}>{formatNumberWithSign(props.incomeChange, 0)}%</SeverityPill>
          </Stack>
        </Stack>
      </Grid>
      <Grid
        xs={12}
        sm={6}
        md={3}
      >
        <Stack
          alignItems="center"
          spacing={1}
          sx={{ p: 3 }}
        >
          <Typography
            color="text.secondary"
            component="h5"
            variant="overline"
          >
            Pending
          </Typography>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
          >
            <Typography variant="h5">
              {numeral(props.pending).format(`${props.currencySymbol}00.00`)}
            </Typography>
            <SeverityPill
              color={props.pendingChange >= 0 ? 'success' : 'error'}>{formatNumberWithSign(props.pendingChange, 0)}%</SeverityPill>
          </Stack>
        </Stack>
      </Grid>
      <Grid
        xs={12}
        sm={6}
        md={3}
      >
        <Stack
          alignItems="center"
          spacing={1}
          sx={{ p: 3 }}
        >
          <Typography
            color="text.secondary"
            component="h2"
            variant="overline"
          >
            Appointments
          </Typography>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
          >
            <Typography variant="h5">{props.appointments}</Typography>
            <SeverityPill
              color={props.appointmentsChange >= 0 ? 'success' : 'error'}>{formatNumberWithSign(props.appointmentsChange, 0)}%</SeverityPill>
          </Stack>
        </Stack>
      </Grid>
      <Grid
        xs={12}
        sm={6}
        md={3}
      >
        <Stack
          alignItems="center"
          spacing={1}
          sx={{ p: 3 }}
        >
          <Typography
            color="text.secondary"
            component="h2"
            variant="overline"
          >
            New Patients
          </Typography>
          <Typography variant="h5">{props.newPatients}</Typography>
        </Stack>
      </Grid>
    </Grid>
  </Card>
);
