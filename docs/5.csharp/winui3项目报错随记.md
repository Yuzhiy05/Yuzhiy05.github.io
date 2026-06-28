---
title: winui3项目报错随记
createTime: 2025/05/26 19:35:22
permalink: /article/hf17jio2/
---

# Winui3 项目创建时的一些问题

最近升级了 VS2022 Preview 6.0，发现 WinUI3 的项目模板和以前不一样了。==没有了空白项目，全是已打包项目==。

选择 (WinUI3) `空白应用(已打包)` 和 `使用 Windows 应用程序打包项目打包` 创建项目。

## 依赖问题

此模板会依赖：

1. `Microsoft.VCLibs.140.00`
2. `Microsoft.VCLibs.140.00.UWPDesktop`

这是 Windows App SDK 构建文件依赖的。

::: tip 重要更新
现在 WindowsAppSDK 使用 HybridCrt 构建，**不需要上述依赖了**。

With v1.0.3 and v1.1P2, WinAppSDK has fully adopted Hybrid CRT, and a VCLibs.UPWDesktop framework package reference is no longer required. The WinUI appx targets file automatically adds this reference for backwards compat, but it can be removed for new projects.
:::

**解决方案：**

在 csproj 的 `<PropertyGroup>` 中添加（UseWinUI 下方）：

```xml
<WindowsPackageType>None</WindowsPackageType>
```

在 .wapproj 最后添加（有一说是添加到含有 DefaultLanguage 属性的属性组中）：

```xml
<PropertyGroup>
  <WinUISDKReferences>false</WinUISDKReferences>
  <TargetPlatformIdentifier>Windows</TargetPlatformIdentifier>
</PropertyGroup>
```

## 已知问题

1. **2025 年的 WinUI3 项目不需要这些依赖了**

   ~~但是这会导致使用 Win2D (AppSDK 1.1 Preview 2, Win2D 1.0.1) 崩溃，需要手动安装老的依赖 VC_redist.x64.exe~~

   2022 年这个问题被解决了

2. **自包含应用程序无法调试 UCRT 构建的原生组件**

3. **自包含和 ReadyToRun 可能会引入 WinForm UWP 的依赖，使安装后体积变大**

---

## 术语解释

### 什么是 HybridCrt（混合 C 运行时）

*待补充*

### WinUI3 项目：什么是打包和非打包，有什么区别？

**打包**就是含有 `程序包标识符`，`程序包标识符` 是唯一的，且打包了之后才有。

打包了才能用后台任务、通知、磁贴等 Windows 扩展性功能。

打包是使用 MSIX 打包，已打包就是包清单中声明对框架包的依赖项。

#### 打包应用的好处

1. ==**安装/卸载更方便**==，卸的更干净，卸完跟没装一样
2. ==**支持增量更新和自动更新**==
3. 跟虚拟机有关（暂不深入）
4. **打包了应用就签名**，签名了就防篡改
5. 都能放沙盒里 (AppContainer) 运行，但是未打包的性能更拉跨

::: info 总结
主要的好处也就用扩展功能和增量更新。
:::

#### 打包应用配置应用行为

| 标识 | 说明 | 信任等级 |
|------|------|----------|
| `uap10:RuntimeBehavior` | - | - |
| `packagedClassicApp` | 标识 WinUI3 应用 | `mediumIL`（完全信任） |
| `win32App` | 其他 Win32 应用 | `mediumIL` |
| `windowsApp` | 表示 UWP 应用 | `appContainer`（沙盒） |

::: warning 注意
`packagedClassicApp` 和 `win32App` 都属于桌面应用，有 exe 可执行文件后缀或者 `main` / `winmain` 函数为入口的，但是无法在 AppContainer 里跑。
:::

### 非打包项目配置

非打包项目需要在 `.csproj` 中包含：

```xml
<PropertyGroup>
    <!--  不打包  -->
    <WindowsPackageType>None</WindowsPackageType>
    <!--  自包含 Windows App SDK Runtime，否则需要单独安装  -->
    <WindowsAppSDKSelfContained>true</WindowsAppSDKSelfContained>
</PropertyGroup>
```

### 引导程序

对于未打包项目需要添加引导程序，这个引导程序干两件事：

1. 初始化动态依赖项生存期管理器 (DDLM)
2. 查找 Windows App SDK 框架包，应用到包映射中

**添加引导程序：** 在项目文件中 (csproj) 设置 `<WindowsPackageType>None</WindowsPackageType>`

也就是说未打包程序需要如上设置才能找到 Windows App SDK → 生成应用程序

::: warning 应用功能声明
如果你要访问某些 API 或资源（如图片或音乐）或者设备（如摄像头或麦克风），那么必须在 Windows 应用的程序包清单中声明相应的应用功能
:::
