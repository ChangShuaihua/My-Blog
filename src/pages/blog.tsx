import { useState, useEffect, useCallback, JSX, useRef } from "react";
import Head from "next/head";
import SvgIcon from "@/components/SvgIcon";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  subcategory: string;
  contentDir?: string; // 图片所在子目录，用于解析相对路径
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

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

const DirectoryItem = React.memo(
  ({
    item,
    level = 0,
    collapsedFolders,
    toggleFolder,
  }: {
    item: DirectoryTreeItem;
    level?: number;
    collapsedFolders: Set<string>;
    toggleFolder: (folderId: string) => void;
  }) => {
    const isCollapsed = collapsedFolders.has(item.id);

    if (item.isFolder) {
      return (
        <div>
          <div
            className="flex items-center cursor-pointer hover:bg-[rgba(255,255,255,.05)] rounded px-1 py-0.5"
            style={{ paddingLeft: `${level * 12}px` }}
            onClick={() => toggleFolder(item.id)}
          >
            <SvgIcon
              name={isCollapsed ? "right" : "down"}
              width={12}
              height={12}
              color="#ffffff"
              className="mr-1 flex-shrink-0"
            />
            <span className="text-yellow-400">📁</span>
            <span className="ml-1 text-gray-300">{item.name}</span>
          </div>
          {!isCollapsed && (
            <div>
              {item.children.map((child, index) => (
                <DirectoryItem
                  key={child.id || `${child.name}-${index}`}
                  item={child}
                  level={level + 1}
                  collapsedFolders={collapsedFolders}
                  toggleFolder={toggleFolder}
                />
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          className="flex items-center"
          style={{ paddingLeft: `${level * 12 + 16}px` }}
        >
          <span className="text-blue-400">📄</span>
          <span className="ml-1 text-gray-300 line-clamp-1">{item.name}</span>
        </div>
      );
    }
  }
);

DirectoryItem.displayName = "DirectoryItem";

// 将打字机动画提取为独立组件
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const typeSpeed = 150;
    const deleteSpeed = 100;
    const pauseTime = 2000;
    const restartPause = 1000;

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < text.length) {
            setDisplayText(text.slice(0, currentIndex + 1));
            setCurrentIndex(currentIndex + 1);
          } else {
            setTimeout(() => setIsDeleting(true), pauseTime);
          }
        } else {
          if (currentIndex > 0) {
            setDisplayText(text.slice(0, currentIndex - 1));
            setCurrentIndex(currentIndex - 1);
          } else {
            setTimeout(() => setIsDeleting(false), restartPause);
          }
        }
      },
      isDeleting ? deleteSpeed : typeSpeed
    );

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, text]);

  return (
    <span className="inline-block">
      {displayText.split(" ").map((word, wordIndex) => {
        if (word === "前端") {
          return (
            <span
              key={wordIndex}
              className="bg-gradient-to-br from-[#1b2c55] to-[#3d85a9] bg-clip-text text-transparent"
            >
              {word}
            </span>
          );
        }
        return (
          <span key={wordIndex}>
            {word}
            {wordIndex < displayText.split(" ").length - 1 ? " " : ""}
          </span>
        );
      })}
      <span className="animate-pulse text-[#3d85a9] pl-[10px] pb-[4px]">|</span>
    </span>
  );
};

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(
    null
  );
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>(
    []
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const blogContentRef = useRef<HTMLDivElement>(null);
  // 加载文章列表
  useEffect(() => {
    loadArticles();
    loadBlogStats();
  }, []);
  useEffect(() => {
    if (!selectedArticle) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollContainer = document.querySelector(
            ".custom-scrollbar"
          ) as HTMLElement;
          if (!scrollContainer) return;

          const scrollTop = scrollContainer.scrollTop;
          const containerHeight = scrollContainer.clientHeight;

          const headings = tableOfContents
            .map((item) => {
              const element = document.getElementById(item.id);
              if (element) {
                const rect = element.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();
                // 计算相对于滚动容器的位置
                const relativeTop = rect.top - containerRect.top;
                return {
                  id: item.id,
                  top: relativeTop,
                  absoluteTop: scrollTop + relativeTop,
                  element,
                };
              }
              return null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null); // 类型守卫

          if (headings.length === 0) return;

          // 改进的检测逻辑
          const threshold = 80; // 减小阈值
          let bestHeading = headings[0]; // 默认第一个标题

          // 找到最合适的标题
          for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];

            // 如果标题在视口顶部附近或之上
            if (heading.top <= threshold) {
              bestHeading = heading;
            } else {
              // 如果当前标题在阈值之下，停止查找
              break;
            }
          }

          // 特殊处理：如果没有标题在阈值内，选择最接近顶部的可见标题
          if (bestHeading.top > threshold) {
            const visibleHeadings = headings.filter(
              (h) => h.top >= 0 && h.top <= containerHeight
            );
            if (visibleHeadings.length > 0) {
              bestHeading = visibleHeadings[0];
            }
          }

          // 只有当找到的标题与当前不同时才更新
          if (bestHeading && bestHeading.id !== activeHeading) {
            setActiveHeading(bestHeading.id);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // 获取滚动容器
    const scrollContainer = document.querySelector(".custom-scrollbar");
    if (scrollContainer) {
      // 添加防抖延迟
      let timeoutId: NodeJS.Timeout;
      const debouncedHandleScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, 30); // 减少防抖时间
      };

      scrollContainer.addEventListener("scroll", debouncedHandleScroll);
      // 初始检查
      setTimeout(handleScroll, 100); // 延迟初始检查

      return () => {
        clearTimeout(timeoutId);
        scrollContainer.removeEventListener("scroll", debouncedHandleScroll);
      };
    }
  }, [selectedArticle, tableOfContents, activeHeading]);

  // 监听滚动显示/隐藏回到顶部按钮
  useEffect(() => {
    if (selectedArticle) {
      setShowBackToTop(false);
      return;
    }

    // 等待数据加载完成和DOM渲染
    if (loading || articles.length === 0) {
      setShowBackToTop(false);
      return;
    }

    const handleScroll = () => {
      if (blogContentRef.current) {
        const scrollTop = blogContentRef.current.scrollTop;
        setShowBackToTop(scrollTop > 100);
      }
    };

    // 延迟设置监听器，确保DOM完全渲染
    let scrollContainer: HTMLDivElement | null = null;
    const timer = setTimeout(() => {
      scrollContainer = blogContentRef.current;
      if (scrollContainer) {
        scrollContainer.addEventListener("scroll", handleScroll);
        // 立即检查一次滚动位置
        handleScroll();
      }
    }, 300); // 增加延迟时间

    return () => {
      clearTimeout(timer);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [selectedArticle, loading, articles.length]);

  // 回到顶部函数
  const scrollToTop = () => {
    if (blogContentRef.current) {
      blogContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // 添加折叠状态管理
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(
    new Set()
  );

  // 切换文件夹折叠状态
  const toggleFolder = useCallback((folderId: string) => {
    setCollapsedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const loadArticles = async () => {
    try {
      const response = await fetch("/data/blogs.json");
      if (!response.ok) {
        // 尝试从响应体中提取 API 返回的具体错误信息
        let errorMsg = `加载文章失败 (HTTP ${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData?.error) {
            errorMsg = errorData.error;
          }
        } catch {
          // 响应体不是 JSON，使用默认错误信息
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setArticles(data.articles || []);
      setCategories(data.categories || ["全部"]);
      setLoadError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "加载文章失败";
      console.error("加载文章失败:", error);
      setLoadError(message);
      setArticles([]);
      setCategories(["全部"]);
    } finally {
      setLoading(false);
    }
  };

  const loadBlogStats = async () => {
    try {
      const response = await fetch("/data/blog-stats.json");
      if (response.ok) {
        const stats = await response.json();
        setBlogStats(stats);

        // 默认收缩所有文件夹
        const getAllFolderIds = (items: DirectoryTreeItem[]): string[] => {
          const folderIds: string[] = [];
          items.forEach((item) => {
            if (item.isFolder) {
              folderIds.push(item.id);
              if (item.children && item.children.length > 0) {
                folderIds.push(...getAllFolderIds(item.children));
              }
            }
          });
          return folderIds;
        };

        const allFolderIds = getAllFolderIds(stats.directoryTree || []);
        setCollapsedFolders(new Set(allFolderIds));
      }
    } catch (error) {
      console.error("加载统计信息失败:", error);
    }
  };
  // 过滤文章
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "全部" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 生成目录
  const generateTableOfContents = (content: string) => {
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    return headings.map((heading, index) => {
      const level = heading.match(/^#+/)?.[0].length || 1;
      const title = heading.replace(/^#+\s+/, "");
      return {
        id: `heading-${index}`,
        title,
        level,
      };
    });
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // 打开文章
  const openArticle = (article: BlogArticle) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedArticle(article);
      setTableOfContents(generateTableOfContents(article.content));
      setIsTransitioning(false);
    }, 300);
  };

  // 返回文章列表
  const backToList = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedArticle(null);
      setTableOfContents([]);
      setIsTransitioning(false);
    }, 300);
  };

  // 跳转到指定标题
  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ================================================================
   *  Markdown 渲染器
   *  支持: ATX/Setext 标题、代码块、表格、引用、列表、图片、分隔线
   *  内联: 粗体、斜体、删除线、行内代码、链接、图片
   * ================================================================ */

  /** 内联元素渲染：粗体 **text**、斜体 *text*、删除线 ~~text~~、行内代码 `code`、链接 [text](url)、图片 ![alt](url) */
  const renderInline = (text: string): (string | JSX.Element)[] => {
    const tokens: (string | JSX.Element)[] = [];
    let remaining = text;
    let key = 0;

    // 统一正则，按优先级匹配
    const patterns: { regex: RegExp; type: string }[] = [
      { regex: /!\[([^\]]*)\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g, type: "image" },   // ![alt](url)
      { regex: /\[([^\]]+)\]\(([^)\s]+(?:\s+"[^"]*")?)\)/g, type: "link" },     // [text](url)
      { regex: /`([^`\n]+)`/g, type: "code" },                                   // `code`
      { regex: /\*\*(.+?)\*\*/g, type: "bold" },                                  // **bold**
      { regex: /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, type: "italic" },         // *italic* (不匹配 **)
      { regex: /~~(.+?)~~/g, type: "strikethrough" },                             // ~~strikethrough~~
    ];

    while (remaining.length > 0) {
      const allMatches: { index: number; length: number; type: string; match: RegExpExecArray }[] = [];

      patterns.forEach(({ regex, type }) => {
        // 需要在 while 内每次重新 exec，因为 remaining 在变
        const r = new RegExp(regex.source, regex.flags);
        const m = r.exec(remaining);
        if (m) {
          allMatches.push({ index: m.index, length: m[0].length, type, match: m });
        }
      });

      if (allMatches.length === 0) {
        tokens.push(<span key={`t-${key++}`}>{remaining}</span>);
        break;
      }

      allMatches.sort((a, b) => a.index - b.index);
      const first = allMatches[0];

      // 前缀纯文本
      if (first.index > 0) {
        tokens.push(<span key={`t-${key++}`}>{remaining.substring(0, first.index)}</span>);
      }

      const matchedText = remaining.substring(first.index, first.index + first.length);
      const inner = first.match[1];
      const href = first.match[2];

      switch (first.type) {
        case "image":
          tokens.push(
            <img
              key={`img-${key++}`}
              src={href}
              alt={inner}
              className="max-w-full h-auto rounded my-4"
              loading="lazy"
            />
          );
          break;
        case "link":
          tokens.push(
            <a
              key={`a-${key++}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3d85a9] hover:text-[#5ba5c9] underline underline-offset-2 transition-colors"
            >
              {inner}
            </a>
          );
          break;
        case "code":
          tokens.push(
            <code
              key={`code-${key++}`}
              className="bg-[rgba(255,255,255,.1)] px-1.5 py-0.5 rounded text-sm text-[#e6a23c] font-mono"
            >
              {inner}
            </code>
          );
          break;
        case "bold":
          tokens.push(
            <strong key={`b-${key++}`} className="text-white font-semibold">{inner}</strong>
          );
          break;
        case "italic":
          tokens.push(<em key={`em-${key++}`} className="text-gray-200">{inner}</em>);
          break;
        case "strikethrough":
          tokens.push(
            <del key={`del-${key++}`} className="text-gray-500">{inner}</del>
          );
          break;
        default:
          tokens.push(<span key={`t-${key++}`}>{matchedText}</span>);
      }

      remaining = remaining.substring(first.index + first.length);
    }

    return tokens;
  };

  /** 块级 Markdown → JSX */
  const renderMarkdown = (content: string) => {
    const lines = content.split("\n");
    const elements: JSX.Element[] = [];
    let headingId = 0;

    let inCodeBlock = false;
    let codeBlockContent = "";
    let codeBlockLang = "";

    let inList = false;
    let listItems: JSX.Element[] = [];
    let listType: "ul" | "ol" = "ul";

    // 表格暂存
    let tableRows: string[][] = [];
    let tableAligns: ("left" | "center" | "right")[] = [];

    let prevLine = ""; // 用于 setext 标题检测

    const flushList = () => {
      if (inList && listItems.length > 0) {
        const cls =
          listType === "ol"
            ? "list-decimal list-inside mb-4 text-gray-300 space-y-1"
            : "list-disc list-inside mb-4 text-gray-300 space-y-1";
        elements.push(
          React.createElement(listType, { key: `list-${headingId++}`, className: cls }, listItems)
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableRows.length === 0) return;
      const [headerRow, ...bodyRows] = tableRows;

      elements.push(
        <div key={`table-${headingId++}`} className="my-4 overflow-x-auto rounded-lg border border-[rgba(255,255,255,.1)]">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="bg-[rgba(255,255,255,.05)]">
                {headerRow.map((cell, ci) => (
                  <th
                    key={ci}
                    className="px-4 py-2.5 text-left font-medium text-white border-b border-[rgba(255,255,255,.1)]"
                    style={{ textAlign: tableAligns[ci] || "left" }}
                  >
                    {renderInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr
                  key={ri}
                  className={ri % 2 === 0 ? "bg-[rgba(0,0,0,.1)]" : "bg-[rgba(0,0,0,.2)]"}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2 border-b border-[rgba(255,255,255,.05)]"
                      style={{ textAlign: tableAligns[ci] || "left" }}
                    >
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      tableAligns = [];
    };

    const pushBlock = (el: JSX.Element) => {
      flushList();
      flushTable();
      elements.push(el);
    };

    // 判断是否为分隔线（至少3个连续的 - * _ 且无其他内容）
    const isHorizontalRule = (line: string): boolean =>
      /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim());

    // 判断是否为 setext 标题下划线
    const isSetextUnderline = (line: string): "h1" | "h2" | null => {
      const t = line.trim();
      if (/^=+\s*$/.test(t)) return "h1";
      if (/^-+\s*$/.test(t)) return "h2";
      return null;
    };

    // 判断是否为表格行
    const isTableRow = (line: string): boolean => /^\|.+\|$/.test(line.trim());

    // 判断是否为表格分隔行
    const isTableSeparator = (line: string): boolean =>
      /^\|[\s\-:]+\|(\s*[\-:]+\s*\|)*\s*$/.test(line.trim());

    // 解析表格分隔行对齐方式
    const parseTableAligns = (line: string): ("left" | "center" | "right")[] => {
      return line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => {
          const t = cell.trim();
          if (t.startsWith(":") && t.endsWith(":")) return "center";
          if (t.endsWith(":")) return "right";
          return "left";
        });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // ── 代码块 ──────────────────────────────
      if (line.trimStart().startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <div key={`cb-${i}`} className="my-4 rounded-lg overflow-hidden border border-[rgba(255,255,255,.1)]">
              {codeBlockLang && (
                <div className="bg-[rgba(255,255,255,.05)] px-4 py-1.5 text-xs text-gray-400 font-mono flex justify-between items-center">
                  <span>{codeBlockLang}</span>
                </div>
              )}
              <pre className="bg-[rgba(0,0,0,.3)] p-4 overflow-x-auto m-0">
                <code className="text-sm text-gray-200 font-mono leading-relaxed whitespace-pre">
                  {codeBlockContent}
                </code>
              </pre>
            </div>
          );
          codeBlockContent = "";
          codeBlockLang = "";
          inCodeBlock = false;
        } else {
          flushList();
          flushTable();
          codeBlockLang = line.trimStart().replace(/^```\s*/, "").trim();
          inCodeBlock = true;
        }
        prevLine = "";
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += (codeBlockContent ? "\n" : "") + line;
        continue;
      }

      const trimmed = line.trim();

      // ── 空行 ────────────────────────────────
      if (!trimmed) {
        // 空行中断列表和表格
        if (inList) flushList();
        if (tableRows.length > 0) flushTable();
        elements.push(<div key={`sp-${i}`} className="h-2" />);
        prevLine = "";
        continue;
      }

      // ── 表格 ─────────────────────────────────
      if (isTableSeparator(trimmed) && tableRows.length === 1) {
        tableAligns = parseTableAligns(trimmed);
        prevLine = trimmed;
        continue;
      }

      if (isTableRow(trimmed)) {
        flushList();
        const cells = trimmed
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
        tableRows.push(cells);
        prevLine = trimmed;
        continue;
      }

      // 非表格行 → 清空表格暂存
      if (tableRows.length > 0) flushTable();

      // ── Setext 标题 ─────────────────────────
      const setextLevel = isSetextUnderline(trimmed);
      if (setextLevel && prevLine && !isHorizontalRule(prevLine) && !isTableRow(prevLine)) {
        // 替换上一行的空行占位和段落
        elements.pop(); // 移除上一行的渲染结果
        if (elements.length > 0 && elements[elements.length - 1].type === "p") {
          elements.pop();
        }
        const id = `heading-${headingId++}`;
        const Tag = setextLevel;
        const cls =
          setextLevel === "h1"
            ? "text-3xl font-bold mb-4 text-white mt-8 first:mt-0"
            : "text-2xl font-bold mb-3 text-white mt-6 pb-2 border-b border-[rgba(255,255,255,.08)]";
        elements.push(
          <Tag key={id} id={id} className={cls}>
            {renderInline(prevLine)}
          </Tag>
        );
        prevLine = trimmed;
        continue;
      }

      // ── 水平分隔线 ──────────────────────────
      if (isHorizontalRule(trimmed)) {
        pushBlock(<hr key={`hr-${i}`} className="my-6 border-[rgba(255,255,255,.15)]" />);
        prevLine = trimmed;
        continue;
      }

      // ── ATX 标题 ────────────────────────────
      const atxMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (atxMatch) {
        const level = atxMatch[1].length;
        const text = atxMatch[2];
        const id = `heading-${headingId++}`;

        const clsMap: Record<number, string> = {
          1: "text-3xl font-bold mb-4 text-white mt-8 first:mt-0",
          2: "text-2xl font-bold mb-3 text-white mt-6 pb-2 border-b border-[rgba(255,255,255,.08)]",
          3: "text-xl font-semibold mb-2 text-white mt-5",
          4: "text-lg font-semibold mb-2 text-gray-200 mt-4",
          5: "text-base font-semibold mb-2 text-gray-300 mt-3",
          6: "text-sm font-semibold mb-2 text-gray-400 mt-3",
        };

        const Tag = `h${level}` as keyof JSX.IntrinsicElements;
        pushBlock(
          <Tag key={id} id={id} className={clsMap[level] || clsMap[6]}>
            {renderInline(text)}
          </Tag>
        );
        prevLine = trimmed;
        continue;
      }

      // ── 图片（独占行）───────────────────────
      if (trimmed.startsWith("![")) {
        const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+(?:\s+"[^"]*")?)\)$/);
        if (imgMatch) {
          pushBlock(
            <div key={`img-${i}`} className="my-6 flex justify-center">
              <img
                src={imgMatch[2]}
                alt={imgMatch[1]}
                className="max-w-full h-auto rounded-lg shadow-lg border border-gray-700"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  console.error(`图片加载失败: ${imgMatch[2]}`);
                }}
              />
            </div>
          );
        } else {
          pushBlock(
            <p key={`p-${i}`} className="mb-3 text-gray-300 leading-relaxed text-[15px]">
              {renderInline(trimmed)}
            </p>
          );
        }
        prevLine = trimmed;
        continue;
      }

      // ── 引用块 ──────────────────────────────
      if (trimmed.startsWith(">")) {
        flushList();
        // 收集连续引用行
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        i--; // 外层 for 会再 ++

        const quoteText = quoteLines.join("\n");
        pushBlock(
          <blockquote
            key={`bq-${i}`}
            className="border-l-4 border-[#3d85a9] bg-[rgba(61,133,169,.08)] pl-4 py-2 my-3 text-gray-400 italic rounded-r"
          >
            {renderInline(quoteText)}
          </blockquote>
        );
        prevLine = ">";
        continue;
      }

      // ── 无序列表 ────────────────────────────
      if (/^[\s]{0,4}[-*+]\s+/.test(line)) {
        if (!inList || listType !== "ul") {
          flushList();
          flushTable();
          inList = true;
          listType = "ul";
        }
        const itemText = line.replace(/^[\s]{0,4}[-*+]\s+/, "");
        listItems.push(
          <li key={`li-${i}`} className="text-gray-300">
            {renderInline(itemText)}
          </li>
        );
        prevLine = trimmed;
        continue;
      }

      // ── 有序列表 ────────────────────────────
      if (/^[\s]{0,4}\d+\.\s+/.test(line)) {
        if (!inList || listType !== "ol") {
          flushList();
          flushTable();
          inList = true;
          listType = "ol";
        }
        const itemText = line.replace(/^[\s]{0,4}\d+\.\s+/, "");
        listItems.push(
          <li key={`li-${i}`} className="text-gray-300">
            {renderInline(itemText)}
          </li>
        );
        prevLine = trimmed;
        continue;
      }

      // ── 普通段落 ────────────────────────────
      flushList();
      elements.push(
        <p key={`p-${i}`} className="mb-3 text-gray-300 leading-relaxed text-[15px]">
          {renderInline(trimmed)}
        </p>
      );
      prevLine = trimmed;
    }

    // 清理未闭合的内容
    flushList();
    flushTable();
    if (inCodeBlock && codeBlockContent) {
      elements.push(
        <div key="trailing-code" className="my-4 rounded-lg overflow-hidden border border-[rgba(255,255,255,.1)]">
          <pre className="bg-[rgba(0,0,0,.3)] p-4 overflow-x-auto m-0">
            <code className="text-sm text-gray-200 font-mono leading-relaxed whitespace-pre">
              {codeBlockContent}
            </code>
          </pre>
        </div>
      );
    }

    return elements;
  };

  if (loading) {
    return (
      <div
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] font-[family-name:var(--font-geist-sans)] flex items-center justify-center relative z-20`}
      >
        <div className="loader">
          <div className="circle">
            <div className="dot"></div>
            <div className="outline"></div>
          </div>
          <div className="circle">
            <div className="dot"></div>
            <div className="outline"></div>
          </div>
          <div className="circle">
            <div className="dot"></div>
            <div className="outline"></div>
          </div>
          <div className="circle">
            <div className="dot"></div>
            <div className="outline"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>docs - shuaihua&apos;s web</title>
        <meta name="description" content="分享前端开发经验和技术文章" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-[family-name:var(--font-geist-sans)] custom-scrollbar overflow-x-hidden`}
        style={{
          overflowY: "scroll",
          height: "100vh",
        }}
      >
        {/* 导航按钮 */}
        <div className="fixed top-4 left-4 z-10 flex gap-2">
          <Link
            href="/works"
            className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
          >
            <SvgIcon name="left" width={16} height={16} color="#fff" />
            <span className="text-sm">作品集</span>
          </Link>
          <Link
            href="/"
            className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
          >
            <SvgIcon name="home" width={16} height={16} color="#fff" />
            <span className="text-sm">首页</span>
          </Link>
        </div>

        <div className="container mx-auto px-4 pt-20 pb-8 max-w-full overflow-x-hidden">
          {/* 文章列表视图 */}
          <div
            className={`transition-all duration-300 ${
              selectedArticle
                ? "opacity-0 pointer-events-none absolute"
                : "opacity-100"
            } ${isTransitioning ? "scale-95" : "scale-100"}`}
          >
            {/* 主要内容区域 - 左右布局 */}
            <div className="max-w-7xl mx-auto flex gap-4 h-[80vh]">
              {/* 左侧分类面板 */}
              <div className="w-64 sticky top-45 h-fit hidden sm:block">
                <div className="bg-[rgba(0,0,0,.3)] rounded-lg p-4 border border-[rgba(255,255,255,.1)]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <SvgIcon name="tag" width={20} height={20} color="#fff" />
                    文章分类
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          selectedCategory === category
                            ? "bg-[#3d85a9] text-white shadow-lg"
                            : "bg-[rgba(0,0,0,.2)] text-gray-300 hover:bg-[rgba(0,0,0,.4)] border border-[rgba(255,255,255,.05)]"
                        }`}
                      >
                        <span>{category}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            selectedCategory === category
                              ? "bg-[rgba(255,255,255,.2)] text-white"
                              : "bg-[rgba(255,255,255,.1)] text-gray-400"
                          }`}
                        >
                          {category === "全部"
                            ? articles.length
                            : articles.filter(
                                (article) => article.category === category
                              ).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 中间文章列表 */}
              <div className="flex-1 w-full">
                {/* 搜索栏 */}
                <div className="mb-4">
                  <div className="max-w-2xl mx-auto">
                    <h1 className="text-[40px] font-bold text-[#fff] text-shadow-sm flex items-end justify-center mb-[10px]">
                      <TypewriterText text="前端 知识库" />
                    </h1>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="搜索文章标题、内容或标签..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-[rgba(0,0,0,.3)] border border-[rgba(255,255,255,.1)] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#3d85a9] transition-colors"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <SvgIcon
                          name="search"
                          width={20}
                          height={20}
                          color="#fff"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 移动端分类tabs */}
                <div className="mt-4 sm:hidden">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1 -mx-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category
                            ? "bg-[#3d85a9] text-white shadow-lg"
                            : "bg-[rgba(0,0,0,.3)] text-gray-300 hover:bg-[rgba(0,0,0,.5)] border border-[rgba(255,255,255,.1)]"
                        }`}
                      >
                        {category}
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            selectedCategory === category
                              ? "bg-[rgba(255,255,255,.2)] text-white"
                              : "bg-[rgba(255,255,255,.1)] text-gray-400"
                          }`}
                        >
                          {category === "全部"
                            ? articles.length
                            : articles.filter(
                                (article) => article.category === category
                              ).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 加载错误提示 */}
                {loadError && (
                  <div className="mb-4 p-4 bg-[rgba(220,38,38,.15)] border border-red-500/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 text-lg">⚠️</span>
                      <div>
                        <p className="text-red-300 text-sm font-medium">
                          文章加载失败
                        </p>
                        <p className="text-red-400/70 text-xs mt-0.5">
                          {loadError}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setLoadError(null);
                        setLoading(true);
                        loadArticles();
                      }}
                      className="flex-shrink-0 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded-md border border-red-500/30 transition-colors cursor-pointer"
                    >
                      重试
                    </button>
                  </div>
                )}

                <div
                  ref={blogContentRef}
                  className="grid gap-3 max-h-[70vh] overflow-auto custom-scrollbar blog-content relative pb-20"
                >
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => openArticle(article)}
                      className="bg-[rgba(0,0,0,.3)] rounded-lg p-4 cursor-pointer hover:bg-[rgba(0,0,0,.4)] transition-all duration-200 border border-[rgba(255,255,255,.08)] hover:border-[#3d85a9] group"
                    >
                      {/* 第一行：标题 + 日期 */}
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h2 className="text-lg font-bold text-white group-hover:text-[#3d85a9] transition-colors leading-snug line-clamp-1">
                          {article.title}
                        </h2>
                        <span className="text-xs text-gray-500 whitespace-nowrap pt-0.5">
                          {formatDate(article.date)}
                        </span>
                      </div>

                      {/* 描述 */}
                      <p className="text-sm text-gray-400 mb-3 leading-relaxed line-clamp-2">
                        {article.description}
                      </p>

                      {/* 底部：分类 + 标签 + 阅读时间 */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* 主分类 */}
                          <span className="px-2 py-0.5 bg-[rgba(61,133,169,.15)] text-[#7ab8d4] rounded text-xs font-medium">
                            {article.category}
                          </span>
                          {/* 子分类（如果和主分类不同） */}
                          {article.subcategory !== article.category && (
                            <span className="px-2 py-0.5 bg-[rgba(255,255,255,.05)] text-gray-500 rounded text-xs">
                              {article.subcategory}
                            </span>
                          )}
                          {/* 标签 */}
                          {article.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs text-gray-500 bg-[rgba(255,255,255,.03)] px-1.5 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 whitespace-nowrap">
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* 回到顶部按钮 */}
                  {showBackToTop && (
                    <div className="sticky bottom-4 flex justify-end pr-4 pointer-events-none ">
                      <button
                        onClick={scrollToTop}
                        className="bg-[rgba(61,133,169,0.9)] hover:bg-[rgba(61,133,169,1)] text-white p-1 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-[rgba(255,255,255,0.1)] pointer-events-auto cursor-pointer"
                        aria-label="回到顶部"
                      >
                        <SvgIcon
                          name="top"
                          width={20}
                          height={20}
                          color="#fff"
                        />
                      </button>
                    </div>
                  )}
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                      {selectedCategory === "全部"
                        ? "没有找到相关文章"
                        : `在 "${selectedCategory}" 分类中没有找到相关文章`}
                    </p>
                  </div>
                )}
              </div>

              {/* 右侧统计面板 */}
              <div className="w-80 sticky top-49 h-fit hidden lg:block">
                <div className="bg-[rgba(0,0,0,.3)] rounded-lg p-3 border border-[rgba(255,255,255,.1)]">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <SvgIcon name="count" width={20} height={20} color="#fff" />
                    博客统计
                  </h3>

                  {blogStats ? (
                    <div className="space-y-3">
                      {/* 总体统计 */}
                      <div className="bg-[rgba(0,0,0,.2)] rounded-lg p-4">
                        <h4 className="text-sm font-medium text-[#fff] mb-3 flex gap-[5px] items-center">
                          <SvgIcon
                            name="count1"
                            width={15}
                            height={15}
                            color="#fff"
                          />
                          总体统计
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">总文章数</span>
                            <span className="text-white font-medium">
                              {blogStats.totalArticles} 篇
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">总目录数</span>
                            <span className="text-white font-medium">
                              {blogStats.totalDirectories} 个
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">总文件数</span>
                            <span className="text-white font-medium">
                              {blogStats.totalFiles} 个
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 分类统计 */}
                      <div className="bg-[rgba(0,0,0,.2)] rounded-lg p-4">
                        <h4 className="text-sm font-medium text-[#fff] mb-3 flex gap-[5px] items-center">
                          <SvgIcon
                            name="count2"
                            width={15}
                            height={15}
                            color="#fff"
                          />
                          分类统计
                        </h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(blogStats.categoryStats).map(
                            ([category, count]) => (
                              <div
                                key={category}
                                className="flex justify-between items-center"
                              >
                                <span className="text-gray-300">
                                  {category}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-[rgba(255,255,255,.1)] rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-[#3d85a9] to-[#1b2c55] rounded-full transition-all duration-300"
                                      style={{
                                        width: `${
                                          (count / blogStats.totalArticles) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-white font-medium w-8 text-right">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* 目录结构 */}
                      <div className="bg-[rgba(0,0,0,.2)] rounded-lg p-4 overflow-y-auto custom-scrollbar h-[150px]">
                        <h4 className="text-sm font-medium text-[#fff] mb-3">
                          📁 目录结构
                        </h4>
                        <div className="text-xs text-gray-300 font-mono leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                          {blogStats?.directoryTree &&
                          blogStats.directoryTree.length > 0 ? (
                            <div className="space-y-1">
                              {blogStats.directoryTree.map(
                                (item: DirectoryTreeItem, index: number) => (
                                  <DirectoryItem
                                    key={item.id || `${item.name}-${index}`}
                                    item={item}
                                    collapsedFolders={collapsedFolders}
                                    toggleFolder={toggleFolder}
                                  />
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500">暂无目录结构</div>
                          )}
                        </div>
                      </div>

                      {/* 更新时间 */}
                      <div className="text-xs text-gray-400 text-center pt-2 border-t border-[rgba(255,255,255,.1)]">
                        最后更新: {blogStats.lastUpdated}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-[#3d85a9] border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">加载统计信息中...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 文章详情视图 - 响应式优化 */}
          {selectedArticle && (
            <div
              className={`transition-all bg-[rgba(0,0,0,.1)] duration-300 p-10 rounded-lg ${
                isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8">
                {/* 文章内容 */}
                <div className="flex-1 order-2 lg:order-1">
                  {/* 返回按钮 */}
                  <button
                    onClick={backToList}
                    className="mb-4 lg:mb-6 bg-[rgba(0,0,0,.3)] hover:bg-[rgba(0,0,0,.4)] rounded-lg px-3 py-2 lg:px-4 lg:py-2 text-white transition-colors flex items-center gap-2 text-sm lg:text-base"
                  >
                    <SvgIcon name="left" width={16} height={16} color="#d63f3f" />
                    返回文章列表
                  </button>

                  {/* 文章头部 */}
                  <div className="mb-6 lg:mb-8">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4 leading-tight">
                      {selectedArticle.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-gray-300 mb-3 lg:mb-4 text-sm lg:text-base">
                      <span>{selectedArticle.date}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{selectedArticle.readTime}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{selectedArticle.category}</span>
                      <span className="hidden md:inline">•</span>
                      <span className="hidden md:inline">
                        {selectedArticle.filename}
                      </span>
                    </div>
                  </div>

                  {/* 文章内容 */}
                  <div className="prose prose-invert max-w-none prose-sm lg:prose-base">
                    {renderMarkdown(selectedArticle.content)}
                  </div>
                </div>

                {/* 目录 - 响应式处理 */}
                {tableOfContents.length > 0 && (
                  <div className="w-full max-w-[300px] order-1 lg:order-2 lg:sticky lg:top-20 lg:h-fit">
                    <div className="bg-[rgba(0,0,0,.3)] rounded-lg p-3 lg:p-4 border border-[rgba(255,255,255,.1)]">
                      <h3 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4">
                        目录
                      </h3>
                      <nav className="lg:block">
                        {/* 移动端折叠目录 */}
                        <div className="lg:hidden">
                          <details className="group">
                            <summary className="cursor-pointer text-sm text-gray-300 hover:text-white transition-colors list-none flex items-center justify-between">
                              <span>展开目录</span>
                              <SvgIcon
                                name="down"
                                width={16}
                                height={16}
                                color="#bcc1c9"
                                className="group-open:rotate-180 transition-transform"
                              />
                            </summary>
                            <div className="mt-2 max-h-60 overflow-y-auto custom-scrollbar overflow-x-hidden">
                              {tableOfContents.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => scrollToHeading(item.id)}
                                  className={`block w-full text-left py-2 px-2 text-sm hover:bg-[rgba(255,255,255,.1)] rounded transition-colors relative ${
                                    activeHeading === item.id
                                      ? "text-[#214362] font-semibold"
                                      : item.level === 1
                                      ? "text-white font-medium"
                                      : item.level === 2
                                      ? "text-gray-300 ml-4"
                                      : "text-gray-400 ml-8"
                                  }`}
                                >
                                  {activeHeading === item.id && (
                                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-[#214362] rounded-r"></span>
                                  )}
                                  <span
                                    className={
                                      activeHeading === item.id ? "ml-3" : ""
                                    }
                                  >
                                    {item.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </details>
                        </div>

                        {/* 桌面端展开目录 */}
                        <div className="hidden lg:block">
                          {tableOfContents.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => scrollToHeading(item.id)}
                              className={`block w-full text-left py-2 px-2 text-sm hover:bg-[rgba(255,255,255,.1)] rounded transition-colors relative ${
                                activeHeading === item.id
                                  ? "text-[#1E2939] font-semibold pl-4"
                                  : item.level === 1
                                  ? "text-white font-medium"
                                  : item.level === 2
                                  ? "text-gray-300 ml-4"
                                  : "text-gray-400 ml-8"
                              }`}
                            >
                              {activeHeading === item.id && (
                                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-[#1E2939] rounded-r"></span>
                              )}
                              <span
                                className={activeHeading === item.id ? "" : ""}
                              >
                                {item.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-8 right-8 z-10">
          <Link
            href="/chat"
            className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
          >
            <span className="text-sm">留言室</span>
            <SvgIcon name="right" width={20} height={20} color="#fff" />
          </Link>
        </div>
      </div>
    </>
  );
}
