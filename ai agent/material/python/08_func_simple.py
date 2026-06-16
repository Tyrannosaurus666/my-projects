def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

def add(a, b):
    return a + b

def is_even(num):
    return num % 2 == 0

def count_vowels(text):
    vowels = "aeiouAEIOU"
    count = 0
    for ch in text:
        if ch in vowels:
            count += 1
    return count

def find_max(numbers):
    if not numbers:
        return None
    max_val = numbers[0]
    for n in numbers:
        if n > max_val:
            max_val = n
    return max_val

print(greet("Alice"))
print(add(3, 5))
print(is_even(10))
print(count_vowels("Hello World"))
print(find_max([3, 7, 2, 9, 1]))
