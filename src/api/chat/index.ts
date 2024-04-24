import type { Contact, Message, Participant, Thread } from 'src/types/chat';
import { createResourceId } from 'src/utils/create-resource-id';
import { deepCopy } from 'src/utils/deep-copy';

import { contacts, threads } from './data';

// On server get current identity (user) from the request
const user = {
  id: '5e86809283e28b96d2d38537',
  avatar: '/assets/avatars/avatar-anika-visser.png',
  name: 'Anika Visser',
};

const findThreadById = (threadId: string, threads: Thread[]): Thread | undefined => {
  return threads.find((thread) => thread.id === threadId);
};

const findThreadByParticipantIds = (participantIds: string[]): Thread | undefined => {
  return threads.find((thread) => {
    if (thread.participantIds.length !== participantIds.length) {
      return false;
    }

    const foundParticipantIds = new Set();

    thread.participantIds.forEach((participantId) => {
      if (participantIds.includes(participantId)) {
        foundParticipantIds.add(participantId);
      }
    });

    return foundParticipantIds.size === participantIds.length;
  });
};

type GetContactsRequest = {
  query?: string;
};

type GetContactsResponse = Promise<Contact[]>;

type GetThreadsRequest = object;

type GetThreadsResponse = Promise<Thread[]>;

type GetThreadRequest = {
  threadKey: string;
};

type GetThreadResponse = Promise<Thread | null>;

type MarkThreadAsSeenRequest = {
  threadId: string;
};

type MarkThreadAsSeenResponse = Promise<true>;

type GetParticipantsRequest = {
  threadKey: string;
};

type GetParticipantsResponse = Promise<Participant[]>;

type AddMessageRequest = {
  threadId?: string;
  recipientIds?: string[];
  body: string;
};

type AddMessageResponse = Promise<{
  message: Message;
  threadId: string;
}>;

class ChatApi {
  getContacts(request: GetContactsRequest = {}): GetContactsResponse {
    const { query } = request;

    return new Promise((resolve, reject) => {
      try {
        let foundContacts = contacts;

        if (query) {
          const cleanQuery = query.toLowerCase().trim();
          foundContacts = foundContacts.filter((contact) =>
            contact.name.toLowerCase().includes(cleanQuery)
          );
        }

        resolve(deepCopy(foundContacts));
      } catch (err) {
        console.error('[Chat Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  getThreads(request: GetThreadsRequest = {}): GetThreadsResponse {
    const expandedThreads = threads.map((thread) => {
      const participants: Participant[] = [user];

      contacts.forEach((contact) => {
        if (thread.participantIds.includes(contact.id)) {
          participants.push({
            id: contact.id,
            avatar: contact.avatar,
            lastActivity: contact.lastActivity,
            name: contact.name,
          });
        }
      });

      return {
        ...thread,
        participants,
      };
    });

    return Promise.resolve(deepCopy(expandedThreads));
  }

  getThread(request: GetThreadRequest): GetThreadResponse {
    const { threadKey } = request;

    return new Promise((resolve, reject) => {
      if (!threadKey) {
        reject(new Error('Thread key is required'));
        return;
      }

      try {
        let thread: Thread | undefined;

        // Thread key might be a contact ID
        const contact = contacts.find((contact) => contact.id === threadKey);

        if (contact) {
          thread = findThreadByParticipantIds([user.id, contact.id]);
        }

        // Thread key might be a thread ID
        if (!thread) {
          thread = findThreadById(threadKey, threads);
        }

        // If reached this point and thread does not exist this could mean:
        // b) The thread key is a contact ID, but no thread found
        // a) The thread key is a thread ID and is invalid
        if (!thread) {
          return resolve(null);
        }

        const participants: Participant[] = [user];

        contacts.forEach((contact) => {
          if (thread!.participantIds.includes(contact.id)) {
            participants.push({
              id: contact.id,
              avatar: contact.avatar,
              lastActivity: contact.lastActivity,
              name: contact.name,
            });
          }
        });

        const expandedThread = {
          ...thread,
          participants,
        };

        resolve(deepCopy(expandedThread));
      } catch (err) {
        console.error('[Chat Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  markThreadAsSeen(request: MarkThreadAsSeenRequest): MarkThreadAsSeenResponse {
    const { threadId } = request;

    return new Promise((resolve, reject) => {
      try {
        const thread = threads.find((thread) => thread.id === threadId);

        if (thread) {
          thread.unreadCount = 0;
        }

        resolve(true);
      } catch (err) {
        console.error('[Chat Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  getParticipants(request: GetParticipantsRequest): GetParticipantsResponse {
    const { threadKey } = request;

    return new Promise((resolve, reject) => {
      try {
        const participants: Participant[] = [user];

        // Thread key might be a thread ID
        const thread = findThreadById(threadKey, threads);

        if (thread) {
          contacts.forEach((contact) => {
            if (thread!.participantIds.includes(contact.id)) {
              participants.push({
                id: contact.id,
                avatar: contact.avatar,
                lastActivity: contact.lastActivity,
                name: contact.name,
              });
            }
          });
        } else {
          const contact = contacts.find((contact) => contact.id === threadKey);

          // If no contact found, the user is trying a shady route
          if (!contact) {
            reject(new Error('Unable to find the contact'));
            return;
          }

          participants.push({
            id: contact.id,
            avatar: contact.avatar,
            lastActivity: contact.lastActivity,
            name: contact.name,
          });
        }

        return resolve(participants);
      } catch (err) {
        console.error('[Chat Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  addMessage(request: AddMessageRequest): AddMessageResponse {
    const { threadId, recipientIds, body } = request;

    return new Promise((resolve, reject) => {
      try {
        if (!(threadId || recipientIds)) {
          reject(new Error('Thread ID or recipient IDs has to be provided'));
          return;
        }

        let thread: Thread | undefined;

        // Try to find the thread
        if (threadId) {
          thread = findThreadById(threadId, threads);

          // If thread ID provided the thread has to exist.

          if (!thread) {
            reject(new Error('Invalid thread id'));
            return;
          }
        } else {
          const participantIds = [user.id, ...(recipientIds || [])];
          thread = findThreadByParticipantIds(participantIds);
        }

        // If reached this point, thread will exist if thread ID provided
        // For recipient Ids it may or may not exist. If it doesn't, create a new one.

        if (!thread) {
          const participantIds = [user.id, ...(recipientIds || [])];

          thread = {
            id: createResourceId(),
            messages: [],
            participantIds,
            // type: participantIds.length === 2 ? 'ONE_TO_ONE' : 'GROUP',
            unreadCount: 0,
            title: '',
          };

          // Add the new thread to the DB
          threads.push(thread);
        }

        const message: Message = {
          id: createResourceId(),
          attachments: [],
          body,
          contentType: 'text',
          createdAt: new Date().getTime(),
          authorId: user.id,
          threadId: thread.id!,
        };

        thread.messages.push(message);

        resolve({
          threadId: thread.id!,
          message,
        });
      } catch (err) {
        console.error('[Chat Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }
}

export const chatApi = new ChatApi();
