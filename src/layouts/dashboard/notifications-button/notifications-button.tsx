import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Bell01Icon from '@untitled-ui/icons-react/build/esm/Bell01';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';

import { usePopover } from 'src/hooks/use-popover';
import { NotificationsPopover } from './notifications-popover';
import { trpc } from '../../../app/_trpc/client';
import { useAuth } from '../../../hooks/use-auth';
import { Notification } from './notifications';
import toast from 'react-hot-toast';

const useNotifications = () => {
  const { user } = useAuth();
  const { data, refetch } = trpc.notification.list.useQuery(undefined, {
    enabled: !!user?.id,
    refetchOnWindowFocus: true,
  });

  const markReadMutation = trpc.notification.markRead.useMutation();
  const markAllReadMutation = trpc.notification.markAllRead.useMutation();
  const deleteMutation = trpc.notification.delete.useMutation();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unread = useMemo((): number => {
    return notifications.reduce((acc, notification) => acc + (notification.read ? 0 : 1), 0);
  }, [notifications]);

  const handleRemoveOne = useCallback(async (notificationId: string) => {
    setNotifications((prevState) => {
      return prevState.filter((notification) => notification.id !== notificationId);
    });

    try {
      await deleteMutation.mutateAsync({
        id: notificationId,
      });
      await refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const handleReadOne = useCallback(async (notificationId: string) => {
    setNotifications((prevState) => {
      return prevState.map((notification) => ({
        ...notification,
        read: notification.id === notificationId ? true : notification.read,
      }));
    });

    try {
      await markReadMutation.mutateAsync({
        id: notificationId,
      });
      await refetch();
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications((prevState) => {
      return prevState.map((notification) => ({
        ...notification,
        read: true,
      }));
    });

    try {
      await markAllReadMutation.mutateAsync();
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  useEffect(() => {
    if (!data) return;

    setNotifications(data);
  }, [data]);

  return {
    handleMarkAllAsRead,
    handleRemoveOne,
    handleReadOne,
    notifications,
    unread,
  };
};

export const NotificationsButton: FC = () => {
  const { user } = useAuth();
  const popover = usePopover<HTMLButtonElement>();
  const { handleRemoveOne, handleMarkAllAsRead, notifications, unread, handleReadOne } =
    useNotifications();

  if (!user) return null;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          ref={popover.anchorRef}
          onClick={popover.handleOpen}
        >
          <Badge
            color="error"
            badgeContent={unread}
          >
            <SvgIcon>
              <Bell01Icon />
            </SvgIcon>
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationsPopover
        anchorEl={popover.anchorRef.current}
        notifications={notifications}
        onClose={popover.handleClose}
        onMarkAllAsRead={handleMarkAllAsRead}
        onRemoveOne={handleRemoveOne}
        open={popover.open}
        onReadOne={handleReadOne}
      />
    </>
  );
};
