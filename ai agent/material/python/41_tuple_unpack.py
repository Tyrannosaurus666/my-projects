point = (3, 4)
x, y = point
print(f"x={x}, y={y}")

person = ("Alice", 25, "Engineer")
name, age, job = person
print(f"{name} is {age} years old, works as {job}")

data = [(1, "a"), (2, "b"), (3, "c")]
for num, letter in data:
    print(f"{num} -> {letter}")

a, b = 10, 20
a, b = b, a
print(f"a={a}, b={b}")

first, *middle, last = [1, 2, 3, 4, 5, 6]
print(f"first={first}, middle={middle}, last={last}")

def min_max(numbers):
    return min(numbers), max(numbers)

mn, mx = min_max([3, 1, 4, 1, 5, 9])
print(f"min={mn}, max={mx}")

nested = ((1, 2), (3, 4))
(a, b), (c, d) = nested
print(a, b, c, d)
