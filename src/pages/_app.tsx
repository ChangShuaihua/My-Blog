import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import LoadingAnimation from "@/components/LoadingAnimation";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
// import SvgIcon from "@/components/SvgIcon";
import {
  ReactionType,
  ReactionCounts,
} from "../../service/api/comment";


// 布局组件，包含公共的主题切换和背景
function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  // const router = useRouter();
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const [commentCount, setCommentCount] = useState(0);
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({
    like: 0,
    cheer: 0,
    celebrate: 0,
    appreciate: 0,
    smile: 0,
  });
  const [hasReacted, setHasReacted] = useState<Record<ReactionType, boolean>>({
    like: false,
    cheer: false,
    celebrate: false,
    appreciate: false,
    smile: false,
  });

  // 添加谢谢你动画状态
  // const [showThanks, setShowThanks] = useState<Record<ReactionType, boolean>>({
  //   like: false,
  //   cheer: false,
  //   celebrate: false,
  //   appreciate: false,
  //   smile: false,
  // });

  // 加载评论数量和点赞数量
  // useEffect(() => {
  //   const loadCounts = async () => {
  //     try {
  //       const [commentsData, reactionsData] = await Promise.all([
  //         commentAPI.getComments(),
  //         reactionAPI.getReactions(),
  //       ]);
  //       setCommentCount(commentsData.length);
  //       setReactionCounts(reactionsData);

  //       // 检查本地存储是否已点赞
  //       const reacted: Record<ReactionType, boolean> = {
  //         like: localStorage.getItem("hasReacted_like") === "true",
  //         cheer: localStorage.getItem("hasReacted_cheer") === "true",
  //         celebrate: localStorage.getItem("hasReacted_celebrate") === "true",
  //         appreciate: localStorage.getItem("hasReacted_appreciate") === "true",
  //         smile: localStorage.getItem("hasReacted_smile") === "true",
  //       };
  //       setHasReacted(reacted);
  //     } catch (error) {
  //       console.error("加载数据失败:", error);
  //     }
  //   };

  //   loadCounts();
  // }, []);

  // 处理点赞
  // const handleReaction = async (type: ReactionType) => {
  //   if (hasReacted[type]) return;

  //   try {
  //     const result = await reactionAPI.addReaction(type);
  //     setReactionCounts((prev) => ({
  //       ...prev,
  //       [type]: result.count,
  //     }));
  //     setHasReacted((prev) => ({
  //       ...prev,
  //       [type]: true,
  //     }));
  //     localStorage.setItem(`hasReacted_${type}`, "true");

  //     // 显示谢谢你动画
  //     setShowThanks((prev) => ({
  //       ...prev,
  //       [type]: true,
  //     }));

  //     // 1秒后隐藏动画
  //     setTimeout(() => {
  //       setShowThanks((prev) => ({
  //         ...prev,
  //         [type]: false,
  //       }));
  //     }, 2000);
  //   } catch (error) {
  //     console.error("点赞失败:", error);
  //   }
  // };

  // const handleCommentClick = () => {
  //   setIsCommentOpen(true);
  // };

  // 格式化评论数量显示
  // const formatCount = (count: number) => {
  //   return count > 99 ? "99+" : count.toString();
  // };

  // const isChatPage = router.pathname === "/chat";

  return (
    <div className="relative min-h-screen">
      {/* 主题切换按钮 */}
      <ThemeToggle />

      {/* 浅色主题背景图片 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-sm transition-opacity duration-1000 ease-in-out z-[-1]"
        style={{
          backgroundImage: `url('/images/img3.jpg')`,
          opacity: theme === "light" ? 1 : 0,
        }}
      />

      {/* 深色主题背景图片 */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-sm transition-opacity duration-1000 ease-in-out z-[-1]"
        style={{
          backgroundImage: `url('/images/img2.jpg')`,
          opacity: theme === "dark" ? 1 : 0,
        }}
      />

      {/* 点赞按钮 */}

      {/* 评论按钮 */}

      {/* 评论弹窗 */}
   
      {/* 页面内容 */}
      {children}
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟加载时间，3秒后隐藏加载动画
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      {/* 全局加载动画 */}
      <LoadingAnimation isVisible={isLoading} />

      {/* 布局组件包装页面内容 */}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
