import { BotStatus, ConversationStatus, FeatureToggle, MessageDirection, MessageType, Role } from './types';

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface Bot {
  id: string;
  name: string;
  status: BotStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BotMember {
  id: string;
  botId: string;
  userId: string;
  role: Role; // CLIENT_ADMIN | AGENT (relativo al bot)
}

export interface Contact {
  id: string;
  botId: string;
  phoneNumber: string;
  name?: string;
}

export interface Conversation {
  id: string;
  botId: string;
  contactId: string;
  status: ConversationStatus;
  lastMessageAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  botId: string;
  direction: MessageDirection;
  type: MessageType;
  content: string; // texto completo o desc del archivo
  createdAt: Date;
}

export interface MessageMedia {
  id: string;
  messageId: string;
  storageUrl: string;
  mimeType: string;
}

export interface KeywordRule {
  id: string;
  botId: string;
  keyword: string;
  response: string;
  isActive: boolean;
}

export interface BotConfig {
  botId: string;
  automation: FeatureToggle;
  ai: FeatureToggle;
  // TODO: Expand settings mapped to ConfigResolver
}
