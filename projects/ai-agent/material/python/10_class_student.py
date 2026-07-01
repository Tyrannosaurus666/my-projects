# 学生类
class Student:
    # 初始化
    def __init__(self, name, student_id):
        self.name = name
        self.student_id = student_id
        self.scores = {}

    def add_score(self, subject, score):
        self.scores[subject] = score

    def get_average(self):
        if not self.scores:
            return 0
        return sum(self.scores.values()) / len(self.scores)

    def get_highest(self):
        if not self.scores:
            return None
        return max(self.scores.items(), key=lambda x: x[1])

    def __str__(self):
        return f"Student({self.name}, ID:{self.student_id}, Avg:{self.get_average():.1f})"

s = Student("Zhang Wei", "2024001")
s.add_score("Math", 88)
s.add_score("English", 92)
s.add_score("CS", 95)
print(s)
print(s.get_highest())
