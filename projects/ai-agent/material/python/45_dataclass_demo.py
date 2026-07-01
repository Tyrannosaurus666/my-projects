from dataclasses import dataclass, field
from typing import List

# 数据类
@dataclass
class Point:
    x: float
    y: float

    def distance_to_origin(self):
        return (self.x**2 + self.y**2)**0.5

@dataclass
class Student:
    name: str
    grades: List[float] = field(default_factory=list)

    def average(self):
        if not self.grades:
            return 0.0
        return sum(self.grades) / len(self.grades)

@dataclass(order=True)
class Task:
    priority: int
    name: str = field(compare=False)

p = Point(3.0, 4.0)
print(f"Distance: {p.distance_to_origin()}")

s = Student("Alice", [88.0, 92.0, 95.0])
print(f"{s.name} average: {s.average():.1f}")

tasks = [Task(2, "Write docs"), Task(1, "Fix bug"), Task(3, "Review")]
for t in sorted(tasks):
    print(f"Priority {t.priority}: {t.name}")
