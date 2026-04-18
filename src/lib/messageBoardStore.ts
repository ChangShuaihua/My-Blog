type Room = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
};

type Message = {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  roomId: string;
  createdAt: string;
};

type MessageBoardStore = {
  rooms: Room[];
  messages: Message[];
};

const globalForMessageBoard = globalThis as unknown as {
  messageBoardStore?: MessageBoardStore;
};

const nowIso = () => new Date().toISOString();

const createDefaultStore = (): MessageBoardStore => ({
  rooms: [
    {
      id: "message-board-main",
      name: "公共留言室",
      description: "欢迎留言交流（本地内存模式，不连接数据库）",
      updatedAt: nowIso(),
    },
  ],
  messages: [],
});

if (!globalForMessageBoard.messageBoardStore) {
  globalForMessageBoard.messageBoardStore = createDefaultStore();
}

const store = globalForMessageBoard.messageBoardStore;

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const getRooms = () =>
  [...store.rooms]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .map((room) => ({
      id: room.id,
      name: room.name,
      description: room.description,
      _count: {
        messages: store.messages.filter((message) => message.roomId === room.id)
          .length,
      },
    }));

export const createRoom = (name: string, description?: string | null) => {
  const newRoom: Room = {
    id: createId("room"),
    name: name.trim(),
    description: description?.trim() || null,
    updatedAt: nowIso(),
  };
  store.rooms.push(newRoom);
  return newRoom;
};

export const getMessagesByRoom = (roomId: string, page = 1, limit = 50) => {
  const start = (page - 1) * limit;
  return store.messages
    .filter((message) => message.roomId === roomId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .slice(start, start + limit);
};

export const addMessage = (input: {
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  roomId: string;
}) => {
  const room = store.rooms.find((item) => item.id === input.roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const message: Message = {
    id: createId("msg"),
    content: input.content,
    userId: input.userId,
    userName: input.userName,
    userAvatar: input.userAvatar ?? null,
    roomId: input.roomId,
    createdAt: nowIso(),
  };

  store.messages.push(message);
  room.updatedAt = message.createdAt;
  return message;
};

