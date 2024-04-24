import { Chart, User } from '@prisma/client';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { CardContent, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import UserAvatar from '../../../components/user-avatar';
import { getUserFullName } from '../../../utils/get-user-full-name';
import dayjs from 'dayjs';
import React from 'react';

const CustomerProfileChartHistoryCard = ({
                                           chart,
                                         }: {
  chart: Chart & {
    signed_by: User | null;
  };
}) => {
  if (!chart.signed_by) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title={'CHART HISTORY'}
        sx={{
          backgroundColor: '#f0f0f0',
          letterSpacing: 2,
          p: 2,
        }}
      />
      <CardContent
        sx={{
          backgroundColor: '#dae8d5',
        }}
      >
        <Stack
          direction={'row'}
          spacing={2}
          alignItems={'center'}
        >
          <SvgIcon fontSize={'large'}>
            <Edit02Icon />
          </SvgIcon>
          <UserAvatar
            userId={chart.signed_by.id}
            height={56}
            width={56}
          />
          <Stack spacing={1}>
            <Typography
              variant={'body1'}
              sx={{
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              SIGNED BY {getUserFullName(chart.signed_by)}
            </Typography>
            <Typography variant={'caption'}>
              {dayjs(chart.signed_at).format('MMMM D, YYYY')} at{' '}
              {dayjs(chart.signed_at).format('hh:mm A')}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CustomerProfileChartHistoryCard;
