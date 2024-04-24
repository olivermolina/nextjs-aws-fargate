import { useAppointmentRequest } from '../../../hooks/use-appointment-request';
import React, { useCallback, useMemo } from 'react';
import { Consultation, Notification, Status, User } from '@prisma/client';
import BackdropLoading from '../account/account-billing-reactivate-backdrop';
import { Card, CardContent, Typography } from '@mui/material';
import { CardProps } from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import SvgIcon from '@mui/material/SvgIcon';
import Mail04Icon from '@untitled-ui/icons-react/build/esm/Mail04';
import Stack, { StackProps } from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import UserAvatar from '../../../components/user-avatar';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { format } from 'date-fns';
import Button from '@mui/material/Button';
import VideocamIcon from '@mui/icons-material/Videocam';
import ConsultationDeclineDialog
  from '../consultation/consultation-drawer/consultation-decline-dialog';
import { useAuth } from '../../../hooks/use-auth';
import { trpc } from '../../../app/_trpc/client';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

export const AppointmentRequestCard = ({
                                         notificationId,
                                         appointment,
                                         refetch,
                                         user,
                                         showMarkAsRead,
                                         showBorderRadius,
                                         showHeader,
                                         sxCardProps,
                                         buttonsFullWidth = true,
                                       }: {
  notificationId: string;
  appointment?: Consultation | null;
  refetch: any;
  user: User;
  showMarkAsRead?: boolean;
  showBorderRadius?: boolean;
  showHeader?: boolean;
  sxCardProps?: CardProps['sx'];
  buttonsFullWidth?: boolean;
}) => {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(trpc.notification.list, undefined, 'query');

  const appointmentRequest = useAppointmentRequest(appointment?.id, refetch);
  const markReadMutation = trpc.notification.markRead.useMutation({
    // When mutate is called:
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey, {
        exact: true,
        queryKey: queryKey,
      }) as Notification[];
      const newData = previousData?.map((notification) => ({
        ...notification,
        read: notification.id === input.id ? true : notification.read,
      }));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newData);

      // // Return a context object with the snapshotted value
      return { previousData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleRead = useCallback(async () => {
    try {
      await markReadMutation.mutateAsync({
        id: notificationId,
      });
    } catch (e) {
      toast.error(e.message);
    }
  }, [notificationId]);

  const showAppointmentRequestNotification = appointment?.status === Status.PENDING;

  if (!showAppointmentRequestNotification) return null;

  return (
    <>
      <Card
        raised
        sx={
          sxCardProps || {
            mr: 2,
            width: 'auto',
            mb: 2,
            backgroundColor: 'warning.light',
            borderRadius: showBorderRadius ? 2 : 0,
          }
        }
      >
        {showHeader && (
          <CardHeader
            avatar={
              <SvgIcon sx={{ color: 'warning.dark' }}>
                <Mail04Icon />
              </SvgIcon>
            }
            title={<Typography variant={'subtitle1'}>Notifications</Typography>}
            sx={{
              px: 4,
              pb: 0,
              '& .MuiCardHeader-action': { mt: '0' },
            }}
          />
        )}
        <CardContent
          sx={{
            position: 'relative',
            py: 0,
            '&:last-child': {
              paddingBottom: showHeader ? 2 : 0,
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent={'flex-start'}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
          >
            <List disablePadding>
              <ListItem
                sx={{
                  alignItems: 'flex-start',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '& .MuiListItemSecondaryAction-root': {
                    top: '24%',
                  },
                }}
              >
                <ListItemAvatar sx={{ mt: 0.5 }}>
                  <UserAvatar userId={appointment.user_id} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography
                        sx={{ mr: 0.5, minWidth: { xs: '100%', lg: 250 } }}
                        variant="subtitle2"
                      >
                        {getUserFullName(user)} requested an appointment.
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      color="text.secondary"
                      variant="caption"
                    >
                      {format(appointment.created_at, 'MMM dd, h:mm a')}
                    </Typography>
                  }
                  sx={{ my: 0 }}
                />
              </ListItem>
            </List>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={1}
              sx={{
                width: '100%',
                pr: showMarkAsRead ? 4 : 0,
                py: { xs: 1, lg: 0 },
              }}
              justifyContent={buttonsFullWidth ? 'space-between' : 'flex-start'}
            >
              <Button
                variant={'contained'}
                fullWidth={buttonsFullWidth}
                startIcon={<VideocamIcon />}
                onClick={appointmentRequest.handleAccept}
                disabled={appointmentRequest.mutation.isLoading}
                sx={{
                  minWidth: 200,
                }}
              >
                Accept and confirm
              </Button>
              <Button
                variant={'outlined'}
                fullWidth={buttonsFullWidth}
                onClick={appointmentRequest.dialog.handleOpen}
                disabled={appointmentRequest.mutation.isLoading}
                sx={{
                  minWidth: 200,
                }}
              >
                Decline
              </Button>
            </Stack>
          </Stack>

          {showMarkAsRead && (
            <IconButton
              color="inherit"
              onClick={handleRead}
              sx={{
                position: 'absolute',
                top: 10,
                right: { xs: 10, lg: 20 },
              }}
            >
              <SvgIcon>
                <CloseIcon />
              </SvgIcon>
            </IconButton>
          )}
        </CardContent>
      </Card>

      <ConsultationDeclineDialog
        isLoading={appointmentRequest.mutation.isLoading}
        handleClose={appointmentRequest.dialog.handleClose}
        handleConfirm={appointmentRequest.handleDecline}
        open={appointmentRequest.dialog.open}
      />
      <BackdropLoading
        open={appointmentRequest.mutation.isLoading}
        message={'Updating appointment status...'}
      />
    </>
  );
};

type CustomerProfileAppointmentRequestProps = {
  showAll?: boolean;
  showBorderRadius?: boolean;
  showMarkAsRead?: boolean;
  showHeader?: boolean;
  sxCardProps?: CardProps['sx'];
  sxStackProps?: StackProps['sx'];
  buttonsFullWidth?: boolean;
  refetchFeeds?: any;
};

export default function CustomerProfileAppointmentRequest({
                                                            showAll,
                                                            showBorderRadius,
                                                            showMarkAsRead,
                                                            showHeader,
                                                            sxCardProps,
                                                            sxStackProps,
                                                            buttonsFullWidth,
                                                            refetchFeeds,
                                                          }: CustomerProfileAppointmentRequestProps) {
  const { user } = useAuth();
  const { data, refetch } = trpc.notification.list.useQuery(undefined, {
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
  });

  const appointmentRequestNotifications = useMemo(() => {
    if (!data) return [];
    const notifications = data.filter(
      (notification) =>
        notification.Consultation &&
        notification.Consultation.status === Status.PENDING &&
        !notification.read,
    );

    return showAll ? notifications : notifications.slice(0, 1);
  }, [data, showAll]);

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="stretch"
      sx={sxStackProps}
    >
      {appointmentRequestNotifications.map((notification) => (
        <AppointmentRequestCard
          key={notification.id}
          notificationId={notification.id}
          appointment={notification.Consultation}
          refetch={() => {
            refetch();
            refetchFeeds?.();
          }}
          user={notification.from_user}
          showBorderRadius={showBorderRadius}
          showMarkAsRead={showMarkAsRead}
          showHeader={showHeader}
          sxCardProps={sxCardProps}
          buttonsFullWidth={buttonsFullWidth}
        />
      ))}
    </Stack>
  );
}
