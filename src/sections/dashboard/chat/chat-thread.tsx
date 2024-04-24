import { FC, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import type SimpleBarCore from 'simplebar-core';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { Scrollbar } from 'src/components/scrollbar';
import { useRouter } from 'src/hooks/use-router';
import { paths } from 'src/paths';
import { useDispatch, useSelector } from 'src/store';
import { thunks } from 'src/thunks/chat';
import { Message, Thread } from 'src/types/chat';

import { ChatMessageAdd } from './chat-message-add';
import { ChatMessages } from './chat-messages';
import { ChatThreadToolbar } from './chat-thread-toolbar';
import { useAuth } from '../../../hooks/use-auth';
import { AuthContextType } from '../../../contexts/auth/jwt';
import { slice } from '../../../slices/chat';
import Pusher, { Channel } from 'pusher-js';
import { useGetPermissionByResource } from '../../../hooks/use-get-permission-by-resource';
import { PermissionResourceEnum } from '../../../hooks/use-role-permissions';
import { RolePermissionLevel, UserType } from '@prisma/client';
import { trpc } from '../../../app/_trpc/client';

const useThread = (threadKey: string): Thread | undefined => {
  const router = useRouter();
  const dispatch = useDispatch();
  const thread = useSelector((state) => {
    const { threads, currentThreadId } = state.chat;

    return threads.byId[currentThreadId as string];
  });

  const handleThreadGet = useCallback(async (): Promise<void> => {
    let threadId: string | undefined;

    try {
      threadId = (await dispatch(
        thunks.getThread({
          threadKey,
        })
      )) as unknown as string | undefined;
    } catch (err) {
      console.error(err);
      router.push(paths.dashboard.chat);
      return;
    }

    // Set the active thread
    // If the thread exists, then is sets it as active, otherwise it sets is as undefined

    dispatch(
      thunks.setCurrentThread({
        threadId,
      })
    );

    // Mark the thread as seen only if it exists

    if (threadId) {
      dispatch(
        thunks.markThreadAsSeen({
          threadId,
        })
      );
    }
  }, [router, dispatch, threadKey]);

  useEffect(
    () => {
      handleThreadGet();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [threadKey]
  );

  return thread;
};

const useMessagesScroll = (
  thread?: Thread
): {
  messagesRef: MutableRefObject<SimpleBarCore | null>;
} => {
  const messagesRef = useRef<SimpleBarCore | null>(null);

  const handleUpdate = useCallback((): void => {
    // Thread does not exist
    if (!thread) {
      return;
    }

    // Ref is not used
    if (!messagesRef.current) {
      return;
    }

    const container = messagesRef.current;
    const scrollElement = container!.getScrollElement();

    if (scrollElement) {
      scrollElement.scrollTop = container.el.scrollHeight;
    }
  }, [thread]);

  useEffect(
    () => {
      handleUpdate();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thread]
  );

  return {
    messagesRef,
  };
};

interface ChatThreadProps {
  threadKey: string;
  showToolbar?: boolean;
}

export const ChatThread: FC<ChatThreadProps> = (props) => {
  const { threadKey, showToolbar = true, ...other } = props;
  const dispatch = useDispatch();
  const { user } = useAuth<AuthContextType>();
  const thread = useThread(threadKey);
  const participants = useMemo(() => (thread ? thread.participants : []), [thread]);
  const { messagesRef } = useMessagesScroll(thread);
  const [channel, setChannel] = useState<Channel | null>(null);
  const permission = useGetPermissionByResource(PermissionResourceEnum.CHAT);
  const [status, setStatus] = useState<'online' | 'offline'>('offline');

  const contactId = useMemo(() => {
    if (thread) {
      return thread.participantIds.find((participantId) => participantId !== user?.id!);
    }

    return participants?.find((participant) => participant.id !== user?.id!)?.id;
  }, [participants, thread, user]);

  const { data } = trpc.user.get.useQuery(
    {
      id: contactId || '',
    },
    {
      enabled: !!contactId,
      refetchOnWindowFocus: false,
    },
  );

  const hasPermissionToSend = useMemo(() => {
    if (!user) {
      return false;
    }

    // If the user is a patient, then they can send messages to all staff
    // or the staff has edit permission to everything (all patients)
    if (
      user?.type === UserType.PATIENT ||
      permission?.editAccessLevel === RolePermissionLevel.EVERYTHING
    ) {
      return true;
    }

    // If the staff has edit permission to assigned only, then they can send messages only to their patients
    if (permission?.editAccessLevel === RolePermissionLevel.OWN) {
      return data?.staffs?.some((staffUserDetails) => staffUserDetails.staff.id === user?.id);
    }

    return false;
  }, [permission, user, data]);

  const handleSend = useCallback(
    async (body: string): Promise<void> => {
      // If we have the thread, we use its ID to add a new message

      if (thread && channel) {
        try {
          await dispatch(
            thunks.addMessage({
              threadId: thread.id,
              body,
              recipientIds: thread.participantIds.filter(
                (participantId) => participantId !== user?.id!
              ),
              status,
            })
          );
        } catch (err) {
          console.error(err);
        }

        return;
      }

      // Filter the current user to get only the other participants
      const recipientIds = participants
        ?.filter((participant) => participant.id !== user?.id!)
        .map((participant) => participant.id);

      // Add the new message

      let threadId: string;

      try {
        threadId = (await dispatch(
          thunks.addMessage({
            recipientIds,
            body,
            status,
          })
        )) as unknown as string;
      } catch (err) {
        console.error(err);
        return;
      }

      // Load the thread because we did not have it

      try {
        await dispatch(
          thunks.getThread({
            threadKey: threadId,
          })
        );
      } catch (err) {
        console.error(err);
        return;
      }

      // Set the new thread as active

      dispatch(thunks.setCurrentThread({ threadId }));
    },
    [dispatch, participants, thread, user, channel, status],
  );

  const watchlistEventHandler = (event: { name: 'online' | 'offline'; user_ids: string[] }) => {
    setStatus(event.name);
    if (event.name === 'online') {
      dispatch(slice.actions.setOnlineUsers(event.user_ids));
    }

    if (event.name === 'offline') {
      dispatch(slice.actions.setOfflineUsers(event.user_ids));
    }
  };

  useEffect(() => {
    if (!thread) return;

    const channelPusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
      userAuthentication: {
        endpoint: '/api/pusher-user-auth',
        params: {
          userId: user?.id!,
          watchlist: thread.participantIds,
        },
        transport: 'ajax',
      },
      channelAuthorization: {
        endpoint: '/api/pusher-user-auth',
        params: {
          userId: user?.id!,
          watchlist: thread.participantIds,
        },
        paramsProvider: () => {
          return { userId: user?.id! };
        },
        transport: 'ajax',
      },
    });
    channelPusher.signin();
    const channel = channelPusher.subscribe(thread.title);
    channel.bind('luna-new-message-event', (data: Message) => {
      console.log('new message event', data);
      dispatch(slice.actions.addMessage({ message: data, threadId: data.threadId }));
    });

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Subscription succeeded!');
    });

    channelPusher.user.watchlist.bind('online', watchlistEventHandler);
    channelPusher.user.watchlist.bind('offline', watchlistEventHandler);

    setChannel(channel);
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [thread, user]);

  // Maybe implement a loading state

  return (
    <Stack
      sx={{
        flexGrow: 1,
        overflow: 'hidden',
      }}
      {...other}
    >
      {showToolbar && (
        <>
          <ChatThreadToolbar participants={participants} />
          <Divider />
        </>
      )}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
        }}
      >
        <Scrollbar
          ref={messagesRef}
          sx={{ maxHeight: '100%' }}
        >
          <ChatMessages
            messages={thread?.messages || []}
            participants={thread?.participants || []}
          />
        </Scrollbar>
      </Box>
      <Divider />
      {hasPermissionToSend && (
        <ChatMessageAdd
          onSend={handleSend}
          threadId={thread?.id}
          toUserId={contactId || ''}
        />
      )}
    </Stack>
  );
};

ChatThread.propTypes = {
  threadKey: PropTypes.string.isRequired,
};
