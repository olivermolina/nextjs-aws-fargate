import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Mail04Icon from '@untitled-ui/icons-react/build/esm/Mail04';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Scrollbar } from 'src/components/scrollbar';

import type { Notification } from './notifications';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { UserType } from '@prisma/client';
import { useSignedUrlFile } from '../../../hooks/use-signed-url-file';
import UserAvatar from '../../../components/user-avatar';

type SignedUrFileType = {
  id: string;
  isSubFiles: boolean;
  fontWeight: string;
  fileName: string;
};

const LinkSignedUrlFile = ({ id, isSubFiles, fontWeight, fileName }: SignedUrFileType) => {
  const { url } = useSignedUrlFile(id, isSubFiles);
  return (
    <Link
      target={'_blank'}
      href={url}
      underline="always"
      variant="body2"
      sx={{ fontWeight }}
    >
      {fileName}
    </Link>
  );
};

const renderContent = (notification: Notification): JSX.Element | null => {
  const userName = getUserFullName(notification.from_user);
  const createdAt = format(notification.created_at, 'MMM dd, h:mm a');
  const fontWeight = notification.read ? 'normal' : 'bold';

  if (notification.File) {
    return (
      <>
        <ListItemAvatar sx={{ mt: 0.5 }}>
          <UserAvatar userId={notification.from_user.id} />
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
                sx={{ mr: 0.5, fontWeight }}
                variant="subtitle2"
              >
                {userName}
              </Typography>
              <Typography
                sx={{ mr: 0.5, fontWeight }}
                variant="body2"
              >
                {notification.description}
              </Typography>
              <LinkSignedUrlFile
                id={notification.File.id}
                isSubFiles={false}
                fontWeight={fontWeight}
                fileName={notification.File.name}
              />
              .
            </Box>
          }
          secondary={
            <Typography
              color="text.secondary"
              variant="caption"
            >
              {createdAt}
            </Typography>
          }
          sx={{ my: 0 }}
        />
      </>
    );
  }

  if (notification.Consultation) {
    return (
      <>
        <ListItemAvatar sx={{ mt: 0.5 }}>
          <UserAvatar userId={notification.from_user.id} />
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
                sx={{ mr: 0.5 }}
                variant="subtitle2"
              >
                {userName}
              </Typography>
              <Typography
                sx={{ mr: 0.5 }}
                variant="body2"
              >
                {notification.description}
              </Typography>
              <Link
                href={
                  notification.from_user.type === UserType.PATIENT
                    ? `/dashboard/consultations?id=${notification.Consultation.id}`
                    : `/patient/consultations?id=${notification.Consultation.id}`
                }
                underline="always"
                variant="body2"
                sx={{ fontWeight }}
              >
                {notification.description === 'requested an appointment'
                  ? 'Accept or reject'
                  : `Appointment status: ${notification.Consultation.status}`}
              </Link>
              .
            </Box>
          }
          secondary={
            <Typography
              color="text.secondary"
              variant="caption"
            >
              {createdAt}
            </Typography>
          }
          sx={{ my: 0 }}
        />
      </>
    );
  }

  if (notification.SubFile) {
    return (
      <>
        <ListItemAvatar sx={{ mt: 0.5 }}>
          <UserAvatar userId={notification.from_user.id} />
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
                sx={{ mr: 0.5, fontWeight }}
                variant="subtitle2"
              >
                {userName}
              </Typography>
              <Typography
                sx={{ mr: 0.5, fontWeight }}
                variant="body2"
              >
                {notification.description}
              </Typography>
              <LinkSignedUrlFile
                id={notification.SubFile.id}
                isSubFiles={true}
                fontWeight={fontWeight}
                fileName={notification.SubFile.name}
              />
              .
            </Box>
          }
          secondary={
            <Typography
              color="text.secondary"
              variant="caption"
            >
              {createdAt}
            </Typography>
          }
          sx={{ my: 0 }}
        />
      </>
    );
  }

  if (notification.Message) {
    return (
      <>
        <ListItemAvatar sx={{ mt: 0.5 }}>
          <UserAvatar userId={notification.from_user.id} />
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
                sx={{ mr: 0.5, fontWeight }}
                variant="subtitle2"
              >
                {userName}
              </Typography>
              <Link
                href={
                  notification.from_user.type === UserType.PATIENT
                    ? `/dashboard/chat?threadKey=${notification.Message.thread_id}`
                    : `/patient/chat?threadKey=${notification.Message.thread_id}`
                }
                underline="always"
                variant="body2"
                sx={{ fontWeight }}
              >
                {notification.description}
              </Link>
              .
            </Box>
          }
          secondary={
            <Typography
              color="text.secondary"
              variant="caption"
            >
              {createdAt}
            </Typography>
          }
          sx={{ my: 0 }}
        />
      </>
    );
  }

  return null;
};

interface NotificationsPopoverProps {
  anchorEl: null | Element;
  notifications: Notification[];
  onClose?: () => void;
  onMarkAllAsRead?: () => void;
  onRemoveOne?: (id: string) => void;
  onReadOne?: (id: string) => void;
  open?: boolean;
}

export const NotificationsPopover: FC<NotificationsPopoverProps> = (props) => {
  const {
    anchorEl,
    notifications,
    onClose,
    onMarkAllAsRead,
    onRemoveOne,
    open = false,
    onReadOne,
    ...other
  } = props;

  const isEmpty = notifications.length === 0;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom',
      }}
      disableScrollLock
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 380 } }}
      {...other}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Typography
          color="inherit"
          variant="h6"
        >
          Notifications
        </Typography>
        <Tooltip title="Mark all as read">
          <IconButton
            onClick={onMarkAllAsRead}
            size="small"
            color="inherit"
          >
            <SvgIcon>
              <Mail04Icon />
            </SvgIcon>
          </IconButton>
        </Tooltip>
      </Stack>
      {isEmpty ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2">There are no notifications</Typography>
        </Box>
      ) : (
        <Scrollbar sx={{ maxHeight: 400 }}>
          <List disablePadding>
            {notifications.map((notification) => (
              <ListItem
                divider
                key={notification.id}
                sx={{
                  alignItems: 'flex-start',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '& .MuiListItemSecondaryAction-root': {
                    top: '24%',
                  },
                }}
                secondaryAction={
                  <Tooltip title="Remove">
                    <IconButton
                      edge="end"
                      onClick={() => onRemoveOne?.(notification.id)}
                      size="small"
                    >
                      <SvgIcon>
                        <XIcon />
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                }
                onClick={!notification.read ? () => onReadOne?.(notification.id) : undefined}
              >
                {renderContent(notification)}
              </ListItem>
            ))}
          </List>
        </Scrollbar>
      )}
    </Popover>
  );
};

NotificationsPopover.propTypes = {
  anchorEl: PropTypes.any,
  notifications: PropTypes.array.isRequired,
  onClose: PropTypes.func,
  onMarkAllAsRead: PropTypes.func,
  onRemoveOne: PropTypes.func,
  open: PropTypes.bool,
};
