# 给llvm提交pr


### 构建libcxx
```c++
cmake -G Ninja -S llvm-project/runtimes -B build  \
-DLLVM_ENABLE_RUNTIMES="libcxx;libcxxabi;libunwind \
-DCMAKE_SYSROOT="D:\workfile\compiler\clang\x86_64-windows-gnu" \
-DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" 

cmake -G"Ninja" -S llvm-project/runtimes -B build  -DLLVM_ENABLE_RUNTIMES="libcxx;libcxxabi;libunwind" -DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" -DCMAKE_SYSROOT="D:/workfile/compiler/clang/x86_64-windows-gnu" -DLLVM_USE_LINKER=lld  -DCMAKE_LINKER="D:/workfile/compiler/clang/llvm/bin/lld"


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

cmake -G Ninja -S llvm-project/runtimes -B build -DLLVM_ENABLE_RUNTIMES="libcxx;libcxxabi;libunwind" -DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" -DCMAKE_SYSROOT="D:/workfile/compiler/clang/x86_64-windows-gnu" -DLLVM_USE_LINKER=lld -DCMAKE_LINKER="D:/workfile/compiler/clang/llvm/bin/lld" -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_MODULE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_C_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind -lc++abi -lunwind -lntdll" -DCMAKE_CXX_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -lntdll -stdlib=libc++ -std=c++23"

cmake -G Ninja -S llvm-project/runtimes -B build -DLLVM_ENABLE_RUNTIMES="libcxx;libcxxabi;libunwind" -DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" -DCMAKE_SYSROOT="D:/workfile/compiler/clang/x86_64-windows-gnu" -DLLVM_USE_LINKER=lld -DCMAKE_LINKER="D:/workfile/compiler/clang/llvm/bin/lld" -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_MODULE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_C_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind  -Wno-unused-command-line-argument" -DCMAKE_CXX_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind  -stdlib=libc++  -Wno-unused-command-line-argument" -DCMAKE_INSTALL_PREFIX="D:/workfile/lib/llvm" -DLIBCXX_ENABLE_SHARED=ON -DLIBCXXABI_ENABLE_SHARED=ON -DLIBCXXABI_ENABLE_STATIC=OFF -DLIBCXXABI_USE_LLVM_UNWINDER=ON

cmake -G Ninja -S llvm-project/runtimes -B build -DLLVM_ENABLE_RUNTIMES="libcxx" -DLLVM_RUNTIME_TARGETS="x86_64-windows-gnu" -DCMAKE_SYSROOT="D:/workfile/compiler/clang/x86_64-windows-gnu" -DLLVM_USE_LINKER=lld -DCMAKE_LINKER="D:/workfile/compiler/clang/llvm/bin/lld" -DCMAKE_EXE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_SHARED_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_MODULE_LINKER_FLAGS="-fuse-ld=lld -L${CMAKE_SYSROOT}/lib" -DCMAKE_C_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind -lc++abi -lunwind -lntdll" -DCMAKE_CXX_FLAGS="-rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -lntdll -stdlib=libc++ -std=c++23" -DCMAKE_INSTALL_PREFIX="D:/workfile/lib/llvm" -DLIBCXX_ENABLE_SHARED=ON -DLIBCXXABI_ENABLE_SHARED=ON -DLIBCXXABI_ENABLE_STATIC=OFF -DLIBCXXABI_USE_LLVM_UNWINDER=ON 

```