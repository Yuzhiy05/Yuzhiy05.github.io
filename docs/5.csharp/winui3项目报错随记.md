---
title: winui3项目报错随记
createTime: 2025/05/26 19:35:22
permalink: /article/hf17jio2/
---

# Winui3项目创建时的一些问题
最近升级了vs2022 preview 6.0.发现winui3的项目模板和以前不一样了。没有了空白项目，全是已经打包。选择(winui3)`空白应用(已打包)`和 `使用windows应用程序打包项目打包`创建项目

此模板会依赖

1.Microsoft.VCLibs.140.00 
2.Microsoft.VCLibs.140.00.UWPDesktop

这是 Windows App SDK 构建文件依赖的

现在WindowsAppsdk使用HybridCrt构建,不需要上述依赖了


```xaml
//在csproj的<PropertyGroup>中添加(UseWinUI下方)
<WindowsPackageType>None</WindowsPackageType>
//.wapproj 在最后添加(有一说是添加到含有 DefaultLanguage属性的属性组中)
<PropertyGroup>
  <WinUISDKReferences>false</WinUISDKReferences>
  <TargetPlatformIdentifier>Windows</TargetPlatformIdentifier>
</PropertyGroup>
```
>With v1.0.3 and v1.1P2, WinAppSDK has fully adopted Hybrid CRT, and a VCLibs.UPWDesktop framework package reference is no longer required. The WinUI appx targets file automatically adds this reference for backwards compat, but it can be removed for new projects.

1.2025年的winui3项目不需要这些乱七八糟的依赖了

~~但是这会导致使用Win2D( appsdk 1.1 preview 2, Win2D 1.0.1)崩溃,需要手动安装老的依赖VC_redist.x64.exe~~

2022年这个问题被解决了

2.自包含应用程序的无法调试UCRT构建的原生组件

3. 自包含和 ReadyToRun可能会引入WinFrom UWP的依赖使安装后体积变大

### 什么是HybridCrt,混合C运行时

### Winui3 项目 什么是打包和非打包,有什么区别?
打包就是含有`程序包表示符`,`程序包标识符`是唯一的，且打包了之后才有

打包了才能用后台任务，通知，磁贴等Windows 扩展性功能，

打包是使用MSIX打包

已打包就是包清单中声明对框架包的依赖项

Q:打包的应用有哪些好处?

1.安装/卸载更方便,卸的更干净,卸完跟没装一样

2.支持增量更新和自动更新

3.跟虚拟机有关，不懂我也不需要知道

4.打包了应用就签名，签名就了就放篡改

5.都能放沙盒里(AppContainer)运行,但是未打包的性能更拉跨。

主要的好处也就用扩展功能和增量更新。
打包应用配置应用行为

uap10:RuntimeBehavior 

packagedClassicApp 标识winui3应用 信任等级 mediumIL 也就是完全信任

win32App 其他win32应用  信任等级 mediumIL  

这两都属于桌面应用，有exe可执行文件后缀或者main或winmain函数为入口的。但是无法在appContainer里跑

windowsApp 表示uwp应用 信任等级 appContainer 也就说只能在沙盒里跑

非打包项目需要在.csproj中包含
```xml
<PropertyGroup>
    <!--  不打包  -->
    <WindowsPackageType>None</WindowsPackageType>
    <!--  自包含 Windows App SDK Runtime，否则需要单独安装  -->
    <WindowsAppSDKSelfContained>true</WindowsAppSDKSelfContained>
</PropertyGroup>
```
对于未打包项目需要添加引导程序,这个引导程序干两件事

1.初始化动态依赖项生存期管理器 (DDLM)

2.查找Windows app sdk框架包，应用到包映射中

怎么添加引导程序,在项目文件中(csproj)设置 ```<WindowsPackageType>None</WindowsPackageType>```

也就是说未打包程序需要如上设置才能找到windows app sdk->生成应用程序

>如果你要访问某些 API 或资源（如图片或音乐）或者设备（如摄像头或麦克风），那么必须在 Windows 应用的程序包清单中声明相应的应用功能
