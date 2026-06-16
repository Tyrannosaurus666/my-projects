numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

doubled = list(map(lambda x: x * 2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))
odds = list(filter(lambda x: x % 2 != 0, numbers))

from functools import reduce
product = reduce(lambda x, y: x * y, numbers)

words = ["apple", "banana", "cherry", "date", "elderberry"]
long_words = list(filter(lambda w: len(w) > 5, words))
upper_words = list(map(lambda w: w.upper(), long_words))

sorted_by_len = sorted(words, key=lambda w: len(w))

points = [(1, 2), (3, 1), (5, 0), (2, 4)]
sorted_by_y = sorted(points, key=lambda p: p[1])

print(doubled, evens, odds)
print(product)
print(upper_words)
print(sorted_by_len)
print(sorted_by_y)
