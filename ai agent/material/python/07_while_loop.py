# 倒计时
n = 10
while n > 0:
    print(n)
    n -= 1

# 计算平均值 - 注意：如果total为0会有除零风险
numbers = [10, 20, 30, 40, 50]
i = 0
total = 0
while i < len(numbers):
    total += numbers[i]
    i += 1

average = total / len(numbers)  # 如果numbers为空会出错
print(f"平均值: {average}")

# 查找第一个大于阈值的数
threshold = 35
idx = 0
while idx < len(numbers):
    if numbers[idx] > threshold:
        print(f"找到: {numbers[idx]} 在索引 {idx}")
        break
    idx += 1
