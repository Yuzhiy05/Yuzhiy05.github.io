

#

为了减少泛型 造成的代码膨胀 CLR会只编译一次泛型类的方法 ？(待验证)

List<String>和List<stream> 中的编译的方法能共享，因为引用类型的变量都是指向堆上的32/64位的指针

值类型大小不一，泛型生成的方法不能公用。即使大小一样Int32和UInt32也不能共用，因为生成的指令不一样



c#泛型中的类型参数的操作数，无法应用操作符
```c#
 public static T sum<T>(T num)where T : struct
 {
     T sum = default(T);
     for(T n=default(T); n<num;n++)
     {
         sum += n;
     }
     return sum;
 }
```
这个例子编译器会报错:
error CS0019: 运算符“<”无法应用于“T”和“T”类型的操作数
error CS0023: 运算符“++”无法应用于“T”类型的操作数
error CS0019: 运算符“+=”无法应用于“T”和“T”类型的操作数

这有点反直觉


泛型推导,少写参数?

泛型参数的协变逆变?
```c#
public class MTest<in T>
//这个模板参数能接受的类型，不限于T 具体有哪些继承?需要讨论
```