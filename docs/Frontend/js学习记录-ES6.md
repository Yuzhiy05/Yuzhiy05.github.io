

打*号基本就没实际试试 有实例的基本上写过一遍 有的api就不写了用到自然会用
以下表示成员的函数时正规写法 `xxx.prototype.prototype_name` 例如`String.prototype.at()` 都懒得写中间原型
但是`String.at()` 表示静态 非实例函数。 所以表示成员函数或属性时连"类名"和原型都不写

# ES6 的js

###变量解构

跟c++ 结构化绑定 和 c# 模式匹配里的 位置模式 很像

用于结构可迭代的对象 比如实现Iterator 接口的对象

js宽松的语言特性 解构失败的不报错只是对应变量为undefined

```js
let [bar, foo] = [1];

foo 为 undefined
```



## 模板字符串

类似于 c# `@"xxx${index}"` 字符串
使用反引号 ` `` `
可以定义多行字符串
使用${} 做字符串插值  引用变量函数 和表达式
括号中的内容可以嵌套另一个模板字符串,不举例了 用来生成代码
使用实例
```js
let index=10;
let str=`this template string ${index}`

let str=`this is muilt line
string ${index++}`
```

1.用模板字符串做代码生成 模板引擎 不介绍


带标签的模板字符串
写个函数`tag` 调用不使用一般函数调用方法而是
` tag`123` ` 这样调用 
相当于字符串前缀,然后自己写个函数处理参数

可以用来表示其他语言的字符串,每个语言设计不一样转义符一样这,这样搞自己处理转义
用str.raw[i] 和values[i]来访问字符串和参数
例如
```js
function loop(str,...values) {

    return str.raw[0] + values[0] + str.raw[1];
}

let max = 10000;
let min = 1;
let rand = Math.floor(Math.random() * (max - min + 1) + min);
console.log(loop`hello the ${rand} world`);

字符串传进去会根基对应的位置解包成
str.raw[0] str.raw[1] 对应数组成员
loop`hello the ${rand} world` 相当于 loop([`hello the`,` world`],rand)

rand就传到 ...values 展开的是values数组里了

let aaa = 10;
console.log(Object.getOwnPropertyNames`123${aaa}456`);
//输出
[ '0', '1', 'length', 'raw' ]
```
也就是说使用标签模板字符串调用时js会自动帮我把字符串 按${} 分隔成一个 类字符数组
其中raw属性就返回原始没转义的字符串

tips 有点坑
使用模板字符串会使得调用方式改变函数行为

```js
let aaa = 10;
//带标签的模板字符串
console.log(Object.getOwnPropertyNames`123${aaa}456`);
console.log(Object.keys`123${aaa}456`);
//输出模板字符串
//这种调用方法实际传的是空对象
console.log(Object.getOwnPropertySymbols(`123${aaa}456`));
console.log(Object.keys(`123${aaa}456`));

//使用普通字符串
console.log(Object.getOwnPropertyNames('123${aaa}456'));
console.log(Object.keys('123${aaa}456'));
//输出
//带标签的模板字符串
[ '0', '1', 'length', 'raw' ]
[ '0', '1' ]

//模板字符串函数调用
[]
[
  '0', '1', '2',
  '3', '4', '5',
  '6', '7'
]

//普通字符串
[
  '0',      '1',  '2',
  '3',      '4',  '5',
  '6',      '7',  '8',
  '9',      '10', '11',
  'length'
]
[
  '0', '1', '2',  '3',
  '4', '5', '6',  '7',
  '8', '9', '10', '11'
]
```
不同调用方式js会将模板字符串解析成不同产物
注意使用普通函数调用的方法传递模板字符串实际上传的是空对象,所以模板字符串调用就使用` tag`hello` ` 的调用方法

主要用法
1.过滤字符串内容
如 HTML 字符串，防止用户输入恶意内容

2.国际化每个国家数字不一样


## 字符串新加了几个功能

String.fromCodePoint() 识别大于0xFFFF 码点 根据Unicode码点创建字符串

String.raw 字符串里每个斜杠\ 前都加个 \  因为\ 会转义 专门给模板字符串用的

```js
console.log(String.raw`Hi\n${2 + 3}!`)
//输出
Hi\n5!

//这样调用不行报错
console.log(String.raw('Hi\u000A!'))
//输出
console.log(String.raw('Hi\u000A!'))
                   ^
TypeError: Cannot convert undefined or null to object
```

实例方法* 
includes(search_str,search_index:number), startsWith(), endsWith()
valueof 只能表示一个字符串是否在字符串里,这几个函数提供更具体的语义
支持第二个参数表示搜索时位置

includes()  是否包含搜选字符串 从search_index 位置开始
startsWith()  是否在开头      从search_index 位置开始
endsWith()   是否在末尾  第二个参数 指示字符串的前i个字符串

repeat(count) 将字符串重复count次 返回新字符串

padStart(length,str)  头补全 预期补全后的长度 str补全字符串 如果原字符串大于等于预期补全后的长度则无效返回原字符串 

padEnd()  尾补全

trimStart() 清空头空格 tab 换行符

trimEnd()  清空头空格 tab 换行符

ES5的 原有的 trim()

matchAll() 正则表达式匹配

replaceAll(pattern, replacement) 替换所有匹配 pattern 可以是字符串也可以是正则表达式 replacement 可以说字符串也可以是
一个正则表达式对应的字符 或者函数能匹配替换的五花八门
详见[链接](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace#%E6%8C%87%E5%AE%9A%E5%87%BD%E6%95%B0%E4%BD%9C%E4%B8%BA%E6%9B%BF%E6%8D%A2%E9%A1%B9)

原有的replace 函数只能替换首个匹配 全不替换全部得写正则表达式 于是就提供一个新功能

at(index) 允许负数 的[index] 负数表示从末尾偏移index位 但是不能超字符串长度




暂时不用了解的

normalize()  Unicode正规化 

toWellFormed()  处理代理字符串的


## 正则表达式和ES6扩展*
暂时不看

## 数值扩展

1.新的二进制和八进制 写法

只能用 0o 或0O表示8进制

     0B或0b 表示二进制

2.数值分隔符
欧美人习惯每三个数值间加逗号或者下滑线_

毕竟人家说 100 000  10万 叫 one  hundred thousand 一百个千
所以js引入了数值下滑线 **100_000**  这玩意实际上就等于**100000** 只不过写起来好看
作为参数传递 写入内存 输出都不影响就纯语法糖
注意别写到那种一眼看上去不对的用法上就行
比如
```js

0_b111111000
0b_111111000

3_.141
3._141
1_e12
1e_12
123__456
_1464301
1464301_
```
非要在进制表示后,小数点前后,科学计数法e前后,没意义的前后缀加下滑线你不报错谁报错呢? 不要当傻逼

3.两个判断数值的静态函数 
Number.isFinite() 是否有限

Number.isNaN() 是否是NaN 有点绕 不是NaN就是数值 返回 false 
注意ES5 里有这两函数的全局版本 全局版本调用前会先用Number构造函数转换到数值类型再判断

4.全局版本数值解析
Number.parseInt()
Number.parseFloat()
这两的全局版本现在为了模块化更清晰放Number对象里当静态函数了 行为不变

### 精度相关
5.Number.isInteger(number)
判断是否整数
有点搞笑这玩意 js存储整数也是ieee754小数存储的 超过精度的数值判断会失准 其次和其他Number函数性质一样
非数值类型参数直接返回false

6.Number.EPSILON 属性 一个常量
js数值不是IEEE754 的小数吗 这里引入一个很小误差的误差值 (大于1的最小可表示小数1.000...1 (1位符号 8位指数 51位值)减去1算出来的误差) 也就是说算来算去数值比这个误差小那就没意义
实际上不等的数值 相减小于这个最小误差 那么这两数在js里也相等 这玩意就类似于高数里那个极限趋近的 ε

7.Number.isSafeInteger()
ES6 表示数值的上下限
Number.MAX_SAFE_INTEGER和Number.MIN_SAFE_INTEGER 也就是-2的53次方 和2的53次方
这个函数就是判断这个数值在不在js的可表示范围内

## MATH 扩展*

Math.trunc() 截断小数部分 返回整数部分

Math.sign() 返回符号 不是Number的会先转成Number

Math.clz32() **count leading zero bits in 32-bit binary representation of a number**
把数值转换成32位无符号数 算这里面有多少前导0
Math.clz32(1) 就有31个

Math.imul(a,b)  把两个数转成带符号整数然后相乘
下面这个例子js原来功能算不了 存储不了溢出的数值 所以用这个算准确值
```js
(0x7fffffff * 0x7fffffff)|0 // 0

Math.imul(0x7fffffff, 0x7fffffff) // 1
```

Math.fround()   返回一个数的32位单精度浮点数形式 精度缩窄会丢精度

Math.f16round() 和上面差不多16位精度的浮点数

Math.hypot(a,b,c) 平方和的平方根
 $$\begin{array}{c} \sqrt{a^{2} +b^{2}+c^{2}} \end{array}$$
Math.hypot(3, 4);        // 5

### 对数
Math.expm1(x) 以e为底的对数-1  
 $$\begin{array}{c} \e^{x}-1 \end{array}$$

Math.log1p(x) 
  $$\begin{array}{c} \log_{}{(1+x)}  \end{array}$$

Math.log10(x) 
$$\begin{array}{c} \log_{10}{x}  \end{array}$$

Math.log2()
$$\begin{array}{c} \log_{2}{x}  \end{array}$$

### 三角函数
Math.sinh(x) 
Math.cosh(x)
Math.tanh(x) 
Math.asinh(x) 
Math.acosh(x) 
Math.atanh(x)

## BigInt*
128的大整形 用的时候后面带n
1n 相当于数值1 的大整形 其他很多操作和Number很像
有些会不一致 我不想管细究没意思


## 函数

### 默认实参
挺傻逼的 参数不给是undefined
es6 前 默认实参得这么写
```js
function log(x, y) {
  y = y || 'World';
  console.log(x, y);
}
现在能直接
function multiply(a, b = 1) {
  return a * b;
}
```
*默认参数是表达式每次函数调用都会重新计算*

默认参数是非尾参数不会被忽略 显而易见的 也就是说你想不写参数只能把默认参数放尾部不然,给的参数不对对应不上默认参数
```js
function f(x=1,y){
  console.log(x,y);
}

f() // 1, undefined
f(2) // 2, undefined
f(, 1) // 报错
f(undefined, 1) // 1, 1
```
你想忽略得显示传undefined 这就和不写参数的想法本末倒置了 注意null 和undefined语义不一样传null就是空不会触发默认参数因为你传了null

有默认参数时 参数初始化有单独作用域 这就是个tips我不想细写
看此[教程]<https://wangdoc.com/es6/function#%E4%BD%9C%E7%94%A8%E5%9F%9F>

传对象可以用解包搞默认参数
```js
function ff({a=1,b=1}={})
{
  console.log(a,b);
}

function m2({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}

```

### 剩余参数/rest 参数
你不确定参数有多少
可以写成...parm 的样子 parm表示参数的数组
```js
function f(...parm){
  console.log(Object.prototype.toString.call(parm));
  parm.forEach(value=>console.log(value));
} 
f(5,4,3,2,1)
//输出
[object Array]
5
4
3
2
1
```
这样就不需要arguments数组了(它就不是数组而是一个类数组的对象还得Array.from转换成数组才能用数组的操作)
注意剩余参数只能是参数尾当最后参数 没有`(a ,...b,c)` 这种

name 属性
函数的定义的名字
三个例子
```js
function ff() {
    console.log('function declaration');
}
let ff1 = () => console.log('arrow function');

let ff2 = function test_name() {
    console.log('function expression');
}
console.log(ff.name);
console.log(ff1.name);
console.log(ff2.name);
console.log((value=>value++).name);
//输出
ff
ff1
test_name
             //这里是空
```
匿名函数输出被赋值变量的名字;原函数有名字就用原名 匿名函数没赋值给变量就没名字

### 箭头函数
类似于c#的Lambda 表达式
写几个例子就懂了
```js
value=>value+5 ; //箭头函数 简化

()=>{console.log("arrow function"),return 10};

let func_c=(a,b,c)=>a+b*c-10;
console.log(func_c(1,3,4));

()=>({name:1});

() => void doesNotReturn(); //只执行副作用不反悔 

```
参数部分 用括号包裹参数 ,只有一个参数可以不写括号只写参数名;没有参数用一个括号表示没参数
函数体部分 只有一个语句且你让他作为 return 语句的表达式 可以不写 大括号加 return;多个语句要写大括号和return
返回对象要加括号包裹对象,正常人也知道是因为:对象表示时和大括号和函数体括号解析有冲突

只执行语句不返回对象还只有一条语句 可以后跟void
函数很多东西:rest参数,解包赋值,参数默认值... 箭头函数都能用

tips 箭头函数没 ` this、arguments 和 super 绑定` 也不能当构造函数 也不能在函数体里用yield


## 数组

### 静态函数
1.Array.from(arr_like,op)

转换类数组对象为正真的数组

如arguments (这个以后少用)

DOM 操作返回的 NodeList 
取代es5里 `Array.prototype.slice.call`的用法

这是一个html页面
```html
<body>
    <h1>Hello, 这是一个 HTML 页面</h1>
    <button accesskey="h" id="btn">点击</button>
    <!-- 引入你写的 JS 文件 -->
    <script src="script.js"></script>
    <button accesskey="h" id="btn">点击2</button>
    <button accesskey="h" id="btn">点击3</button>
</body>
```
获取所有butten，打印一下类型看看
```js
let buttens = document.querySelectorAll('button');

function getType(obj) {
    const t = typeof obj;
    if (t !== 'object') {
        return t;
    }
    if (obj === null) {
        return 'null';
    }
    return Object.prototype.toString.call(obj).slice(8, -1);
}
let arr_node = Array.from(nodelist);

let arr_node2 = [...nodelist];

console.log(getType(arr_node2));
console.log(getType(arr_node));
console.log(getType(nodelist));
//输出
Array
Array
NodeList
```
op参数是类似forEach或map的用法中的op,对遍历的每个元素需要的执行的操作
操作完再塞到数组里返回 这里把一个arr_like通过Array.from 转换成每个值都大写的数组
在es5中做同样的操作需要 Array.prototype.slice.call(obj) 麻烦死
```js
let arr_like =
{
    0: 'a',
    1: 'b',
    2: 'c',
    length: 3
};

let arr_from = Array.from(arr_like, (value) => {
    return value.toUpperCase();
});

console.log(getType(arr_from));

console.log(arr_from);
//输出
Array
[ 'A', 'B', 'C' ]
```
注意 Array.from 转换的类数组对象 需要有length属性,并且属性名不是0,1,2,3 开始的序列——中间有间断如
0,2,3 则1位置产生的元素是undefined

2.Array.of
弥补Array构造的函数功能
使得数组创建的语义统一
Array() 构造函数语义不一致
```js
let arr_construct = new Array(1);
console.log(arr_construct);
console.log(arr_construct.length);
console.log(getType(arr_construct));
console.log(arr_construct[0]);

let arr_construct2 = new Array(1, 2, 3);
console.log(arr_construct2);

let arr_construct3 = new Array();
console.log(arr_construct3);

let arr_construct4 = new Array(1, 2);
console.log(arr_construct4);
//输出
[ <1 empty item> ]
1
Array
undefined
[ 1, 2, 3 ]
[]
[ 1, 2 ]
```
Array的构造函数对于直传一个参数时 行为是指定参数长度的空数组
Array.of() 所有的参数都用来组成数组成员 参数是什么生成的数组就是什么

### 成员方法/实例方法

1.copyWithin(target, start = 0, end = this.length)

复制数组成员到指定位置

target 指定位置  负数就从末尾开始指定

start 起始位置  负值就从末尾开始算

end 结束位置 不指定就到数组末尾

从0 索引位置开始 将2索引位置值赋值到0 向后遍历
```js
[1,2,3,4,5].copyWithin(0,2)

//[ 3, 4, 5, 4, 5 ]
```

2.find系列根据条件查找符合语义的结果

find(Precondition,this)    找到符合首个返回true(符合条件的值)  
findIndex(Precondition,this)  找到符合首个符合条件值的索引   替代 indexof
findLast(Precondition,this)    从后向前检查
findLastIndex(Precondition,this)  从后向前检查

Precondition 函数声明可为
`function Precondition(value,index,arr)`
按照索引顺序 将元素应用到条件数组中

this 参数和map,forEach 差不多都是要绑定的回调对象 参考[链接](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array#%E8%BF%AD%E4%BB%A3%E6%96%B9%E6%B3%95)

注意find原语义是不会改变数组内容的但传入的条件函数不一定。

3.fill
fill(value,start,end)

填充数组  常用的 `new Array(10).fill(10);`
填充的参数如果是对象,都是浅拷贝也就说多个指向 value对象的指针
```js
let test_arr = new Array(5).fill({ name: '1145' });
console.log(test_arr);
test_arr[0].name = 'changed';
console.log(test_arr);
//输出
[
  { name: '1145' },
  { name: '1145' },
  { name: '1145' },
  { name: '1145' },
  { name: '1145' }
]
[
  { name: 'changed' },
  { name: 'changed' },
  { name: 'changed' },
  { name: 'changed' },
  { name: 'changed' }
]
```
可以看到数组内容全部被改变了

4. 新的遍历函数 迭代器
   key()  类似 for...in  返回键 的迭代器
   values()  类似 for...of 返回值的迭代器
   entries() 键值对        返回键值对的迭代器
看下实例就知道  这几个对应函数返回的是对某个遍历项的迭代器,可以手工调用.next来迭代
```js
let arr7 = [10, 20, 30, 40, 50];
for (let index in arr7) {
    console.log(`index:${index}`);
}
for (let index of arr7.keys()) {
    console.log(`key:${index}`);
}
for (let value of arr7) {
    console.log(`value:${value}`);
}
for (let value of arr7.values()) {
    console.log(`value2:${value}`);
}
for (let [index, value] of arr7.entries()) {
    console.log(`index:${index}, value:${value}`);
}

const iter = arr7.entries();
let first = iter.next().value;
let second = iter.next().value;

console.log(first); //[ 0, 10 ]
console.log(second); //[1,20]
//输出
index:0
index:1
index:2
index:3
index:4
key:0
key:1
key:2
key:3
key:4
value:10
value:20
value:30
value:40
value:50
value2:10
value2:20
value2:30
value2:40
value2:50
index:0, value:10
index:1, value:20
index:2, value:30
index:3, value:40
index:4, value:50
```

5. includes(value) 是否包含指定值
和字符串成员一样
之前查找都用indexof 还要比较不等于-1

6.拉平数组
flat(depth=1) 拉平数组 depth深度可指定 指定Infinity 为参数就是把所有层数都拉平 
flatMap(op,this) 拉平数组的操作 只能拉一层

`function op(element,index,array)`  和其他迭代函数可接受的参数函数的参数一致
element  数组中正在处理的当前元素。
index    数组中正在处理的当前元素的索引
rray     调用 flatMap() 的当前数组

```js
//拉平一层
cosnsole.log([1, 2, [3, [4, 5]]].flat())
//
[ 1, 2, 3, [ 4, 5 ] ]
```

7.at 支持负数索引的[]
[-1]负索引的数组访问符js里没有语义
访问对象时语义是访问属性名为-1 的对象
现在使用at(index) 
at(-1) 是倒数第一个元素 注意索引不能超数组长度

8.不改变原数组,返回原数组的拷贝的操作*
toReversed()   逆序 对应操作 Reverse() 会在原数组上逆序 这个返回一个新数组
toSorted()     排序        Sort()
toSpliced(start, deleteCount,itam1...)    删除 指定位置向后开始的n个元素 并填充为item1...         splice()   
with(index, value )      splice(index, 1, value)   删除指定位置的一个元素 并填充为 value     





### 数组展开
...[1,3,4] 成1,3,4
数组展开
```js
let arr=[1,2,3,4];

f(0,...arr,5,6)

//实际传入的参数是 
0,1,2,3,4,5,6

let arr1=[7,8,9]

let arr2=[1,2,3,4,5,6,...arr1,10,11]
//1,2,3,4,5,6,7,8,9,10,11
```
将数组展开为参数
展开成员 进行赋值传值都可以
配合解构
类似于函数使用apply,但是以后不需要写apply,可以更直观的调用

... 这三个点运算符叫[展开语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax) 具体看mdn

实现了Iterator 接口的对象 可迭代对象都能展开


## 对象
1.现在能跟写类一样直接写成员函数和成员了 和oop语言越来越像了
只不过属性名和属性值变量名 同名
```js
let a={bbb} 等价于 let a={bbb:bbb}

let c={
  ff(){
    ...
  }
}
等价于
let c={
  ff:function(){
    ...
  }
}
//直接返回对象更简单了
function ff(a,b){
   a++;b++;
   return {a,b};
}

``` 
使用表达式定义属性名

```js
const value = 42;
let obj2 = {
    ['some' + 'Key']: 123,
    [value]: 456
}
console.log(obj2.someKey); //123
console.log(obj2[42]); //456

```
也就是说 表达式会求值转换成字符串再访问属性名(我瞎猜的)

2.反射函数属性名字符串
name
```js
let obj3={
  cc1:123,
  ff(){
    console.log(ff);
  }
}
console.log(obj3.cc1.name); //undefiend
console.log(obj3.ff.name) //ff
```

3.遍历对象的属性的注意事项
for ... in  所有可遍历 包括继承的属性
Object.keys 所有可遍历 非继承属性
Object.getOwnPropertyNames(obj)  自身所有属性包括不可遍历的即 继承的不包含
Object.getOwnPropertySymbols(obj)  自身的Symbol属性 只有这个会返回Symbol属性
Reflect.ownKeys(obj)   反射自身所有属性 不管是否Symbol
遍历顺序为*
3.1数值键 根据数值升序 
3.2遍历字符键根据加入顺序 
3.3遍历Symbol键根据加入顺序
根据属性描述符
```js
let arr_test = [1, 3, 4];
let desc = Object.getOwnPropertyDescriptors(arr_test);
console.log(desc);
for (let key in arr_test) {
    console.log(`key:${key}, value:${desc[key].value}`);
}
//输出
{
  '0': { value: 1, writable: true, enumerable: true, configurable: true },
  '1': { value: 3, writable: true, enumerable: true, configurable: true },
  '2': { value: 4, writable: true, enumerable: true, configurable: true },
  length: { value: 3, writable: true, enumerable: false, configurable: false }
}

key:0, value:1
key:1, value:3
key:2, value:4
```
可以发现length属性的属性描述符中enumerable可枚举项为false 正因为如此 才会在for...in 中被屏蔽不会被美剧到
除此之外Object.keys assign 也会屏蔽可枚举项为false的属性(提一嘴还会屏蔽继承的属性 for...in不会)

4.简化表示对象原型
`super` 关键字
只能用在对象方法里

在内部替代Object.getPrototypeOf()

5. 对象也能解包,解构赋值
6. ... 解包运算符可以用在对象上 展开 对象自身且属性描述内可枚举的属性* 基本上提单了 Object.assign
```js
let {x,y,...z}={x:1,y:2,z:3,o:4}
//  x 1  y 2 z {z:3,o:4}

```
tips 注意解构赋值是浅拷贝 同时不能复制从原型对象继承的属性
[例子](https://wangdoc.com/es6/object#%E8%A7%A3%E6%9E%84%E8%B5%8B%E5%80%BC)


## 异常错误对象
AggregateError 封装了多个错误的对象
一个操作抛多个异常的时候用

Error对象现在有给case属性 提供一个报错原型不一定要字符串 具体看MDN




# js的坑
1.
模板字符串做代码生成 实现简单的模板引擎
用现有的就行不要学怎么写

2.
使用标签模板字符串
模板字符串会转义 ,输入的是别的语言的字符串 转义规则不一样在js里转不了
ES2018 放宽限制 对转不了的不报错转换成undefined

3.
只是有使用标签模板字符串
` tag`123` ` 这样调用的时候会放松限制

4. *
Number.isNaN() 
Number.isFinite
因为字符串 '15' 能 转换成数值15 所以全局函数版本先用Number转换数值对象,再isNaN() 返回false 他是一个数不是NaN
对于Number.isFinite 你是字符串就直接判死刑了 返回false 只对数值对象判断
直接用静态函数 你不是数值就直接返回true

5.Number.isInteger(number) 超精度数值判断失准 25.0和25视为一个值
```js
function test_bool(...args) {
    args.forEach((arg) => {
        console.log(arg);
    });
}

test_bool(
    Number.isInteger(25), // true
    Number.isInteger(25.0), // true
    Number.isInteger(3.0000000000000002), // true
    Number.isInteger(5E-324), // false
    Number.isInteger(5E-325), // true
)
//输出true
true
true
true
true
false
true
```

6.BigInt*  这个有些操作会和Number不一致
我不想记具体的 有什么问题查MDN就好了

7.严格模式
使用默认参数 解构赋值 拓展运算符 函数内部不能用严格模式
不想解释,属于[设计妥协]()

8.箭头函数里的this*
不指向箭头函数本身而是创建时的作用域对象 看这个[例子](https://wangdoc.com/es6/function#rest-%E5%8F%82%E6%95%B0:~:text=%E4%B8%80%E6%AC%A1%E9%83%BD%E6%B2%A1%E6%9B%B4%E6%96%B0%E3%80%82-,%E7%AE%AD%E5%A4%B4%E5%87%BD%E6%95%B0,-%E5%AE%9E%E9%99%85%E4%B8%8A%E5%8F%AF%E4%BB%A5)

此教程有很多例子我就不写了 反正关于this坑很多

9.Function.prototype.toString()
现在返回源代码 还包括注释

10 try...catch 可以省略catch参数 `catch(err)`里的参数可以不写了
```js
try{

}
catch{

}
```

11.数组空位
ES5  中`[1,3,,4,5]` 其中的空位不是undefined 但是ES5 的很多遍历函数对空位的行为不一致
forEach() map()  filter(), reduce(), every() ...凡是有遍历的对空位的处理分为三种情况反正不一致
ES6 统一将空位定义为undefined
```js
let arr_empty=new Array(5);//五个空位的数组
console.log(arr_empty[1]);
//输出
undefined
```
Array.from() 会将空位处理为undefined
...,copyWithin,fill,for...of,entries,keys,values,find,findIndex现在都不会当空位不存在

12.ES5 早期数组排序方法缺乏稳定性 
ES2019 全部采用稳定算法


13.解包的模式是属性名而不是位置
这个例子我假设不知道ff的实现只知道ff返回一个对象我想用自定义的变量名解包 就会报错
一般这种情况很少智能感知会提示返回的变量名的
```js
let ff = (a, b) => {
        a++;
        b++;
        return { a, b };
    };

    let { x, y } = ff(10, 20);

    console.log(x);
    console.log(y);
```

14 表达式属性是个对象 会把属性字符串名提升到Object
```js
const keyA = {a: 1};
const keyB = {b: 2};

const myObject = {
  [keyA]: 'valueA',
  [keyB]: 'valueB'
};

myObject // Object {[object Object]: "valueB"}
```

15. 成员函数的name 属性
对 bind,Function 构造函数 和get set Symbol有特定行为