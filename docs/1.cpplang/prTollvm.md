# 给llvm提交pr


### clone llvm 项目

1.git clone --depth=1 --filter=blob:none --branch main git@github.com:Yuzhiy05/llvm-project.git

在Git中，blob是指文件的内容。当你在Git仓库中对文件进行更改时，Git会创建一个新的blob对象来表示文件的新内容。
--filter=blob：none，“blob”指的是仓库中大于特定大小阈值的二进制对象。默认情况下，Git将任何大于100 KB的对象视为blob。
当你在克隆仓库时使用--filter=blob：none时，Git会从克隆中排除这些大型二进制对象（blob）。这可以显著减少克隆仓库的大小，并使下载速度更快

--filter=blob:limit=<size> 过滤掉大小为size的 文件内容(blob)

--depth=1 只clone 最新提交

2. git sparse-checkout set libcxx libcxxabi libunwind runtimes cmake libc llvm 
3. git sparse-checkout add llvm  
添加更多模块

 tips: ai给的答案里 git sparse-checkout init --cone 这条不需要了查文档这个要废弃了 直接set 路径 不需要/libcxx



### 构建libcxx
```c++
cmake -G Ninja -S llvm-project/runtimes -B build  \
-DLLVM_ENABLE_RUNTIMES="libcxx;libcxxabi;libunwind \
-DCMAKE_SYSROOT="D:\workfile\compiler\clang\x86_64-windows-gnu" \
-DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" 

cmake -G Ninja -S llvm-project/runtimes -B build -DLLVM_ENABLE_RUNTIMES="libcxx;libcxxabi;libunwind" -DLLVM_RUNTIME_TARGETS="x86_64-windows-msvc" -DCMAKE_SYSROOT="D:\workfile\compiler\windows-msvc-sysroot" -DLLVM_USE_LINKER=lld -DCMAKE_LINKER="D:/workfile/compiler/clang/llvm/bin/lld" -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_MODULE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib"


cmake -G Ninja -S llvm-project/runtimes -B build 
-DLLVM_ENABLE_RUNTIMES="libcxx;libcxxabi;libunwind" 
-DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" 
-DCMAKE_SYSROOT="D:/workfile/compiler/clang/x86_64-windows-gnu" 
-DLLVM_USE_LINKER=lld 
-DCMAKE_LINKER="D:/workfile/compiler/clang/llvm/bin/lld" 
-DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" 
-DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" 
-DCMAKE_MODULE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib"
-DCMAKE_C_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind -lc++abi -lunwind -lntdll "
-DCMAKE_CXX_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -lntdll -stdlib=libc++ -std=c++23"

现在就用这个
//动态链接 构建libcxx;libcxxabi;libunwind
cmake -G Ninja -S llvm-project/runtimes -B build -DLLVM_ENABLE_RUNTIMES="libcxx;libcxxabi;libunwind" -DCMAKE_BUILD_TYPE=Release -DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" -DCMAKE_SYSROOT="D:/workfile/compiler/clang/x86_64-windows-gnu" -DLLVM_USE_LINKER=lld -DCMAKE_LINKER="D:/workfile/compiler/clang/llvm/bin/lld" -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=lld -LD:/workfile/compiler/clang/x86_64-windows-gnu/lib" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=lld -LD:/workfile/compiler/clang/x86_64-windows-gnu/lib" -DCMAKE_MODULE_LINKER_FLAGS="-fuse-ld=lld -LD:/workfile/compiler/clang/x86_64-windows-gnu/lib" -DCMAKE_C_FLAGS="-rtlib=compiler-rt -Wno-unused-command-line-argument" -DCMAKE_CXX_FLAGS="-rtlib=compiler-rt -stdlib=libc++ -Wno-unused-command-line-argument" -DCMAKE_INSTALL_PREFIX="D:/workfile/lib/llvm" -DLIBCXX_ENABLE_SHARED=ON -DLIBCXXABI_ENABLE_SHARED=OFF -DLIBCXXABI_ENABLE_STATIC=ON -DLIBCXXABI_USE_LLVM_UNWINDER=ON -DLIBCXX_ENABLE_STATIC_ABI_LIBRARY=ON -DLIBCXX_INCLUDE_BENCHMARKS=ON -DLIBCXX_CXX_ABI=libcxxabi

-DCMAKE_STATIC_LINKER_FLAGS="-fuse-ld=lld -LD:/workfile/compiler/clang/x86_64-windows-gnu/lib" 

//报错
/*ld.lld: error: undefined symbol: std::__1::__libcpp_condvar_wait(void**, void**)
>>> referenced by libcxxabi/src/CMakeFiles/cxxabi_shared_objects.dir/cxa_guard.cpp.obj:(__cxxabiv1::(anonymous namespace)::LibcppCondVar::wait(__cxxabiv1::(anonymous namespace)::LibcppMutex&))

ld.lld: error: undefined symbol: std::__1::__libcpp_mutex_lock(void**)
>>> referenced by libcxxabi/src/CMakeFiles/cxxabi_shared_objects.dir/cxa_guard.cpp.obj:(__cxxabiv1::(anonymous namespace)::LibcppMutex::lock())
>>> referenced by libcxxabi/src/CMakeFiles/cxxabi_shared_objects.dir/fallback_malloc.cpp.obj:((anonymous namespace)::mutexor::mutexor(void**))

ld.lld: error: undefined symbol: std::__1::__libcpp_mutex_unlock(void**)
>>> referenced by libcxxabi/src/CMakeFiles/cxxabi_shared_objects.dir/cxa_guard.cpp.obj:(__cxxabiv1::(anonymous namespace)::LibcppMutex::unlock())
>>> referenced by libcxxabi/src/CMakeFiles/cxxabi_shared_objects.dir/fallback_malloc.cpp.obj:((anonymous namespace)::mutexor::~mutexor())

ld.lld: error: undefined symbol: std::__1::__libcpp_condvar_broadcast(void**)
>>> referenced by libcxxabi/src/CMakeFiles/cxxabi_shared_objects.dir/cxa_guard.cpp.obj:(__cxxabiv1::(anonymous namespace)::LibcppCondVar::broadcast())
clang++: error: linker command failed with exit code 1 (use -v to see invocation)
*/

//动态链接
cmake -G Ninja -S llvm-project/runtimes -B build -DLLVM_ENABLE_RUNTIMES="libcxx" -DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" -DCMAKE_SYSROOT="D:/workfile/compiler/clang/x86_64-windows-gnu" -DLLVM_USE_LINKER=lld -DCMAKE_LINKER="D:/workfile/compiler/clang/llvm/bin/lld" -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_MODULE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_C_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind -lc++abi -lunwind -lntdll" -DCMAKE_CXX_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -lntdll -stdlib=libc++ -std=c++23" -DCMAKE_INSTALL_PREFIX="D:/workfile/lib/llvm" -DLIBCXX_ENABLE_SHARED=ON -DLIBCXXABI_ENABLE_SHARED=ON -DLIBCXXABI_ENABLE_STATIC=OFF -DLIBCXXABI_USE_LLVM_UNWINDER=ON 


//单libcxx 动态链接 
cmake -G Ninja -S llvm-project/runtimes -B build -DLLVM_ENABLE_PROJECTS="libcxx" -DLLVM_ENABLE_RUNTIMES="libcxx" -DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" -DCMAKE_SYSROOT="D:/workfile/compiler/clang/x86_64-windows-gnu" -DLLVM_USE_LINKER=lld -DCMAKE_LINKER="D:/workfile/compiler/clang/llvm/bin/lld" -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_MODULE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_C_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind -lc++abi -lunwind -lntdll" -DCMAKE_CXX_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -lntdll -stdlib=libc++ -std=c++23" -DCMAKE_INSTALL_PREFIX="D:/workfile/lib/llvm" -DLIBCXX_ENABLE_SHARED=ON -DLIBCXXABI_ENABLE_SHARED=ON -DLIBCXXABI_ENABLE_STATIC=OFF -DLIBCXXABI_USE_LLVM_UNWINDER=ON
//报错
// In file included from D:/workfile/github/llvm-libcxx/llvm-project/libcxx/src/stdexcept.cpp:17:
// D:/workfile/github/llvm-libcxx/llvm-project/libcxx/src/support/runtime/stdexcept_default.ipp:13:12: fatal error: 'cxxabi.h' file not found
//    13 | #  include <cxxabi.h>
//       |            ^~~~~~~~~~




```


