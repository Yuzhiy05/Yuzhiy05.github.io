---
title: js学习记录
createTime: 2025/08/04 13:47:46
permalink: /article/2pbod4sz/
---


# JS的常见坑
变量提升 
有代码块但是没作用域变量都是全局的 
变量没有固定类型,可以多次赋不同的值

js 没有整数只有浮点数 1==1.0 true 有些操作需要转换成整数32位操作会导致精度丢失
0.1 + 0.2 == 0.3 false 浮点数精度问题
根据iEEE 754 js最多保存15位整数
```js
console.log("1==1.0:" + (1 == 1.0));
console.log("0.1 + 0.2 == 0.3:" + (0.1 + 0.2 == 0.3));
console.log("0*infinity:" + (0 * Infinity));
console.log("0/0:" + (0 / 0));
console.log("0/infinity:" + (0 / Infinity));

1==1.0:true
0.1 + 0.2 == 0.3:false
0*infinity:NaN
0/0:NaN
0/infinity:0

```


### js的类型
原始类型 
1.数值1，1.1之类的(js内部只有浮点) 
2.字符串 'xxx',"xxxx"
3.bool

对象时特殊类型 由不同类型符合

null和undefined 分别为不同的特殊类型
### null 和undefined
js 沿用之前的语言习惯 其中的类型都是对象 所以null只是空对象并没有单独做出一个类型,同时null对象转换为数值是为0和c语言,java一样
，undefined 表示此处无定义,转换成整数为Nan ；尽管在做 instanceof 进行比较时他们两仍相等,但却表达了不同的语义


### parseInt/parseFloat 函数

将字符串转换为整数,参数不是字符串的先转换为字符串再转换为整数
字符串会一个字符一个字符的转换,遇到不能转换的字符就返回已经转换好的数值
自动过滤前导空格 换行
parseInt('8a') // 8
parseInt('12**') // 12

首个字符不能转换就返回NaN
parseInt('abc') // NaN
parseInt('.3') // NaN

很傻逼[遇到了再看](https://wangdoc.com/javascript/types/number#parseint)

### 强制类型转换 Nunmber String Boolean
Js中对 运算符对操作数的类型与实际类型不一致时会发生转换 这种期望其实挺符合一般语境 比如减法就是期望两个数值相减

Number
对于字符串 Number转换比parseInt还严格只要字符串部分有一点不能转换成数值就会转换成Nan
```js
// 字符串：如果不可以被解析为数值，返回 NaN
Number('324abc') // NaN
```
对于对象 除非是 `var x=[1]`; 这样Number(x) 返回1 其他都返回Nan
这是因为对任何对象的转换成原始类型都先调用valueOf 方法如果返回的还是对象则toString 像[1,2,3]这样的数组转换成字符串
'1,2,3' ,再对其进行Number函数这没法转换成数值所以是Nan,其他对象也是一样基本上没自定义valueOf的对象,valueOf的结果都是自己本身,都没法转成数值 ,当然自定义的valueOf和toString函数都返回对象,不符合js的*期望*时会直接报错 可见js对错误宽容多了

String 
对于原始类型 如期望一样转换成字面意义的字符串

对于对象 则在调用valueOf与toString顺序进行调换了,先对对象进行toString操作,再valueOf。对于自定义的对象的valueOf与toString方法;js期望的是两次转换至少要转换到原始类型
以便应用String转换成字符串,但是两次都返回对象这不符合js的*期望* js会报类型转换失败
```
var obj = {
  valueOf: function () {
    return {};
  },
  toString: function () {
    return {};
  }
};

String(obj)
// TypeError: Cannot convert object to primitive value
```

boolean 
该转换除了那些特殊意义的值其他都转换为true

js 对不同语境时发现类型不匹配会自动隐式的转换类型

1. 字符串和 数值相加时 js的期望的语义其实是字符串链接 所以
```js
1+'1' 
// '11'
'5' + {} 
// "5[object Object]"
'5' + [] 
// "5"
'5' + function (){} 
// "5function (){}"
```
2. - 号对字符串来说就没字符串的语义了 所以
```
'2'-'1'
//  变成数值 1

'2'-1 
// 字符串 减 数值 和字符串 加 数值不一样
//1
```
除此之外* /都表达其数学上的语义只有+ 被借用了表达了字符串连接的语义

### 字符串
tips  String.raw() = c# 里的@"x\rx\nx" 原样字符串
JS使用Unicode字符集
内部默认单字符utf-16
四字节字符会被视为两字节字符.string.Length 返回长度不正确
可以单引号也能双引号,也能单引号里双引号，双引号里单引号
'字符串'
"字符串"

'xxxx"aaa"'
"ffff'bbb'b"
默认一行，不能向c# c++ 一样分行 
多行可以加 \ 

字符串默认不可变
修改字符串内部的操作会失效且不报错

### 对象
键值对构成对象
键值是字符串,使用数值型自动转换成字符串 ,所以写不写'foo':'hello'都不一样
```js
var obj = {
  foo: 'Hello',
  bar: 'World'
};
属性可以是函数,也就是方法
var obj = {
  p: function (x) {
    return 2 * x;
  }
};
obj.p(1)
```
foo 称为对象的属性

js还允许这样 属性动态创建,后续加属性,没必要声明时指定
```js
var o1 = {};
var o2 = { bar: 'hello' };

o1.foo = o2;
console.log(o1.foo.bar)//hello

对象和值
var o1 = {};
var o2 = o1;

o1 = 1;
o2 // {}

```

加圆括号令js编译器将{xxx}内容视为 对象
```js
{console.log("hell0")} //代码块
({console.log("1111")})//对象，报错

访问属性
var foo = 'bar';

var obj = {
    foo: 1,
    bar: 2
};

console.log(obj.foo)  // 1
console.log(obj[foo])  // 2
console.log(obj['foo'])  // 1;
```
使用.访问属性名
使用[]需要加'' 访问属性名,因为属性名本质是字符串
```js
var obj={
    p:1,
    2:22
}
Object.keys(obj) 查看属性

delete obj.p 删除属性
可以删除一个不存在的属性,不报错且返回true
删除不可删除的属性 报错
删除继承的属性无效果
```

属性是否存在 `in` 关键字
查看的是键 是否存在而不是值

```js
var obj={
    111:111
    222:222
}
console.log(111 in obj)

遍历属性
var obj2 = {
    111: 111,
    222: 222,
    333: 333,
    444: 444,
    555: 555
}
console.log(111 in obj2)

for (var i in obj2) {
    console.log(i + " -> " + obj2[i]);
}
```
向c#一样对象都继承toString方法;但是遍历不出来的(不可遍历的属性)
对于不可遍历的属性，直接跳过

教程不建议使用with语句

### 函数
函数三种声明方式
```js
直接声明
function ff(x){
    console.log(x)
}
函数表达式
var ff=function(x){
    console.log(x)
};
//function 后带名字只有函数内部可见 递归调用
var ff=function ff(x){
    ff(x+1)
};

new Function 构造函数 没人用
```

tips 和变量不一样的是,后声明的同名函数覆盖之前声明。因为变量提升(不管声明在哪,函数调用前，第二次声明的函数都提升到开头了),第一次声明任何时候都不起作用
```js
function gr(num) {
    console.log("2222, " + num);
};
gr("Bob");
function gr(num) {
    console.log("333, " + num);
};
gr("Bob");

PS D:\workfile\TS\Test> npx node greeter.js
333, Bob
333, Bob
```
函数三个属性
name 函数名 对于始终是function 关键字后的名字
`var ff= function ff2(){}`
ff.name 为ff2

这个用来获取参数名字

length 参数个数

toString 函数源码 包括注释(根据这个获得多行字符串,js字符串都是单行的)

原生函数返回 native code 不显示全部源码

tips js es5版本只有
全局作用域 
函数作用域   此作用域和其他语言
es6的块级作用域后面介绍

### 数组
js对象本身就是一个key:value 键值对组合
js的的数组就是一个特殊对象,他的所有键都是字符串 '0' '1' '2' '3'... 对,不是数字是字符串；因为js对象的键默认是字符串。
所以数组里类型不一样都不是事
```js
[1,2,3,null,undefined,'1','2']
```

1.slice
slice 的 切片函数 输入 数组的start 和end index索引能截取数组切片, 同时可以使用负索引
```js
var arr=[1,2,3,4,5];
arr.slice(0,3) //1 2 3  左闭区间 右开区间
arr.slice(3) //4 5  一直到末尾
arr.slice(-2) //4 5 倒数第二位开始到末尾
```

2.sort 默认按字典序排序 卧槽里的太变态了！
```js
var arr4 = [111, 1011, 110];
arr4.sort(); //  [ 1011, 110, 111 ]
```
自定义排序规则需要传函数 两个参数a,b,返回大于0 a 排b 前面 否则 b排a前面
```js
arr4.sort((a, b) => a - b);
//[ 110, 111, 1011 ]
```
不同于其他语言的是 js更像c语言 其他语言的自定义排序函数都要求返回一个bool 表示a与b的序关系
js与c直接的排序函数直接返回数值 而且这还是js推荐写法

3.map 返回新数组的的映射函数 类似于forEach
传入的函数有两个类型(原型) 
3.1 纯成员 一个参数 
3.2 当前成员 当前索引 源数组 三个参数
```js
var arr5 = arr4.map(a => a - 1);

var arr6 = arr4.map((elem, index, arr) => {
    return elem + index + arr.length;
});
``` 
map本身还有一个接受 第二个参数的重载
抄的示例
```js
var out = [];

[1, 2, 3].forEach(function(elem) {
  this.push(elem * elem);
}, out);

out // [1, 4, 9]
```
注意map 和forEach都会跳过空位 但不会跳过null 和undefined 


tips2
sort reverse  splice 会改变原数组
其他一些常规操作都是生成新数组 且都会接受一个声明为 funcrtion(elem,index,arr) 的函数

4.reduce reduceRight
从左向右 应用函数 这个例子相当于相加 参数和之前的类似 同时reduce函数指定了初始值 10
```js
arr7.reduce((sum, curr, index, arr) => {
    return sum + curr;
},10)
```

还有一些其他原型函数 都按字面意思使用没啥坑
### 类型转换

作为动态类型语言,转换在不同语境是相当随意的,当可以发生转换时就可以转
```
var x = [2];

console.log(typeof x);

console.log(x instanceof Array);

console.log(1 == 1 && x++);

console.log(typeof x);

//output
object
true
2
number


var x = [2, 3, 1];

console.log(typeof x);

console.log(x instanceof Array);

console.log(1 == 1 && x++);

console.log(typeof x);

//output
object
true
NaN
number
```


### 包装对象
加new 的Number Boolean String 构造函数调用
类似于c# 装箱 原始类型转换成对象  让js在调属性的时候统一成一个模型 由`对象`来调

包装对象的bool 和原始bool不一样 包装对象毕竟是对象 只有原始bool类型的false 才能在if 语境中表示false(是个对象在if语境都转换成true)
```js
if(new Boolean(false)){
    console.log('true');
}
console.log(flasebool.valueOf());
//输出
true
false
```

原始类型调用 一些属性的时候都是转换成包装对象再调用的
数值类型记得加括号,不然会被当做小数点
```js
10.toString(2) //2进制

```
toFixed 保留几位小数的再转字符串 函数 他的舍入规则很蠢 有个对应只保留几位小数的函数 toPrecision 他的舍入也不准
归根结底还是底部小数存储有关
```js
(10.055).toFixed(2) // 10.05
(10.005).toFixed(2) // 10.01
```

fromCharCode 忽略大于0xFFFF 的多余部分 很坑不想写

String 的原型方法
substring/substr string既有类似数组的slice也有substring/substr 。有一些隐式行为
1.自动调换参数  start 参数大于 end参数 会调换位置
2.负数转0
```js
'JavaScript'.substring(10, 4) // "Script"
// 等同于
'JavaScript'.substring(4, 10) // "Script"

'JavaScript'.substring(-3) // "JavaScript"
'JavaScript'.substring(4, -3) // "Java"
```

split 也有些坑 一般遇不到

### Date


### 运算符求值
对于 *||* 和*&&* 运算符 与c语言不同的是,首个类型不为ture或false时返回第二个表达式的值,而不是逻辑运算的结果(bool)值,可能时因为js的值在if语境下可以隐式的转换成true或flase。以&& 为例子 多个&& 使用时 返回首个为false的表达式。这很好理解在c语言中,`a&&b`需要a与b均为真才为真,而a为真的情况下只需要关注b的表达式的值即可,所以js直接返回b了,因为js的动态类型不同语境可以相互转换,b若能转换为flase在if中就直接视为false了


//加一个tips框
有这样一个规则
如果 JavaScript 预期某个位置应该是布尔值，会将该位置上现有的值自动转为布尔值。转换规则是除了下面六个值被转为false，其他值都视为true。

1.undefined
2.null
3.false
4.0
5.NaN
6.""或''（空字符串）

这样就很好理解逻辑运算符的一些和以前学的c语言不一致的地方了-这两毕竟不是同类型的语言不能直接比较
```js
't' && '' // ""
't' && 'f' // "f"
true && 'foo' && '' && 4 && 'foo' && true
// ''

't' || '' // "t"
't' || 'f' // "t"
false || 0 || '' || 4 || 'foo' || true
// 4

```

### 运算符比较
对于大小比较 
1.两个字符串按一般习惯是字典比较

2.不同类型 
2.1字符串 bool 数值 这三个类型大小比较时 js的思想是看成 "你想"做数值比较 所以都会转换为数值

2.2 要是有对象参与比较 js会调用valueOf 方法 希望返回一个原始类型 如果返回的还是对象就调用ToString 方法 返回字符串这样就转换成
原始类型了,js在这里只允许类型做一次转换原始类型的操作,如果一次valueOf 不能转换为原始类型,js采用默认方法ToString 转换成原始字符串再以原始类型的规则比较

当然js的对象的属性可以动态添加的 你可以的自定义一个valueOf函数返回一个你想要的原始类型

```js
var obj1 = { a: 1 };

console.log(typeof obj1.valueOf());

console.log( obj1.valueOf().toString());

console.log(obj1 >= '[object Objeca]');

//output
true
object
[object Object]


obj1.valueOf=function (){
    return 1;
}
```

对于相等比较
一般有两种语义 对于对象 相等比较有时我们会希望比较的两个表达式指向同一个对象,有时只是希望比较其值是否相同。

`===` 严格相等运算符就表达这种*引用相等*的语义只有在两个类型相同才会继续不叫,类型都不相等直接返回false,这也是意料之中

1.对原始的类型(值类型,在c#中我喜欢叫值类型) 只会比较其值 
2.对于对象 会比较是否为相同对象

tips
因为相等比较和大小比较一般有不同期望的语义，所以js按作者习惯设计的刻意的不一致性，我个人认为js语言的设计就是其作者的*私货*只不过这些私货其实也是一种范式或大多数人的习惯，所以学习js其实是理解这些习惯

tips2
undefined和null与自身严格相等 但互相不等

`==` 相等运算符则会在不同类型之间的隐式转换了

还是两种情形和大小比较类似
1.原始类型都会看成数值比较
2.对象和原始类型比较,对象会经过valueOf函数ToString 的转换

tips 因为都会转换成数值进行比较 有些比较会反直觉

```js
false == 'false'    // false
false == '0'        // true

0 == ''             // true
0 == '0'            // true

'true' == true // false
// 等同于 Number('true') === Number(true)
// 等同于 NaN === 1

'1' == true  // true
// 等同于 Number('1') === Number(true)
// 等同于 1 === 1
```
这里可以直接看到能转换成数值的字符串都会转换成数值,对'true' 或'false' 可能我们希望他转换成数值的1,0 其实对字符串转数值来说他是个NaN 所以跟谁比都false

### 运算符优先级
所有语言都有这个问题,c++反而是最大吞噬原则而不是js这种左结合或右结合,该用括号用括号不要自作聪明

js大多数运算符都是左结合比如
```js
1+2+3 
(1+2)+3
```
以加法举例子其实没什么意思,数值加法具有*结合律* 怎么加都是一样的,而js中明确有乘法比加法高优先级这种普遍设计

只有 赋值运算符 `=` 三元运算符`?:=` 和指数运算符`**` 是有结合,这也在意料之中
毕竟在在写赋值表达式时期望的语义是先算右边表达式再赋值
```js
var x;
x=1+2-3;
总是期望
x=(1+(2-3));
```
当然这个例子举的不好,不管是不是右结合console.log出来的表达式的值一样

### js 的错误处理

这里没什么坑 还是继承(基类-js中没基类这种说法,但是又继承)错误Error 构造错误信息
 throw try...catch...finally 这一套


 ### 变量声明
 let  会提升 初始化之前访问会报错
 var  ES5 会变量提升 未初始化 定义为undefined  允许重复声明 作用域规则不清晰
 const 不允许修改值 其他都和let一样

 示例
 ```js
 {
    var func_area_obj_var = 10;
}

console.log(func_area_obj_var);

{
    let func_area_obj_let = 11;
}

console.log(func_area_obj_let);

//输出
10

...\src\index.js:164
console.log(func_area_obj_let);
            ^

ReferenceError: func_area_obj_let is not defined



有一点经常不被注意就是for循环
使用var
for(var i=0;i<5;i++){
    console.log(i);
}
console.log("循环值为:"+i)
//输出
0
1
2
3
4
循环值为:5

使用let
for (let i = 0; i < 5; i++) {
    console.log(i);
}
console.log("循环值为:" + i)
//输出
0
1
2
3
4
...\src\index.js:359
console.log("循环值为:" + i)
                      ^

ReferenceError: i is not defined
 ```

 这里var 是声明在全局的,但是 let却和别的语言还是不一致 let 是声明在for的括号内的
 let 和其他语言的auto let var比较接近，不允许重复声明之类的.现代编程范式都是先声明后使用,ES6推荐用这个

这里var 没有块级变量的意义,只有函数级别变量(和全局)所以 if 块中定义会溢出到外部函数作用域(变量提升)把全局变量覆盖
 ```js
 var tmp = new Date();

function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world';
  }
}

f(); // undefined
 ```
块作用域声明函数 一个坑不想细看

 同时和别的语言不一样的是
 if 语境省略大括号在js会被视为没有块作用域


 const 的语义只保证对象不可变,但对象指向的其他数据类型无法保证,要使得对象彻底不可变需要Object.freeze 冻结对象和其属性

 同时ES6的顶层对象属性 和全局变量不挂钩了
 ES5 全局变量在浏览器中相当于 大的对象window 下面的属性;在ES6 这两解绑了 除了老的关键字var function 声明的变量和函数

 浏览器的顶层对象叫 window
 node的顶层对象 是 global
web worker  叫self
 ES2020标准现在 有提案统一用 globalThis
 

 ### this

 ### 统一的函数调用
1.Function.prototype.call()   首个参数 this 表示应用的对象 后跟任意参数
注意prototype (原型) 类似于其他语言的成员方法
一般调用成员函数得先定义成员函数(js里起码es5里没成员函数这个叫法,不过在我看来就是一个东西)
```js
let obj={
name:'114',
func:function(){
    console.log('call obj func');
    console.log(this.name);
}
}
obj.func();
```
你也可以不定义
```js
let obj2={
    name:'114'
}

let func=function(name2){
    console.log('call call func');
    console.log(this.name+name2);
}
func.call(obj2,'514');
```
用函数调用语法传对象参数调用

call在顶层使用不传参,默认使用的顶层对象;在浏览器里叫window;在node里叫啥不知道。调用的函数里没this就没事,有this没定义就undefined
还有个用[调用原生方法](https://wangdoc.com/javascript/oop/this#functionprototypeapply)


2.Function.prototype.apply()  首个参数 this 表示应用的对象 后跟参数数组
和call 一样 只不过参数是以`[x1,x2,x3...]`这样的参数传的

这样数组内容可以被解构成参数
一个典型例子 找最大值 所有教程都有这个[例子](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply#%E5%B0%9D%E8%AF%95%E4%B8%80%E4%B8%8B)
因为Math.max调用都是这么调的,只能找参数最大值
`Math.max(2, -1, 5) // 5`
apply这玩意现在可以把数组值结构成参数找到最大值,不过这个例子很有扭曲,标准库的Array为什么不提供相应函数呢？

空元素变undefined,[例子](https://wangdoc.com/javascript/oop/this#functionprototypeapply:~:text=%EF%BC%882%EF%BC%89-,%E5%B0%86%E6%95%B0%E7%BB%84,-%E7%9A%84%E7%A9%BA%E5%85%83%E7%B4%A0)

还有一个数组like 转数组
slice 函数本来接受start 和end的index 返回切片后的数组 
```js
 let array_like = {
        1: '1',
        2: '5',
        5: '6',
        length: 3
    }

    let array_is = Array.prototype.slice.apply(array_like);
    console.log(Array.isArray(array_like));
    console.log(Array.isArray(array_is));
    //输出
    false
    true
```
能这么搞本质事参数对象解包了
上面apply能干的事ES6 剩余参数语法都能干 
见[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply#%E7%94%A8_apply_%E5%B0%86%E6%95%B0%E7%BB%84%E5%90%84%E9%A1%B9%E6%B7%BB%E5%8A%A0%E5%88%B0%E5%8F%A6%E4%B8%80%E4%B8%AA%E6%95%B0%E7%BB%84)

3.Function.prototype.call.bind() 绑定this 不变

call,和 apply 也能绑定对象 用一个函数存起来就是了
```js
 let for_bind = {
        name: '114'
    }

    let apply_bind = function () {
        console.log('apply_bind');
        console.log(this === for_bind)
    }
    let binded = function () {
        apply_bind.apply(for_bind);
    }

    binded();

```
这样apply_bind 用的this需要包裹成一个新函数存起来

bind干的事就是简化这种写法,和其他语言bind差不多绑定一个对象为固定参数
```js
 let bind_func_obj = {
        name: '114514',
        func: function () {
            console.log(this.name);
        }
    }
    let binded_func = bind_func_obj.func;

    binded_func();

这个例子输出undefined
因为调用时候不指定对象,this指向全局
```
这样手动绑定对象,也能绑其他对象
```js
 let other_obj = {
        name: '514'
    };
    let binded_func2 = bind_func_obj.func.bind(bind_func_obj);
    let binded_func3 = bind_func_obj.func.bind(other_obj);
    binded_func2();
    binded_func3();
    //输出
    114514
    514
```
bind 主要就是解决 回调函数作为参数, 其内部this 乱指的问题,bind 完对象后再把返回的函数作为参数传递.

还有个用法不算坑:和call一起用组成统一的函数调用语法
让函数调用等价
`f(obj,args...)== obj.f(args...)`

### 严格模式

js本来是脚本 现在变成大众化语言 需要搞一点约束 让一些傻逼写法报错 还要兼容以前老用法
用一个严格模式区分开来

ES6 新增块级作用域 以后都用let 声明遍历而不是var 


### 异步 事件循坏 微任务 宏任务


### DOM

选择器参数 DOMString


getElementsByClassName和querySelectorAll 区别

动态和静态区别

动态只读元素 可以通过具体DOM元素修改 但不能直接改

### ES模块和CommonJS 模块
报错
[MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type is not specified and it doesn't parse as CommonJS. Reparsing as ES module because module syntax was detected.

在ES模块里使用了__filename  __dirname这种全局变量
代码
```js
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ENV_PATH = resolve(__dirname, '../.env.development');
```

### 给导出对象起别名

fs.promises.writeFile 这个函数名太长用起来麻烦导出时
```js
const fsp = require('fs').promises;
await fsp.writeFile('hello.txt', 'Hello, 世界！');

const { promises: fsPromises } = require('fs');
const writeFile = fsPromises.writeFile;
await writeFile('msg.txt', 'Hello!');

const { writeFile } = require('fs').promises;
```
在ESmodule 里
```ts
import { promises as fsPromises } from 'fs';

import fsPromises from 'fs/promises';

//只引入一个对象
import { writeFile } from 'fs/promises';
```

# js的oop

### 原型对象 原型链 继承

ES6 用class 抽象出类的概念 来描述继承
ES5这个继承看看得了

三个东西

函数: ES5的 任何函数都能当构造函数,构造函数就是普通函数 内部用this 表示生成对象的属性 加上new 关键字调用。
```js
let People = function (name = '114', end_name = '514', age = 24) {
        this.name = name; //这里使用this.xxx的属性都会作为属性生成在对象钟
        this.end_name = end_name;
        this.age = age;
        this.func = function () {
            console.log(`${this.age} duse`)
        }
    };

    let beast = new People();
    beast.func();
```
ES5 的js没有类概念 但是有原型的概念,类似于基类
这就是 `prototype`,别的语言用class定义类时,函数都是统一存储的也就是说,只有实例对象成员函数地址都一样
```c#
public class test{

    public int age{get;set}=10;

    public void ff()=>console.Writeline($"{age} desu");
}


var test1=new test();
```
c#定义的test类成员函数全局只有一份,js的成员就不一样了每个实例对象都有一份,你说这扯不扯。js的对象时动态的,可以在任意时刻添加删除
成员.
所以js把所有"类成员函数" 放在对象的原型对象里,所有从原型对象继承来的方法对所有被继承对象效果都一样。md这不就是虚函数?js非要搞这个原型。对其他语言来说class里的东西都是类型信息,存编译器里的,js直接就让我们操作类型信息,尽管他没类型这个概念.
原型链就是,对象的原型对象也有自己的原型对象...一直链接到Object,构成一条原型链;Object的原型则是null。

继承就是操作原型对象 主要就两玩意

prototype 

`xx.prototype=yy` 就是指定原型 但一般不这么写
在原型中定义的属性,会被所有定义的类型继承
```js
上面People的例子
People.prototype.color = 'white'; 
```
这样所有new出来的People 原型对象都有color属性了,如果赋值构造函数,构造函数也共享了


constructor 
还是拿People举例子,People 属性的原型的构造函数属性指向People这个函数。就相当于其他语言的类型信息对象,在js里直接暴露给你了
```js
People.prototype.constructor =People

```

有个坑注意 最好不要直接替换对象的原型对象
```js
  let People = function (name = '114', end_name = '514', age = 24) {
        this.name = name;
        this.end_name = end_name;
        this.age = age;
        this.func = function () {
            console.log(`${this.age} duse`)
        }
    };

    let beast = new People();
    beast.func();

    People.prototype.color = 'white';
    console.info(beast.color);

    console.log(People.prototype);

    People.prototype = {
        constructor: People,
        name2: '1919',
        fuc_super: function () {
            console.log('调用原型对象')
        }
    };
    console.log(People.prototype);
    console.log(Object.getPrototypeOf(beast));
    console.info(beast.color);

    let new_obj = new People();
    console.log(new_obj.color);
    console.log(new_obj.name2);
    //输出
   white
{ color: 'white' }
{
  constructor: [Function: People],
  name2: '1919',
  fuc_super: [Function: fuc_super]
}
{ color: 'white' }
white
undefined
1919
```

在替换了People的原型对象后 已经创建对象的原型还是旧的原型对象,所以beast.color还能输出white。我一开始以为替换后所有以People的创建的对象的原型对象都替换了,所以一般都不直接替换原型对象.而是以`People.prototype.xxx`或

Object.getPrototypeOf() 
Object.setPrototypeOf()
获取 / 设置某对象的原型

Object.create() 从某个已存在对象创建对象 而不手动使用构造函数

Object.prototype.isPrototypeOf() 判断对象是否是参数对象的原型 只要在原型链上的都是

Object.prototype.__proto__ 这玩意指向对象的原型,以前浏览器用 现在js不仅是浏览器的脚本语言了 node之类的也用他们不一定实现这个玩意 ES6 已经淘汰了

Object.getOwnPropertyNames() 类似于其他语言反射里的获取所有属性名(数组)

Object.keys 获取像键值一样的可遍历的属性名 数组 (属性有属性描述对象可以改改属性是否可遍历)

Object.prototype.hasOwnProperty() 判断是自有属性还是原型链上的属性

for ...in 这种写法在js里是遍历属性的 遍历值得map或者forEach
```js
for ( var name in object ) {
  if ( object.hasOwnProperty(name) ) {
    /* loop code */
  }
}
```
拷贝对象 不用看


### 继承构造函数
ES6 有类之后写法更偏向有class的语言
ES5 的继承写法了解一下即可

不用new调用构造函数 非严格模式会什么都不干 对象都没创建

ES5的继承分两步 子类调用父类函数,子类原型指向父类原型对象
```js
//第一步
let Base=function(name){
    this.name=name;
}

let Derived=function(name,age){
    Base.call(this,name);
    this.age=age;
}
 Derived.prototype = Object.create(Base.prototype);
 Derived.prototype.constructor = Derived;

    let new_obj = new Derived('114', '514');

```
ES6 有class就没这么多事了

ES5 js不提供多重继承,有办法扭曲实现 没意思不用看

### 模块
ES6 才有模块
ES5 用一些很扭曲的方法实现,了解就好
模块就是复用别人的代码,导出模块中的对象能直接用。

1. ES5 用对象做 模块内的任何东西都塞一个对象里,用什么直接调属性写法即可。
这种干法,要把模块内所有东西都暴露出去。
2. 用构造函数做,构造函数中定义变量的东西实例化后外部访问不到,只能内部定义闭包函数访问到
3. 模块模式 经典[写法](https://wangdoc.com/javascript/oop/prototype#%E5%B0%81%E8%A3%85%E7%A7%81%E6%9C%89%E5%8F%98%E9%87%8F%E7%AB%8B%E5%8D%B3%E6%89%A7%E8%A1%8C%E5%87%BD%E6%95%B0%E7%9A%84%E5%86%99%E6%B3%95)看看得了
本质就是变量放函数里,函数作用域外部访问不到,把需要外部暴露的模块return 出去。

模块的放大模式在ES5里是个小坑,ES6不需要知道






