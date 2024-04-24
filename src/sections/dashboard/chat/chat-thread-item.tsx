import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceStrict } from 'date-fns';
import { avatarClasses } from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Message, Participant, Thread } from 'src/types/chat';
import { customLocale } from 'src/utils/date-locale';
import { useAuth } from '../../../hooks/use-auth';
import { AuthContextType } from '../../../contexts/auth/jwt';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import UserAvatar from '../../../components/user-avatar';

const getLastMessage = (thread: Thread): Message | undefined => {
  return thread.messages?.[thread.messages.length - 1];
};

const getRecipients = (participants: Participant[], userId: string): Participant[] => {
  return participants.filter((participant) => participant.id !== userId);
};

const getDisplayName = (recipients: Participant[], userId: string): string => {
  return recipients
    .filter((participant) => participant.id !== userId)
    .map((participant) => participant.name)
    .join(', ');
};

const getDisplayContent = (userId: string, lastMessage?: Message): string => {
  if (!lastMessage) {
    return '';
  }

  const author = lastMessage.authorId === userId ? 'Me: ' : '';
  let message = '';
  if (lastMessage.contentType === 'text') {
    message = lastMessage.body;
  } else if (['jpeg', 'jpg', 'png'].includes(lastMessage.contentType)) {
    message = 'Sent a photo';
  } else {
    message = 'Sent a file';
  }

  return `${author}${message}`;
};

const getLastActivity = (lastMessage?: Message): string | null => {
  if (!lastMessage) {
    return null;
  }

  return formatDistanceStrict(lastMessage.createdAt, new Date(), {
    addSuffix: false,
    locale: customLocale,
  });
};

interface ChatThreadItemProps {
  active?: boolean;
  onSelect?: () => void;
  thread: Thread;
  onlineUserIds: string[];
}

export const OnlineStyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

export const OfflineStyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#a9a4a4',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

export const ChatThreadItem: FC<ChatThreadItemProps> = (props) => {
  const { active = false, thread, onSelect, onlineUserIds, ...other } = props;
  const { user } = useAuth<AuthContextType>();

  const recipients = getRecipients(thread.participants || [], user?.id!);
  const lastMessage = getLastMessage(thread);
  const lastActivity = getLastActivity(lastMessage);
  const displayName = getDisplayName(recipients, user?.id!);
  const displayContent = getDisplayContent(user?.id!, lastMessage);
  const groupThread = recipients.length > 1;
  const isUnread = !!(thread.unreadCount && thread.unreadCount > 0);

  return (
    <Stack
      component="li"
      direction="row"
      onClick={onSelect}
      spacing={2}
      sx={{
        borderRadius: 2.5,
        cursor: 'pointer',
        px: 3,
        py: 2,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
        ...(active && {
          backgroundColor: 'action.hover',
        }),
      }}
      {...other}
    >
      <div>
        <AvatarGroup
          max={2}
          sx={{
            [`& .${avatarClasses.root}`]: groupThread
              ? {
                height: 26,
                width: 26,
                '&:nth-of-type(2)': {
                  mt: '10px',
                },
              }
              : {
                height: 36,
                width: 36,
              },
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
      </div>
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <Typography
          noWrap
          variant="subtitle2"
        >
          {displayName}
        </Typography>
        <Stack
          alignItems="center"
          direction="row"
          spacing={1}
        >
          {isUnread && (
            <Box
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                height: 8,
                width: 8,
              }}
            />
          )}
          <Typography
            color="text.secondary"
            noWrap
            sx={{ flexGrow: 1 }}
            variant="subtitle2"
          >
            {displayContent}
          </Typography>
        </Stack>
      </Box>
      {lastActivity && (
        <Typography
          color="text.secondary"
          sx={{ whiteSpace: 'nowrap' }}
          variant="caption"
        >
          {lastActivity}
        </Typography>
      )}
    </Stack>
  );
};

ChatThreadItem.propTypes = {
  active: PropTypes.bool,
  onSelect: PropTypes.func,
  // @ts-ignore
  thread: PropTypes.object.isRequired,
};
