// 不文明词汇字典（只包含多字敏感词，避免单字误拦）
const PROFANITY_WORDS = {
  // 中文多字不文明词汇（不包含单字，防止误伤：如"妈妈""马上""吃饭了吗"）
  chinese: [
    "鸡鸡很大",
    "你妈的",
    "傻逼",
    "煞笔",
    "操你妈",
    "草泥马",
    "卧槽泥马",
    "他妈的",
    "去你妈的",
    "死全家",
    "滚蛋",
    "滚开",
    "脑残",
    "智障",
    "白痴",
    "废物点心",
    "贱人",
    "婊子",
    "妓女",
    "鸡婆",
    "狗屎",
    "狗日的",
    "狗娘养的",
    "王八蛋",
    "龟儿子",
    "畜生",
    "你妈逼",
    "你麻痹",
    "你码比",
    "妈逼",
    "妈比",
    "马币",
    "麻痹",
    "尼玛",
    "尼玛的",
    "操你吗",
    "卧槽",
    "我靠",
    "妈的",
    "妈了个逼",
    "我操",
    "我草",
    "臭傻逼",
    "大傻逼",
    "臭流氓",
    "色狼",
    "变态",
    "恶心人",
  ],
  // 英文不文明词汇（不含常见正常词汇 dog/can/smart 等）
  english: [
    "fuck you",
    "motherfucker",
    "son of a bitch",
    "bullshit",
    "dumbass",
    "jackass",
    "asshole",
    "cock sucker",
    "cocksucker",
    "dickhead",
    "pussy",
    "nigga",
    "nigger",
    "retard",
    "whore",
    "slut",
    "prostitute",
    "pornography",
    "penis",
    "vagina",
    "dildo",
  ],
  // 拼音和缩写（只收录公认粗口缩写）
  abbreviations: [
    "nmsl",
    "jjhd",
    "cnm",
    "tmb",
    "wdnmd",
    "mmp",
    "nmb",
    "rnmb",
    "qnmlgb",
    "gck",
    "wsnd",
    "fuck",
    "fucker",
    "fucking",
    "shit",
    "bitch",
    "bastard",
    "damn",
    "wtf",
    "stfu",
    "piss off",
  ],
};

// 敏感词替换字符
const REPLACEMENT_CHAR = "*";

// 将所有词库汇总并按长度从长到短排序，避免"妈的"先替换掉"你妈的"一部分
const ALL_PROFANITY = Array.from(
  new Set([
    ...PROFANITY_WORDS.chinese,
    ...PROFANITY_WORDS.english,
    ...PROFANITY_WORDS.abbreviations,
  ])
).sort((a, b) => b.length - a.length);

/**
 * 检查文本是否包含不文明内容
 * 使用边界匹配，避免英文中常见前缀/后缀误判；中文按多字词精确子串匹配
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return ALL_PROFANITY.some((word) => {
    const w = word.toLowerCase();
    // 纯英文单词：使用单词边界
    if (/^[a-z0-9\s'-]+$/i.test(word)) {
      const pattern = new RegExp(
        `(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`,
        "i"
      );
      return pattern.test(lower);
    }
    // 中文多字词：直接子串匹配
    return lower.includes(w);
  });
}

/**
 * 过滤文本中的不文明内容，用星号替换
 */
export function filterProfanity(text: string): string {
  if (!text) return text;
  let result = text;
  for (const word of ALL_PROFANITY) {
    let regex;
    if (/^[a-z0-9\s'-]+$/i.test(word)) {
      // 纯英文单词：边界匹配后再替换
      regex = new RegExp(
        `(^|[^a-z0-9])(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})([^a-z0-9]|$)`,
        "gi"
      );
      result = result.replace(regex, (_m, pre, target, post) =>
        `${pre}${REPLACEMENT_CHAR.repeat(target.length)}${post}`
      );
    } else {
      // 中文：直接全局替换
      regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      result = result.replace(regex, REPLACEMENT_CHAR.repeat(word.length));
    }
  }
  return result;
}

/**
 * 验证昵称是否合法（不能是保留昵称shuaihua且不能包含不文明词汇）
 */
export function isValidNickname(nickname: string): boolean {
  const trimmed = nickname?.trim();
  if (!trimmed) return false;
  if (trimmed.length > 20) return false;
  if (isAuthor(trimmed)) return false;
  if (containsProfanity(trimmed)) return false;
  return true;
}

/**
 * 检查昵称是否为作者保留名
 */
export function isAuthor(nickname: string): boolean {
  const trimmed = nickname?.trim().toLowerCase();
  return trimmed === "shuaihua";
}
