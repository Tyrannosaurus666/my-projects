# 判断成绩
score = 85

# 检查分数
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

# 打印
print(grade)

# 三元表达式
result = "Pass" if score >= 60 else "Fail"
print(result)
