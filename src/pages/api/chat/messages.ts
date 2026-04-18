import { NextApiRequest, NextApiResponse } from "next";
import { addMessage, getMessagesByRoom } from "@/lib/messageBoardStore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { roomId, page = "1", limit = "50" } = req.query;
      if (!roomId || typeof roomId !== "string") {
        return res.status(400).json({ error: "roomId is required" });
      }

      const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNumber = Math.max(1, parseInt(limit as string, 10) || 50);
      const messages = getMessagesByRoom(roomId, pageNumber, limitNumber);

      return res.status(200).json(messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  } else if (req.method === "POST") {
    try {
      const { content, userId, userName, userAvatar, roomId } = req.body;
      if (!content || !userId || !userName || !roomId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const message = addMessage({
        content: String(content),
        userId: String(userId),
        userName: String(userName),
        userAvatar: userAvatar ? String(userAvatar) : null,
        roomId: String(roomId),
      });

      return res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ error: "Failed to send message" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
