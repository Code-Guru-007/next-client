// ----------------------------------------------------------------------

export type IChatAttachment = {
  name: string;
  size: number;
  type: string;
  path: string;
  preview: string;
  createdAt: Date;
  modifiedAt: Date;
};

export type IChatMessage = {
  id: string;
  body: string;
  createdAt: Date;
  senderId: string;
  contentType: string;
  attachments: IChatAttachment[];
};

export type IChatParticipant = {
  id: string;
  name: string;
  role: string;
  email: string;
  address: string;
  avatarUrl: string;
  phoneNumber: string;
  lastActivity: Date | string | number;
  status: string;
};

export type IChatConversation = {
  id: string;
  type: string;
  unreadCount: number;
  messages: IChatMessage[];
  participants: IChatParticipant[];
};

// ----------------------------------------------------------------------

export type IChatContactsState = {
  byId: string;
  allIds: string[];
};

export type IChatConversationsState = {
  byId: string;
  allIds: string[];
};

export type IChatState = {
  contacts: IChatParticipant[];
  recipients: IChatParticipant[];
  conversations: IChatConversationsState;
  currentConversationId: string | null;
  conversationsStatus: {
    loading: boolean;
    empty: boolean;
    error: IErrorType;
  };
};

export type IErrorType = {
  message: string | null;
} | null;
