data = [12, 45, 33, 27, 89, 41, 56]

total = 0
for val in data:
    total += val

even_sum = 0
odd_sum = 0
for val in data:
    if val % 2 == 0:
        even_sum += val
    else:
        odd_sum += val

double_data = []
for val in data:
    double_data.append(val * 2)

max_val = data[0]
min_val = data[0]
for val in data:
    if val > max_val:
        max_val = val
    if val < min_val:
        min_val = val

print(f"总和: {total}, 偶数: {even_sum}, 奇数: {odd_sum}")
print(f"最大值: {max_val}, 最小值: {min_val}")
print(double_data)
