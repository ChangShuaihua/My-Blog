import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import SvgIcon from "@/components/SvgIcon";
import { useTheme } from "@/contexts/ThemeContext";
import {
  isValidNickname,
  filterProfanity,
  containsProfanity,
} from "@/utils/contentFilter";

interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  _count: { messages: number };
}

export default function ChatPage() {
  const { theme } = useTheme();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [showUserModal, setShowUserModal] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onlineUsers = 1;
  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化用户信息
  useEffect(() => {
    const savedUserName = localStorage.getItem("chatUserName");
    const savedUserId = localStorage.getItem("chatUserId");

    if (savedUserName && savedUserId) {
      setUserName(savedUserName);
      setCurrentUserId(savedUserId);
      setShowUserModal(false);
    } else {
      // 生成新的用户ID
      const newUserId = `user-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setCurrentUserId(newUserId);
      localStorage.setItem("chatUserId", newUserId);
    }
  }, []);

  // 加载留言室列表
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoadingRooms(true);
        const response = await fetch("/api/chat/rooms");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setRooms(data);
          if (data.length > 0) {
            setCurrentRoom((prev) => prev ?? data[0]);
          }
        } else {
          console.error("API returned non-array data:", data);
          setRooms([]);
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        setRooms([]);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    loadRooms();
  }, []);

  // 切换留言室时加载历史留言
  useEffect(() => {
    if (!currentRoom) return;
    fetchMessages(currentRoom.id);
  }, [currentRoom]);

  const fetchMessages = async (roomId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/chat/messages?roomId=${roomId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error("Messages API returned non-array data:", data);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const debouncedSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentRoom || !userName || isSending) return;

    // 检查消息内容
    if (containsProfanity(newMessage)) {
      setMessageError("消息包含不当内容，请重新输入");
      setTimeout(() => setMessageError(""), 3000);
      return;
    }

    setIsSending(true);
    setMessageError("");

    try {
      // 过滤消息内容
      const filteredContent = filterProfanity(newMessage);

      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: filteredContent,
          userId: currentUserId,
          userName,
          roomId: currentRoom.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Message sent successfully:", result);

      setMessages((prev) => [...prev, result]);
      setRooms((prevRooms) => {
        const updatedRooms = prevRooms.map((room) =>
          room.id === currentRoom.id
            ? { ...room, _count: { messages: room._count.messages + 1 } }
            : room
        );
        return [...updatedRooms].sort(
          (a, b) =>
            (b.id === currentRoom.id ? 1 : 0) - (a.id === currentRoom.id ? 1 : 0)
        );
      });

      setNewMessage("");
      // 重置textarea高度
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessageError("发送消息失败，请检查网络连接");
      setTimeout(() => setMessageError(""), 3000);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, currentRoom, userName, currentUserId, isSending]);

  const sendMessage = () => {
    // 清除之前的定时器
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
    }

    // 设置防抖延迟
    sendTimeoutRef.current = setTimeout(() => {
      debouncedSendMessage();
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 自动调整textarea高度
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // 清除之前的错误信息
    if (messageError) {
      setMessageError("");
    }

    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 120; // 最大高度
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  };

  // 验证昵称
  const validateNickname = (nickname: string) => {
    if (!nickname.trim()) {
      setNicknameError("请输入昵称");
      return false;
    }

    if (!isValidNickname(nickname)) {
      if (nickname.toLowerCase().trim() === "shuaihua") {
        setNicknameError("该昵称不可用，请选择其他昵称");
      } else {
        setNicknameError("昵称包含不当内容，请重新输入");
      }
      return false;
    }

    setNicknameError("");
    return true;
  };

  const handleUserNameSubmit = () => {
    if (validateNickname(userName)) {
      localStorage.setItem("chatUserName", userName.trim());
      setShowUserModal(false);
    }
  };

  // 处理昵称输入变化
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserName(value);

    // 实时验证
    if (value.trim()) {
      validateNickname(value);
    } else {
      setNicknameError("");
    }
  };

  // 选择房间并在移动端关闭侧边栏
  const selectRoom = (room: ChatRoom) => {
    setCurrentRoom(room);
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    return () => {
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getThemeClasses = () => {
    const isDark = theme === "dark";
    return {
      // 主容器
      mainContainer: isDark ? "bg-gray-900" : "bg-gray-100",
      // 侧边栏
      sidebar: isDark
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200",
      sidebarBorder: isDark ? "border-gray-700" : "border-gray-200",
      // 文本颜色
      primaryText: isDark ? "text-white" : "text-gray-900",
      secondaryText: isDark ? "text-gray-400" : "text-gray-500",
      // 悬停效果
      hoverBg: isDark ? "hover:bg-gray-700" : "hover:bg-gray-50",
      // 选中状态
      selectedBg: isDark
        ? "bg-gradient-to-r from-[#213C61] to-[#4C638C]"
        : "bg-gradient-to-r from-[#213C61] to-[#496189]",
      // 输入框
      inputBg: isDark
        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500",
      // 模态框
      modalBg: isDark
        ? "bg-gradient-to-r from-[#213C61] to-[#4C638C]"
        : "bg-gradient-to-r from-gray-200 to-gray-300",
      // 消息气泡
      messageBg: isDark
        ? "bg-gradient-to-r from-[#213C61] to-[#4C638C]"
        : "bg-gradient-to-r from-gray-200 to-gray-300",
    };
  };

  const themeClasses = getThemeClasses();

  // 留言室骨架屏组件
  const RoomSkeleton = () => (
    <div className="p-2 animate-pulse">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="p-3 border-b border-gray-200 dark:border-gray-700 mb-2"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-6"></div>
          </div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32 mt-2"></div>
        </div>
      ))}
    </div>
  );

  // 消息骨架屏组件
  const MessageSkeleton = () => (
    <div className="p-4 space-y-4 animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className={`flex items-start space-x-3 ${
            index % 2 === 0 ? "" : "flex-row-reverse space-x-reverse"
          }`}
        >
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
          <div
            className={`flex-1 max-w-xs lg:max-w-md ${
              index % 2 === 0 ? "" : "flex flex-col justify-end items-end"
            }`}
          >
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2"></div>
            <div
              className={`h-10 bg-gray-300 dark:bg-gray-600 rounded-lg w-${
                index % 2 === 0 ? "32" : "24"
              }`}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );

  // 侧边栏组件
  const Sidebar = ({ className = "" }: { className?: string }) => (
    <div
      className={`${themeClasses.sidebar} border-r flex flex-col ${className}`}
    >
      {/* 固定头部 */}
      <div
        className={`px-4 py-2 border-b ${themeClasses.sidebarBorder} flex-shrink-0`}
      >
        <div className="flex items-center justify-between">
          <h1
            className={`text-lg md:text-xl font-bold ${themeClasses.primaryText}`}
          >
            留言室
          </h1>
          <div className="flex items-center space-x-2">
            {/* 移动端导航按钮 */}
            <div className="flex md:hidden items-center ">
              <Link
                href="/blog"
                className={`p-2 ${themeClasses.hoverBg} rounded`}
              >
                <SvgIcon
                  name="docs"
                  className="w-5 h-5"
                  lightColor="#6b7280"
                  darkColor="#9ca3af"
                />
              </Link>
              <Link href="/" className={`p-2 ${themeClasses.hoverBg} rounded`}>
                <SvgIcon
                  name="home"
                  className="w-5 h-5"
                  lightColor="#6b7280"
                  darkColor="#9ca3af"
                />
              </Link>
            </div>
            <div
              className="w-3 h-3 rounded-full bg-green-500"
              title="内存模式"
            />
            {/* 移动端关闭按钮 */}
            <button
            title=" 关闭 "
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`md:hidden p-1 ${themeClasses.hoverBg} rounded`}
            >
              <SvgIcon
                name="close"
                className="w-5 h-5"
                lightColor="#6b7280"
                darkColor="#9ca3af"
              />
            </button>
          </div>
        </div>
        <p className={`text-sm ${themeClasses.secondaryText} mt-1`}>
          欢迎, {userName}
        </p>
      </div>

      {/* 可滚动的房间列表 */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingRooms ? (
          <RoomSkeleton />
        ) : (
          <div className="p-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`p-3 cursor-pointer border-b rounded-lg mb-1 transition-colors ${
                  themeClasses.sidebarBorder
                } ${themeClasses.hoverBg} ${
                  currentRoom?.id === room.id ? themeClasses.selectedBg : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`font-medium text-sm md:text-base ${
                      themeClasses.primaryText
                    } ${currentRoom?.id === room.id ? "text-white" : ""}`}
                  >
                    {room.name}
                  </h3>
                  <span
                    className={`text-xs md:text-sm ${
                      themeClasses.secondaryText
                    } ${currentRoom?.id === room.id ? "text-white" : ""}`}
                  >
                    {room._count.messages}
                  </span>
                </div>
                {room.description && (
                  <p
                    className={`text-xs md:text-sm ${
                      themeClasses.secondaryText
                    } mt-1 ${currentRoom?.id === room.id ? "text-white" : ""}`}
                  >
                    {room.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (showUserModal) {
    return (
      <>
        <Head>
          <title>留言室 - shuaihua&rsquo;s web</title>
        </Head>
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${themeClasses.modalBg} rounded-lg p-6 w-full max-w-md mx-4`}
          >
            <h2 className={`text-[16px] mb-4 ${themeClasses.primaryText}`}>
              请输入您的留言昵称
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={userName}
                onChange={handleNicknameChange}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUserNameSubmit();
                  }
                }}
                placeholder="请输入昵称"
                className={`w-full p-3 outline-none rounded-lg text-base ${
                  themeClasses.inputBg
                } ${nicknameError ? "border-red-500" : ""}`}
                maxLength={20}
                autoFocus
              />
              {nicknameError && (
                <p className="text-red-500 text-sm mt-2">{nicknameError}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleUserNameSubmit}
              disabled={!userName.trim() || !!nicknameError}
              className={`w-full text-white p-3 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-base ${themeClasses.selectedBg} cursor-pointer`}
            >
              进入留言室
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>留言室 - shuaihua&rsquo;s web</title>
      </Head>
      <div className="h-screen flex flex-col md:justify-center md:items-center">
        {/* 导航按钮 - 桌面端 */}
        <div className="hidden md:flex fixed top-4 left-4 z-10 gap-2">
          <Link
            href="/blog"
            className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
          >
            <SvgIcon name="left" width={16} height={16} color="#fff" />
            <span className="text-sm">文章集</span>
          </Link>
          <Link
            href="/"
            className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
          >
            <SvgIcon name="home" width={16} height={16} color="#fff" />
            <span className="text-sm">首页</span>
          </Link>
        </div>

        <div
          className={`flex h-full md:h-[80vh] w-full md:w-[90vw] lg:w-[80vw] ${themeClasses.mainContainer} md:rounded-[10px] md:p-[10px]`}
        >
          {/* 桌面端侧边栏 */}
          <Sidebar className="hidden md:flex w-80 rounded-l-[10px]" />

          {/* 移动端侧边栏遮罩 */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* 移动端侧边栏抽屉 */}
          <div
            className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 md:hidden ${
              isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar className="h-full" />
          </div>

          {/* 主留言区域 */}
          <div className="flex-1 flex flex-col">
            {currentRoom ? (
              <>
                {/* 留言头部 */}
                <div
                  className={`px-4 py-[10px] ${themeClasses.sidebar} border-b ${themeClasses.sidebarBorder} flex items-center justify-between rounded-r-[10px] flex-shrink-0`}
                >
                  <div className="flex items-center space-x-3 relative w-full pt-safe-top">
                    {/* 移动端菜单按钮 */}
                    <button
                    title="菜单"
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className={`md:hidden p-2 ${themeClasses.hoverBg} rounded`}
                    >
                      <SvgIcon
                        name="menu"
                        className="w-5 h-5"
                        lightColor="#6b7280"
                        darkColor="#9ca3af"
                      />
                    </button>
                    <div>
                      <div
                        className={`text-base flex gap-[20px] md:text-lg font-semibold ${themeClasses.primaryText}`}
                      >
                        {currentRoom.name}

                        {/* 在线人数显示 */}
                        <div className="flex items-center space-x-2 font-normal">
                          <div className="flex items-center space-x-1">
                            <span
                              className={`text-xs md:text-sm ${themeClasses.secondaryText}`}
                            >
                              当前留言室在线人数：{onlineUsers}
                            </span>
                          </div>
                        </div>
                      </div>
                      {currentRoom.description && (
                        <p
                          className={`text-xs md:text-sm ${themeClasses.secondaryText}`}
                        >
                          {currentRoom.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto px-3 md:px-4 py-2 md:py-4 space-y-3 md:space-y-4 custom-scrollbar">
                  {isLoadingMessages ? (
                    <MessageSkeleton />
                  ) : (
                    <>
                      {messages.map((message) => {
                        const isMyMessage = message.userId === currentUserId;
                        return (
                          <div
                            key={message.id}
                            className={`flex items-start space-x-2 md:space-x-3 ${
                              isMyMessage
                                ? "flex-row-reverse space-x-reverse"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium flex-shrink-0 ${themeClasses.selectedBg}`}
                            >
                              {message.userName.charAt(0).toUpperCase()}
                            </div>
                            <div
                              className={`flex-1 max-w-[75%] md:max-w-xs lg:max-w-md ${
                                isMyMessage ? "text-right md:mr-[10px]" : ""
                              }`}
                            >
                              <div
                                className={`flex items-center space-x-2 mb-1 ${
                                  isMyMessage
                                    ? "flex-row-reverse space-x-reverse"
                                    : ""
                                }`}
                              >
                                <span
                                  className={`text-xs ${themeClasses.secondaryText}`}
                                >
                                  {message.userName}
                                </span>
                                <span
                                  className={`text-xs ${themeClasses.secondaryText}`}
                                >
                                  {formatTime(message.createdAt)}
                                </span>
                              </div>
                              <div
                                className={`px-3 py-2 text-[14px] rounded-lg w-fit break-word ${
                                  isMyMessage
                                    ? "bg-gray-500 text-white ml-auto text-left"
                                    : themeClasses.messageBg
                                }`}
                              >
                                {message.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* 输入区域 */}
                <div
                  className={`p-3 md:p-4 border-t rounded-b-[10px] ${themeClasses.sidebarBorder} ${themeClasses.sidebar}`}
                >
                  {messageError && (
                    <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                      {messageError}
                    </div>
                  )}
                  <div className="flex items-end space-x-2 md:space-x-3">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={handleTextareaChange}
                      onKeyPress={handleKeyPress}
                      placeholder="输入消息..."
                      className={`flex-1 p-2 border rounded-lg resize-none text-base ${themeClasses.inputBg} focus:outline-none focus:ring-2 focus:ring-gray-500 custom-scrollbar`}
                      rows={1}
                      style={{ minHeight: "44px", maxHeight: "120px" }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className={`text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px] h-[44px] transition-colors ${themeClasses.selectedBg}`}
                    >
                      {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-sm md:text-base">发送</span>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div
                className={`flex-1 flex items-center justify-center ${themeClasses.primaryText}`}
              >
                <p className="text-lg">请选择一个留言室</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
