---
title: TypeScript入门
published: 2026-04-25
description: ""
tags: []
category: CSDN迁移
draft: false
---

1、简介：
-----

### 1.为什么会出现Ts：

js维护太麻烦，不适合开发大项目

ts 基于js的语言，目的增强js的功能，使其更适合多人合作的企业级项目

ts可以看作js的超集，集成所有的js语法同时增加了自己的语法

### 2.类型概念：

1.  类型指的是具有相同特征的值，如果两个值具有某种共同的特征，就可以说，属于同一个类型，一旦确定某个值的数据类型，就意味着，这个只具有该类型的所有特征，可以进行该类型的所有运算。适合该类型的，都可以使用这个值，不适合该类型的地方会报错

```TypeScript
function addOne(n：number){
    return n + 1
}
//addOne('hello')会报错
//确定n 为number类型，再赋值字符串就会报错
```

JavaScript 语言就没有这个功能，不会检查类型对不对。开发阶段很可能发现不了这个问题，代码也许就会原样发布，导致用户在使用时遇到错误。

作为比较，TypeScript 是在开发阶段报错，这样有利于提早发现错误，避免使用时报错。另一方面，函数定义里面加入类型，具有提示作用，可以告诉开发者这个函数怎么用。

### 3.动态类型与静态类型

1.  js的类型系统比较弱，没有使用限制，运算可以接受各种类型的值，语法上js 属于动态类型的语言

```TypeScript
//例1
let x = 1;
x= 'hello'
//例2
let y = {foo:1}
delete y.foo;
y.bar = 2
```

上面的例一，变量x声明时，值的类型是数值，但是后面可以改成字符串。所以，无法提前知道变量的类型是什么，也就是说，变量的类型是动态的。

上面的例二，变量y是一个对象，有一个属性foo，但是这个属性是可以删掉的，并且还可以新增其他属性。所以，对象有什么属性，这个属性还在不在，也是动态的，没法提前知道。

正是因为存在这些动态变化，所以 JavaScript 的类型系统是动态的，不具有很强的约束性。这对于提前发现代码错误，非常不利。

上面示例中，例一的报错是因为变量赋值时，TypeScript 已经推断确定了类型，后面就不允许再赋值为其他类型的值，即变量的类型是静态的。例二的报错是因为对象的属性也是静态的，不允许随意增删。

TypeScript 的作用，就是为 JavaScript 引入这种静态类型特征。

### 4.静态类型的优点

1.  有利于代码的静态分析。

有了静态类型，不需要运行代码，就可以知道变脸的类型，从而就能推断代码有没有错误，这就叫代码的静态分析

      2.有利于发现错误

由于每个值、每个变量、每个运算符都有严格的类型约束，TypeScript 就能轻松发现拼写错误、语义错误和方法调用错误，节省程序员的时间。

```TypeScript
let obj = {message: ''}
//console.log(obj.messege);抱错
拼写错误

const a = 0;
const b = true;
//const result = a + b;报错
//js不报错，但是ts会报错，运算符不能用数值和布尔值相加

function hello() {
    return 'hello world'
}
hello().find('hello')
//上面示例中，hello()返回的是一个字符串，TypeScript 发现字符串没有find()方法，
//所以报错了。如果是 JavaScript，只有到运行阶段才会报错。
```

1.  更好的IDE支持，做到语法提示和自动补全

IDE（集成开发环境）一般都会利用类型信息，提供语法提供功能，和自动补全

1.  提供代码文档

类型信息可以部分替代代码文档，解释应该如何使用这些代码，熟练的开发者往往只看类型，就能大致推断代码的作用。借助类型信息，很多工具能够直接生成文档。

1.  有助于代码重构

修改他人的 JavaScript 代码，往往非常痛苦，项目越大越痛苦，因为不确定修改后是否会影响到其他部分的代码。

类型信息大大减轻了重构的成本。一般来说，只要函数或对象的参数和返回值保持类型不变，就能基本确定，重构后的代码也能正常运行。如果还有配套的单元测试，就完全可以放心重构。越是大型的、多人合作的项目，类型信息能够提供的帮助越大。

综上所述，TypeScript 有助于提高代码质量，保证代码安全，更适合用在大型的企业级项目。这就是为什么大量 JavaScript 项目转成 TypeScript 的原因。

### **5.静态类型的缺点**

1.  丧失了动态类型的代码灵活性。
2.  增加编程的工作量
3.  更高的学习成本
4.  引入独立的编译步骤
5.  兼容性问题

2.基本用法
------

### 1.类型声明

TypeScript 代码最明显的特征，就是为 JavaScript 变量加上了类型声明。

```TypeScript
let foo:string;
```

上面的示例，变量foo后面使用冒号，声明了他的类型为string

```TypeScript
function toString(num:number):string{
    return String(num);
}
参数的类型是number ，返回值的类型是string
```

### 2.类型判断

类型声明并不是必需的，如果没有，TypeScript 会自己推断类型。

```TypeScript
let foo = 123;
```

没有声明，但是推断是number

```TypeScript
let foo = 123;
//foo = 'hello'; 报错
```

TypeScript 也可以推断函数的返回值。

```TypeScript
function toString(num:number) {
  return String(num);
}
```

上面示例中，函数toString()没有声明返回值的类型，但是 TypeScript 推断返回的是字符串。正是因为 TypeScript 的类型推断，所以函数返回值的类型通常是省略不写的。

从这里可以看到，TypeScript 的设计思想是，类型声明是可选的，你可以加，也可以不加。即使不加类型声明，依然是有效的 TypeScript 代码，只是这时不能保证 TypeScript 会正确推断出类型。由于这个原因，所有 JavaScript 代码都是合法的 TypeScript 代码。

这样设计还有一个好处，将以前的 JavaScript 项目改为 TypeScript 项目时，你可以逐步地为老代码添加类型，即使有些代码没有添加，也不会无法运行。

### 3.TypeScript的编译

JavaScript 的运行环境（浏览器和 Node.js）不认识 TypeScript 代码。所以，TypeScript 项目要想运行，必须先转为 JavaScript 代码，这个代码转换的过程就叫做“编译”（compile）。

TypeScript 官方没有做运行环境，只提供编译器。编译时，会将类型声明和类型相关的代码全部删除，只留下能运行的 JavaScript 代码，并且不会改变 JavaScript 的运行结果。

因此，TypeScript 的类型检查只是编译时的类型检查，而不是运行时的类型检查。一旦代码编译为 JavaScript，运行时就不再检查类型了。

### 4.值与类型

学习 TypeScript 需要分清楚“值”（value）和“类型”（type）。

“类型”是针对“值”的，可以视为是后者的一个元属性。每一个值在 TypeScript 里面都是有类型的。比如，3是一个值，它的类型是number。

TypeScript 代码只涉及类型，不涉及值。所有跟“值”相关的处理，都由 JavaScript 完成。

这一点务必牢记。TypeScript 项目里面，其实存在两种代码，一种是底层的“值代码”，另一种是上层的“类型代码”。前者使用 JavaScript 语法，后者使用 TypeScript 的类型语法。

它们是可以分离的，TypeScript 的编译过程，实际上就是把“类型代码”全部拿掉，只保留“值代码”。

编写 TypeScript 项目时，不要混淆哪些是值代码，哪些是类型代码。

### 5.TypeScript Playground

最简单的 TypeScript 使用方法，就是使用官网的在线编译页面，叫做 [TypeScript Playground](http://www.typescriptlang.org/play/ "TypeScript Playground")。

只要打开这个网页，把 TypeScript 代码贴进文本框，它就会在当前页面自动编译出 JavaScript 代码，还可以在浏览器执行编译产物。如果编译报错，它也会给出详细的报错信息。

这个页面还具有支持完整的 IDE 支持，可以自动语法提示。此外，它支持把代码片段和编译器设置保存成 URL，分享给他人。

3.基本类型
------

JavaScript语言分为8种类型

boolean，string，number，bigint，symbol， object，undefined， null

注意，上面所有类型的名称都是小写字母，首字母大写的Number、String、Boolean等在 JavaScript 语言中都是内置对象，而不是类型名称。

另外，undefined 和 null 既可以作为值，也可以作为类型，取决于在哪里使用它们。

### 1.any 类型

any 类型表示没有任何限制，该类型的变量可以赋予任意类型的值

```TypeScript
let x :any
x=1;
x='hello'//不报错
x= true//不报错
```

变量类型一旦设为any，TypeScript 实际上会关闭这个变量的类型检查。即使有明显的类型错误，只要句法正确，都不会报错。

```TypeScript
let x:any = 'hello'
x(1)//不报错
x.foo = 100// 不报错
```

上面示例中，变量x的值是一个字符串，但是把它当作函数调用，或者当作对象读取任意属性，TypeScript 编译时都不报错。原因就是x的类型是any，TypeScript 不对其进行类型检查。

由于这个原因，应该尽量避免使用any类型，否则就失去了使用 TypeScript 的意义。

实际开发中，any类型主要适用以下两个场合。

（1）出于特殊原因，需要关闭某些变量的类型检查，就可以把该变量的类型设为any。

（2）为了适配以前老的 JavaScript 项目，让代码快速迁移到 TypeScript，可以把变量类型设为any。有些年代很久的大型 JavaScript 项目，尤其是别人的代码，很难为每一行适配正确的类型，这时你为那些类型复杂的变量加上any，TypeScript 编译时就不会报错。

总之，TypeScript 认为，只要开发者使用了any类型，就表示开发者想要自己来处理这些代码，所以就不对any类型进行任何限制，怎么使用都可以。

从集合论的角度看，any类型可以看成是所有其他类型的全集，包含了一切可能的类型。TypeScript 将这种类型称为“顶层类型”（top type），意为涵盖了所有下层。

### 2.unkonwn类型

为了解决any类型“污染”其他变量的问题，TypeScript 3.0 引入了[unknown类型](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type "unknown类型")。它与any含义相同，表示类型不确定，可能是任意类型，但是它的使用有一些限制，不像any那样自由，可以视为严格版的any。

unknown跟any的相似之处，在于所有类型的值都可以分配给unknown类型。

```TypeScript
let x:unknown;

x = true; // 正确
x = 42; // 正确
x = 'Hello World'; // 正确
```

unknown类型跟any类型的不同之处在于，它不能直接使用。主要有以下几个限制。

首先，unknown类型的变量，不能直接赋值给其他类型的变量（除了any类型和unknown类型）。

```TypeScript
let v:unknown = 123;

let v1:boolean = v; // 报错
let v2:number = v; // 报错
```

上面示例中，变量v是unknown类型，赋值给any和unknown以外类型的变量都会报错，这就避免了污染问题，从而克服了any类型的一大缺点。

其次，不能直接调用unknown类型变量的方法和属性。

```TypeScript
let v1:unknown = { foo: 123 };
v1.foo  // 报错

let v2:unknown = 'hello';
v2.trim() // 报错

let v3:unknown = (n = 0) => n + 1;
v3() // 报错
```

上面示例中，直接调用unknown类型变量的属性和方法，或者直接当作函数执行，都会报错。

再次，unknown类型变量能够进行的运算是有限的，只能进行比较运算（运算符==、===、!=、!==、||、&&、?）、取反运算（运算符!）、typeof运算符和instanceof运算符这几种，其他运算都会报错。

```TypeScript
let a:unknown = 1;

a + 1 // 报错
a === 1 // 正确
```

上面示例中，unknown类型的变量a进行加法运算会报错，因为这是不允许的运算。但是，进行比较运算就是可以的。

那么，怎么才能使用unknown类型变量呢？

答案是只有经过“类型缩小”，unknown类型变量才可以使用。所谓“类型缩小”，就是缩小unknown变量的类型范围，确保不会出错。

```TypeScript
let a:unknown = 1;

if (typeof a === 'number') {
  let r = a + 10; // 正确
}
```

### 3.never类型

为了保持与集合论的对应关系，以及类型运算的完整性，TypeScript 还引入了“空类型”的概念，即该类型为空，不包含任何值。

由于不存在任何属于“空类型”的值，所以该类型被称为never，即不可能有这样的值。

```TypeScript
let x : never
```

上面示例中，变量x的类型是never，就不可能赋给它任何值，否则都会报错。

never类型的一个重要特点是，可以赋值给任意其他类型。

为什么never类型可以赋值给任意其他类型呢？这也跟集合论有关，空集是任何集合的子集。TypeScript 就相应规定，任何类型都包含了never类型。因此，never类型是任何其他类型所共有的，TypeScript 把这种情况称为“底层类型”（bottom type）。

总之，TypeScript 有两个“顶层类型”（any和unknown），但是“底层类型”只有never唯一一个。