---
title: 调试cmake本身
createTime: 2026/06/21 23:31:33
permalink: /article/rsmzw5sy/
---

# 调试cmake本身

`message`

`CMakePrintHelpers`

```bash
cmake -S . -B build --trace-source=CMakeLists.txt
```
