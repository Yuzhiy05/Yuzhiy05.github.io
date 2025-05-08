

最近升级了vs2022 preview 6.0.发现winui3的项目模板和以前不一样了。没有了空白项目，全是已经打包。选择(winui3)'空白应用(已打包)'/'使用windows应用程序打包项目打包'创建项目





```xaml
//在csproj的<PropertyGroup>中添加
<WindowsPackageType>None</WindowsPackageType>
//.wapproj 在最后添加
<PropertyGroup>
  <WinUISDKReferences>false</WinUISDKReferences>
  <TargetPlatformIdentifier>Windows</TargetPlatformIdentifier>
</PropertyGroup>
```