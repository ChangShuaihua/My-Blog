变量声明
声明变量有三个“var”,“let”,"const"const优先，语义化更好，如果变量变化，用let。

以下let可以变成const：（变量没有发生变化）



以下let不可以改为const ，变量发生了变化



const声明常量不能更改，且需要初始化，对于引用数据类型 ，const声明的变量，里面存的是地址，不是值。

const arr = [1,2,3]



以后声明变量我们优先使用哪个？

const

有了变量先给const，如果发现它后面是要被修改的，再改为let

为什么const声明的对象可以修改里面的属性？

Ø因为对象是引用类型，里面存储的是地址，只要地址不变，就不会报错

Ø建议数组 和对象使用const来声明

3.什么时候使用let声明变量？

如果基本数据类型的值或者引用类型的地址发生变化的时候，需要用let

Ø比如一个变量进行加减运算，比如for循环中的i++

API作用，分类
作用:就是使用JS去操作html和浏览器

分类：DOM(文档对象模型 )、BOM（浏览器对象模型）



DOM是浏览器提供的一套专门用来操作网页内容的功能

DOM树



根据选择器来获取DOM元素

匹配一个元素

document.querySelector('css选择器')

选择匹配多个元素

document.querySelectorAll('css选择器')

得到一个伪数组，有长度没有索引号，得到里面的对象需要遍历（for）

1.获取页面中的标签我们最终常用那两种方式？

querySelectorAll()

querySelector()

小括号里写css选择器

必须是字符串，也就是必须加引号

其他获取方式



操作元素内容
对象.innerHTML 属性

对象.innerText 属性

元素.innerText属性只识别文本，不能解析标签

元素.innerHTML属性能识别文本，能够解析标签

如果还在纠结到底用谁，你可以选择innerHTML

操作元素内容
还可以通过JS设置/修改标签元素属性，比如通过src更换图片

最常见的属性比如：href、title、src等

语法：对像.属性 =值

const pic = document.querySelector('img') pic.src = '地址' pic.title = '文字'

操作元素属性
1.通过style属性操作CSS

语法：对象.样式属性 = 值

样式修改通过style属性引出

如果属性有连接符，需要转换为小驼峰命名法

例如：background-color改为backgroundColor

赋值的时候，需要的时候不要忘记加css单位

2.操作类名(className)操作CSS

如果修改的样式比较多，直接通过style属性修改比较繁琐，我们可以通过借助于css类名的形式。

语法：

元素.className = 'active

1. 使用 className 有什么好处？

可以同时修改多个样式

2. 使用 className 有什么注意事项？

直接使用 className 赋值会覆盖以前的类名

3.通过classList操作类控制CSS

为了解决className 容易覆盖以前的类名，我们可以通过classList方式追加和删除类名

语法：

//追加一个类 元素.classList.add ('类名') //删除一个类 元素.classLIst.remove('类名') //切换一个类 元素.classList.toggle('类名')

操作表单元素属性
获取: DOM对象.属性名

设置: DOM对象.属性名 = 新值

表单.value='用户名' 表单.type = 'password'

表单属性中添加就有效果,移除就没有效果,一律使用布尔值表示 如果为true 代表添加了该属性 如果是false 代表移除了该属性 比如： disabled、checked、selected

自定义属性
标准属性: 标签天生自带的属性 比如class id title等, 可以直接使用点语法操作比如： disabled、checked、

selected

l 自定义属性：

Ø 在html5中推出来了专门的data-自定义属性

Ø 在标签上一律以data-开头

Ø 在DOM对象上一律以dataset对象方式获取

<body> <div class= "box" date-id = "10">盒子</div> <script> const box = document.queryselector('.box') console.log(box.dataset.id) </script> </body>

定时器
开启定时器：setIntercal(函数，间隔时间)

setInterval(函数，间隔时间)

作用：每隔一段时间调用这个函数

间隔时间是毫秒

关闭定时器

let 变量名 = setInterval(函数，间隔时间) clearInterval(变量名)

时间监听
语法：

元素对象。addEventListener（’事件类型‘，要执行的函数）

事件监听三要素

事件源，事件类型，事件调用的函数
————————————————
版权声明：本文为CSDN博主「changshuaihua001」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/changshuaihua001/article/details/155354016