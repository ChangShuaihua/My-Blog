import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import fs from 'fs-extra';
import path from 'path';
import dayjs from 'dayjs';

// 👉 你的 CSDN
const BASE_URL = 'https://blog.csdn.net/changshuaihua001?type=blog'

// 👉 输出目录
const OUTPUT_DIR = 'D:/blok//template-web-main/template-web-main/src/blogs/csdn'

// 👉 最大页数（防死循环）
const MAX_PAGE = 10;

const turndown = new TurndownService({
  codeBlockStyle: 'fenced',
});
// 模拟浏览器请求（防爬）
async function fetchPage(url) {
  return axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      Referer: 'https://blog.csdn.net/',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9',
    },
    timeout: 10000,
  });
}
// 延迟
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// 下载图片
async function downloadImage(url, filePath) {
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        Referer: 'https://blog.csdn.net/',
        'User-Agent': 'Mozilla/5.0',
      },
    });
    await fs.writeFile(filePath, res.data);
  } catch {
    console.log('❌ 图片失败:', url);
  }
}
// 获取文章列表（🔥已防死循环）
async function getArticleLinks() {
  let page = 1;
  let links = [];
  while (page <= MAX_PAGE) {
    const url = `${BASE_URL}/article/list/${page}`;
    console.log('📄 列表页:', url);
    try {
      const { data } = await fetchPage(url);
      const $ = cheerio.load(data);

      let pageLinks = $('a[href*="/article/details/"]')
        .map((_, el) => $(el).attr('href'))
        .get();

      if (pageLinks.length === 0) break;

      pageLinks = pageLinks.map((link) =>
        link.startsWith('http') ? link : 'https://blog.csdn.net' + link
      );

      const prevLength = links.length;

      links.push(...pageLinks);

      // 如果没有新增文章 → 停止
      if (links.length === prevLength) {
        console.log('⚠️ 没新文章，停止翻页');
        break;
      }

      page++;
      await sleep(800);
    } catch {
      console.log('❌ 列表页失败');
      break;
    }
  }

  return [...new Set(links)];
}

// 处理文章
async function processArticle(url) {
  console.log('📝 文章:', url);

  try {
    const { data } = await fetchPage(url);
    const $ = cheerio.load(data);

    const title = $('.title-article').text().trim() || '无标题';
    const date = $('.time').first().text().trim();
    const content = $('#content_views');

    if (!content || content.length === 0) {
      console.log('⚠️ 被拦截:', url);
      return;
    }

    // slug
    const slug = title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);

    const postDir = path.join(OUTPUT_DIR, slug);
    const imgDir = path.join(postDir, 'images');

    // 防重复
    if (await fs.pathExists(path.join(postDir, 'index.md'))) {
      console.log('⏭️ 已存在:', title);
      return;
    }

    await fs.ensureDir(imgDir);

    // 图片处理
    const imgs = content.find('img');

    for (let i = 0; i < imgs.length; i++) {
      const img = imgs.eq(i);
      let src = img.attr('src') || img.attr('data-src');

      if (!src) continue;

      if (src.startsWith('//')) src = 'https:' + src;

      const ext = path.extname(src).split('?')[0] || '.png';
      const fileName = `img-${i}${ext}`;
      const filePath = path.join(imgDir, fileName);

      await downloadImage(src, filePath);
      img.attr('src', `./images/${fileName}`);
    }

    // 转 markdown
    const html = content.html();
    const md = turndown.turndown(html);

    const published = dayjs(date).isValid()
      ? dayjs(date).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');

    const frontmatter = `---
title: ${title}
published: ${published}
description: ""
tags: []
category: CSDN迁移
draft: false
---

`;

    await fs.writeFile(path.join(postDir, 'index.md'), frontmatter + md);

    console.log('✅ 完成:', title);
  } catch {
    console.log('❌ 失败:', url);
  }
}

// 主函数
async function run() {
  await fs.ensureDir(OUTPUT_DIR);

  const links = await getArticleLinks();

  console.log(`\n🚀 共 ${links.length} 篇文章\n`);

  for (const link of links) {
    await processArticle(link);
    await sleep(1000);
  }

  console.log('\n🎉 全部完成！');
}

run();
