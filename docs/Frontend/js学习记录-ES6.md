

打*号基本就没实际试试 有实例的基本上写过一遍 有的api就不写了用到自然会用

# ES6 的js

### 变量解构

跟c++ 结构化绑定 和 c# 模式匹配里的 位置模式 很像

用于结构可迭代的对象 比如实现Iterator 接口的对象

js宽松的语言特性 解构失败的不报错只是对应变量为undefined

```js
let [bar, foo] = [1];

foo 为 undefined
```



### 模板字符串

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


### 字符串新加了几个功能

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


### 正则表达式和ES6扩展*
暂时不看






# js的坑

模板字符串做代码生成 实现简单的模板引擎
用现有的就行不要学怎么写

使用标签模板字符串
模板字符串会转义 ,输入的是别的语言的字符串 转义规则不一样在js里转不了
ES2018 放宽限制 对转不了的不报错转换成undefined

只是有使用标签模板字符串
` tag`123` ` 这样调用的时候会放松限制


