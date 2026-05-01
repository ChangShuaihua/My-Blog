---
title: React 入门
published: 2026-04-25
description: ""
tags: []
category: CSDN迁移
draft: false
---

本文针对 React 入门学习者，围绕「组件认知、事件绑定、useState 状态管理、样式操作」四大核心知识点，采用 **函数组件+最新 Hook 写法**，结合可直接复制运行的代码示例、详细注释、常见问题解析和拓展用法，层层递进讲解，学完可独立完成基础 React 页面开发，轻松搭建带交互效果的简单应用。

一、React 组件初步认识
--------------

### 1\. 组件的核心意义

React 的核心思想是「组件化开发」，即将复杂的页面拆分成一个个独立、可复用、可维护的代码片段（组件），就像搭积木一样，将不同功能的“积木”拼接起来，组成完整的页面。这种方式的优势在于：

*   复用性：相同功能的组件可在多个页面、多个场景中重复使用，减少重复代码，提高开发效率；
    
*   可维护性：组件独立存在，修改一个组件不会影响其他组件，后期迭代、bug 修复更便捷；
    
*   可读性：页面结构清晰，每个组件负责特定功能，便于团队协作和后续代码查阅。
    

### 2\. 组件的分类

React 中的组件主要分为两类，目前主流且推荐使用的是函数组件，类组件已逐步被淘汰（了解即可）。

#### （1）函数组件（推荐）

本质是一个**返回 JSX 结构** 的 JavaScript 普通函数，语法简洁、易于理解，配合 Hook 可实现所有类组件的功能，是 React 16.8 之后的主流写法。

```
// 1. 导入React（React 18+ 中，在组件文件中可省略，但建议保留，避免后续报错）
import React from "react";

// 2. 定义函数组件：首字母必须大写（React 区分组件和普通函数的核心规则）
// 组件名称建议使用帕斯卡命名法（PascalCase），如：HelloWorld、UserCard
function HelloReact() {
  // 组件内部可定义变量、函数（后续结合事件、状态使用）
  const greeting = "欢迎学习 React 组件！";
  
  // 组件必须返回一个 JSX 结构（JSX 是 HTML 和 JavaScript 的结合体，后续会详细讲解）
  // 注意：一个组件只能有一个根节点（可用 <div>、<> 空标签或 <Fragment> 包裹）
  return (
    <>
      <h2>{greeting}</h2> {/* 用 {} 包裹 JavaScript 表达式，读取变量 */}
      <p>这是一个简单的函数组件</p>
    </>
  );
}

// 3. 导出组件：供其他文件导入使用（默认导出，一个文件只能有一个默认导出）
export default HelloReact;
```

#### （2）类组件（了解即可）

基于 ES6 的 class 语法创建，需要继承 React.Component，通过 render() 方法返回 JSX，写法相对繁琐，目前已不推荐使用，仅在旧项目中可能遇到。

```
import React from "react";

// 类组件：继承 React.Component
class HelloReact extends React.Component {
  // render() 方法是类组件的核心，必须有，返回 JSX
  render() {
    const greeting = "欢迎学习 React 组件！";
    return (
      <div>
        <h2>{greeting}</h2>
        <p>这是一个类组件（了解即可）</p>
      </div>
    );
  }
}

export default HelloReact;
```

### 3\. 组件的嵌套与复用

组件之间可以相互嵌套，形成“父组件-子组件”的层级关系，这是搭建复杂页面的基础；同时，组件可以无限复用，降低开发成本。

示例（父组件嵌套多个子组件，实现复用）：

```
import React from "react";

// 子组件1：按钮组件（可复用）
function Button({ text, onClick }) {
  // 通过 props 接收父组件传递的数据（后续会详细讲解 props）
  return (
    <button onClick={onClick} style={{ margin: "0 5px" }}>
      {text}
    </button>
  );
}

// 子组件2：文本展示组件（可复用）
function TextDisplay({ content }) {
  return <p style={{ fontSize: "18px", color: "#333" }}>{content}</p>;
}

// 父组件：App 组件（页面入口组件）
function App() {
  // 父组件定义数据和事件，传递给子组件
  const handleClick = (msg) => {
    alert(msg);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>父组件</h1>
      {/* 复用子组件1：传递不同的 text 和 onClick 事件 */}
      <Button text="点击提示" onClick={() => handleClick("子组件按钮被点击了！")} />
      <Button text="清空提示" onClick={() => handleClick("清空成功！")} />
      {/* 复用子组件2：传递不同的 content */}
      <TextDisplay content="这是第一个文本内容" />
      <TextDisplay content="这是第二个文本内容" />
    </div>
  );
}

export default App;
```

### 4\. 组件的关键规则（必记）

*   组件名 **首字母必须大写**：React 会将首字母小写的函数识别为普通 JavaScript 函数，而非组件，会导致报错；
    
*   一个组件只能有 **一个根节点**：如果需要返回多个元素，可用空标签 <></>（推荐）或 <Fragment></Fragment> 包裹，不能直接返回多个并列的标签；
    
*   JSX 语法规则：标签必须闭合（如 <input />），属性用小驼峰命名（如 className 而非 class）；
    
*   组件内部不能直接修改父组件传递的数据（props 只读），后续会讲解如何通过回调函数实现父子组件通信。
    

### 5\. 拓展：组件的拆分原则

入门阶段拆分组件，遵循“单一职责原则”即可：一个组件只负责一个功能，避免一个组件过于庞大。例如：

*   页面头部 → Header 组件；
    
*   页面导航 → Nav 组件；
    
*   列表项 → ListItem 组件；
    
*   表单 → Form 组件（内部可拆分 Input、Button 子组件）。
    

二、React 事件绑定（详细版）
-----------------

### 1\. 核心规则（与原生 JS 的区别，必记）

React 事件绑定的本质是“合成事件”（React 对原生 DOM 事件的封装），目的是解决跨浏览器兼容性问题，用法与原生 JS 类似，但有 3 个关键区别：

*   事件名采用 **小驼峰命名**：如 onClick（而非原生的 onclick）、onChange（而非 onchange）、onSubmit（而非 onsubmit）；
    
*   事件处理函数是 **JavaScript 表达式**，必须用 {} 包裹（原生 JS 是字符串形式）；
    
*   不能直接写函数调用（如 onClick={handleClick()}），否则组件渲染时会立即执行函数，而非点击时执行。
    

### 2\. 四种常用绑定写法（覆盖所有场景）

函数组件中，事件绑定的写法灵活，以下四种写法覆盖了无参、有参、简单逻辑、复杂逻辑等所有常见场景，重点掌握前两种。

```
import React from "react";

function App() {
  // 场景1：无参数、逻辑简单的事件处理函数
  const handleClick1 = () => {
    alert("无参点击事件，最常用！");
  };

  // 场景2：有参数的事件处理函数（核心写法）
  const handleClick2 = (msg, num) => {
    alert(`有参点击：${msg}，数字是 ${num}`);
  };

  // 场景3：逻辑复杂的事件处理函数（拆分到单独函数，便于维护）
  const handleInputChange = (e) => {
    // e 是 React 合成事件对象，类似原生 JS 的 event
    console.log("输入框内容：", e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 写法1：无参 → 直接写函数名（最常用，推荐） */}
      <button onClick={handleClick1} style={{ margin: "5px" }}>
        无参点击
      </button>

      {/* 写法2：有参 → 箭头函数包裹（必用，避免立即执行） */}
      <button onClick={() => handleClick2("Hello", 123)} style={{ margin: "5px" }}>
        有参点击
      </button>

      {/* 写法3：内联箭头函数（简单逻辑直接写，无需单独定义函数） */}
      <button onClick={() => alert("内联点击，逻辑简单时使用")} style={{ margin: "5px" }}>
        内联点击
      </button>

      {/* 写法4：带事件对象 e + 参数（需注意 e 的位置） */}
      <input
        type="text"
        placeholder="请输入内容"
        // 若需要同时传递 e 和自定义参数，e 需作为箭头函数的第一个参数
        onChange={(e) => handleInputChange(e)}
        style={{ margin: "5px", padding: "5px" }}
      />
    </div>
  );
}

export default App;
```

### 3\. 合成事件对象 e 的常用属性和方法

React 合成事件对象 e 与原生 JS 的 event 对象用法基本一致，以下是入门常用的属性和方法，足以应对基础开发：

*   e.target：获取触发事件的 DOM 元素（最常用），如 e.target.value（获取输入框内容）、e.target.innerText（获取元素文本）；
    
*   e.preventDefault()：阻止默认行为，如阻止表单提交、阻止 a 标签跳转；
    
*   e.stopPropagation()：阻止事件冒泡，避免父组件事件被触发；
    
*   e.currentTarget：获取绑定事件的 DOM 元素（与 e.target 区别：e.target 是实际触发事件的元素，e.currentTarget 是绑定事件的元素）。
    

```
import React from "react";

function App() {
  // 阻止表单默认提交行为
  const handleFormSubmit = (e) => {
    e.preventDefault(); // 阻止表单默认刷新页面的行为
    const inputVal = e.target[0].value; // 获取表单中第一个输入框的内容
    alert(`表单提交，输入内容：${inputVal}`);
  };

  return (
    <form onSubmit={handleFormSubmit} style={{ margin: "20px" }}>
      <input
        type="text"
        placeholder="请输入内容"
        style={{ padding: "5px", marginRight: "10px" }}
      />
      <button type="submit">提交</button>
    </form>
  );
}

export default App;
```

### 4\. 常用事件汇总（入门必备）

以下是 React 开发中最常用的事件，记熟这些，可应对 90% 的基础交互场景：

React 事件名（小驼峰）

触发场景

常用场景

onClick

鼠标点击元素

按钮点击、卡片点击、导航跳转

onChange

表单元素内容变化

输入框、下拉框、复选框内容同步

onSubmit

表单提交（点击提交按钮或按回车）

登录表单、注册表单、搜索表单

onMouseEnter

鼠标进入元素

hover 效果、显示下拉菜单

onMouseLeave

鼠标离开元素

隐藏下拉菜单、取消 hover 效果

onKeyUp

键盘按键抬起

按回车触发搜索、快捷键操作

### 5\. 常见易错点（避坑指南）

*   易错点1：事件绑定写成 onClick={handleClick()} → 错误！会导致组件渲染时立即执行函数，而非点击时执行，正确写法是 onClick={handleClick}（无参）或 onClick={() => handleClick()}（有参）；
    
*   易错点2：混淆事件名大小写 → 错误！如 onlick、onChange（首字母小写），正确写法是 onClick、onChange（小驼峰）；
    
*   易错点3：无法获取 e.target.value → 检查是否在事件函数中正确接收 e 参数，且触发事件的元素是表单元素（如 input、textarea）；
    
*   易错点4：阻止默认行为无效 → 确保 e.preventDefault() 写在事件函数的最前面，且事件绑定在正确的元素上（如表单的 onSubmit 事件，而非按钮的 onClick 事件）。