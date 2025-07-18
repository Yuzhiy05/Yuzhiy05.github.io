---
title: fast_io_tutorials
createTime: 2024/12/02 23:04:13
permalink: /article/xst10xfz/
---


打印自定义类型需要特化print_define

```c++
#include <fast_io.h>
struct point
{
	int x{};
	int y{};
};

template <typename char_type, typename output>
void print_define(::fast_io::io_reserve_type_t<char_type, point>, output out, point const &p)
{
	if constexpr (::std::is_same_v<char_type, char>)
	{
		::fast_io::println(out, "(", p.x, ",", p.y, ")");
	}
	::fast_io::println("-----------------");
}

int main(){
     ::fast_io::println(point{2, 5});
}
```
::: card title="结果" icon="twemoji:astonished-face"
(2,5)
\-----------------
:::
 


打印容器

```c++
 std::vector vec{1,2,3,4,5};
 fast_io::println(::fast_io::mnp::rgvw(str, ","));
```
::: card title="结果" icon="twemoji:astonished-face"
1|2|3|4|5
:::

打印带自定义类的容器

```c++
#include <fast_io.h>
struct test_t
{
	constexpr test_t() noexcept
		: content{}
	{}
	constexpr test_t(std::size_t i) noexcept
		: content{i}
	{}
	constexpr test_t(test_t const &other) noexcept
		: content{other.content}
	{}
	constexpr test_t &operator=(test_t const &other) noexcept
	{
		content = other.content;
		return *this;
	}
	constexpr test_t(test_t &&other) noexcept
		: content{other.content}
	{}
	constexpr test_t &operator=(test_t &&other) noexcept
	{
		content = other.content;
		return *this;
	}
	constexpr ~test_t() noexcept
	{}
	std::size_t content;
};

template <typename char_type, typename out_type>
inline constexpr void print_define(fast_io::io_reserve_type_t<char_type, test_t>, out_type out,test_t const &t) noexcept
{
	fast_io::operations::print_freestanding<false>(out, t.content);
}
int main(){
    std::vector v3{test_t{3}, test_t{4}, test_t{5}};
	print("-----\n");

	v3.insert(v3.begin(), 3);
	print(fast_io::mnp::rgvw(v3), " \n"
	"-----");
}

```

::: card title="结果" icon="twemoji:astonished-face"  
\-----  
3 3 4 5  
\-----
:::