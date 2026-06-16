from enum import Enum, auto

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

class Status(Enum):
    PENDING = auto()
    RUNNING = auto()
    COMPLETED = auto()
    FAILED = auto()

class Day(Enum):
    MON = "Monday"
    TUE = "Tuesday"
    WED = "Wednesday"

def process_status(s):
    if s == Status.PENDING:
        return "Waiting..."
    elif s == Status.RUNNING:
        return "Processing..."
    elif s == Status.COMPLETED:
        return "Done!"
    return "Error!"

print(Color.RED, Color.RED.name, Color.RED.value)
print(Status.PENDING.value)
print(Day.MON.value)
print(process_status(Status.RUNNING))

for day in Day:
    print(day.name, "->", day.value)
