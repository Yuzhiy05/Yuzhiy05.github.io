---
title: libcxx_anlyse_tree
createTime: 2025/02/27 08:55:42
permalink: /article/68nz5xdu/
---

# libc++ 中的tree 分析

```cpp
template <class _From, class _To>
using __rebind_pointer_t = typename pointer_traits<_From>::template rebind<_To>::other;
```

==node 类型==

```cpp
template <class _VoidPtr>
struct __tree_node_base_types {
  typedef _VoidPtr __void_pointer;

  typedef __tree_node_base<__void_pointer> __node_base_type;
  typedef __rebind_pointer_t<_VoidPtr, __node_base_type> __node_base_pointer;

  typedef __tree_end_node<__node_base_pointer> __end_node_type;
  typedef __rebind_pointer_t<_VoidPtr, __end_node_type> __end_node_pointer;
  typedef __end_node_pointer __parent_pointer;

private:
  static_assert(is_same<typename pointer_traits<_VoidPtr>::element_type, void>::value,
                "_VoidPtr does not point to unqualified void type");
};

//node
template <class _Pointer>
class __tree_end_node {
public:
  typedef _Pointer pointer;
  pointer __left_;

  _LIBCPP_HIDE_FROM_ABI __tree_end_node() _NOEXCEPT : __left_() {}
};

template <class _VoidPtr>
class  __tree_node_base : public __tree_node_base_types<_VoidPtr>::__end_node_type {
  typedef __tree_node_base_types<_VoidPtr> _NodeBaseTypes;

public:
  typedef typename _NodeBaseTypes::__node_base_pointer pointer;
  typedef typename _NodeBaseTypes::__parent_pointer __parent_pointer;

  pointer __right_;
  __parent_pointer __parent_;
  bool __is_black_;

  _LIBCPP_HIDE_FROM_ABI pointer __parent_unsafe() const { return static_cast<pointer>(__parent_); }

  _LIBCPP_HIDE_FROM_ABI void __set_parent(pointer __p) { __parent_ = static_cast<__parent_pointer>(__p); }

  ~__tree_node_base()                                  = delete;
  __tree_node_base(__tree_node_base const&)            = delete;
  __tree_node_base& operator=(__tree_node_base const&) = delete;
};
```