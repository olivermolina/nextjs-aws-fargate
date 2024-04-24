import { ConsultationTrpcResponse } from '../../../server/routers/consultation';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';

type CustomerProfileChartRenderAppointmentItemProps = {
  appointment: ConsultationTrpcResponse;
  direction: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  alignItems?: string;
};

const CustomerProfileChartRenderAppointmentItem = ({
                                                     appointment,
                                                     direction,
                                                     alignItems = 'column',
                                                   }: CustomerProfileChartRenderAppointmentItemProps) => {
  return (
    <Stack
      spacing={1}
      direction={direction}
      alignItems={alignItems}
    >
      <Typography>{appointment.service?.name || appointment.title}</Typography>
      <Typography
        variant={'caption'}
        color={'text.secondary'}
      >
        {`${dayjs(appointment.start_time).format('MMM DD, YYYY')} ${dayjs(
          appointment.start_time,
        ).format('hh:mm A')} - ${dayjs(appointment.end_time).format('hh:mm A')} `}
      </Typography>
    </Stack>
  );
};

export default CustomerProfileChartRenderAppointmentItem;
