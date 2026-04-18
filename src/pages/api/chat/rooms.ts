import { NextApiRequest, NextApiResponse } from "next";
import { createRoom, getRooms } from "@/lib/messageBoardStore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      return res.status(200).json(getRooms());
    } catch (error) {
      console.error("Failed to fetch message rooms:", error);
      return res.status(500).json({ error: "Failed to fetch rooms" });
    }
  } else if (req.method === "POST") {
    try {
      const { name, description } = req.body;
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Room name is required" });
      }

      const room = createRoom(name, description);
      return res.status(201).json(room);
    } catch (error) {
      console.error("Failed to create message room:", error);
      return res.status(500).json({ error: "Failed to create room" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
