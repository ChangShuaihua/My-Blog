/**
 * 构建时脚本：将 src/blogs/ 下的 Markdown 文章生成静态 JSON 文件到 public/data/
 *
 * 解决 static export (output: "export") 下 API Routes 不可用的问题。
 * 前端改为 fetch /data/blogs.json 和 /data/blog-stats.json 替代 /api/blogs 和 /api/blog-stats。
 *
 * 同时复制文章图片到 public/blogs-images/，并转换文章内的图片路径。
 *
 * 用法：node scripts/generate-blog-data.js
 * 会自动在 prebuild 阶段执行。
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const BLOGS_DIR = path.join(__dirname, "..", "src", "blogs");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "data");
const IMAGES_OUTPUT_DIR = path.join(__dirname, "..", "public", "blogs-images");

// ── 工具函数 ────────────────────────────────────────────────

/** 提取文章描述：优先取 frontmatter description，否则取第一段有意义的文本 */
function extractDescription(content) {
  const introMatch = content.match(/##\s*简介\s*\n([\s\S]*?)(?=\n##|\n#|$)/);
  if (introMatch && introMatch[1] && introMatch[1].trim()) {
    return introMatch[1].trim().replace(/\n/g, " ").substring(0, 150) + "...";
  }
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

/** 计算阅读时间（中文约 500 字/分钟） */
function calculateReadTime(content) {
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
  const minutes = Math.max(1, Math.ceil(wordCount / 500));
  return `${minutes} 分钟阅读`;
}

// ── 图片处理 ────────────────────────────────────────────────

/**
 * 复制文章 images 目录到 public/blogs-images/<relativeDir>/
 * 并转换 markdown 中的图片路径为绝对路径。
 *
 * 支持以下格式：
 *   ![alt](./images/xxx.png)   → ![alt](/blogs-images/<dir>/xxx.png)
 *   ![alt](images/xxx.png)     → ![alt](/blogs-images/<dir>/xxx.png)
 *   <img src="./images/xxx" /> → <img src="/blogs-images/<dir>/xxx" />
 */
function copyImagesAndTransformPaths(content, mdFileDir, relativeDir) {
  const srcImagesDir = path.join(mdFileDir, "images");

  // 如果存在 images 目录，复制到 public
  if (fs.existsSync(srcImagesDir) && fs.statSync(srcImagesDir).isDirectory()) {
    const destImagesDir = path.join(IMAGES_OUTPUT_DIR, relativeDir);
    fs.mkdirSync(destImagesDir, { recursive: true });
    copyDirSync(srcImagesDir, destImagesDir);
  }

  // 转换图片路径：./images/xxx 或 images/xxx → /blogs-images/<relativeDir>/xxx
  const imageBaseUrl = `/blogs-images/${relativeDir.replace(/\\/g, "/")}`;

  let transformed = content
    // Markdown 图片: ![alt](路径)
    .replace(
      /!\[([^\]]*)\]\(\.\/images\/([^)]+)\)/g,
      `![$1](${imageBaseUrl}/$2)`
    )
    .replace(
      /!\[([^\]]*)\]\(images\/([^)]+)\)/g,
      `![$1](${imageBaseUrl}/$2)`
    )
    // HTML img 标签
    .replace(
      /<img\s+([^>]*?)src=["']\.\/images\/([^"']+)["']([^>]*?)>/g,
      `<img $1src="${imageBaseUrl}/$2"$3>`
    )
    .replace(
      /<img\s+([^>]*?)src=["']images\/([^"']+)["']([^>]*?)>/g,
      `<img $1src="${imageBaseUrl}/$2"$3>`
    );

  return transformed;
}

/** 递归复制目录 */
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  entries.forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function readBlogsRecursively(dir, baseDir) {
  const articles = [];
  if (!fs.existsSync(dir)) return articles;

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
      const { data, content: rawContent } = matter(fileContents);

      // 处理图片：复制到 public + 转换路径
      const content = copyImagesAndTransformPaths(rawContent, dir, relativePath);

      const frontmatterCategory = data.category || "";
      const category =
        frontmatterCategory && frontmatterCategory.trim()
          ? frontmatterCategory.trim()
          : dirCategory;
      const subcategory = dirCategory;

      const description =
        data.description && data.description.trim()
          ? data.description.trim()
          : extractDescription(content);

      const dateStr = data.published || data.date || "";
      const date = dateStr
        ? new Date(dateStr).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const readTime = data.readTime || calculateReadTime(content) || "5 分钟阅读";

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
        contentDir: relativePath.replace(/\\/g, "/"), // 图片路径前缀
      });
    }
  });
  return articles;
}

// ── 构建目录树 ──────────────────────────────────────────────

function buildDirectoryTree(dir, baseDir, level = 0) {
  if (!fs.existsSync(dir)) return { tree: [], dirCount: 0, fileCount: 0 };

  const items = [];
  let dirCount = 0;
  let fileCount = 0;

  const entries = fs.readdirSync(dir);
  const filtered = entries.filter((entry) => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && entry === "images") return false;
    if (!stat.isDirectory() && entry === "count.md") return false;
    return true;
  });

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

// ── 统计分类 ────────────────────────────────────────────────

function countArticles(dir, baseDir) {
  if (!fs.existsSync(dir)) return { count: 0, categoryStats: {} };

  let count = 0;
  const categoryStats = {};

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

      const cat = (data.category && data.category.trim()) || dirCategory;
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
      count++;
    }
  });

  return { count, categoryStats };
}

// ── 主函数 ──────────────────────────────────────────────────

function main() {
  console.log("🔍 扫描博客目录: " + BLOGS_DIR);

  // 0. 清理旧的图片输出目录
  if (fs.existsSync(IMAGES_OUTPUT_DIR)) {
    fs.rmSync(IMAGES_OUTPUT_DIR, { recursive: true, force: true });
    console.log("🧹 已清理旧图片目录");
  }

  // 1. 生成文章与分类数据（对应 /api/blogs）
  const articles = readBlogsRecursively(BLOGS_DIR, BLOGS_DIR);
  articles.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });

  const categorySet = new Set();
  articles.forEach((a) => categorySet.add(a.category));
  const categories = ["全部", ...Array.from(categorySet)];

  const blogsData = { articles, categories };

  // 2. 生成统计与目录树（对应 /api/blog-stats）
  const treeResult = buildDirectoryTree(BLOGS_DIR, BLOGS_DIR);
  const articleStats = countArticles(BLOGS_DIR, BLOGS_DIR);

  const statsData = {
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

  // 3. 写入 JSON 文件
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "blogs.json"),
    JSON.stringify(blogsData),
    "utf8"
  );
  console.log(`✅ 已生成 public/data/blogs.json (${articles.length} 篇文章)`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "blog-stats.json"),
    JSON.stringify(statsData),
    "utf8"
  );
  console.log(
    `✅ 已生成 public/data/blog-stats.json (${statsData.totalDirectories} 个目录, ${statsData.totalFiles} 个文件)`
  );

  // 4. 统计图片
  const imagesDirExists = fs.existsSync(IMAGES_OUTPUT_DIR);
  if (imagesDirExists) {
    const imageCount = countFilesRecursive(IMAGES_OUTPUT_DIR);
    console.log(`🖼️  已复制 ${imageCount} 个图片到 public/blogs-images/`);
  }
}

/** 递归统计文件数 */
function countFilesRecursive(dir) {
  let count = 0;
  if (!fs.existsSync(dir)) return count;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      count += countFilesRecursive(path.join(dir, entry.name));
    } else {
      count++;
    }
  });
  return count;
}

try {
  main();
} catch (error) {
  console.error("❌ 生成博客数据失败:", error);
  process.exit(1);
}
