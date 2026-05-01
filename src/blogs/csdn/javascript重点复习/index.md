---
title: Javascript重点复习
published: 2026-04-25
description: ""
tags: []
category: CSDN迁移
draft: false
---

1，变量和常量的区别：

维度

变量

常量

可修改性

声明后可以被重新赋值

声明时必须赋值，且不可修改

作用域

let 为块级作用域，var为函数/全局作用域

块级作用域

适用场景

值需要动态变化的场景

固定值

2.写一个函数判断一个js变量的数据类型：

```javascript
<script>
function getDateType(value){
    return Object.prototype.toString.call(value).slice(8,-1).tolowerCase();
}
</script>
```

**3.==和===区别，为什么推荐使用===**

\==：抽象相等，会自动转换类型后比较（如1==“1”结果为true）。

\===严格相等，不转换类型，类型和值都相同·才返回true（“如1===“1”返回值为false）。

推荐===，避免隐式转换类型导致不可预计结果（如“”==0为true），逻辑更清晰。

**4.mull和undefined的区别**

类型

null

undefined

含义

表示空值（主动赋值的空）

表示未定义（变量声明未赋值）

类型检测

typeof null →“object”

typeof undefined→undefined

场景

主动清空变量（如 let obj = null）

变量未初始化，函数无返回值

**5.&&和||什么时候使用，举个例子**

&&逻辑与，||逻辑或，

&&所有条件都成立时才成立。

例子：

*   表单验证（用户名 + 密码都不能为空）；
*   权限判断（登录状态 && 管理员身份）；
*   功能触发（按钮可点击 && 数据已加载）。

||有一个条件成立时就成立。

*   登录验证（手机号 || 邮箱均可登录）；
*   数据兜底（取有值的变量，避免undefind；
*   功能触发（点击按钮 || 按回车，都触发搜索）。

**6.什么是三目运算符？2什么时候使用，举个例子**

结构语法：

```javascript
条件表达式？表达式1：表达式2
```

**执行逻辑**：

1.  先判断「条件表达式」的布尔值（自动隐式转换）；
2.  如果为 ture，执行并返回「表达式 1」的结果；
3.  如果为 false，执行并返回「表达式 2」的结果。

它是 if……else语句的简洁写法，核心作用是用一行代码完成简单的条件判断与值返回。

**7.不同运算符的优先级顺序是什么？**

括号 > 一元 > 乘除 > 加减 > 关系 > 相等 > 逻辑 > 三目 > 赋值 > 逗号；

**8.for，forEach，for……of的区别？**

###### **1\. 传统 for 循环**

**核心**：手动控制遍历的索引、起始 / 结束条件、步长，灵活性最高，性能最好。

**语法**：for （初始化；条件；步长）{逻辑}

示例

```javascript
const arr = [10, 20, 30];
// 基础遍历
for (let i = 0; i < arr.length; i++) {
  console.log(`索引${i}：${arr[i]}`); // 索引0：10 | 索引1：20 | 索引2：30
}

// 中断遍历（break）
for (let i = 0; i < arr.length; i++) {
  if (arr[i] === 20) break; // 遇到20停止遍历
  console.log(arr[i]); // 仅输出10
}

// 异步场景（await 生效）
async function test() {
  const arr = [1, 2, 3];
  for (let i = 0; i < arr.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(arr[i]); // 每隔1秒输出1、2、3（阻塞遍历）
  }
}
test();
```

###### 2. forEach

核心：数组原型方法，回调式遍历，简洁但灵活性差（无法中断）。

语法：arr.forEach((value,index,array)=>{逻辑}

示例：

```javascript
const arr = [10, 20, 30];
// 基础遍历
arr.forEach((val, idx) => {
  console.log(`索引${idx}：${val}`); // 同for循环输出
});

// 无法中断（break 报错）
try {
  arr.forEach(val => {
    if (val === 20) break; // Uncaught SyntaxError: Illegal break statement
  });
} catch (e) {
  console.error(e);
}

// 回调内return仅跳出当前回调（不会终止遍历）
arr.forEach(val => {
  if (val === 20) return; // 跳过20，继续遍历30
  console.log(val); // 输出10、30
});

// 异步陷阱（await 不阻塞）
async function test() {
  const arr = [1, 2, 3];
  arr.forEach(async val => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(val); // 1秒后同时输出1、2、3（无阻塞）
  });
}
test();
```

###### 3. for……of

核心：ES6 迭代器语法，兼顾简洁性和灵活性，支持大部分可迭代对象。

语法: for(const value of 可迭代对象){逻辑}

```javascript
const arr = [10, 20, 30];
// 基础遍历（直接取值）
for (const val of arr) {
  console.log(val); // 10、20、30
}

// 中断遍历（break/continue 生效）
for (const val of arr) {
  if (val === 20) break;
  console.log(val); // 仅输出10
}

// 遍历其他可迭代对象（字符串/Map）
const str = "abc";
for (const char of str) console.log(char); // a、b、c

const map = new Map([["a", 1], ["b", 2]]);
for (const [key, value] of map) {
  console.log(`${key}: ${value}`); // a:1、b:2
}

// 异步支持（await 生效）
async function test() {
  const arr = [1, 2, 3];
  for (const val of arr) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(val); // 每隔1秒输出1、2、3（阻塞遍历）
  }
}
test();

// 获取索引（结合 Array.prototype.entries()）
for (const [idx, val] of arr.entries()) {
  console.log(`索引${idx}：${val}`); // 索引0：10 | 索引1：20 | 索引2：30
}
```

1.  **优先用** for...of：大部分日常场景（遍历数组 / 字符串 / Map/Set、需要中断、异步遍历），兼顾简洁和灵活，是 ES6 推荐的遍历方式。
2.  **用传统** for **循环**：

*   性能要求极高（如超大数组遍历，无函数调用开销）；
*   需要手动控制步长（如 i += 2 跳着遍历）；
*   兼容极低版本浏览器（如 IE8 及以下）。

1.  **用** forEach：仅当：① 无需中断遍历；② 代码追求极简（一行回调）；③ 明确不需要异步阻塞。❌ 避免：异步遍历、需要中断的场景。

*   forEach 对空数组不会执行回调，且无法遍历对象（需用 Object.keys(obj).forEach()）；
*   for...of 不能直接遍历普通对象（需先转成可迭代对象，如 Object.entries(obj)）；
*   传统 for 循环可遍历类数组（如 arguments、DOM 集合），forEach 需要先转数组（如 Array.from(arguments).forEach()）。

**9.什么是作用域？js中有哪些作用域?**

作用域本质是变量/函数的可访问范围

**作用域就是变量的 “管辖范围”**