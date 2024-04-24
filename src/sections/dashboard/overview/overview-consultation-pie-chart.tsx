import type { FC } from 'react';
import type { ApexOptions } from 'apexcharts';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import InfoCircleIcon from '@untitled-ui/icons-react/build/esm/InfoCircle';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

import { Chart } from 'src/components/chart';
import { paths } from '../../../paths';

const labels: string[] = ['Confirmed', 'Pending', 'Cancelled', 'Completed'];

type ChartSeries = number[];

type Props = {
  pending: number;
  completed: number;
  canceled: number;
  confirmed: number;
}

const useChartOptions = (): ApexOptions => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    colors: [
      theme.palette.primary.dark,
      theme.palette.warning.main,
      theme.palette.neutral[700],
      theme.palette.success.dark,
    ],
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
      type: 'solid',
    },
    labels,
    legend: {
      labels: {
        colors: theme.palette.text.secondary,
      },
      show: true,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
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
    stroke: {
      width: 0,
    },
    theme: {
      mode: theme.palette.mode,
    },
    tooltip: {
      fillSeriesColor: false,
    },
  };
};

export const OverviewConsultationPieChart: FC<Props> = (props) => {
  const chartOptions = useChartOptions();
  const { confirmed, pending, canceled, completed } = props;

  return (
    <Card>
      <CardHeader
        action={
          <Tooltip title="Appointments by Status">
            <SvgIcon>
              <InfoCircleIcon />
            </SvgIcon>
          </Tooltip>
        }
        title="Appointments by Status"
      />
      <CardContent>
        <Chart
          height={230}
          options={chartOptions}
          series={[confirmed, pending, canceled, completed] as ChartSeries}
          type="donut"
        />
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={
            <SvgIcon>
              <ArrowRightIcon />
            </SvgIcon>
          }
          size="small"
          href={paths.dashboard.consultation.index}
        >
          See all
        </Button>
      </CardActions>
    </Card>
  );
};
