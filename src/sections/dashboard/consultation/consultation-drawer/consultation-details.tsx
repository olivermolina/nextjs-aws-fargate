import React, { FC, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';
import type { SeverityPillColor } from 'src/components/severity-pill';
import { SeverityPill } from 'src/components/severity-pill';
import { InvoiceStatus, Status, User } from '@prisma/client';
import { Consultation } from 'src/types/consultation';
import { getUserFullName } from 'src/utils/get-user-full-name';
import Link from '@mui/material/Link';
import { paths } from 'src/paths';
import { RouterLink } from 'src/components/router-link';
import Edit02Icon from '@untitled-ui/icons-react/build/esm/Edit02';
import SvgIcon from '@mui/material/SvgIcon';
import VideocamIcon from '@mui/icons-material/Videocam';
import { useRouter } from '../../../../hooks/use-router';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import FileOpenIcon from '@mui/icons-material/FileOpen';

const statusMap: Record<Status, string> = {
  CANCELED: 'warning',
  COMPLETED: 'success',
  PENDING: 'info',
  CONFIRMED: 'primary',
};

interface ConsultationDetailsProps {
  onApprove?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
  consultation: Consultation;
  isPatientView?: boolean;
  token: string;
}

export const ConsultationDetails: FC<ConsultationDetailsProps> = (props) => {
  const { onApprove, onEdit, consultation, isPatientView, token } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const align = lgUp ? 'horizontal' : 'vertical';
  const scheduleStartDate = format(new Date(consultation.start_time), 'dd/MM/yyyy HH:mm');
  const statusColor = statusMap[consultation.status] as SeverityPillColor;
  const fullName = consultation.user.first_name + ' ' + consultation.user.last_name;
  const staffFullName = consultation.staffs
    .map((consultationStaff) => getUserFullName(consultationStaff.staff as User))
    .join(',');

  const showVideoCallButtons = useMemo(() => {
    // If the consultation is not a telemedicine consultation, don't show the video call buttons
    if (!consultation.telemedicine || consultation.status !== Status.CONFIRMED) return false;

    // If the consultation is in the past, don't show the video call buttons
    if (dayjs().isAfter(dayjs(consultation.start_time), 'day')) {
      return false;
    }

    // If the video call has already started, don't show the video call buttons if the duration has exceeded the service duration
    if (consultation.video_call_started_at) {
      const serviceDurationInMinutes = consultation.service?.duration || 0;
      const videoCallStartedAt = dayjs(consultation.video_call_started_at);
      const durationInMinutes = dayjs().diff(videoCallStartedAt, 'minutes');
      return durationInMinutes < serviceDurationInMinutes;
    }

    return true;
  }, [consultation]);

  const baseVideoUrl = `https://lunahealth.daily.co/${consultation.id}`;
  const videoUrl = `${baseVideoUrl}?t=${token}`;
  const router = useRouter();
  const onStartVideoAppointment = useCallback(() => {
    if (isPatientView) {
      window.open(videoUrl, '_self');
      return;
    }

    router.push(
      paths.dashboard.customers.details.replace(':customerId', consultation.user_id) +
      `?video_url=${baseVideoUrl}`,
    );
  }, [videoUrl, consultation, isPatientView]);

  const onCopyVideoAppointmentLink = () => {
    navigator.clipboard
      .writeText(videoUrl)
      .then(() => {
        toast.success('Link copied');
      })
      .catch(() => {
        toast.error('Failed to copy link ');
      });
  };

  const handleViewChart = (id: string) => {
    router.push(
      paths.dashboard.customers.details.replace(':customerId', consultation.user_id) +
      `?tab=profile&chartId=${id}`,
    );
  };

  return (
    <Stack spacing={6}>
      <Stack spacing={3}>
        {showVideoCallButtons && (
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={2}
          >
            <Button
              fullWidth
              variant={'contained'}
              startIcon={
                <SvgIcon>
                  <VideocamIcon />
                </SvgIcon>
              }
              onClick={onStartVideoAppointment}
              size={'small'}
            >
              Start video appointment
            </Button>
            <Button
              fullWidth
              variant={'outlined'}
              onClick={onCopyVideoAppointmentLink}
              size={'small'}
            >
              Copy video appointment link
            </Button>
          </Stack>
        )}

        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <Typography variant="h6">Details</Typography>
          {!isPatientView && (
            <Button
              onClick={onEdit}
              size="small"
              color="inherit"
              startIcon={
                <SvgIcon>
                  <Edit02Icon />
                </SvgIcon>
              }
            >
              Edit
            </Button>
          )}
        </Stack>

        <PropertyList>
          {!isPatientView && (
            <PropertyListItem
              align={align}
              disableGutters
              divider
              label="Patient Name"
            >
              <Typography
                color="text.secondary"
                variant="body2"
              >
                {fullName}
              </Typography>
            </PropertyListItem>
          )}

          <PropertyListItem
            align={align}
            disableGutters
            divider
            label="Staff"
          >
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {staffFullName}
            </Typography>
          </PropertyListItem>

          {!isPatientView && showVideoCallButtons && (
            <PropertyListItem
              align={align}
              disableGutters
              divider
              label="Video URL"
            >
              <Link
                href={videoUrl}
                underline="hover"
                variant="body2"
              >
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 250,
                    '&:hover': {
                      color: 'blue',
                    },
                  }}
                >
                  {videoUrl}
                </Typography>
              </Link>
            </PropertyListItem>
          )}

          <PropertyListItem
            align={align}
            disableGutters
            divider
            label="Date"
            value={scheduleStartDate}
          />

          <PropertyListItem
            align={align}
            disableGutters
            divider
            label="Status"
          >
            <SeverityPill color={statusColor}>{consultation.status}</SeverityPill>
          </PropertyListItem>

          <PropertyListItem
            align={align}
            disableGutters
            divider
            label="Description"
          >
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {consultation.description}
            </Typography>
          </PropertyListItem>

          {consultation.location && (
            <PropertyListItem
              align={align}
              disableGutters
              divider
              label="Location"
            >
              <Typography
                color="text.secondary"
                variant="body2"
              >
                {consultation.location.display_name}
              </Typography>
            </PropertyListItem>
          )}

          {consultation.invoice?.status === InvoiceStatus.PAID && (
            <PropertyListItem
              align={align}
              disableGutters
              divider
              label="Invoice"
            >
              <Link
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
                component={RouterLink}
                variant={'body2'}
                href={paths.dashboard.invoices.details.replace(
                  ':invoiceId',
                  consultation.invoice?.id,
                )}
              >
                <Typography variant="body2">{consultation.invoice?.invoice_number}</Typography>
              </Link>
            </PropertyListItem>
          )}

          {!isPatientView && consultation.Charts?.map((chart) => (
            <PropertyListItem
              key={chart.id}
              align={align}
              disableGutters
              divider
              label={chart.name}
            >
              <Button
                size={'small'}
                endIcon={
                  <SvgIcon fontSize="small">
                    <FileOpenIcon color={'primary'} />
                  </SvgIcon>
                }
                onClick={() => handleViewChart(chart.id)}
                sx={{
                  p: 0.2,
                }}
              >
                <Typography variant={'caption'}>View</Typography>
              </Button>
            </PropertyListItem>
          ))}
        </PropertyList>
      </Stack>
    </Stack>
  );
};

ConsultationDetails.propTypes = {
  onApprove: PropTypes.func,
  onEdit: PropTypes.func,
  onReject: PropTypes.func,
  // @ts-ignore
  consultation: PropTypes.object,
};
