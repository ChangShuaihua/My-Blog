---
title: JavaScript重点复习（3）
published: 2026-04-25
description: ""
tags: []
category: CSDN迁移
draft: false
---

16如何获取，添加，删除，修改一个Dom 如何操作一个已有Dom的样式

一，获取Dom

```javascript
// 1. 获取单个元素
const box = document.getElementById("box");
const btn = document.querySelector(".btn"); // 类选择器
// 2. 获取多个元素并转为数组
const lis = Array.from(document.querySelectorAll("ul li"));
console.log(box, btn, lis);
```

二、添加Dom

```javascript
// 1. 获取单个元素
const box = document.getElementById("box");
const btn = document.querySelector(".btn"); // 类选择器
// 2. 获取多个元素并转为数组
const lis = Array.from(document.querySelectorAll("ul li"));
console.log(box, btn, lis);
```

三，Dom删除

```javascript
// 1. 单个元素删除（推荐）
const delItem = document.getElementById("del-item");
delItem.remove();
// 2. 批量删除（所有class为item的元素）
document.querySelectorAll(".item").forEach(item => item.remove());
```

四，Dom修改

```javascript
const target = document.getElementById("target");
// 1. 修改属性
target.src = "new-img.jpg"; // 内置属性
target.setAttribute("data-index", "2"); // 自定义属性
// 2. 修改内容
target.innerText = "修改后的纯文本内容"; // 纯文本
target.innerHTML = "<span>带HTML标签的内容</span>"; // 富文本
```

#### 五、DOM 样式操作（单段代码）

```javascript
const box = document.getElementById("box");
// 1. 直接操作style（行内样式）
box.style.width = "200px";
box.style.backgroundColor = "skyblue";
box.style.cssText = "height: 100px; color: #fff; margin: 20px auto;";
// 2. 操作classList（推荐，配合CSS）
box.classList.add("active", "big-box");
box.classList.toggle("active"); // 切换样式
box.classList.remove("big-box");
console.log(box.classList.contains("active"));
// 3. 批量替换类名
box.className = "new-style1 new-style2";
```

#### **总结**

1.  DOM 获取：单个元素用 getElementById/querySelector，批量用 querySelectorAll 并转数组；
2.  DOM 添加：先 createElement 创建元素，再用 appendChild/insertAdjacentHTML 插入；
3.  DOM 删除：单个元素直接用 remove()，批量删除通过遍历 querySelectorAll 实现；
4.  DOM 修改：属性用 setAttribute/ 点语法，内容用 innerText（纯文本）/innerHTML（富文本）；
5.  样式操作：临时单个样式用 style，多样式 / 开关状态用 classList，批量替换类名用 className。

17.代码实现点击按钮切换元素的显示/隐藏

```javascript
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>切换元素显示/隐藏</title>
  <style>
    /* 待切换元素的默认样式 */
    .target-box {
      width: 300px;
      height: 150px;
      background: #f0f7ff;
      border: 1px solid #409eff;
      margin-top: 10px;
      padding: 10px;
    }
    .toggle-btn {
      padding: 6px 16px;
      background: #409eff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <!-- 切换按钮 -->
  <button class="toggle-btn">隐藏盒子</button>
  <!-- 待切换的元素 -->
  <div class="target-box" id="targetBox">
    这是一个可以被切换显示/隐藏的盒子
  </div>

  <script>
    // 1. 获取元素
    const toggleBtn = document.querySelector('.toggle-btn');
    const targetBox = document.getElementById('targetBox');

    // 2. 绑定点击事件
    toggleBtn.addEventListener('click', function() {
      // 3. 判断元素当前显示状态
      if (targetBox.style.display === 'none') {
        // 若当前是隐藏状态，改为显示
        targetBox.style.display = 'block';
        toggleBtn.textContent = '隐藏盒子'; // 更新按钮文本
      } else {
        // 若当前是显示状态，改为隐藏
        targetBox.style.display = 'none';
        toggleBtn.textContent = '显示盒子'; // 更新按钮文本
      }
    });
  </script>
</body>
</html>
```

18、掌握基本的Dom操作，选取元素，修改内容和样式，处理事件，以及动态创建和删除元素

. 选取 DOM 元素
-----------

```javascript
// 单个元素选取
const box = document.getElementById('myBox');
const btn = document.querySelector('.my-btn');
const title = document.querySelector('h1');

// 多个元素选取与遍历
const lis = document.querySelectorAll('ul li');
lis.forEach(li => console.log(li.textContent));

// 类数组转真实数组
const items = document.getElementsByClassName('item');
const itemsArr = Array.from(items);
const filterItems = itemsArr.filter(item => item.textContent.includes('测试'));
```

2\. 修改元素内容
----------

```javascript
<div id="contentBox">原始内容</div>
<script>
  const contentBox = document.getElementById('contentBox');
  // 纯文本修改
  contentBox.textContent = '修改后的纯文本内容';
  // HTML 内容修改（支持标签解析）
  contentBox.innerHTML = '<h3 style="color: #409eff;">HTML 标题</h3><p>嵌套段落</p>';
  // 获取内容
  console.log('纯文本内容：', contentBox.textContent);
  console.log('HTML 内容：', contentBox.innerHTML);
</script>
```

#### **总结**

1.  选取元素优先使用 querySelector/querySelectorAll，适配所有 CSS 选择器，使用更灵活。
2.  样式修改推荐用类名切换（classList），而非直接操作行内样式，便于维护。
3.  动态元素的事件需在创建后绑定，删除元素优先使用 element.remove()（现代浏览器更简洁）。
4.  综合实战整合了所有 DOM 核心操作，是入门阶段的典型练手案例。