# 创建一个列表
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
# 添加元素
numbers.append(7)
numbers.insert(0, 0)
# 删除元素
numbers.remove(1)
popped = numbers.pop()
# 排序
numbers.sort()
# 反转
numbers.reverse()
# 打印
print(numbers)
print(popped)

# 切片操作
subset = numbers[2:5]
print(subset)

# 列表推导
squares = [x**2 for x in numbers if x % 2 == 0]
print(squares)
