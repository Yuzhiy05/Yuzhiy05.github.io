---
title: Boost库使用-regex
createTime: 2025/05/14 22:41:42
permalink: /article/94jsixre/
---

# Boost库使用 Regex用法

1.正则表达式的模式怎么写

```regex
字符
.        // 任意字符（除换行外）
\d       // 数字 [0-9]
\D       // 非数字 [^0-9]
\w       // 单词字符 [a-zA-Z0-9_]
\W       // 非单词字符 [^a-zA-Z0-9_]
\s       // 空白字符 [ \r\n\t\f]
\S       // 非空白字符
[abc]    // a、b 或 c 中的任意一个
[^abc]   // 除 a、b、c 外的任意字符
[a-z]    // a 到 z 范围内的字符


量词
*        // 0次或多次
?        // 0次或1次
+        // 1次或多次
{n}      // 恰好 n 次
{n,}     // 至少 n 次
{n,m}    // n 到 m 次

分组
(expr)       // 捕获分组
(?:expr)     // 非捕获分组
(?<name>expr) // 命名捕获组
\1, \2       // 向后引用

位置匹配
^        // 字符串开始（或行开始，多行模式下）
$        // 字符串结束（或行结束，多行模式下）
\b       // 单词边界
\B       // 非单词边界
\A       // 字符串开始（绝对）
\Z       // 字符串结束（绝对）

修饰
// 在正则表达式开头设置
(?i)     // 忽略大小写
(?s)     // 单行模式（. 匹配换行）
(?m)     // 多行模式（^$ 匹配行首行尾）  boost::regex pattern(R"((?m)^[ABC]\d{12}$)");
(?x)     // 忽略空白和注释


//惯用法
(?=expr)  // 正向前瞻
(?!expr)  // 负向前瞻
(?<=expr) // 正向后顾
(?<!expr) // 负向后顾

//条件表达式
(?(condition)yes|no)


//Unicode支持
\p{property}    // Unicode 属性
\X             // Unicode 组合字符序列
```

==三个功能函数==
```cpp
boost::regex_match()    // 完全匹配
boost::regex_search()   // 搜索匹配
boost::regex_replace()  // 替换匹配
```

:::tip
==regex_search 函数搜索到首个匹配项就结束==
:::