#TS入门踩坑记录

使用了此文档入门
[ts中文手册](https://typescript.bootcss.com/tutorials/typescript-in-5-minutes.html)

按照流程安装ts编译器

```Powershell
> npm install -g typescript
```

在文件夹下创建文件 greeter.js
```typescript
function greeter(person) {
    return "Hello, " + person;
}

let user = "Jane User";

document.body.innerHTML = greeter(user);
```

使用tsc greeter.js
编译报错
```powershell
PS D:\...\TS\Test> tsc greeter.ts
D:\...\TS\Test\greeter.ts(5,5): error TS1005: ';' expected.
```
我在网上搜索一番后才知道ts1.0版本函数后需要加分号，最开始我以为npm包管理没给我下最新版ts编译器

我随即换了命令
npm install -g typescript@latest

pnpm add typescript@latest -g

我随即我使用 npm update typescript 来更新tsc，更新后显示
```shell
   ╭──────────────────────────────────────────╮
   │                                          │
   │   Update available! 10.13.0 → 10.13.1.   │
   │   Changelog: https://pnpm.io/v/10.13.1   │
   │     To update, run: pnpm self-update     │
   │                                          │
   ╰──────────────────────────────────────────╯

 WARN  GET https://registry.npmmirror.com/typescript error (ETIMEDOUT). Will retry in 10 seconds. 2 retries left.
Packages: +1
+
Progress: resolved 1, reused 0, downloaded 1, added 1, done

C:\Users\hp\AppData\Local\pnpm\global\5:
+ typescript 5.8.3

Done in 45.5s using pnpm v10.13.0
```
使用tsc -v命令查看版本
显示 Version 1.0.3.0

我发现命令行中tsc版本可能不对劲,使用
npm view typescript version
5.8.3

npm ls typescript
Test@ D:\workfile\TS\Test
`-- typescript@5.8.3 -> .\node_modules\.pnpm\typescript@5.8.3\node_modules\typescript
  `-- typescript@5.8.3 deduped -> .\node_modules\.pnpm\typescript@5.8.3\node_modules\typescript

npm确实给我下载了5.8.3版本的 tsc编译器

使用gcm(Get-Command)一看
```shell
> Get-Command tsc                      
CommandType     Name                                               Version    Source
-----------     ----                                               -------    ------
Application     tsc.exe                                            1.0.40050… C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.0\tsc.exe     
```
使用的是MS sdk下的1.0版本

使用npx运行本地模块
```shell
npx tsc greeter.ts

node greeter.js
```
编译生成.js文件后
使用node运行

如果使用了TS语法,安装并使用ts-node 来运行
