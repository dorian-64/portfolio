export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  createdAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
}
