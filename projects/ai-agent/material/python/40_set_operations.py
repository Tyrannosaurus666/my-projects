# 创建集合
set_a = {1, 2, 3, 4, 5}
set_b = {4, 5, 6, 7, 8}

# 基本操作
union = set_a | set_b
intersection = set_a & set_b
difference = set_a - set_b
symmetric_diff = set_a ^ set_b

# 打印结果
print(f"并集: {union}")
print(f"交集: {intersection}")
print(f"差集: {difference}")
print(f"对称差: {symmetric_diff}")

# 集合方法
set_a.add(6)
set_a.remove(1)
set_c = set_a.copy()
set_c.discard(10)  # 不会报错

# 子集/超集检查
print(f"A是B的子集: {set_a.issubset(set_b)}")
print(f"A是B的超集: {set_a.issuperset({2, 3})}")
