---
title: 使用cmake为项目添加依赖
createTime: 2026/06/21 23:31:33
permalink: /article/1dngp6mo/
---

## 依赖管理方式

- git submodule
- FetchContent

### 传递依赖

如果我的库 libA 依赖了 libB，并且把 libB 的类型暴露在接口中；或 `target_link_libraries(libA PUBLIC/INTERFACE libB)`，就需要所有使用我的库的人也依赖 libB。

在 `<Package>config.cmake` 文件中使用 `find_dependency` 命令转发依赖，让外部引用你库的使用者也引入你的依赖：

```cmake
include(CMakeFindDependencyMacro)
find_dependency(TransitiveDep)
```
