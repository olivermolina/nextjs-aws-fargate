import type { FC } from 'react';
import type { ApexOptions } from 'apexcharts';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import ChevronUpIcon from '@untitled-ui/icons-react/build/esm/ChevronUp';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { Chart } from 'src/components/chart';

type ChartSeries = number[];

const chartSeries: ChartSeries = [83];

const useChartOptions = (): ApexOptions => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false,
      },
    },
    colors: [theme.palette.primary.main],
    fill: {
      opacity: 1,
      type: 'solid',
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          show: false,
        },
        hollow: {
          size: '50%',
        },
        track: {
          background: theme.palette.background.default,
        },
      },
    },
    states: {
      active: {
        filter: {
          type: 'none',
        },
      },
      hover: {
        filter: {
          type: 'none',
        },
      },
    },
    theme: {
      mode: theme.palette.mode,
    },
  };
};

export const QuickStats6: FC = () => {
  const chartOptions = useChartOptions();

  return (
    <Box
      sx={{
        backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100'),
        p: 3,
      }}
    >
      <Grid
        container
        spacing={3}
      >
        <Grid
          xs={12}
          md={6}
        >
          <Card>
            <CardContent>
              <Stack
                alignItems="center"
                direction="row"
                spacing={2}
              >
                <Chart
                  height={160}
                  options={chartOptions}
                  series={chartSeries}
                  type="radialBar"
                  width={160}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Typography variant="h4">0.299 BTC</Typography>
                    <Typography variant="subtitle2">Weekly earnings</Typography>
                  </Stack>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: 'success.alpha8',
                    color: 'success.main',
                  }}
                  variant="rounded"
                >
                  <SvgIcon>
                    <ChevronUpIcon />
                  </SvgIcon>
                </Avatar>
              </Stack>
            </CardContent>
            <Divider />
            <CardActions>
              <Button
                color="inherit"
                endIcon={
                  <SvgIcon>
                    <ArrowRightIcon />
                  </SvgIcon>
                }
              >
                See all activity
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid
          xs={12}
          md={6}
        >
          <Card>
            <CardContent>
              <Stack
                alignItems="center"
                direction="row"
                spacing={2}
              >
                <Chart
                  height={160}
                  options={chartOptions}
                  series={chartSeries}
                  type="radialBar"
                  width={160}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Typography variant="h4">$52,000.00</Typography>
                    <Typography variant="subtitle2">Your private wallet</Typography>
                  </Stack>
                </Box>
                <Avatar
                  sx={{
                    backgroundColor: 'error.alpha8',
                    color: 'error.main',
                  }}
                  variant="rounded"
                >
                  <SvgIcon>
                    <ChevronDownIcon />
                  </SvgIcon>
                </Avatar>
              </Stack>
            </CardContent>
            <Divider />
            <CardActions>
              <Button
                color="inherit"
                endIcon={
                  <SvgIcon>
                    <ArrowRightIcon />
                  </SvgIcon>
                }
              >
                Withdraw money
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
