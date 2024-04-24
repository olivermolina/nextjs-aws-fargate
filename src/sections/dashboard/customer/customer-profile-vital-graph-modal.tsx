import React, { FC, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Prisma } from '@prisma/client';
import { trpc } from '../../../app/_trpc/client';
import type { ApexOptions } from 'apexcharts';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import { Scrollbar } from '../../../components/scrollbar';
import Box from '@mui/material/Box';
import { Chart } from '../../../components/chart';
import { Skeleton } from '@mui/material';

type ChartSeries = {
  name: string;
  data: number[];
}[];

const useChartOptions = (categories: String[], units: string): ApexOptions => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: [theme.palette.primary.main, theme.palette.warning.main],
    dataLabels: {
      enabled: false,
    },
    fill: {
      gradient: {
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
      },
      type: 'gradient',
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    markers: {
      size: 6,
      strokeColors: theme.palette.background.default,
      strokeWidth: 3,
    },
    stroke: {
      curve: 'smooth',
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
      categories: categories || [],
      labels: {
        offsetY: 5,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => (value > 0 ? `${value.toFixed(0)} ${units}` : `${value.toFixed(0)}`),
        offsetX: -10,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
  };
};

type LineGraphProps = {
  categories: string[];
  chartSeries: ChartSeries;
  units: string;
};

const LineGraph: FC<LineGraphProps> = ({ categories, chartSeries, units }) => {
  const chartOptions = useChartOptions(categories, units);

  return (
    <Scrollbar>
      <Box
        sx={{
          height: 375,
          minWidth: 500,
          position: 'relative',
        }}
      >
        <Chart
          height={350}
          options={chartOptions}
          series={chartSeries}
          type="area"
        />
      </Box>
    </Scrollbar>
  );
};

export type VitalFilterGraph = {
  userId: string;
  name?: Prisma.VitalScalarFieldEnum;
  primaryText?: string;
  secondaryText?: string;
  icon?: React.ReactNode;
  units?: string;
};

interface Props {
  open: boolean;
  handleClose: () => void;
  filterGraph?: VitalFilterGraph;
}

export const CustomerProfileVitalGraphModal: FC<Props> = ({ open, handleClose, filterGraph }) => {
  const { data, isLoading } = trpc.vitals.getVitalHistory.useQuery(
    {
      userId: filterGraph?.userId!,
      name: filterGraph?.name!,
    },
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(filterGraph?.userId),
    },
  );

  // if filterGraph?.name === 'systolic' then fetch the diastolic data
  const { data: secondaryData, isLoading: secondaryIsLoading } =
    trpc.vitals.getVitalHistory.useQuery(
      {
        userId: filterGraph?.userId!,
        name: 'diastolic',
      },
      {
        refetchOnWindowFocus: false,
        enabled: Boolean(filterGraph?.userId) && filterGraph?.name === 'systolic',
      },
    );

  const dateCategories = useMemo(() => {
    if (secondaryData && data) {
      const category1 = data.map((item) => dayjs(item.date).format('DD MMM YY'));
      const category2 = secondaryData.map((item) => dayjs(item.date).format('DD MMM YY'));
      //merge the two arrays and remove duplicates
      return [...new Set([...category1, ...category2])];
    }
    return data?.map((item) => dayjs(item.date).format('DD MMM YY'));
  }, [data, secondaryData]);

  const chartSeries: ChartSeries = useMemo(() => {
    if (!secondaryData && !data) {
      return [];
    }

    if (filterGraph?.name === 'systolic' && secondaryData) {
      return [
        {
          name: 'Systole',
          data: data?.map((item) => Number(item.systolic)) || [],
        },
        {
          name: 'Diastole',
          data: secondaryData.map((item) => Number(item.diastolic)),
        },
      ];
    }
    return [
      {
        name: filterGraph?.primaryText || '',
        data: data?.map((item) => Number(item[filterGraph?.name!])) || [],
      },
    ];
  }, [data, secondaryData, filterGraph?.name, filterGraph?.primaryText]);

  const onClose = () => {
    handleClose();
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth={'md'}
      onClose={onClose}
    >
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
        sx={{
          px: 2,
          py: 1,
        }}
      >
        {filterGraph?.icon}
        <Typography
          sx={{ flexGrow: 1 }}
          variant="h6"
        >
          {filterGraph?.primaryText}
        </Typography>
        <IconButton onClick={onClose}>
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <DialogContent>
        {isLoading || (secondaryIsLoading && filterGraph?.name === 'systolic') ? (
          <Skeleton
            variant="rectangular"
            height={375}
          />
        ) : (
          <LineGraph
            categories={dateCategories || []}
            chartSeries={chartSeries}
            units={filterGraph?.units || ''}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
