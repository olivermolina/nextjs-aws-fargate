import type { FC } from 'react';
import type { ApexOptions } from 'apexcharts';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';

import { Chart } from 'src/components/chart';

const useChartOptions = (): ApexOptions => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.mode === 'dark' ? theme.palette.primary.darkest : theme.palette.primary.light,
    ],
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    grid: {
      borderColor: theme.palette.divider,
      padding: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      },
      strokeDashArray: 2,
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '32px',
        horizontal: true,
      },
    },
    theme: {
      mode: theme.palette.mode,
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        show: false,
      },
    },
  };
};

type ChartSeries = {
  name: string;
  data: number[];
}[];

interface AnalyticsTrafficSourcesProps {
  chartSeries: ChartSeries;
}

export const AnalyticsTrafficSources: FC<AnalyticsTrafficSourcesProps> = (props) => {
  const { chartSeries } = props;
  const chartOptions = useChartOptions();

  return (
    <Card>
      <CardHeader
        sx={{ pb: 0 }}
        title="Traffic Sources"
      />
      <CardContent sx={{ pt: 0 }}>
        <Chart
          height={400}
          options={chartOptions}
          series={chartSeries}
          type="bar"
        />
      </CardContent>
    </Card>
  );
};

AnalyticsTrafficSources.propTypes = {
  chartSeries: PropTypes.any.isRequired,
};
