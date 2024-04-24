import React, { FC, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { ConsultationDetails } from './consultation-details';
import { Consultation } from 'src/types/consultation';
import { trpc } from '../../../../app/_trpc/client';
import CircularProgress from '@mui/material/CircularProgress';
import { useCreateLog } from '../../../../hooks/use-create-log';
import { LogAction, Status } from '@prisma/client';
import { useAuth } from '../../../../hooks/use-auth';
import { useRouter } from '../../../../hooks/use-router';
import InfoIcon from '@mui/icons-material/Info';
import { getUserFullName } from '../../../../utils/get-user-full-name';
import Button from '@mui/material/Button';
import VideocamIcon from '@mui/icons-material/Videocam';
import BackdropLoading from '../../account/account-billing-reactivate-backdrop';
import ConsultationDeclineDialog from './consultation-decline-dialog';
import { useAppointmentRequest } from '../../../../hooks/use-appointment-request';

interface ConsultationDrawerProps {
  container?: HTMLDivElement | null;
  open?: boolean;
  onClose?: () => void;
  consultation?: Consultation;
  consultationId?: string;
  handleEdit?: (id: string) => void;
  isPatientView?: boolean;
  refetchList?: any;
}

export const ConsultationDrawer: FC<ConsultationDrawerProps> = (props) => {
  const router = useRouter();
  const { user } = useAuth();
  const { container, onClose, open, handleEdit, consultation, consultationId, isPatientView } =
    props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const { data: patientRoomToken } = trpc.consultation.getDailyRoomToken.useQuery(
    {
      id: consultation?.id!,
      is_owner: false,
    },
    {
      enabled: !!consultation?.id && consultation?.telemedicine,
      refetchOnWindowFocus: false,
    }
  );

  const { data, isLoading, refetch } = trpc.consultation.get.useQuery(
    {
      id: (consultation?.id || consultationId)!,
      organization_id: user?.organization_id,
    },
    {
      enabled: !!(consultation?.id || consultationId),
    }
  );

  const onEdit = useCallback(() => {
    const id = consultation?.id || consultationId;
    if (id) {
      handleEdit?.(id);
    }
  }, [consultation, consultationId]);

  const onRefetch = () => {
    refetch();
    props.refetchList?.();
  };

  const { dialog, mutation, handleDecline, handleAccept } = useAppointmentRequest(
    (data || consultation)?.id,
    onRefetch,
  );

  const content: JSX.Element | null = useMemo(() => {
    const appointment = data || consultation;

    if (isLoading && !consultation) {
      return (
        <div>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            sx={{
              px: 3,
              py: 2,
            }}
          >
            <Typography
              color="inherit"
              variant="h6"
            >
              {''}
            </Typography>
            <IconButton
              color="inherit"
              onClick={onClose}
            >
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Stack>
          <Stack
            alignItems={'center'}
            sx={{ height: '100%' }}
            justifyContent={'center'}
          >
            <CircularProgress />
          </Stack>
        </div>
      );
    }

    if (!appointment) {
      return (
        <div>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            sx={{
              px: 3,
              py: 2,
            }}
          >
            <Typography
              color="inherit"
              variant="h6"
            ></Typography>
            <IconButton
              color="inherit"
              onClick={() => {
                onClose?.();
                router.push('/dashboard/consultations');
              }}
            >
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Stack>
          <Stack
            alignItems={'center'}
            sx={{ height: '100%' }}
            justifyContent={'center'}
          >
            <Typography
              color="inherit"
              variant="caption"
            >
              Please select a consultation
            </Typography>
          </Stack>
        </div>
      );
    }

    if (appointment) {
      return (
        <div>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            sx={{
              px: 3,
              py: 2,
            }}
          >
            {appointment.status === Status.PENDING ? (
              <Stack
                direction={'row'}
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
                sx={{
                  backgroundColor: '#ece6fb',
                  p: 1,
                  borderRadius: 0.5,
                  mt: 1,
                  width: '100%',
                }}
              >
                <InfoIcon color={'primary'} />
                <Typography variant={'caption'}>
                  Patient {getUserFullName(appointment.user)} has requested an appointment
                </Typography>
              </Stack>
            ) : (
              <Typography
                color="inherit"
                variant="h6"
              />
            )}
            <IconButton
              color="inherit"
              onClick={onClose}
            >
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Stack>

          {appointment.status === Status.PENDING && (
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-around"
              spacing={2}
              sx={{
                p: 2,
              }}
            >
              <Button
                variant={'contained'}
                fullWidth
                startIcon={<VideocamIcon />}
                onClick={handleAccept}
                disabled={mutation.isLoading}
              >
                Accept and confirm
              </Button>
              <Button
                variant={'outlined'}
                fullWidth
                onClick={dialog.handleOpen}
                disabled={mutation.isLoading}
              >
                Decline
              </Button>
            </Stack>
          )}

          <Box
            sx={{
              px: 3,
              py: 4,
            }}
          >
            <ConsultationDetails
              onEdit={onEdit}
              onReject={onClose}
              consultation={appointment}
              isPatientView={isPatientView}
              token={patientRoomToken?.token || ''}
            />
          </Box>
        </div>
      );
    }
    return null;
  }, [data, consultation, isLoading, consultationId, user]);

  const createLog = useCreateLog();

  useEffect(() => {
    if (data) {
      createLog.save({
        user_id: data.user_id || '',
        text: 'the appointment',
        action: LogAction.VIEW,
        consultation_id: data.id || '',
      });
    }
  }, [data]);

  if (lgUp) {
    return (
      <>
        <Drawer
          anchor="right"
          open={open}
          PaperProps={{
            sx: {
              position: 'relative',
              width: 500,
            },
          }}
          SlideProps={{ container }}
          variant="persistent"
        >
          {content}
        </Drawer>

        <BackdropLoading
          open={mutation.isLoading}
          message="Updating status..."
        />

        <ConsultationDeclineDialog
          isLoading={mutation.isLoading}
          handleClose={dialog.handleClose}
          handleConfirm={handleDecline}
          open={dialog.open}
        />
      </>
    );
  }

  return (
    <>
      <Drawer
        anchor="left"
        hideBackdrop
        ModalProps={{
          container,
          sx: {
            pointerEvents: 'none',
            position: 'absolute',
          },
        }}
        onClose={onClose}
        open={open}
        PaperProps={{
          sx: {
            maxWidth: '100%',
            width: 400,
            pointerEvents: 'auto',
            position: 'absolute',
          },
        }}
        SlideProps={{ container }}
        variant="temporary"
      >
        {content}
      </Drawer>

      <BackdropLoading
        open={mutation.isLoading}
        message="Updating status..."
      />

      <ConsultationDeclineDialog
        isLoading={mutation.isLoading}
        handleClose={dialog.handleClose}
        handleConfirm={handleDecline}
        open={dialog.open}
      />
    </>
  );
};

ConsultationDrawer.propTypes = {
  container: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  // @ts-ignore
  consultation: PropTypes.object,
};
