import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNowStrict } from 'date-fns';
import ArchiveIcon from '@untitled-ui/icons-react/build/esm/Archive';
import Bell01Icon from '@untitled-ui/icons-react/build/esm/Bell01';
import Camera01Icon from '@untitled-ui/icons-react/build/esm/Camera01';
import PhoneIcon from '@untitled-ui/icons-react/build/esm/Phone';
import SlashCircle01Icon from '@untitled-ui/icons-react/build/esm/SlashCircle01';
import Trash02Icon from '@untitled-ui/icons-react/build/esm/Trash02';
import AvatarGroup from '@mui/material/AvatarGroup';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { usePopover } from 'src/hooks/use-popover';
import type { Participant } from 'src/types/chat';
import { useAuth } from '../../../hooks/use-auth';
import { AuthContextType } from '../../../contexts/auth/jwt';
import { useSelector } from '../../../store';
import { OfflineStyledBadge, OnlineStyledBadge } from './chat-thread-item';
import UserAvatar from '../../../components/user-avatar';

const getRecipients = (participants: Participant[], userId: string): Participant[] => {
  return participants.filter((participant) => participant.id !== userId);
};

const getDisplayName = (recipients: Participant[], userId: string): string => {
  return recipients
    .filter((participant) => participant.id !== userId)
    .map((participant) => participant.name)
    .join(', ');
};

const getLastActive = (recipients: Participant[]): string | null => {
  const hasLastActive = recipients.length === 1 && recipients[0].lastActivity;

  if (hasLastActive) {
    return formatDistanceToNowStrict(recipients[0].lastActivity!, { addSuffix: true });
  }

  return null;
};

interface ChatThreadToolbarProps {
  participants?: Participant[];
}

export const ChatThreadToolbar: FC<ChatThreadToolbarProps> = (props) => {
  const { participants = [], ...other } = props;
  const { user } = useAuth<AuthContextType>();
  const onlineUserIds = useSelector((state) => state.chat.threads.onlineUserIds);
  const popover = usePopover<HTMLButtonElement>();

  // Maybe use memo for these values

  const recipients = getRecipients(participants, user?.id!);
  const displayName = getDisplayName(recipients, user?.id!);
  const lastActive = getLastActive(recipients);

  return (
    <>
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{
          flexShrink: 0,
          minHeight: 64,
          px: 2,
          py: 1,
        }}
        {...other}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={2}
        >
          <AvatarGroup
            max={2}
            sx={{
              ...(recipients.length > 1 && {
                '& .MuiAvatar-root': {
                  height: 30,
                  width: 30,
                  '&:nth-of-type(2)': {
                    mt: '10px',
                  },
                },
              }),
            }}
          >
            {recipients.map((recipient) =>
              onlineUserIds.includes(recipient.id) ? (
                <OnlineStyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  key={recipient.id}
                >
                  <UserAvatar
                    userId={recipient.id}
                    height={32}
                    width={32}
                  />
                </OnlineStyledBadge>
              ) : (
                <OfflineStyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  key={recipient.id}
                >
                  <UserAvatar
                    userId={recipient.id}
                    height={32}
                    width={32}
                  />
                </OfflineStyledBadge>
              )
            )}
          </AvatarGroup>
          <div>
            <Typography variant="subtitle2">{displayName}</Typography>
            {lastActive && (
              <Typography
                color="text.secondary"
                variant="caption"
              >
                Last active {lastActive}
              </Typography>
            )}
          </div>
        </Stack>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          <IconButton>
            <SvgIcon>
              <PhoneIcon />
            </SvgIcon>
          </IconButton>
          <IconButton>
            <SvgIcon>
              <Camera01Icon />
            </SvgIcon>
          </IconButton>
          {/*<Tooltip title="More options">*/}
          {/*  <IconButton*/}
          {/*    // onClick={popover.handleOpen}*/}
          {/*    ref={popover.anchorRef}*/}
          {/*  >*/}
          {/*    <SvgIcon>*/}
          {/*      <DotsHorizontalIcon />*/}
          {/*    </SvgIcon>*/}
          {/*  </IconButton>*/}
          {/*</Tooltip>*/}
        </Stack>
      </Stack>
      <Menu
        anchorEl={popover.anchorRef.current}
        keepMounted
        onClose={popover.handleClose}
        open={popover.open}
      >
        <MenuItem>
          <ListItemIcon>
            <SvgIcon>
              <SlashCircle01Icon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText primary="Block" />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SvgIcon>
              <Trash02Icon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SvgIcon>
              <ArchiveIcon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText primary="Archive" />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SvgIcon>
              <Bell01Icon />
            </SvgIcon>
          </ListItemIcon>
          <ListItemText primary="Mute" />
        </MenuItem>
      </Menu>
    </>
  );
};

ChatThreadToolbar.propTypes = {
  participants: PropTypes.array,
};
