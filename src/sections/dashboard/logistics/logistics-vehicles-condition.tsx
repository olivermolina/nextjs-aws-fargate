import type { FC } from 'react';
import PropTypes from 'prop-types';
import type { ApexOptions } from 'apexcharts';
import { alpha } from '@mui/system/colorManipulator';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles/createTheme';
import { useTheme } from '@mui/material/styles';
import { Chart } from 'src/components/chart';

type Category = {
  id: 'excellent' | 'good' | 'bad';
  title: string;
  description: string;
};

const categories: Category[] = [
  {
    id: 'excellent',
    title: 'Very good',
    description: 'Excellent',
  },
  {
    id: 'good',
    title: 'Good',
    description: 'Good condition',
  },
  {
    id: 'bad',
    title: 'Bad',
    description: 'Needs attention',
  },
];

type ChartSeries = number[];

const createChartOptions = (theme: Theme, color: string): ApexOptions => {
  return {
    chart: {
      background: 'transparent',
    },
    colors: [color],
    labels: ['Health'],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            show: true,
            color: theme.palette.text.secondary,
            fontSize: '12px',
            fontWeight: 400,
            offsetY: 20,
          },
          value: {
            color: theme.palette.text.primary,
            fontSize: '18px',
            fontWeight: 600,
            offsetY: -20,
          },
        },
        hollow: {
          size: '50%',
        },
        track: {
          background: alpha(color, 0.12),
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

interface LogisticsVehiclesConditionProps {
  bad: number;
  excellent: number;
  good: number;
}

export const LogisticsVehiclesCondition: FC<LogisticsVehiclesConditionProps> = (props) => {
  const { bad, excellent, good } = props;
  const theme = useTheme();

  const total = excellent + good + bad;

  const colorsMap: Record<string, string> = {
    excellent: theme.palette.primary.main,
    good: theme.palette.warning.main,
    bad: theme.palette.error.main,
  };

  return (
    <Card>
      <CardHeader title="Vehicles Condition" />
      <Box sx={{ p: 1 }}>
        <Grid
          container
          spacing={3}
        >
          {categories.map((category) => {
            const color = colorsMap[category.id];
            const chartOptions = createChartOptions(theme, color);
            const amount = props[category.id] || 0;
            const progress = Math.round((amount / total) * 100);
            const chartSeries: ChartSeries = [progress];

            return (
              <Grid
                key={category.title}
                xs={12}
                md={4}
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    backgroundColor: alpha(color, 0.04),
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                  }}
                >
                  <Typography
                    sx={{ color }}
                    variant="h6"
                  >
                    {category.title}
                  </Typography>
                  <Chart
                    height={200}
                    options={chartOptions}
                    series={chartSeries}
                    type="radialBar"
                  />
                  <Typography variant="h6">{amount}</Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    {category.description}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Card>
  );
};

LogisticsVehiclesCondition.propTypes = {
  bad: PropTypes.number.isRequired,
  excellent: PropTypes.number.isRequired,
  good: PropTypes.number.isRequired,
};
