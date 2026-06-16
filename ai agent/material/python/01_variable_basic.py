name = "Alice"
age = 25
height = 1.68
is_student = True
scores = [85, 92, 78, 95]
info = {"name": name, "age": age}

total = sum(scores)
average = total / len(scores)
info["average"] = average

print(f"姓名: {name}, 年龄: {age}, 平均分: {average:.2f}")
for i, s in enumerate(scores):
    print(f"科目{i+1}: {s}")
