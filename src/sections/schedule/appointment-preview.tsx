/* eslint-disable react-hooks/exhaustive-deps, react/jsx-max-props-per-line */

import React, { FC, useCallback, useEffect, useMemo } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventNoteIcon from '@mui/icons-material/EventNote';
import VideocamIcon from '@mui/icons-material/Videocam';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TodayIcon from '@mui/icons-material/Today';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { green, grey } from '@mui/material/colors';
import { format } from 'date-fns';
import { Consultation } from 'src/types/consultation';
import dayjs from 'dayjs';
import { getUserFullName } from 'src/utils/get-user-full-name';
import { User } from 'src/types/user';
import { getBaseUrl } from 'src/utils/get-base-url';
import { AvailabilityWithSlots } from './appointment-create-form';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { trpc } from '../../app/_trpc/client';
import { useParams } from 'next/navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';

dayjs.extend(utc);
dayjs.extend(timezone);

type JobPreviewProps = {
  availabilities: AvailabilityWithSlots[];
  selectedStaff: string | null;
  consultation: Consultation;
};

export const JobPreview: FC<JobPreviewProps> = ({
  consultation,
  availabilities,
  selectedStaff,
}) => {
  const params = useParams();
  const slug = params['slug'] as string;
  const { data } = trpc.consultation.getDailyRoomToken.useQuery(
    {
      id: consultation?.id!,
      is_owner: false,
    },
    {
      enabled: !!consultation?.id,
      refetchOnWindowFocus: false,
    }
  );

  const availability = useMemo(() => {
    return availabilities?.find((availability) => availability.user_id === selectedStaff);
  }, [availabilities, selectedStaff]);

  useEffect(() => {
    const scheduleTitle = document.getElementById('schedule-title');
    if (scheduleTitle) scheduleTitle.remove();
  }, []);

  const handleAddToGoogleCalendar = useCallback(() => {
    let description = `To reschedule please make changes with the following link\n${getBaseUrl()}/schedule/${slug}/${
      consultation.id
    }`;
    if (consultation.telemedicine) {
      const fullVideoUrl = `https://lunahealth.daily.co/${consultation.id}?t=${data?.token}`;
      description += `\n\nAt the time of the call please connect using this link\n${fullVideoUrl}`;
    }

    const event = {
      title: consultation.title,
      location: 'Video Call',
      description,
      startTime: dayjs(consultation.start_time)
        .tz(availability?.timezone)
        .format('YYYY-MM-DD hh:mm A'),
      endTime: dayjs(consultation.end_time)
        .tz(availability?.timezone)
        .format('YYYY-MM-DD hh:mm A'),
    };

    const formattedStartTime = format(new Date(event.startTime), "yyyyMMdd'T'HHmmssXXX");
    const formattedEndTime = format(new Date(event.endTime), "yyyyMMdd'T'HHmmssXXX");
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title || ''
    )}&dates=${formattedStartTime}/${formattedEndTime}&details=${encodeURIComponent(
      event.description || ''
    )}&location=${encodeURIComponent(event.location)}`;

    window.open(googleCalendarUrl, '_blank');
  }, [data]);

  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 'auto',
        padding: '32px',
        borderRadius: '16px',
        textAlign: 'left',
        margin: 'auto',
      }}
    >
      <Stack
        spacing={3}
        direction="column"
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <CheckCircleIcon sx={{ color: green[500], fontSize: '40px' }} />
          <Typography
            variant="h4"
            component="div"
            sx={{ fontWeight: 'bold' }}
          >
            You’re booked with {getUserFullName(consultation.staffs?.[0]!.staff as unknown as User)}
          </Typography>
        </Stack>
        <Typography
          sx={{ fontSize: '1rem', lineHeight: '1.5' }}
          color="text.secondary"
        >
          You’ll receive an email confirmation
        </Typography>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 'bold', mb: 3, lineHeight: '1.4' }}
        >
          Details
        </Typography>
        <Stack
          spacing={1}
          direction="column"
          sx={{ mb: 2 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <TodayIcon sx={{ color: grey[500] }} />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 'medium', lineHeight: '1.4' }}
            >
              {consultation.description}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <EventNoteIcon sx={{ color: grey[500] }} />
            <Typography
              variant="subtitle1"
              sx={{ lineHeight: '1.4' }}
            >
              {dayjs(consultation.start_time)
                .tz(availability?.timezone)
                .format('dddd - MMM DD, YYYY')}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <AccessTimeIcon sx={{ color: grey[500] }} />
            <Typography
              variant="subtitle1"
              sx={{ lineHeight: '1.4' }}
            >
              {dayjs(consultation.start_time)
                .tz(availability?.timezone)
                .format('hh:mm A')}{' '}
              -{' '}
              {dayjs(consultation.end_time)
                .tz(availability?.timezone)
                .format('hh:mm A')}
            </Typography>
          </Stack>

          {consultation.telemedicine && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
            >
              <VideocamIcon sx={{ color: grey[500] }} />
              <Typography
                variant="subtitle1"
                sx={{ lineHeight: '1.4' }}
              >
                Video Call
              </Typography>
            </Stack>
          )}

          {consultation?.location && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
            >
              <LocationOnIcon sx={{ color: grey[500] }} />
              <Typography
                variant="subtitle1"
                sx={{ lineHeight: '1.4' }}
              >
                {consultation?.location?.value}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* to do connect functionality for other buttons... */}

        <Button
          variant="outlined"
          size="large"
          sx={{ mt: 2, borderColor: grey[500], color: grey[800], textTransform: 'none' }}
          onClick={handleAddToGoogleCalendar}
        >
          Add to Google calendar
        </Button>

        <Button
          variant="outlined"
          size="large"
          sx={{ mt: 2, borderColor: grey[700], color: grey[800], textTransform: 'none' }}
        >
          Add to Apple calendar
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ mt: 2, borderColor: grey[800], color: grey[800], textTransform: 'none' }}
        >
          Add to Outlook
        </Button>
      </Stack>
    </Card>
  );
};
