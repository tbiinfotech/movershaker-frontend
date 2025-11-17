interface Reaction {
  userId: string; // ID of the user who reacted
  reaction: string; // The reaction emoji or type
}

interface Message {
  id: string;
  text: string;
  image: string;
  video: string;
  fileUrl?: string;
  sentBy: { uid: string; displayName: string };
  sentAt: { seconds: number };
  isRead: Array<string>;
  reactions: Reaction[];
  isDeleted: boolean;
  replies?: Object
}

export default Message;

