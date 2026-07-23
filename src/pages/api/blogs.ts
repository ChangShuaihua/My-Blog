import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextApiRequest, NextApiResponse } from "next";

interface BlogArticle {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  readTime: string;
  filename: string;
  category: string;
  subcategory: string; // 子分类/目录名
}

interface BlogResponse {
  articles: BlogArticle[];
  categories: string[];
}

// 递归读取文件夹
function readBlogsRecursively(dir: string, baseDir: string): BlogArticle[] {
  const articles: BlogArticle[] = [];
  const items = fs.readdirSync(dir);
  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      articles.push(...readBlogsRecursively(fullPath, baseDir));
    } else if (item.endsWith(".md") && item !== "count.md") {
      const relativePath = path.relative(baseDir, dir);
      const dirCategory = relativePath || "未分类";
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      // 优先使用 frontmatter 中的 category，否则用目录路径
      const frontmatterCategory = data.category || "";
      const category =
        frontmatterCategory && frontmatterCategory.trim()
          ? frontmatterCategory.trim()
          : dirCategory;

      // 子分类使用目录结构中最内层的目录名（更具体的位置）
      const subcategory = dirCategory;

      // 从内容提取更好的描述
      const description =
        data.description && data.description.trim()
          ? data.description.trim()
          : extractDescription(content);

      // 解析日期：优先 published，其次 date
      const dateStr = data.published || data.date || "";
      const date = dateStr
        ? new Date(dateStr).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      // 计算阅读时间（大约 300 字/分钟）
      const calculatedReadTime = calculateReadTime(content);
      const readTime =
        data.readTime || calculatedReadTime || "5 分钟阅读";

      articles.push({
        id: `${dirCategory}-${item}`,
        title: data.title || item.replace(".md", ""),
        description,
        date,
        tags: data.tags && data.tags.length > 0 ? data.tags : [],
        content,
        readTime,
        filename: item,
        category,
        subcategory,
      });
    }
  });
  return articles;
}

// 更好的描述提取：抓取第一段有意义的内容
function extractDescription(content: string): string {
  // 先尝试获取"简介"部分
  const introMatch = content.match(/##\s*简介\s*\n([\s\S]*?)(?=\n##|\n#|$)/);
  if (introMatch && introMatch[1] && introMatch[1].trim()) {
    return introMatch[1].trim().replace(/\n/g, " ").substring(0, 150) + "...";
  }
  // 否则取第一段非标题、非空行的有意义文本
  const lines = content.split("\n");
  let paragraph = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("---") &&
      !trimmed.startsWith("!") &&
      trimmed.length > 10
    ) {
      paragraph += trimmed + " ";
      if (paragraph.length > 150) break;
    }
  }
  if (paragraph.trim()) {
    return paragraph.trim().substring(0, 150) + "...";
  }
  return "暂无描述";
}

// 根据内容计算阅读时间
function calculateReadTime(content: string): string {
  // 移除 markdown 标记，保留纯文本
  const plainText = content
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/`{3}[\s\S]*?`{3}/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\*\*|__|\*|_|~~/g, "")
    .replace(/\n+/g, " ")
    .trim();
  const wordCount = plainText.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 500)); // 中文约500字/分钟
  return `${minutes} 分钟阅读`;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlogResponse | { error: string }>
) {
  try {
    const blogsDirectory = path.join(process.cwd(), "src", "blogs");

    if (!fs.existsSync(blogsDirectory)) {
      return res.status(404).json({ error: "blogs目录不存在" });
    }

    // 递归读取所有文章
    const articles = readBlogsRecursively(blogsDirectory, blogsDirectory);

    // 按日期排序（最新的在前）
    articles.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });

    // 提取分类：优先用 frontmatter 类别聚合
    const categorySet = new Set<string>();
    articles.forEach((article) => {
      categorySet.add(article.category);
    });
    const categories = ["全部", ...Array.from(categorySet)];

    res.status(200).json({ articles, categories });
  } catch (error) {
    console.error("读取文章失败:", error);
    res.status(500).json({ error: "读取文章失败" });
  }
}
