---
title: VueBegin
createTime: 2025/07/15 08:58:17
permalink: /article/64l51nbs/
---

# Vue 入门

## 响应式 API

- `reactive` 创建响应式对象
- `ref` 创建响应式基础类型

## HTML 标签与 Vue 组件

Vue 的标签和 HTML 的标签类似，不过在 Vue 中不叫标签叫组件。

平时给 HTML 标签赋值时都是传静态字符串，Vue 中加 `:` 的写法是动态绑定值，其实是 `v-bind:value` 的简写。

```vue
<a-input :value="userinput">
```

## Vue3 断点调试

工具：VSCode
