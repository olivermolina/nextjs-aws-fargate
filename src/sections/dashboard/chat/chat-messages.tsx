import type { FC } from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import type { Message, Participant } from 'src/types/chat';
import type { User } from 'src/types/user';

import { ChatMessage } from './chat-message';
import { useAuth } from '../../../hooks/use-auth';
import { AuthContextType } from '../../../contexts/auth/jwt';

const getAuthor = (message: Message, participants: Participant[], user: User) => {
  const participant = participants.find((participant) => participant.id === message.authorId);

  // This should never happen
  if (!participant) {
    return {
      id: 'unknown',
      name: 'Unknown',
      avatar: '',
      isUser: false,
    };
  }

  // Since chat mock db is not synced with external auth providers
  // we set the user details from user auth state instead of thread participants
  if (message.authorId === user.id) {
    return {
      id: user.id,
      name: 'Me',
      avatar: user.avatar,
      isUser: true,
    };
  }

  return {
    id: participant.id,
    avatar: participant!.avatar,
    name: participant!.name,
    isUser: false,
  };
};

interface ChatMessagesProps {
  messages?: Message[];
  participants?: Participant[];
}

export const ChatMessages: FC<ChatMessagesProps> = (props) => {
  const { messages = [], participants = [], ...other } = props;
  const { user } = useAuth<AuthContextType>();

  if (!user) {
    return null;
  }

  return (
    <Stack
      spacing={2}
      sx={{ p: 3 }}
      {...other}
    >
      {messages.map((message) => {
        const author = getAuthor(message, participants, user);

        return (
          <ChatMessage
            id={author.id || ''}
            authorAvatar={author.avatar}
            authorName={author.name}
            body={message.body}
            contentType={message.contentType}
            createdAt={message.createdAt}
            key={message.id}
            position={author.isUser ? 'right' : 'left'}
            filename={message.attachments?.[0]?.name}
          />
        );
      })}
    </Stack>
  );
};

ChatMessages.propTypes = {
  messages: PropTypes.array,
  participants: PropTypes.array,
};
