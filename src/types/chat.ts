export interface Contact {
  id: string;
  avatar: string;
  isActive: boolean;
  lastActivity?: number;
  name: string;
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
}

export interface Message {
  id: string;
  attachments: Attachment[];
  body: string;
  contentType: string;
  createdAt: number;
  authorId: string;
  threadId: string;
}

export interface Participant {
  id: string;
  avatar: string | null;
  lastActivity?: number;
  name: string;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  participantIds: string[];
  participants?: Participant[];
  unreadCount?: number;
}
