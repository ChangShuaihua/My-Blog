import { NextApiRequest, NextApiResponse } from "next";

const REACTION_TYPES = [
  "like",
  "cheer",
  "celebrate",
  "appreciate",
  "smile",
] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

type ReactionStore = Record<ReactionType, number>;

const globalForReactions = globalThis as unknown as {
  reactionsStore?: ReactionStore;
};

const createDefaultStore = (): ReactionStore => ({
  like: 0,
  cheer: 0,
  celebrate: 0,
  appreciate: 0,
  smile: 0,
});

if (!globalForReactions.reactionsStore) {
  globalForReactions.reactionsStore = createDefaultStore();
}

const store = globalForReactions.reactionsStore;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const reactionMap: ReactionStore = createDefaultStore();
      (Object.keys(reactionMap) as ReactionType[]).forEach((type) => {
        reactionMap[type] = store[type] ?? 0;
      });
      return res.status(200).json(reactionMap);
    }

    if (req.method === "POST") {
      const { type } = req.body ?? {};
      const t = type as ReactionType;
      if (!t || !REACTION_TYPES.includes(t)) {
        return res.status(400).json({ error: "无效的点赞类型" });
      }

      store[t] = (store[t] ?? 0) + 1;
      return res.status(200).json({ type: t, count: store[t] });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("点赞API错误:", error);
    return res.status(500).json({ error: "服务器内部错误" });
  }
}
