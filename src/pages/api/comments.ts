import { NextApiRequest, NextApiResponse } from "next";

type Comment = {
  id: string;
  nickname: string | null;
  contact: string | null;
  content: string;
  parentId: string | null;
  createdAt: string;
  replies: Comment[];
};

const globalForComments = globalThis as unknown as {
  commentsStore?: Comment[];
};

const now = () => new Date().toISOString();

const createId = () =>
  `comment-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

if (!globalForComments.commentsStore) {
  globalForComments.commentsStore = [];
}

const store = globalForComments.commentsStore;

// 递归将扁平列表拼装成「顶级评论 + replies」树
function buildTree(flat: Comment[]): Comment[] {
  const byId = new Map<string, Comment>();
  const flatCopy: Comment[] = flat.map((c) => ({ ...c, replies: [] }));
  flatCopy.forEach((c) => byId.set(c.id, c));

  const roots: Comment[] = [];
  flatCopy
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .forEach((c) => {
      if (c.parentId && byId.has(c.parentId)) {
        byId.get(c.parentId)!.replies.push(c);
      } else {
        roots.push(c);
      }
    });

  // 顶级评论按创建时间倒序
  return roots.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      // 内存模式：每次 GET 都返回整棵评论树
      const comments = buildTree(store);
      return res.status(200).json(comments);
    }

    if (req.method === "POST") {
      const { nickname, contact, content, parentId } = req.body ?? {};

      if (!content || String(content).trim() === "") {
        return res.status(400).json({ error: "评论内容不能为空" });
      }

      const comment: Comment = {
        id: createId(),
        nickname: nickname ? String(nickname).trim() : null,
        contact: contact ? String(contact).trim() : null,
        content: String(content).trim(),
        parentId: parentId ? String(parentId) : null,
        createdAt: now(),
        replies: [],
      };
      store.push(comment);

      // 返回包含 replies 的完整评论对象，保持类型一致
      const asTree = buildTree(store);
      const findCreated = (list: Comment[]): Comment | undefined => {
        for (const c of list) {
          if (c.id === comment.id) return c;
          if (c.replies?.length) {
            const nested = findCreated(c.replies);
            if (nested) return nested;
          }
        }
        return undefined;
      };
      const created = findCreated(asTree) ?? comment;
      return res.status(201).json(created);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("评论API错误:", error);
    return res.status(500).json({ error: "服务器内部错误" });
  }
}
