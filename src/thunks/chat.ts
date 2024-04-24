import { slice } from 'src/slices/chat';
import type { AppThunk } from 'src/store';
import trpcClient from '../libs/trpc';

const getThreads =
  (): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await trpcClient().chat.threads.query();
    dispatch(slice.actions.getThreads(response));
  };

type GetThreadParams = {
  threadKey: string;
};

const getThread =
  (params: GetThreadParams): AppThunk =>
  async (dispatch): Promise<string | undefined> => {
    const thread = await trpcClient().chat.getThread.query({
      id: params.threadKey,
    });

    dispatch(slice.actions.getThread(thread));

    return thread?.id;
  };

type MarkThreadAsSeenParams = {
  threadId: string;
};

const markThreadAsSeen =
  (params: MarkThreadAsSeenParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await trpcClient().chat.markThreadAsSeen.mutate({
      id: params.threadId,
    });

    dispatch(slice.actions.markThreadAsSeen(params.threadId));
  };

type SetCurrentThreadParams = {
  threadId?: string;
};

const setCurrentThread =
  (params: SetCurrentThreadParams): AppThunk =>
  (dispatch): void => {
    dispatch(slice.actions.setCurrentThread(params.threadId));
  };

type AddMessageParams = {
  threadId?: string;
  recipientIds?: string[];
  body: string;
  status: 'online' | 'offline';
};

const addMessage =
  (params: AddMessageParams): AppThunk =>
  async (dispatch): Promise<string> => {
    const message = await trpcClient().chat.createMessage.mutate({
      body: params.body,
      toUserId: params.recipientIds![0],
      threadId: params.threadId,
      status: params.status,
    });

    dispatch(slice.actions.addMessage({ message, threadId: message.threadId }));

    return message.threadId;
  };

export const thunks = {
  addMessage,
  getThread,
  getThreads,
  markThreadAsSeen,
  setCurrentThread,
};
