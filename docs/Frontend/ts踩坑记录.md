---
title: ts踩坑记录
createTime: 2025/07/23 17:20:47
permalink: /article/4vz3t8qm/
---

# TS 入门踩坑记录

使用了此文档入门：[ts中文手册](https://typescript.bootcss.com/tutorials/typescript-in-5-minutes.html)

## 安装与编译

按照流程安装 ts 编译器：

```powershell
npm install -g typescript
```

在文件夹下创建文件 `greeter.js`：

```typescript
function greeter(person) {
    return "Hello, " + person;
}

let user = "Jane User";

document.body.innerHTML = greeter(user);
```

使用 `tsc greeter.js` 编译报错：

```powershell
PS D:\...\TS\Test> tsc greeter.ts
D:\...\TS\Test\greeter.ts(5,5): error TS1005: ';' expected.
```

:::warning 踩坑记录
在网上搜索一番后才知道 ts 1.0 版本函数后需要加分号，最开始以为 npm 包管理没给下最新版 ts 编译器。
:::

随即换了命令：

```shell
npm install -g typescript@latest
pnpm add typescript@latest -g
```

使用 `npm update typescript` 来更新 tsc，更新后显示：

```shell
   ╭──────────────────────────────────────────╮
   │                                          │
   │   Update available! 10.13.0 → 10.13.1.   │
   │   Changelog: https://pnpm.io/v/10.13.1   │
   │     To update, run: pnpm self-update     │
   │                                          │
   ╰──────────────────────────────────────────╯

 WARN  GET https://registry.npmmirror.com/typescript error (ETIMEDOUT). Will retry in 10 seconds. 2 retries left.
Packages: +1
+
Progress: resolved 1, reused 0, downloaded 1, added 1, done

C:\Users\hp\AppData\Local\pnpm\global\5:
+ typescript 5.8.3

Done in 45.5s using pnpm v10.13.0
```

## 版本问题排查

使用 `tsc -v` 命令查看版本，显示 `Version 1.0.3.0`。

发现命令行中 tsc 版本可能不对劲，使用以下命令确认：

```shell
npm view typescript version
# 5.8.3

npm ls typescript
# Test@ D:\workfile\TS\Test
# `-- typescript@5.8.3 -> .\node_modules\.pnpm\typescript@5.8.3\node_modules\typescript
#   `-- typescript@5.8.3 deduped -> .\node_modules\.pnpm\typescript@5.8.3\node_modules\typescript
```

npm 确实下载了 5.8.3 版本的 tsc 编译器。

使用 `gcm(Get-Command)` 一看：

```powershell
> Get-Command tsc
CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Application     tsc.exe                                            1.0.40050… C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.0\tsc.exe
```

:::warning 踩坑记录
使用的是 MS SDK 下的 1.0 版本，导致版本冲突。
:::

## 解决方案

使用 npx 运行本地模块：

```shell
npx tsc greeter.ts
node greeter.js
```

编译生成 `.js` 文件后，使用 `node` 运行。

如果使用了 TS 语法，安装并使用 `ts-node` 来运行。

`tsc --init` 生成 `tsconfig.json` 文件。

:::tip 现代方案
现在有更现代的 `tsx`，去掉 ts-node 直接编译运行 ts 程序。

```shell
npx tsc greeter.ts
```
:::
