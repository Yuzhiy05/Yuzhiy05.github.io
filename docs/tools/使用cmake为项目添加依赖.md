


git  submodule

FetchContent



### 传递依赖

如果我的库libA依赖了libB,并且把libB的类型暴露在接口中;或
`target_link_libraries(libA PUBLIC/INTERFACE libB)`
就需要所有使用我的库的人也依赖libB

在\<Package\>config.cmake文件中使用
`find_dependency` 命令转发依赖 让外部引用你库的的使用者也引入你的依赖

```shell
include(CMakeFindDependencyMacro)
find_dependency(TransitiveDep)
```