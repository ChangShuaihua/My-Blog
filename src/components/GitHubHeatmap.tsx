import { useState, useEffect } from "react";
import SvgIcon from "./SvgIcon";

// GitHub贡献数据类型定义
interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributionsData {
  total: { [year: string]: number };
  contributions: ContributionDay[];
}

interface GitHubHeatmapProps {
  username: string;
  year: number;
}

// 缓存键生成函数
const getCacheKey = (username: string, year: number) =>
  `github_contributions_${username}_${year}`;

// 缓存过期时间（24小时）
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

const GitHubHeatmap: React.FC<GitHubHeatmapProps> = ({ username, year }) => {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContributions, setTotalContributions] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 从本地存储获取缓存数据
  const getCachedData = (username: string, year: number) => {
    try {
      const cacheKey = getCacheKey(username, year);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // 检查缓存是否过期
        if (now - timestamp < CACHE_EXPIRY) {
          return data;
        } else {
          // 清除过期缓存
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error("读取缓存失败:", error);
    }
    return null;
  };

  // 保存数据到本地存储
  const setCachedData = (
    username: string,
    year: number,
    data: GitHubContributionsData
  ) => {
    try {
      const cacheKey = getCacheKey(username, year);
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error("保存缓存失败:", error);
    }
  };

  // 使用 github-contributions-api 获取贡献数据
  const fetchContributions = async (username: string, year: number) => {
    try {
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=${year}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GitHubContributionsData = await response.json();

      // 保存到缓存
      setCachedData(username, year, data);

      return data;
    } catch (error) {
      console.error("获取GitHub贡献数据失败:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadContributions = async () => {
      try {
        setLoading(true);
        setError(null);

        // 首先尝试从缓存获取数据
        const cachedData = getCachedData(username, year);

        if (cachedData) {
          console.log("使用缓存数据");
          // 过滤掉今天以后的数据
          const filteredContributions = cachedData.contributions;
          setContributions(filteredContributions);
          setTotalContributions(cachedData.total[year.toString()] || 0);
        } else {
          console.log("从API获取数据");
          // 缓存中没有数据，从API获取
          const data = await fetchContributions(username, year);

          // 过滤掉今天以后的数据
          const filteredContributions = data.contributions;

          setContributions(filteredContributions);
          setTotalContributions(data.total[year.toString()] || 0);
        }
      } catch {
        setError("获取GitHub数据失败，请检查用户名或网络连接");
        setContributions([]);
        setTotalContributions(0);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadContributions();
    }
  }, [username, year]);

  // 获取颜色
  const getColor = (level: number): string => {
    const colors = {
      0: "#161b22", // 无提交
      1: "#0e4429", // 少量提交
      2: "#006d32", // 中等提交
      3: "#26a641", // 较多提交
      4: "#39d353", // 大量提交
    };
    return colors[level as keyof typeof colors] || colors[0];
  };

  // 按周分组
  const getWeeks = () => {
    if (contributions.length === 0) return [];

    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];

    // 获取年份的第一天是星期几
    const firstDay = new Date(year, 0, 1);
    const firstDayOfWeek = firstDay.getDay();

    // 填充第一周的空白天数
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: "", count: 0, level: 0 });
    }

    contributions.forEach((day) => {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    // 处理最后一周
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: "", count: 0, level: 0 });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = getWeeks();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[15px] text-[#fff] w-full max-w-full">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-[#3d85a9] rounded animate-spin"></div>
          <span>加载GitHub贡献图...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[15px] text-[#fff] w-full max-w-full">
        <div className="text-red-400">
          <div className="font-semibold mb-2">⚠️ 加载失败</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] overflow-x-auto custom-scrollbar">
      <div className="mb-[12px]">
        <h3 className="text-[16px] font-semibold mb-[1px] flex items-center gap-2">
          <SvgIcon name="github" width={20} height={20} color="#fff" />
          {year}年GitHub提交
        </h3>
        <p className="text-[12px] text-[rgba(255,255,255,0.7)]">
          {totalContributions} contributions in {year}
        </p>
        <p className="text-[12px] text-[rgba(255,255,255,0.7)]">
          {totalContributions} 次提交在 2025年
        </p>
      </div>

      <div className="relative">
        {/* 月份标签 */}
        <div className="flex mb-[8px] text-[10px] text-[rgba(255,255,255,0.7)] pl-[20px]">
          {months.map((month, monthIndex) => {
            // 计算每个月对应的周数
            const monthWeeks = weeks.filter((week, weekIndex) => {
              const weekDate = new Date(year, 0, 1 + weekIndex * 7);
              return weekDate.getMonth() === monthIndex;
            }).length;

            return (
              <div
                key={month}
                className="text-center flex-shrink-0"
                style={{
                  width: `${Math.max(monthWeeks * 12, 26)}px`,
                }}
              >
                {month}
              </div>
            );
          })}
        </div>

        <div className="flex">
          {/* 星期标签 */}
          <div className="flex flex-col mr-[8px] text-[10px] text-[rgba(255,255,255,0.7)] flex-shrink-0">
            {weekdays.map((day, index) => (
              <div
                key={day}
                className="h-[11px] flex items-center mb-[2px] last:mb-0"
              >
                {index % 2 === 1 ? day.slice(0, 1) : ""}
              </div>
            ))}
          </div>

          {/* 热力图网格 */}
          <div className="flex gap-[1px] min-w-0">
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="flex flex-col gap-[2px] flex-shrink-0"
              >
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-[11px] h-[11px] rounded-[2px] cursor-pointer hover:ring-1 hover:ring-white transition-all relative group"
                    style={{ backgroundColor: getColor(day.level) }}
                  >
                    {/* 悬停提示 */}
                    {day.date && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {day.date}: {day.count} contributions
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 图例 */}
        <div className="flex items-center justify-between mt-[15px] text-[10px] text-[rgba(255,255,255,0.7)]">
          <span>Less</span>
          <div className="flex gap-[2px] items-center">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-[11px] h-[11px] rounded-[2px]"
                style={{ backgroundColor: getColor(level) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default GitHubHeatmap;
