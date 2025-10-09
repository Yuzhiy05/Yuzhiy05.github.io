


# ES6 的js

### 变量解构

跟c++ 结构化绑定 和 c# 模式匹配里的 位置模式 很像

用于结构可迭代的对象 比如实现Iterator 接口的对象

js宽松的语言特性 解构失败的不报错只是对应变量为undefined

```js
let [bar, foo] = [1];

foo 为 undefined
```


