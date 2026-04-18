本文将全面讲解 JavaScript 中 Set、Map 数据结构的底层原理、语法、方法、特性、使用场景，以及 WeakSet、WeakMap 的核心特性、方法，并对比它们与普通 Set/Map 的区别和联系，帮助你深入理解并灵活运用这些数据结构。
## 一、Set 详解
1.1 底层原理
在 JavaScript 引擎（如 V8）中，Set 的底层实现基于哈希表（Hash Table），部分场景下会结合红黑树优化：
- 基础实现：哈希表（散列表），通过计算元素的哈希值确定存储位置，实现 O (1) 级别的增删查效率。
- 冲突处理：当不同元素哈希值相同时，采用 “链地址法”（将冲突元素存入链表 / 红黑树）解决。
- 扩容机制：当哈希表的负载因子（已存储元素 / 总容量）超过阈值（通常 75%），会自动扩容并重新哈希，保证性能。
- 特殊处理：Set 不允许重复值，底层会在插入时检查哈希表中是否已存在该值，存在则忽略插入。
Set 的实现逻辑几乎和 Map 完全一致，可以把 Set 看作「键和值相同的特殊 Map」：
- Set 存储的「值」，对应 Map 中的「键」；
- Set 的 add() 方法 ≈ Map 的 set() 方法（只是值和键相同）；
- Set 的 has() 方法 ≈ Map 的 get() 方法（只是判断键是否存在，不返回值）。
简化版模拟 Set 实现
class MySimpleSet {
  constructor() {
    // 直接复用Map的逻辑，值既是键也是值
    this._map = new MySimpleMap();
  }

  add(value) {
    // Set的value作为Map的key，value随便填（比如undefined）
    this._map.set(value, undefined);
    return this;
  }

  has(value) {
    return this._map.get(value) !== undefined;
  }

  delete(value) {
    const existed = this._map.get(value) !== undefined;
    if (existed) {
      this._map.delete(value); // 需给MySimpleMap补充delete方法，逻辑类似set/get
    }
    return existed;
  }

  get size() {
    return this._map.size;
  }

  clear() {
    this._map = new MySimpleMap();
  }
}

正因为 Set 基于 Map 实现，所以它继承了 Map 的所有核心特性：有序性、唯一性（SameValueZero 规则）、高效的增删查。
1.2 语法（创建 Set）
Set 是构造函数，用于创建一个存储唯一值的集合，支持传入可迭代对象（数组、字符串等）初始化。
// 1. 创建空 Set
const set1 = new Set();

// 2. 传入可迭代对象初始化（自动去重）
const set2 = new Set([1, 2, 2, 3]); // Set(3) {1, 2, 3}
const set3 = new Set('hello');      // Set(4) {'h', 'e', 'l', 'o'}

// 3. 注意：Set 对值的判断是“值相等”，对象/数组即使内容相同也视为不同
const set4 = new Set([{a:1}, {a:1}]); // Set(2) {{a:1}, {a:1}}

1.3 核心方法与属性
类型名称作用属性size返回 Set 中元素的数量（只读，类似数组 length）操作add(value)向 Set 中添加元素，返回 Set 本身（可链式调用）操作delete(value)删除指定元素，返回布尔值（true = 删除成功，false = 元素不存在）操作has(value)判断是否包含指定元素，返回布尔值操作clear()清空 Set 中所有元素，无返回值遍历forEach(callback)遍历 Set 元素，回调参数：(value, key, set)（key 等于 value，兼容 Map）遍历keys()返回迭代器对象，遍历所有元素（与 values () 一致）遍历values()返回迭代器对象，遍历所有元素（Set 无键名，键值合一）遍历entries()返回迭代器对象，遍历 [value, value] 形式的数组（兼容 Map）
代码示例：
const set = new Set([1, 2, 3]);

// 基础操作
console.log(set.size); // 3
set.add(4).add(5);     // 链式添加，Set {1,2,3,4,5}
console.log(set.has(3)); // true
console.log(set.delete(2)); // true，删除元素 2
set.clear(); // 清空
console.log(set.size); // 0

// 遍历
const set2 = new Set(['a', 'b', 'c']);
// forEach 遍历
set2.forEach((value, key) => {
  console.log(value, key); // a a | b b | c c（key 和 value 相同）
});

// for...of 遍历（Set 是可迭代对象）
for (const val of set2.values()) {
  console.log(val); // a | b | c
}
for (const [val, val2] of set2.entries()) {
  console.log(val, val2); // a a | b b | c c
}

1.4 核心特性
1.唯一性：Set 中不会存储重复值，添加重复值会被自动忽略（判断规则：SameValueZero 算法，类似 ===，但 NaN 视为相等）。
const set = new Set([NaN, NaN]); // Set(1) {NaN}
console.log(set.has(NaN)); // true

2.无序性：Set 中的元素没有索引（不能通过下标访问），但会按插入顺序保存（遍历顺序 = 插入顺序）。
3.可迭代性：Set 实现了迭代器接口，支持 for...of、扩展运算符（...）、Array.from() 等。
const set = new Set([1,2,3]);
const arr = [...set]; // [1,2,3]（Set 转数组）

4.值类型无限制：可存储任意类型的值（原始值、对象、函数等）。
1.5 典型使用场景
1.数组 / 字符串去重（最常用）：
// 数组去重
const arr = [1,2,2,3,3,3];
const uniqueArr = [...new Set(arr)]; // [1,2,3]

// 字符串去重
const str = 'aabbcc';
const uniqueStr = [...new Set(str)].join(''); // 'abc'

2.存储不重复的标识：如存储用户 ID、标签列表，避免重复。
// 存储已选中的标签
const selectedTags = new Set();
// 选中标签
function selectTag(tag) {
  selectedTags.add(tag);
}
// 取消选中
function unselectTag(tag) {
  selectedTags.delete(tag);
}
// 判断是否选中
function isSelected(tag) {
  return selectedTags.has(tag);
}

3.数据交集 / 并集 / 差集计算：
const setA = new Set([1,2,3]);
const setB = new Set([2,3,4]);

// 并集
const union = new Set([...setA, ...setB]); // Set {1,2,3,4}
// 交集
const intersection = new Set([...setA].filter(x => setB.has(x))); // Set {2,3}
// 差集（A - B）
const difference = new Set([...setA].filter(x => !setB.has(x))); // Set {1}

4.避免重复执行：如监听事件时，确保同一回调只绑定一次。
## 二、Map 详解
2.1 底层原理
Map 的底层实现与 Set 类似（V8 引擎），核心是哈希表（Hash Table）：
- 存储结构：哈希表中每个节点存储 [键, 值] 键值对，键的哈希值决定存储位置。
- 键的唯一性：Map 的键是唯一的，底层通过 SameValueZero 算法判断键是否重复（与 Set 一致）。
- 性能优化：当哈希表中元素数量超过阈值，会转为红黑树存储，保证大量数据下的遍历 / 查找性能。
- 与对象的区别：普通对象的键只能是字符串 / 符号（Symbol），而 Map 的键可以是任意类型（对象、函数、原始值等），底层通过哈希表实现对非字符串键的支持。
Map 如何基于哈希表实现？
JS 中的 Map 本质是「哈希表 + 双向链表」（V8 引擎实现），既利用哈希表保证高效操作，又用双向链表维护插入顺序（满足 ES6 对 Map 有序的要求）。
1.核心实现逻辑

1）存储结构
每个哈希桶中存储的不是单纯的键值对，而是包含「键、值、链表指针、双向链表指针」的节点：
- 哈希表维度：通过键的哈希值找到对应桶，解决「快速查找」；
- 双向链表维度：所有节点按插入顺序连成链表，解决「有序遍历」。
2.2 语法（创建 Map）
Map 是构造函数，用于创建键值对集合，键可以是任意类型，支持传入二维数组（[[键，值], [键，值]]）初始化。
// 1. 创建空 Map
const map1 = new Map();

// 2. 传入二维数组初始化
const map2 = new Map([
  ['name', '张三'],
  [18, '年龄'],
  [{id:1}, '用户信息'] // 键可以是对象
]); // Map(3) {'name' => '张三', 18 => '年龄', {id:1} => '用户信息'}

// 3. 注意：键的唯一性（相同键会覆盖值）
const map3 = new Map([
  ['a', 1],
  ['a', 2]
]); // Map(1) {'a' => 2}

2.3 核心方法与属性
类型名称作用属性size返回 Map 中键值对的数量（只读）操作set(key, value)添加 / 更新键值对，返回 Map 本身（可链式调用）操作get(key)获取指定键的值，不存在则返回 undefined操作delete(key)删除指定键值对，返回布尔值（true = 删除成功，false = 键不存在）操作has(key)判断是否包含指定键，返回布尔值操作clear()清空 Map 中所有键值对，无返回值遍历forEach(callback)遍历 Map 键值对，回调参数：(value, key, map)遍历keys()返回迭代器对象，遍历所有键遍历values()返回迭代器对象，遍历所有值遍历entries()返回迭代器对象，遍历 [key, value] 形式的数组（默认迭代器）
代码示例：
const map = new Map();

// 基础操作
map.set('name', '李四')
   .set('age', 20)
   .set({id:2}, '用户'); // 链式设置

console.log(map.size); // 3
console.log(map.get('name')); // 李四
console.log(map.has('age')); // true
console.log(map.delete('age')); // true
// map.clear();

// 遍历
map.forEach((value, key) => {
  console.log(key, value); // name 李四 | {id:2} 用户
});

// for...of 遍历
for (const key of map.keys()) {
  console.log(key); // name | {id:2}
}
for (const [key, value] of map.entries()) { // 等同于 for (const [k,v] of map)
  console.log(key, value); // name 李四 | {id:2} 用户
}

2.4 核心特性
1.键的任意性：Map 的键可以是任意类型（原始值、对象、函数、Symbol 等），而普通对象的键只能是字符串 / Symbol。
const fn = () => {};
const map = new Map();
map.set(fn, '函数作为键');
map.set(Symbol('id'), '符号作为键');
console.log(map.get(fn)); // 函数作为键

2.键的唯一性：相同键（SameValueZero 判定）会覆盖原有值，如 0 和 -0 视为同一键，NaN 视为同一键。
3.有序性：遍历顺序 = 键值对的插入顺序（普通对象在 ES6 前无序，ES6 后仅保证字符串键的插入顺序）。
4.可迭代性：支持 for...of、扩展运算符、Array.from() 等迭代操作。
5.性能优化：针对频繁增删键值对的场景，Map 的性能优于普通对象（对象的增删会触发原型链检查，Map 无此开销）。
2.5 典型使用场景
1.存储非字符串键的键值对：如以对象为键存储关联数据。
// 存储 DOM 元素对应的配置
const btn1 = document.getElementById('btn1');
const btn2 = document.getElementById('btn2');
const btnConfig = new Map();
btnConfig.set(btn1, {color: 'red', size: '16px'});
btnConfig.set(btn2, {color: 'blue', size: '14px'});
// 获取 btn1 的配置
console.log(btnConfig.get(btn1)); // {color: 'red', size: '16px'}

2.频繁增删键值对的场景：如动态配置、缓存数据。
// 简单的内存缓存
const cache = new Map();
// 设置缓存（带过期时间）
function setCache(key, value, expire = 5000) {
  cache.set(key, { value, time: Date.now() + expire });
}
// 获取缓存
function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.time) {
    cache.delete(key); // 过期删除
    return null;
  }
  return item.value;
}

3.需要保留插入顺序的键值对：如表单字段的校验规则（按字段填写顺序遍历）。
4.替代普通对象避免键名冲突：如避免对象键与原型链上的属性（toString、hasOwnProperty）冲突。
## 三、WeakSet 详解
3.1 核心方法
WeakSet 是 “弱引用” 版本的 Set，方法比 Set 少，仅支持以下操作：
方法作用add(value)向 WeakSet 中添加元素（仅支持对象类型，原始值会报错），返回 WeakSet 本身delete(value)删除指定对象，返回布尔值（true = 删除成功，false = 对象不存在）has(value)判断是否包含指定对象，返回布尔值
注意：WeakSet 没有 size 属性、没有 clear() 方法、不支持遍历（无 forEach/keys/values/entries）。
代码示例：
const ws = new WeakSet();
const obj1 = {a:1};
const obj2 = {b:2};

// 添加元素（仅支持对象）
ws.add(obj1);
ws.add(obj2);
// ws.add(123); // 报错：TypeError: Invalid value used in weak set

console.log(ws.has(obj1)); // true
console.log(ws.delete(obj1)); // true
console.log(ws.has(obj1)); // false

// 无 size 属性
console.log(ws.size); // undefined

// 不支持遍历
// for (const val of ws) {} // 报错：ws is not iterable

3.2 核心特性
1.弱引用特性：WeakSet 对存储的对象是 “弱引用”—— 如果对象没有其他强引用，垃圾回收机制（GC）会自动回收该对象，同时 WeakSet 中对应的引用也会被移除（无需手动删除）。
let obj = {a:1};
const ws = new WeakSet();
ws.add(obj);

console.log(ws.has(obj)); // true
obj = null; // 解除强引用
// 此时 obj 无其他强引用，GC 会回收 obj，ws 中对应的引用也会消失
// （无法直接验证，因为 WeakSet 无遍历/大小方法）

2.仅存储对象：WeakSet 只能存储对象类型，传入原始值（数字、字符串、布尔值等）会报错。
3.不可遍历 / 无大小：由于弱引用的特性，WeakSet 的元素数量可能随时被 GC 改变，因此不提供 size 和遍历方法。
4.无内存泄漏风险：适合存储临时对象，无需手动清理，GC 会自动处理。
## 四、WeakMap 详解
4.1 核心方法
WeakMap 是 “弱引用” 版本的 Map，方法比 Map 少，仅支持以下操作：
方法作用set(key, value)添加 / 更新键值对（键仅支持对象类型，原始值会报错），返回 WeakMap 本身get(key)获取指定对象键的值，不存在则返回 undefineddelete(key)删除指定对象键值对，返回布尔值（true = 删除成功，false = 键不存在）has(key)判断是否包含指定对象键，返回布尔值
注意：WeakMap 没有 size 属性、没有 clear() 方法、不支持遍历（无 forEach/keys/values/entries）。
代码示例：
const wm = new WeakMap();
const obj1 = {id:1};
const obj2 = {id:2};

// 设置键值对（键仅支持对象）
wm.set(obj1, '张三');
wm.set(obj2, '李四');
// wm.set('name', '王五'); // 报错：TypeError: Invalid value used as weak map key

console.log(wm.get(obj1)); // 张三
console.log(wm.has(obj2)); // true
console.log(wm.delete(obj2)); // true
console.log(wm.get(obj2)); // undefined

// 无 size 属性
console.log(wm.size); // undefined

// 不支持遍历
// wm.forEach(() => {}); // 报错：wm.forEach is not a function

4.2 核心特性
1.弱引用特性：WeakMap 的键是弱引用（值是强引用）—— 如果键对象没有其他强引用，GC 会回收该对象，同时 WeakMap 中对应的键值对也会被移除。
let user = {name: '张三'};
const wm = new WeakMap();
wm.set(user, {age: 20});

console.log(wm.get(user)); // {age: 20}
user = null; // 解除对 {name: '张三'} 的强引用
// GC 会回收 user 对象，wm 中的键值对也会被清理

2.键仅支持对象：WeakMap 的键必须是对象类型（null 除外），传入原始值会报错；值可以是任意类型。
3.不可遍历 / 无大小：因弱引用特性，无法确定 WeakMap 的实时元素数量，故不提供 size 和遍历方法。
4.无内存泄漏风险：适合存储与对象生命周期绑定的数据（如 DOM 元素的附加数据）。
## 五、WeakSet/WeakMap 与 Set/Map 的区别与联系
5.1 核心区别（表格对比）
特性SetWeakSetMapWeakMap存储内容唯一值（任意类型）唯一对象键值对（键任意类型）键值对（键仅对象）引用类型强引用弱引用键：强引用键：弱引用可遍历性支持（for...of/forEach）不支持支持不支持size 属性有（只读）无有（只读）无clear () 方法有无有无垃圾回收不会自动清理无强引用时自动清理不会自动清理键无强引用时自动清理适用场景数组去重、集合运算临时存储对象通用键值对存储绑定对象生命周期的数据
5.2 核心联系
1.底层基础：WeakSet/WeakMap 与 Set/Map 底层均基于哈希表实现，核心逻辑（如唯一性判断）一致（SameValueZero 算法）。
2.核心能力：WeakSet 保留了 Set 的 “唯一性”，WeakMap 保留了 Map 的 “键值对” 核心特性。
3.方法复用：WeakSet 复用了 Set 的 add()/delete()/has()，WeakMap 复用了 Map 的 set()/get()/delete()/has()（仅删减，未修改逻辑）。
5.3 选择原则
- 若需存储原始值 / 需要遍历 / 需要统计数量 → 用 Set/Map。
- 若需存储临时对象 / 与对象生命周期绑定的数据（避免内存泄漏）→ 用 WeakSet/WeakMap。
- 若需以对象为键存储数据，且希望对象销毁时自动清理数据 → 用 WeakMap；否则用 Map。
## 六、总结
核心要点回顾
1.Set/Map 核心：
- Set 是 “唯一值集合”，适合去重、集合运算；Map 是 “通用键值对集合”，键支持任意类型，适合替代普通对象存储键值对。
- 两者均为强引用，需手动清理数据，支持遍历和 size 属性。
2.WeakSet/WeakMap 核心：
- WeakSet 仅存对象、WeakMap 键仅为对象，均为弱引用，GC 会自动清理无强引用的元素，无内存泄漏风险。
- 不支持遍历、无 size/clear ()，适合存储与对象生命周期绑定的临时数据。
3.选择逻辑：
- 需遍历 / 统计数量 / 存储原始值 → Set/Map；
- 存储临时对象 / 绑定对象生命周期 → WeakSet/WeakMap。
