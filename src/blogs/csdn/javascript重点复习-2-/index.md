---
title: JavaScript重点复习（2）
published: 2026-04-25
description: ""
tags: []
category: CSDN迁移
draft: false
---

10.什么是匿名函数，什么是构造函数，什么是立即执行函数，分别有什么使用场景？

1.匿名函数：匿名函数就是**没有指定函数名称的函数**，它的核心结构只有 function 关键字、参数和函数体，没有函数名标识。

// 匿名函数的基本形式 function (param1, param2) { return param1 + param2; }

#### **注意：匿名函数无法直接独立执行（会报错），必须通过赋值、作为参数传递等方式绑定引用或使用**

#### **特点**

*   没有函数名，只能通过变量引用或立即调用
*   常用于回调函数、立即执行等场景
*   不会污染全局命名空间

**场景 1：赋值给变量 / 常量，作为普通函数使用**

// 赋值给变量，成为具名引用的函数 const sum = function (a, b) { return a + b; }; console.log(sum(1, 2)); // 输出 3

**场景 2：作为回调函数（核心场景）**

在异步操作（如定时器、AJAX）、数组方法（map/filter/reduce）中，匿名函数常作为回调传递，避免多余的具名函数声明，让代码更简洁。

// 数组方法中的匿名回调 const arr = \[1, 2, 3, 4\]; const evenArr = arr.filter(function (item) { return item % 2 === 0; // 筛选偶数 }); console.log(evenArr); // 输出 \[2, 4\] // 定时器中的匿名回调 setTimeout(function () { console.log("2秒后执行"); }, 2000);

**场景 3：作为对象的方法**

给对象定义方法时，可直接使用匿名函数，简化对象字面量的写法。

const person = { name: "张三", sayHello: function () { // 匿名函数作为对象方法 console.log(\`你好，我是${this.name}\`); } }; person.sayHello(); // 输出 "你好，我是张三"

11,什么是回调函数，有那些使用场景

回调函数的核心是「**把函数作为参数传递给另一个函数，当满足特定条件或时机时，被传递的这个函数会被调用执行**」。

你可以这样类比：你去餐厅吃饭，点完餐后把自己的手机号（回调函数）留给服务员（主函数），服务员做好饭后（满足条件），就会拨打你的手机号（调用回调函数）通知你取餐。

// 主函数：接收一个函数作为参数（这个参数就是回调函数） function doSomething(callback) { console.log("主函数执行一些操作..."); // 满足条件后，调用回调函数 callback(); } // 回调函数：被传递给主函数的函数 function myCallback() { console.log("回调函数被执行了！"); } // 调用主函数，传入回调函数 doSomething(myCallback); // 输出： // 主函数执行一些操作... // 回调函数被执行了！

##### **3\. 核心特点**

*   回调函数是「被动执行」的：它不会自己主动运行，而是由接收它的主函数在合适时机触发。
*   支持灵活扩展：主函数负责核心逻辑，回调函数负责自定义逻辑，无需修改主函数即可改变最终效果。
*   可传递参数：回调函数可以接收主函数传递的参数，实现数据交互。

##### **1\. 处理异步操作（核心场景）**

JavaScript 是单线程语言，异步操作（如定时器、网络请求、文件读取）不会阻塞主线程，此时需要用回调函数来处理异步操作完成后的逻辑。

定时器·

// 3秒后执行回调函数 setTimeout(() => { console.log("3秒到了，执行回调"); // 异步回调 }, 3000); // 每隔1秒执行一次回调函数 const timer = setInterval(() => { console.log("每隔1秒执行一次"); }, 1000); // 5秒后停止定时器 setTimeout(() => { clearInterval(timer); console.log("停止定时器"); }, 5000);

12，什么是闭包，闭包形成的条件是什么，有哪些典型应用场景

闭包的核心是：**一个内部函数，能够访问并持有其外部函数作用域中的变量（即使外部函数已经执行完毕并销毁），这种函数与它所处的作用域环境的组合，就叫做闭包**。

你可以这样类比：外部函数相当于一个「房间」，里面的变量是「房间里的物品」，内部函数相当于「带着房间钥匙的人」。即使房间（外部函数）被关闭（执行完毕），这个人（内部函数）依然能用钥匙（闭包）打开房间，访问里面的物品（外部变量）。

### **闭包形成的条件**

1.  **函数嵌套**：存在函数嵌套（外部函数包含内部函数）
2.  **内部函数引用外部变量**：内部函数引用了外部函数的变量或参数
3.  **内部函数被外部引用**：内部函数被返回或在外部被调用

13，不同情况下，this的指向是什么

场景类型

this指向

示例

全局作用域 / 普通函数直接调用

浏览器：window；Node.js：global；严格模式：undefined

function fn(){console.log(this)}; fn()

对象的方法调用

调用该方法的对象（左边的对象）

obj.fn()

→

this

指向

obj

构造函数（

new

调用）

new创建的新实例对象

new Person()

→

this

指向实例

DOM 事件监听函数

绑定事件的 DOM 元素（区别于

e.target

）

btn.onclick = function(){console.log(this)}

call

/

apply

调用

第一个参数指定的对象

fn.call(obj)

→

this

指向

obj

bind

调用

第一个参数指定的对象（返回新函数）

const newFn = fn.bind(obj)

→ 新函数

this

指向

obj

箭头函数

外层作用域的

this

（定义时绑定）

const fn = () => {console.log(this)}

#### **总结**

1.  核心规则：this 指向「函数调用时的调用者」，定义时无法确定；
2.  常规场景优先级：构造函数（new）> 对象方法 > 普通函数调用 > 全局作用域；
3.  特殊修改：call/apply/bind 可手动修改 this，优先级高于常规场景；
4.  特殊函数：箭头函数无自身 this，继承外层作用域的 this，且无法被修改。

14.如何创建，删除，修改，查询对象

1，创建对象的四种方法

1、这是创建单个对象最常用的方式，用{ } 直接定义属性和方法。

// 空对象 const obj1 = {}; // 带属性和方法的对象 const person = { name: "张三", age: 20, sayHello: function () { console.log(\`你好，我是${this.name}\`); } }; // ES6 简化写法（方法可省略 function 关键字） const person2 = { name: "李四", age: 25, sayHello() { // 简化写法 console.log(\`你好，我是${this.name}\`); } };

2、通过new 调用构造函数，创建实例对象

// 定义构造函数（首字母大写） function Person(name, age) { this.name = name; this.age = age; this.sayHello = function () { console.log(\`你好，我是${this.name}\`); }; } // 创建实例对象 const person1 = new Person("张三", 20); const person2 = new Person("李四", 25); person1.sayHello(); // 输出：你好，我是张三

##### **3\. Object 构造函数（内置构造函数，较少直接使用）**

通过 new Object() 创建对象，等价于对象字面量 {}，日常使用较少。

// 空对象 const obj = new Object(); // 带属性的对象 const car = new Object(); car.brand = "宝马"; car.price = 300000; console.log(car); // 输出：{ brand: '宝马', price: 300000 }

##### **4\. Object.create ()（基于原型创建对象）**

创建一个新对象，指定其原型对象，适合实现对象继承。

// 原型对象 const animal = { type: "动物", eat() { console.log("进食中..."); } }; // 基于 animal 原型创建 dog 对象 const dog = Object.create(animal); dog.name = "旺财"; dog.bark = function () { console.log("汪汪汪"); }; console.log(dog.type); // 输出：动物（继承原型属性） dog.eat(); // 输出：进食中...（继承原型方法）

#### **二、查询对象（获取对象属性 / 方法）**

##### **1\. 点语法（. ，推荐，可读性高）**

适用于属性名是「合法标识符」（不含空格、特殊字符，不是关键字）的场景。

const person = { name: "张三", age: 20 }; // 查询属性 console.log(person.name); // 输出：张三 console.log(person.age); // 输出：20 // 查询方法并调用 person.sayHello = function () { console.log(\`你好，我是${this.name}\`); }; person.sayHello(); // 输出：你好，我是张三

##### **2\. 方括号语法（【】，灵活）**

适用于属性名包含空格、特殊字符，或属性名是变量 / 表达式的场景。

const person = { "full name": "张三", // 属性名带空格 age: 20, "user-Id": 1001 // 属性名带连字符 }; // 1. 属性名带特殊字符 console.log(person\["full name"\]); // 输出：张三 console.log(person\["user-Id"\]); // 输出：1001 // 2. 属性名是变量 const propName = "age"; console.log(person\[propName\]); // 输出：20 // 3. 属性名是表达式 console.log(person\["age" + 1\]); // 输出：undefined（不存在 age1 属性）

##### **3\. Object.keys () / Object.values () / Object.entries ()（批量查询）**

*   Object.keys(obj)：返回对象自身所有「可枚举属性名」的数组；
*   Object.values(obj)：返回对象自身所有「可枚举属性值」的数组；
*   Object.entries(obj)：返回对象自身所有「可枚举属性键值对」的二维数组。

#### **三、修改对象（更新已有属性 / 方法，或添加新属性 / 方法）**

1.点语法

const person = { name: "张三", age: 20 }; // 1. 修改已有属性 person.age = 21; console.log(person.age); // 输出：21 // 2. 修改已有方法 person.sayHello = function () { console.log(\`哈喽，我是${this.name}，今年${this.age}岁\`); }; person.sayHello(); // 输出：哈喽，我是张三，今年21岁 // 3. 添加新属性 person.gender = "男"; console.log(person.gender); // 输出：男 // 4. 添加新方法 person.run = function () { console.log(\`${this.name}在跑步\`); }; person.run(); // 输出：张三在跑步

2.方括号语法

const person = { name: "张三", age: 20 }; // 1. 修改带特殊字符的属性（若有） person\["full name"\] = "张三丰"; console.log(person\["full name"\]); // 输出：张三丰 // 2. 通过变量修改/添加属性 const propName = "height"; person\[propName\] = 180; // 添加 height 属性 console.log(person.height); // 输出：180 // 3. 修改方法 person\["sayHello"\] = function () { console.log(\`你好，我身高${this.height}cm\`); }; person\["sayHello"\](); // 输出：你好，我身高180cm

##### **3\. Object.assign ()（批量修改 / 添加属性）**

将一个或多个源对象的属性复制到目标对象，用于批量更新或合并对象。

const target = { name: "张三", age: 20 }; const source = { age: 21, gender: "男", height: 180 }; // 批量修改（age）和添加（gender、height）属性 Object.assign(target, source); console.log(target); // 输出：{ name: '张三', age: 21, gender: '男', height: 180 }

#### **四、删除对象（删除对象属性 / 方法）**

##### **1\. delete 操作符（常用）**

删除对象的自身属性 / 方法，删除成功返回 true（注意：无法删除继承的属性和 const 声明的对象本身）。

const person = { name: "张三", age: 20, sayHello: function () { console.log(\`你好，我是${this.name}\`); } }; // 1. 删除属性 delete person.age; console.log(person.age); // 输出：undefined console.log(person); // 输出：{ name: '张三', sayHello: \[Function: sayHello\] } // 2. 删除方法 delete person.sayHello; console.log(person.sayHello); // 输出：undefined // 3. 无法删除继承的属性 Object.prototype.gender = "男"; delete person.gender; // 返回 true，但实际未删除 console.log(person.gender); // 输出：男（仍能访问原型属性）

##### **批量删除（手动遍历 + delete）**

若需删除多个属性，\[\[可结合 Object.keys() 和遍历实现批量删除。

const person = { name: "张三", age: 20, gender: "男", height: 180 }; // 要删除的属性列表 const propsToDelete = \["age", "height"\]; // 批量删除 propsToDelete.forEach(prop => { delete person\[prop\]; }); console.log(person); // 输出：{ name: '张三', gender: '男' }

#### **总结**

1.  **创建对象**：优先用「对象字面量」（简洁），批量创建用「构造函数」，基于原型继承用 Object.create()；
2.  **查询对象**：常规场景用「点语法」，特殊属性名 / 变量属性用「方括号语法」，批量查询用 Object.keys() 系列方法；
3.  **修改对象**：单个属性 / 方法用「点语法」或「方括号语法」，批量更新用 Object.assign()；
4.  **删除对象**：单个属性用 delete 操作符，批量删除用「遍历 + delete」，注意 delete 无法删除继承属性。

15.数组的创建，说出不少于10个数组的常用方法

1.字面量【】

// 空数组 const arr1 = \[\]; // 带初始值的数组（支持不同数据类型） const arr2 = \[1, "张三", true, null, { age: 20 }\];

##### **2\. Array 构造函数（new Array()）**

// 空数组（无参数） const arr1 = new Array(); // 单个数字参数：创建指定长度的空数组（元素为 undefined） const arr2 = new Array(5); // 长度为5的空数组 // 多个参数/非数字参数：创建带初始值的数组 const arr3 = new Array(1, 2, 3, "李四"); // \[1, 2, 3, "李四"\]

##### **3\. Array.of ()（解决构造函数单个数字参数的歧义）**

创建一个包含任意数量参数的数组，不受参数类型和数量影响，弥补 new Array() 的缺陷。

// 单个数字参数：创建包含该数字的数组（而非指定长度） const arr1 = Array.of(5); // \[5\] // 多个参数：与字面量效果一致 const arr2 = Array.of(1, "张三", true); // \[1, "张三", true\]

数组常用的方法：

##### **1\. 增删元素（修改原数组）**

*   **push()**：向数组**末尾**添加一个 / 多个元素，返回新数组长度。

const arr = \[1, 2\]; const len = arr.push(3, 4); // len = 4，arr = \[1, 2, 3, 4\]

*   **pop()**：删除数组**末尾**的一个元素，返回被删除的元素。

const arr = \[1, 2, 3\]; const delItem = arr.pop(); // delItem = 3，arr = \[1, 2\]

*   **unshift()**：向数组**开头**添加一个 / 多个元素，返回新数组长度。

const arr = \[2, 3\]; const len = arr.unshift(0, 1); // len = 4，arr = \[0, 1, 2, 3\]

*   **shift()**：删除数组**开头**的一个元素，返回被删除的元素。

const arr = \[0, 1, 2\]; const delItem = arr.shift(); // delItem = 0，arr = \[1, 2\]

*   **splice()**：万能增删改，修改原数组，返回被删除的元素数组。语法：arr.splice(起始索引, 删除数量, 新增元素1, 新增元素2...)

const arr = \[1, 2, 3, 4\]; // 1. 删除：从索引1开始删除2个元素 const delArr1 = arr.splice(1, 2); // delArr1 = \[2, 3\]，arr = \[1, 4\] // 2. 新增：从索引1开始删除0个，添加2、3 const delArr2 = arr.splice(1, 0, 2, 3); // delArr2 = \[\]，arr = \[1, 2, 3, 4\] // 3. 修改：从索引2开始删除1个，替换为5 const delArr3 = arr.splice(2, 1, 5); // delArr3 = \[3\]，arr = \[1, 2, 5, 4\]

##### **2\. 遍历 / 迭代（不修改原数组，按需处理元素）**

*   **forEach()**：遍历数组所有元素，无返回值（无法中断遍历，除了抛出异常）。

const arr = \[1, 2, 3\]; arr.forEach((item, index) => { console.log(\`索引${index}：${item}\`); // 依次输出 1、2、3 });

*   **map()**：遍历数组，返回一个由处理后元素组成的新数组（一一映射）。

const arr = \[1, 2, 3\]; const newArr = arr.map((item) => item \* 2); // newArr = \[2, 4, 6\]

##### **3\. 筛选 / 查找（不修改原数组，返回符合条件的结果）**

*   **filter()**：筛选数组中符合条件的元素，返回新数组。

const arr = \[1, 2, 3, 4, 5\]; const evenArr = arr.filter((item) => item % 2 === 0); // evenArr = \[2, 4\]

*   **find()**：查找第一个符合条件的元素，返回该元素（无符合条件则返回 undefined）。

const arr = \[{ id: 1, name: "张三" }, { id: 2, name: "李四" }\]; const target = arr.find((item) => item.id === 2); // target = { id: 2, name: "李四" }

*   **findIndex()**：查找第一个符合条件的元素索引，返回索引值（无符合条件则返回 -1）。

const arr = \[10, 20, 30\]; const index = arr.findIndex((item) => item === 20); // index = 1

*   **includes()**：判断数组是否包含指定元素，返回布尔值（支持简单类型，引用类型需地址一致）。

const arr = \[1, 2, 3\]; console.log(arr.includes(2)); // true console.log(arr.includes(4)); // false

*   **indexOf()**：查找指定元素第一次出现的索引，返回索引值（无则返回 -1，严格相等匹配）。

const arr = \[1, 2, 3, 2\]; console.log(arr.indexOf(2)); // 1 console.log(arr.indexOf(4)); // -1

##### **4\. 归并 / 排序（归并不改原数组，排序默认改原数组）**

*   **reduce()**：归并数组，将元素累积计算为一个单一值，返回最终结果。语法：arr.reduce((累计值, 当前元素, 当前索引, 原数组) => {}, 初始累计值)

const arr = \[1, 2, 3, 4\]; // 求和（初始累计值为0） const sum = arr.reduce((total, item) => total + item, 0); // sum = 10 // 求最大值 const max = arr.reduce((prev, item) => prev > item ? prev : item); // max = 4

*   **sort()**：对数组元素排序，默认按字符串 Unicode 排序，修改原数组（需传回调函数实现数值排序）。

const arr1 = \[3, 1, 4, 2\]; // 默认排序（错误的数值排序） arr1.sort(); // arr1 = \[1, 2, 3, 4\]（此处巧合正确，实际对多位数会出错） // 数值升序排序（回调函数） arr1.sort((a, b) => a - b); // arr1 = \[1, 2, 3, 4\] // 数值降序排序（回调函数） arr1.sort((a, b) => b - a); // arr1 = \[4, 3, 2, 1\]

##### **5\. 其他常用方法**

*   **concat()**：合并多个数组 / 元素，返回新数组（不修改原数组）。

onst arr1 = \[1, 2\]; const arr2 = \[3, 4\]; const newArr = arr1.concat(arr2, 5); // newArr = \[1, 2, 3, 4, 5\]

*   **join()**：将数组元素用指定分隔符拼接为字符串，返回字符串（不修改原数组）。

const arr = \["张三", "李四", "王五"\]; const str1 = arr.join(); // 默认用逗号分隔，str1 = "张三,李四,王五" const str2 = arr.join("-"); // 用短横线分隔，str2 = "张三-李四-王五"

*   **slice()**：截取数组的指定部分，返回新数组（不修改原数组，含头不含尾）。语法：arr.slice(起始索引, 结束索引)（省略结束索引则截取到末尾）

const arr = \[1, 2, 3, 4, 5\]; const newArr1 = arr.slice(1, 4); // \[2, 3, 4\] const newArr2 = arr.slice(2); // \[3, 4, 5\] const newArr3 = arr.slice(-2); // 负数表示倒数，\[4, 5\]

#### **总结**

1.  **数组创建**：优先用「数组字面量」（简洁），处理类数组用 Array.from()，避免歧义用 Array.of()；
2.  **常用方法（核心）**：

*   增删：push/pop/unshift/shift/splice（前 4 个针对性增删，splice 万能）；
*   遍历：forEach（无返回值）/map（返回新数组）；
*   筛选：filter（返回所有符合条件）/find（返回第一个符合条件）/includes（判断是否包含）；
*   归并排序：reduce（累积计算）/sort（排序，需传回调实现数值排序）；
*   其他：concat（合并）/join（拼接字符串）/slice（截取）。

1.  关键区分：部分方法修改原数组（如 push/splice/sort），部分方法返回新数组（如 map/filter/concat），使用时需注意是否保留原数组。