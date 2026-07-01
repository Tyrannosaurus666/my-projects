student = {
    "id": "2024001",
    "name": "Li Hua",
    "grades": {"math": 88, "english": 92, "cs": 95}
}

student["age"] = 20
student["grades"]["physics"] = 85

del student["age"]

keys = list(student.keys())
values = list(student.values())

for subject, grade in student["grades"].items():
    print(f"{subject}: {grade}")

math_score = student.get("grades", {}).get("math", 0)
print(f"Math score: {math_score}")

merged = {**student, "email": "lihua@example.com"}
print(merged)
