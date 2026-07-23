import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextApiRequest, NextApiResponse } from "next";

interface DirectoryTreeItem {
  id: string;
  name: string;
  isFolder: boolean;
  level: number;
  children: DirectoryTreeItem[];
}

interface BlogStats {
  totalArticles: number;
  totalDirectories: number;
  totalFiles: number;
  lastUpdated: string;
  categoryStats: { [key: string]: number };
  directoryTree: DirectoryTreeItem[];
}

// 递归读取目录结构
function buildDirectoryTree(
  dir: string,
  baseDir: string,
  level: number = 0
): { tree: DirectoryTreeItem[]; dirCount: number; fileCount: number } {
  const items: DirectoryTreeItem[] = [];
  let dirCount = 0;
  let fileCount = 0;

  const entries = fs.readdirSync(dir);

  // 过滤掉 images 目录和 count.md
  const filtered = entries.filter((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && entry === "images") return false;
    if (!stat.isDirectory() && entry === "count.md") return false;
    return true;
  });

  // 排序：文件夹在前，文件在后，各自按名字排序
  filtered.sort((a, b) => {
    const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
    const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b, "zh");
  });

  filtered.forEach((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subResult = buildDirectoryTree(fullPath, baseDir, level + 1);
      dirCount += 1 + subResult.dirCount;
      fileCount += subResult.fileCount;
      items.push({
        id: `folder-${path.relative(baseDir, fullPath).replace(/[\\/]/g, "-")}`,
        name: entry,
        isFolder: true,
        level,
        children: subResult.tree,
      });
    } else if (entry.endsWith(".md")) {
      fileCount += 1;
      items.push({
        id: `file-${path.relative(baseDir, fullPath).replace(/[\\/]/g, "-")}`,
        name: entry.replace(".md", ""),
        isFolder: false,
        level,
        children: [],
      });
    }
  });

  return { tree: items, dirCount, fileCount };
}

// 递归统计文章
function countArticles(dir: string, baseDir: string): { count: number; categoryStats: { [key: string]: number } } {
  let count = 0;
  const categoryStats: { [key: string]: number } = {};

  const items = fs.readdirSync(dir);
  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const sub = countArticles(fullPath, baseDir);
      count += sub.count;
      Object.entries(sub.categoryStats).forEach(([cat, cnt]) => {
        categoryStats[cat] = (categoryStats[cat] || 0) + cnt;
      });
    } else if (item.endsWith(".md") && item !== "count.md") {
      const relativePath = path.relative(baseDir, dir);
      const dirCategory = relativePath || "未分类";

      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      // 优先使用 frontmatter category
      const cat = (data.category && data.category.trim()) || dirCategory;
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
      count++;
    }
  });

  return { count, categoryStats };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlogStats | { error: string }>
) {
  try {
    const blogsDirectory = path.join(process.cwd(), "src", "blogs");

    if (!fs.existsSync(blogsDirectory)) {
      return res.status(404).json({ error: "blogs目录不存在" });
    }

    const treeResult = buildDirectoryTree(blogsDirectory, blogsDirectory);
    const articleStats = countArticles(blogsDirectory, blogsDirectory);

    const stats: BlogStats = {
      totalArticles: articleStats.count,
      totalDirectories: treeResult.dirCount,
      totalFiles: treeResult.fileCount,
      lastUpdated: new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      categoryStats: articleStats.categoryStats,
      directoryTree: treeResult.tree,
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("获取博客统计失败:", error);
    res.status(500).json({ error: "获取博客统计失败" });
  }
}
